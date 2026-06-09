# 设计人生 - 游戏化自律系统

一套将人生管理游戏化的 React + TypeScript 应用，帮助你将自律变成上瘾的游戏体验。

## 🎮 功能特性

- **首页仪表盘** - 等级系统、经验值、任务进度、健康数据概览
- **任务系统** - 天/周/月三视图切换，主线/支线/日常任务分类
- **数据记录** - 睡眠、饮食、运动、视频项目进度追踪
- **虾教头NPC** - 毒舌但心软的AI助手，提供互动对话
- **积分商城** - 完成任务赚取积分，兑换专属奖励
- **复盘中心** - 自动生成周报，数据可视化分析

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
cd design-life-game
npm install
```

### 启动开发服务器
```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 构建生产版本
```bash
npm run build
```

## 🚢 GitHub Pages 自动部署

本项目已配置 GitHub Actions 部署到 GitHub Pages。远程仓库为：

```text
https://github.com/feibo123132/lifegaming
```

仓库 Settings → Pages 的 Source 需要保持为 `GitHub Actions`。之后每次把最新代码 push 到 `main` 分支，`.github/workflows/deploy-pages.yml` 会自动安装依赖、执行构建，并把 `dist` 发布到 GitHub Pages。

部署后的项目路径为：

```text
https://feibo123132.github.io/lifegaming/
```

## ☁️ 腾讯云开发数据同步

本项目使用腾讯云开发 CloudBase 的身份认证和数据库完成多端同步。用户使用同一个邮箱登录后，任务完成状态、可用积分、奖励兑换记录、NPC 对话会同步到同一份云端数据。

### 云端集合

在云开发控制台的数据库中创建集合：

```text
lifegaming_user_states
```

每个邮箱用户会在该集合中维护一条文档，核心字段包括：

```ts
{
  userId: "your-email@example.com",
  version: 1,
  data: {
    tasks: [],
    userPoints: 1580,
    redeemedRewardIds: [],
    redeemHistory: [],
    npcMessages: [],
    npcState: "working",
    updatedAt: "2026-06-09T00:00:00.000Z"
  },
  updateTime: "2026-06-09T00:00:00.000Z",
  createTime: "2026-06-09T00:00:00.000Z"
}
```

### 环境变量

本地开发可创建 `.env.local`：

```bash
VITE_CLOUDBASE_ENV_ID=你的环境ID
VITE_CLOUDBASE_REGION=ap-shanghai
```

GitHub Actions 部署时，在仓库 `Settings -> Secrets and variables -> Actions -> Variables` 添加：

```text
VITE_CLOUDBASE_ENV_ID = 你的环境ID
VITE_CLOUDBASE_REGION = ap-shanghai
```

## 📁 项目结构

```
design-life-game/
├── src/
│   ├── components/     # 共享组件
│   │   ├── Layout.tsx
│   │   ├── ProgressRing.tsx
│   │   └── PointsAnimation.tsx
│   ├── pages/          # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── Tasks.tsx
│   │   ├── DataRecord.tsx
│   │   ├── NPC.tsx
│   │   ├── Shop.tsx
│   │   └── Review.tsx
│   ├── data/           # 模拟数据
│   │   └── mockData.ts
│   ├── types/          # TypeScript类型定义
│   │   └── index.ts
│   ├── utils/          # 工具函数
│   │   └── helpers.ts
│   ├── styles/         # 样式文件
│   │   └── index.css
│   ├── App.tsx
│   └── main.tsx
├── public/             # 静态资源
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🛠 技术栈

- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **Recharts** - 数据可视化
- **Lucide React** - 图标库

## 📝 使用说明

1. 点击左侧导航栏切换不同功能页面
2. 在**任务**页面可以切换天/周/月视图查看任务
3. 完成任务会自动获得积分，并有动画反馈
4. 在**数据记录**页面记录睡眠、饮食、运动数据
5. 和**虾教头**对话获取建议和鼓励
6. 在**积分商城**用积分兑换奖励
7. 在**复盘中心**查看周报和数据分析

## 🎨 自定义配置

### 修改用户数据
编辑 `src/data/mockData.ts` 中的 `currentUser` 对象

### 添加新任务
在 `src/data/mockData.ts` 的 `initialTasks` 数组中添加

### 修改积分奖励
编辑 `src/data/mockData.ts` 中的 `rewards` 数组

## 📄 许可证

MIT License
