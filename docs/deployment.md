# 玄枢自行部署

本指南使用 **Ubuntu、Node.js 24、systemd 和 Nginx**，将普通 Node 服务发布到 `https://example.com`。网站公开访问，无需用户账户或 API Key。

[项目介绍](../README.md) · [使用指南](usage.md)

## 1. 准备环境

准备一台能使用 `sudo` 和 SSH 的 Ubuntu 服务器，以及指向该服务器的域名。将下文的 `example.com`、SSH 用户 `deploy` 和 Node 路径替换为自己的配置。允许服务器与云防火墙的 TCP 80 / 443 端口；Node 服务仅监听本机 `127.0.0.1:3011`。

在构建机与服务器安装 Node.js 24，项目最低要求为 **22.13.0**。服务器上的 Node 应位于系统目录或 `/opt`，以便独立服务用户执行；不要使用只能从个人 home 目录访问的 Node 安装。

```bash
node --version
npm --version
command -v node
```

服务器安装 Nginx、curl 和 Certbot：

```bash
sudo apt-get update
sudo apt-get install -y nginx curl certbot
```

## 2. 构建并上传

在开发机的项目目录执行。`XUANSHU_SITE_URL` 是完整公开地址，用于生成站点元信息；换域名后需要重新构建。

```bash
npm ci
XUANSHU_SITE_URL=https://example.com npm run build:server
tar -czf xuanshu-server.tar.gz -C dist/standalone .
scp xuanshu-server.tar.gz deploy@example.com:/tmp/xuanshu-server.tar.gz
```

`dist/standalone` 包含 `server.js`、页面构建、静态文件及运行时依赖。服务器运行成品时不需要安装开发依赖、数据库或本地托管配置。仅对已有构建重新打包时可运行 `node scripts/package-server.mjs`；修改源码后应重新执行完整构建。

## 3. 创建用户与发布目录

以下命令在服务器执行。系统用户 `xuanshu` 只运行应用，不能交互登录。首次部署时创建用户和基础目录：

```bash
if ! id -u xuanshu >/dev/null 2>&1; then
    sudo useradd --system --user-group --home-dir /opt/xuanshu \
        --no-create-home --shell /usr/sbin/nologin xuanshu
fi
sudo install -d -o root -g root -m 755 /opt/xuanshu /opt/xuanshu/releases
```

每次发布使用一个**从未使用过的发布编号**。下面的命令在子 shell 内执行；文件缺失或编号重复会中止，不切换当前版本。

```bash
(
    set -eu
    release_id=20261002-001
    release_dir="/opt/xuanshu/releases/$release_id"

    test -f /tmp/xuanshu-server.tar.gz
    test ! -e "$release_dir"
    sudo install -d -o xuanshu -g xuanshu -m 755 "$release_dir"
    sudo tar -xzf /tmp/xuanshu-server.tar.gz -C "$release_dir"
    sudo chown -R xuanshu:xuanshu "$release_dir"
    sudo -u xuanshu test -r "$release_dir/server.js"
    sudo -u xuanshu test -d "$release_dir/node_modules"
    sudo -u xuanshu test -d "$release_dir/dist/client"

    if [ -L /opt/xuanshu/current ]; then
        previous_release=$(readlink -f /opt/xuanshu/current)
        test -f "$previous_release/server.js"
        sudo ln -sfnT "$previous_release" /opt/xuanshu/previous
    fi
    sudo ln -sfnT "$release_dir" /opt/xuanshu/current.next
    sudo mv -Tf /opt/xuanshu/current.next /opt/xuanshu/current
)
```

`current` 指向当前发布，`previous` 保存切换前的发布。保留旧发布目录直到新版本验证通过。上述命令只管理 `/opt/xuanshu`，不涉及服务器上的其他项目。

## 4. 配置 systemd

创建 `/etc/systemd/system/xuanshu.service`。示例 Node 路径为 `/opt/node24/bin/node`，请用服务器上 `command -v node` 得到的绝对路径替换；确认该路径可被 `xuanshu` 用户执行。

```ini
[Unit]
Description=Xuanshu deterministic divination workbench
After=network.target

[Service]
Type=simple
User=xuanshu
Group=xuanshu
WorkingDirectory=/opt/xuanshu/current
Environment=NODE_ENV=production
Environment=HOST=127.0.0.1
Environment=PORT=3011
Environment=XUANSHU_SITE_URL=https://example.com
ExecStart=/opt/node24/bin/node /opt/xuanshu/current/server.js
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true

[Install]
WantedBy=multi-user.target
```

首次安装或修改服务配置后执行：

```bash
sudo -u xuanshu /opt/node24/bin/node --version
sudo systemctl daemon-reload
sudo systemctl enable --now xuanshu
sudo systemctl status xuanshu --no-pager
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3011/
```

应看到服务 `active (running)` 和首页 `200`。后续发布重复第 2、3 步，然后执行 `sudo systemctl restart xuanshu`；修改了 service 文件时先 `daemon-reload` 再重启。

## 5. 配置 Nginx 与 HTTPS

若已有覆盖域名的有效证书，直接使用后面的 HTTPS 配置。若尚无证书，先创建 `/var/www/letsencrypt`，并将下面的临时 HTTP 配置保存为 `/etc/nginx/sites-available/xuanshu`：

```bash
sudo install -d -o root -g root -m 755 /var/www/letsencrypt
```

```nginx
server {
    listen 80;
    server_name example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }

    location / {
        proxy_pass http://127.0.0.1:3011;
        proxy_set_header Host $http_host;
    }
}
```

启用这个独立站点、检查配置并申请证书。签发前 DNS 必须已生效，公网 80 端口必须可达。

```bash
sudo ln -sfn /etc/nginx/sites-available/xuanshu /etc/nginx/sites-enabled/xuanshu
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
sudo certbot certonly --webroot -w /var/www/letsencrypt -d example.com
```

证书签发成功后，用下列内容替换 `/etc/nginx/sites-available/xuanshu`。使用其他证书时，替换证书路径。

```nginx
server {
    listen 80;
    server_name example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }

    location / {
        return 301 https://example.com$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3011;
        proxy_http_version 1.1;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Host $http_host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot renew --dry-run
```

`$http_host` 保留访问地址中的端口。若使用非标准 HTTPS 端口，需要同时调整 `listen`、公开地址、重定向地址和防火墙规则。为 Certbot 续期成功后配置 Nginx reload 钩子：

```bash
sudo install -d /etc/letsencrypt/renewal-hooks/deploy
sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx >/dev/null <<'SH'
#!/bin/sh
nginx -t && systemctl reload nginx
SH
sudo chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx
sudo systemctl enable --now certbot.timer
```

## 6. 验证发布

先检查服务和近期日志，再分别核对本机服务与公开 HTTPS 入口。每条页面和静态插画应返回 `200`。

```bash
sudo systemctl is-active xuanshu
sudo journalctl -u xuanshu -n 50 --no-pager

for base_url in http://127.0.0.1:3011 https://example.com; do
    for route in / /liuyao /bazi /ziwei /meihua /xiaoliuren /history \
        /assets/v3/methods/bazi-jade-slips.svg; do
        curl -fsS -o /dev/null -w "$base_url$route %{http_code}\n" "$base_url$route"
    done
done
```

接着用浏览器按[使用指南](usage.md)完成一次排盘，检查图片、JS、CSS 正常加载；打开历史记录并刷新，确认能恢复刚才的排盘。切换浅色 / 深色主题，在手机宽度检查表单和结果。HTTP 状态正常只能说明资源可访问，不能替代这些操作验证。

## 7. 回滚

如果新版本有问题，检查 `previous` 指向的版本，再原子切回并重启。首次部署没有上一版时，以下检查会停止。

```bash
(
    set -eu
    rollback_release=$(readlink -f /opt/xuanshu/previous)
    test -f "$rollback_release/server.js"
    sudo ln -sfnT "$rollback_release" /opt/xuanshu/current.next
    sudo mv -Tf /opt/xuanshu/current.next /opt/xuanshu/current
    sudo systemctl restart xuanshu
)
sudo systemctl status xuanshu --no-pager
curl -fsS -o /dev/null -w '%{http_code}\n' https://example.com/
```

回滚后重复页面和浏览器验证。排盘记录保存在访问者浏览器中，不在服务器发布目录中；更换域名或端口不会自动迁移原站历史记录。
