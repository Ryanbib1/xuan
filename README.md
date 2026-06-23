# 玄 · 部署指南（GitHub + Vercel + Cloudflare 域名）

一个仓库同时包含**前端**(`index.html`)和**后端**(`api/zhengyuan.js`)。
推到 GitHub → Vercel 自动部署 → 前端、后端、HTTPS、访问统计一站全包。
免费版功能纯前端零成本；只有「正缘深度解读」走后端用服务端密钥。

## 仓库结构

```
index.html         # 前端（= xuan2.html，Vercel 自动当首页）
api/zhengyuan.js   # 后端 Serverless 函数 → 上线后变 /api/zhengyuan
vercel.json        # 路由/函数配置
dev-server.js      # 本地联调（含 Vercel res 兼容 shim）
package.json
.env.example
.gitignore
```

前端深算逻辑：**优先调后端 `/api/zhengyuan`（用户无需 key）；后端不可达时回退「体验模式」用用户自己的 key**。所以本地双击 `index.html` 也能用体验模式，部署到 Vercel 后自动走服务端密钥。

---

## 一、推到 GitHub（你有账号）

不用命令行也行，二选一：

**A. 网页拖拽（最省事）**
1. github.com → 右上 `+` → New repository → 命名如 `xuan` → 选 **Private** → Create。
2. 进仓库 → `uploading an existing file` → 把本文件夹里**所有文件**(含 `api` 文件夹)拖进去 → Commit。
   > ⚠️ 别上传 `.env`（里面是密钥）。本仓库 `.gitignore` 已挡，但网页拖拽不读 `.gitignore`，所以**手动别拖 `.env`**（现在也还没这个文件，安全）。

**B. 命令行**
```bash
cd ~/"Documents/Claude Code/code/20260623_玄正缘后端"
git init && git add -A && git commit -m "玄 初次部署"
git branch -M main
git remote add origin https://github.com/你的用户名/xuan.git
git push -u origin main
```

## 二、Vercel 首次使用（5 分钟）

1. 打开 **vercel.com** → `Sign Up` → 选 **Continue with GitHub**（直接用 GitHub 登录，免新账号）。
2. 授权后 → `Add New...` → `Project` → 找到刚才的 `xuan` 仓库 → `Import`。
3. 配置页**什么都不用改**（框架选 Other / 自动识别即可）。先别急着点 Deploy，**先加密钥**：
   - 展开 `Environment Variables` → Name 填 `ANTHROPIC_API_KEY`、Value 填你的 `sk-ant-...` → Add。
4. 点 **Deploy**，等 1 分钟。完成后给你一个 `https://xuan-xxxx.vercel.app`。
5. 打开它 → 正缘 → 排盘 → 点「✦ 深算正缘 ✦」。**这次不用填任何 key**，就能出深度解读 = 后端在干活 ✅

> 以后只要往 GitHub 一 push，Vercel 自动重新部署，无需手动操作。

## 三、接自定义域名（Cloudflare）

假设你的域名在 Cloudflare（或打算买后用 Cloudflare 管 DNS）：

1. Vercel 项目 → `Settings` → `Domains` → 输入你的域名（如 `xuan.com` 或 `www.xuan.com`）→ Add。
2. Vercel 会给你**要填的 DNS 记录**（通常是一条 `CNAME` 指向 `cname.vercel-dns.com`，根域名则给一个 `A` 记录 IP）。
3. 去 **Cloudflare → 你的域名 → DNS → Add record**，按 Vercel 给的值填：
   - 类型/名称/目标照抄。
   - **代理状态先设为「DNS only」（灰色云朵）**，别开橙色云朵——否则 Cloudflare 和 Vercel 两层 SSL 容易打架。等通了再考虑要不要开代理（开的话 Cloudflare SSL 模式要设 `Full`）。
4. 回 Vercel Domains 页等它变成 ✅ Valid（几分钟到几十分钟）。完成后你的域名就指向玄了，HTTPS 自动配好。

## 四、访问统计

`index.html` 已内置 Vercel Analytics 脚本（`/_vercel/insights/script.js`），但需在 Vercel 后台开一下：
- 项目 → `Analytics` 标签 → `Enable`（免费档够个人用）。
- 之后能看 PV/UV、来源、热门页面——**不采集用户隐私数据**，正好对应你想要的「看多少人来、用了啥」。

---

## 本地联调（可选）

```bash
cd ~/"Documents/Claude Code/code/20260623_玄正缘后端"
ANTHROPIC_API_KEY=sk-ant-xxxx node dev-server.js
open http://localhost:8787   # 首页即 index.html，深算走本地 /api/zhengyuan
```

## 阶段 2 / 3：接支付（等你拿到资质）

- `api/zhengyuan.js` 顶部已留 `TODO 付费版`：校验订单已支付，否则 `402`。
- 个人友好的第三方聚合支付（虎皮椒 / PayJS）→ 回调标记订单已付 → 前端凭订单号请求深算。
- 那时把前端「体验模式」入口隐藏，改成「购买深度解读」。

## 安全备忘

- 密钥**只**在 Vercel 环境变量里，永不进 Git、永不进前端。
- `api/zhengyuan.js` 的 CORS 现在是 `*`，前后端同仓库同域时可收紧成你的正式域名。
- 上线前可在后端加简单频率限制，防被刷爆 token。
