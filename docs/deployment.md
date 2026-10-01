# 玄枢自行部署

本指南以 Ubuntu、Node.js 24、systemd 和 Nginx 为例，部署到 `https://example.com`。将示例域名、证书路径和 Node 路径替换为自己的配置。站点公开访问，无需用户名或密码；原 Sites 构建配置保持可用。

## 构建与打包

使用 Node.js 24（项目最低要求为 22.13）。在开发机安装依赖、构建并打包：

```bash
npm ci
XUANSHU_SITE_URL=https://example.com npm run build:server
tar -czf xuanshu-server.tar.gz -C dist/standalone .
```

`dist/standalone` 包含服务入口、页面构建、静态文件和运行时依赖。服务器只需要 Node.js，不需要安装完整开发依赖，也不要上传开发机的整个 `node_modules`。仅对已经构建好的 `dist` 重新打包时，运行 `node scripts/package-server.mjs`。

## 独立服务

创建专用系统用户 `xuanshu`，将每次发布放到 `/opt/xuanshu/releases/<release-id>`。`/opt/xuanshu/current` 是指向当前发布的符号链接；保留上一个发布以便回退。以下示例使用 `/opt/node24/bin/node`，请根据 `command -v node` 的结果调整为实际绝对路径。

`/etc/systemd/system/xuanshu.service`：

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

第一次安装服务后运行 `systemctl daemon-reload` 和 `systemctl enable --now xuanshu`。后续发布先解压并检查文件，再原子切换符号链接，重启该服务；不改动服务器上其他项目。

```bash
release_id=release-001
install -d -o xuanshu -g xuanshu "/opt/xuanshu/releases/$release_id"
tar -xzf /tmp/xuanshu-server.tar.gz -C "/opt/xuanshu/releases/$release_id"
chown -R xuanshu:xuanshu "/opt/xuanshu/releases/$release_id"
ln -s "/opt/xuanshu/releases/$release_id" /opt/xuanshu/current.next
mv -Tf /opt/xuanshu/current.next /opt/xuanshu/current
systemctl restart xuanshu
```

## Nginx 公开入口

为域名设置 DNS 记录并准备覆盖该域名的 TLS 证书。建立独立 Nginx 站点配置，例如：

```nginx
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

页面和静态文件公开提供访问。`$http_host` 会保留访问地址中的自定义端口。确认云防火墙允许 HTTPS 端口，Node 服务只监听回环地址。修改 Nginx 后执行 `nginx -t`，通过后再 reload，并配置证书自动续期。

## 验证与回退

检查 `systemctl status xuanshu` 和 `journalctl -u xuanshu -n 50`。验证本机 `http://127.0.0.1:3011/` 和公网入口均返回 200，首页、`/liuyao`、`/bazi`、`/ziwei`、`/meihua`、`/xiaoliuren`、`/history` 及图片 / JS / CSS 能正常加载，再用浏览器完成一次排盘和刷新恢复。

发现故障时，将 `/opt/xuanshu/current` 切回上一发布目录，再 `systemctl restart xuanshu`。历史数据保存在访问者浏览器内；更换域名不会自动迁移旧站历史记录。
