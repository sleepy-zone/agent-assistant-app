# Agent Assistant App

一个基于 Electron 的桌面应用，用于管理 AI 相关的 Prompt、MCP 配置和 Agent 配置。

## 功能特性

- 📝 **Prompt 管理** - 创建、编辑、组织和管理各种 AI Prompt
- ⚙️ **MCP 配置** - 管理 Model Context Protocol 服务器配置
- 🤖 **Agent 配置** - 配置不同的 AI Agent 设置
- 📁 **分组管理** - 按类别组织项目，支持分组和标签
- 🔍 **搜索过滤** - 快速查找和过滤项目
- 💾 **本地存储** - 数据保存在本地，支持备份和恢复
- 🖥️ **标准桌面应用** - 采用标准桌面应用窗口设计

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **React** - 前端用户界面
- **TypeScript** - 类型安全的 JavaScript
- **LowDB** - 轻量级本地数据库
- **Tailwind CSS** - 实用优先的 CSS 框架

## 安装和运行

### 克隆项目

```bash
git clone <repository-url>
cd agent-assistant-app
```

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm run dev
```

### 构建应用

```bash
# For Windows
pnpm run build:win

# For macOS
pnpm run build:mac

# For Linux
pnpm run build:linux
```

## 项目结构

```
src/
├── main/          # 主进程代码
│   ├── storage.ts      # 本地存储管理
│   ├── dataManager.ts  # 数据管理逻辑
│   └── index.ts        # 主进程入口
├── preload/       # 预加载脚本
│   ├── index.ts        # IPC 通信桥接
│   └── index.d.ts      # 类型定义
└── renderer/      # 渲染进程代码
    ├── src/
    │   ├── components/     # React 组件
    │   ├── hooks/          # 自定义 Hook
    │   ├── types/          # TypeScript 类型定义
    │   └── App.tsx         # 主应用组件
    └── assets/        # 静态资源
```

## 数据结构

### Prompt 项目
```typescript
interface PromptItem extends BaseItem {
  content: string;
  variables?: Record<string, string>;
  template?: string;
}
```

### MCP 配置
```typescript
interface MCPConfig extends BaseItem {
  serverName: string;
  config: Record<string, any>;
  enabled: boolean;
}
```

### Agent 配置
```typescript
interface AgentConfig extends BaseItem {
  provider: string;
  model: string;
  apiKey: string;
  settings: Record<string, any>;
  enabled: boolean;
}
```

### 分组
```typescript
interface Group {
  id: string;
  name: string;
  description: string;
  itemType: 'prompt' | 'mcp' | 'agent';
}
```

## 开发指南

### 添加新功能

1. 在 `src/renderer/src/types/index.ts` 中定义数据结构
2. 在 `src/main/dataManager.ts` 中实现数据管理逻辑
3. 创建对应的 React 组件在 `src/renderer/src/components/`
4. 更新 `src/renderer/src/App.tsx` 集成新功能

### 测试

```bash
# 运行测试
pnpm run test

# 运行测试并生成覆盖率报告
pnpm run test:coverage
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！
