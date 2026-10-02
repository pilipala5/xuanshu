<p align="center">
  <img src="docs/images/readme-brand.svg" width="960" alt="玄枢 XUANSHU · 五门术数，一处排盘" />
</p>

<p align="center">
  <strong>五门术数，一处排盘。</strong><br />
  无需注册 · 无需密钥 · 本机计算 · 免费开源
</p>

<p align="center">
  <a href="https://github.com/pilipala5/xuanshu/stargazers"><img src="https://img.shields.io/github/stars/pilipala5/xuanshu?style=flat-square&amp;label=Stars&amp;color=b89b62" alt="GitHub Stars" /></a>
  <a href="https://github.com/pilipala5/xuanshu/watchers"><img src="https://img.shields.io/github/watchers/pilipala5/xuanshu?style=flat-square&amp;label=Watch&amp;color=64766b" alt="GitHub 订阅人数" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-64766b?style=flat-square" alt="MIT License" /></a>
</p>

<p align="center">
  <a href="https://47.117.103.246:8443/"><strong>在线体验 ↗</strong></a> &nbsp; · &nbsp;
  <a href="#features">功能</a> &nbsp; · &nbsp;
  <a href="#demo">预览</a> &nbsp; · &nbsp;
  <a href="#quick-start">开始使用</a> &nbsp; · &nbsp;
  <a href="#support">支持项目</a>
</p>

<p align="center">
  <a href="https://47.117.103.246:8443/"><img src="docs/images/home-desktop.jpg" width="960" alt="玄枢首页：山水背景与五门术数入口，点击在线体验" /></a>
</p>

玄枢是一个开源的东方术数排盘工具。填写输入、查看排盘、核对规则，在一个工作台内完成。

| 清晰排盘 | 随时回看 | 多端使用 |
| :---: | :---: | :---: |
| 规则可查，步骤可复算 | 本机历史，复制与导出 | 桌面 / 手机，浅色 / 深色 |

<a id="features"></a>

## 一览 · 五门术数

| 术数 | 输入 | 核心功能 |
| :--- | :--- | :--- |
| **六爻** | 所问之事，六次三钱投掷 | 本卦 / 变卦、爻位明细、PNG 摘要、解读提示词 |
| **四柱八字** | 出生日期、时间、性别 | 四柱、十神、大运 / 流年，可选换日规则 |
| **紫微斗数** | 出生信息，可选流年 | 十二宫、星曜 / 四化、本命与流年叠盘 |
| **梅花易数** | 两个整数 | 本 / 互 / 变卦、体用、取余步骤 |
| **小六壬** | 日期、时间 | 月 / 日 / 时顺推、六宫落点 |

<a id="demo"></a>

## 一瞥 · 界面与操作

<p align="center">
  <img src="docs/images/workbench-demo.gif" width="960" alt="真实页面关键帧：填写输入、生成排盘、查看结果" /><br />
  <sub>实际页面截图组成的关键帧演示 · 均为公开测试样例</sub>
</p>

<details>
<summary><strong>展开查看：八字与紫微排盘</strong></summary>

<table>
  <tr>
    <td width="50%" align="center"><strong>四柱八字</strong><br /><br /><a href="docs/images/bazi-full.jpg"><img src="docs/images/bazi-desktop.jpg" width="520" alt="八字样例：庚午、壬午、辛亥、甲午四柱" /></a></td>
    <td width="50%" align="center"><strong>紫微斗数</strong><br /><br /><a href="docs/images/ziwei-full.jpg"><img src="docs/images/ziwei-desktop.jpg" width="520" alt="紫微样例：十二宫与 2026 年流年叠盘" /></a></td>
  </tr>
</table>

样例：1990-06-15 · 12:00 · 男 · 流年 2026；八字选择 00:00 换日。点击图片查看完整排盘。

</details>

<details>
<summary><strong>展开查看：手机、深色主题与历史</strong></summary>

<table>
  <tr>
    <td width="50%" align="center"><strong>手机首页</strong><br /><br /><img src="docs/images/home-mobile.jpg" width="240" alt="手机首页与五门术数入口" /></td>
    <td width="50%" align="center"><strong>手机紫微</strong><br /><br /><img src="docs/images/ziwei-mobile.jpg" width="240" alt="手机紫微命盘与宫位详情" /></td>
  </tr>
  <tr>
    <td align="center"><strong>深色主题</strong><br /><br /><a href="docs/images/home-dark.jpg"><img src="docs/images/home-dark.jpg" width="520" alt="玄枢深色首页" /></a></td>
    <td align="center"><strong>本机历史</strong><br /><br /><a href="docs/images/history-desktop.jpg"><img src="docs/images/history-desktop.jpg" width="520" alt="五门术数的本机历史记录" /></a></td>
  </tr>
</table>

</details>

<a id="quick-start"></a>

## 上手 · 本地运行

需要 **Node.js ≥ 22.13.0**。

```bash
git clone https://github.com/pilipala5/xuanshu.git
cd xuanshu
npm ci
npm run dev -- --hostname 127.0.0.1 --port 5173
```

打开 [localhost:5173](http://127.0.0.1:5173)。无需数据库或 API Key。

<details>
<summary><strong>开发与部署</strong></summary>

检查：`npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`。

独立服务：

```bash
npm run build:server
HOST=127.0.0.1 PORT=3011 node dist/standalone/server.js
```

技术栈：React 19 · TypeScript · Vinext / Vite · Tailwind CSS · Motion · GSAP。历法与安星使用 [lunar-typescript](https://github.com/6tail/lunar-typescript) 和 [iztro](https://github.com/SylarLong/iztro)。

生产配置与 HTTPS 见 [部署指南](docs/deployment.md)。

</details>

## 深入 · 文档与贡献

[使用指南](docs/usage.md) &nbsp; · &nbsp; [计算口径](docs/calculation-rules.md) &nbsp; · &nbsp; [自行部署](docs/deployment.md) &nbsp; · &nbsp; [参与贡献](CONTRIBUTING.md) &nbsp; · &nbsp; [问题反馈](https://github.com/pilipala5/xuanshu/issues)

- **数据在本机**：输入与排盘记录不上传；历史仅在当前浏览器、当前站点可读，清除站点数据后无法自动找回。
- **规则有边界**：取法与时间约定见计算口径；当前不提供真太阳时校正、自动吉凶判断或 AI 解读。
- **反馈可复现**：请附脱敏输入、所选规则、实际与预期结果；规则变更需补充样例与测试。

<a id="support"></a>

## 同行 · 支持玄枢

喜欢玄枢，欢迎点一个 **Star ⭐**；关注更新，可在仓库右上角选择 **Watch → Custom**，按需订阅通知。

<p align="center">
  <a href="https://github.com/pilipala5/xuanshu"><img src="https://img.shields.io/badge/Star-%E6%94%AF%E6%8C%81%E7%8E%84%E6%9E%A2-b89b62?style=for-the-badge&amp;logo=github&amp;logoColor=white" alt="为玄枢点 Star" /></a>
  <a href="https://github.com/pilipala5/xuanshu"><img src="https://img.shields.io/badge/Watch-%E8%AE%A2%E9%98%85%E6%9B%B4%E6%96%B0-64766b?style=for-the-badge&amp;logo=github&amp;logoColor=white" alt="前往仓库，通过 Watch 订阅玄枢更新" /></a>
  <a href="https://www.star-history.com/#pilipala5/xuanshu&amp;Date"><img src="https://img.shields.io/badge/Star_History-%E6%98%9F%E6%A0%87%E8%B6%8B%E5%8A%BF-64766b?style=for-the-badge" alt="查看 Star 数增长趋势" /></a>
</p>

### 🍵 自愿资助

所有功能免费使用。如果愿意支持维护与开发，欢迎请作者喝杯茶。**完全自愿，金额随意。**

<details>
<summary><strong>展开微信收款码</strong></summary>

<p align="center">
  <a href="docs/images/wechat-support.jpg"><img src="docs/images/wechat-support.jpg" width="280" alt="作者提供的微信收款码，用于自愿资助玄枢" /></a><br />
  <sub>微信扫码 · 点击查看原图</sub>
</p>

</details>

---

<p align="center">
  <strong>玄枢 · 五门术数，一处排盘。</strong><br />
  <sub><a href="LICENSE">MIT License</a> · <a href="THIRD_PARTY_NOTICES.md">第三方许可</a></sub><br />
  <sub>用于传统文化学习与个人参考，不代替专业判断。</sub>
</p>
