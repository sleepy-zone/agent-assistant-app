# Implementation Plan

## Overview
创建一个 Electron MenuBar 应用，用于管理 agent 相关的 prompt、MCP 配置和 agent 配置，支持分组管理和增删改查操作，数据存储在本地。应用采用简洁的系统菜单风格，点击菜单栏图标即可展示管理窗口。

## Types

定义统一的数据结构来管理不同类型的内容，支持分组和 CRUD 操作。

```typescript
// 数据项基础接口
interface BaseItem {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  groupId?: string;
  tags?: string[];
}

// 分组接口
interface Group {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  itemType: 'prompt' | 'mcp' | 'agent';
}

// Prompt 数据结构
interface PromptItem extends BaseItem {
  content: string;
  variables?: Record<string, string>;
  template?: string;
}

// MCP 配置数据结构
interface MCPConfig extends BaseItem {
  serverName: string;
  config: Record<string, any>;
  enabled: boolean;
}

// Agent 配置数据结构
interface AgentConfig extends BaseItem {
  provider: string;
  model: string;
  apiKey: string;
  settings: Record<string, any>;
  enabled: boolean;
}

// 存储数据结构
interface StorageData {
  prompts: PromptItem[];
  mcpConfigs: MCPConfig[];
  agentConfigs: AgentConfig[];
  groups: Group[];
}
```

## Files

需要创建新的数据管理模块、UI 组件和配置文件，修改主进程以支持菜单栏应用。

### 新建文件
- `src/main/menu.ts` - 菜单栏管理
- `src/main/storage.ts` - 本地存储管理
- `src/main/dataManager.ts` - 数据管理逻辑
- `src/renderer/src/types/index.ts` - 类型定义
- `src/renderer/src/components/ItemManager.tsx` - 项目管理组件
- `src/renderer/src/components/GroupManager.tsx` - 分组管理组件
- `src/renderer/src/components/PromptEditor.tsx` - Prompt 编辑器
- `src/renderer/src/components/MCPEditor.tsx` - MCP 配置编辑器
- `src/renderer/src/components/AgentEditor.tsx` - Agent 配置编辑器
- `src/renderer/src/hooks/useDataManager.ts` - 数据管理 Hook
- `src/renderer/src/hooks/useGroups.ts` - 分组管理 Hook

### 修改文件
- `src/main/index.ts` - 添加菜单栏支持和 IPC 处理
- `src/preload/index.ts` - 添加新的 IPC 接口
- `src/renderer/src/App.tsx` - 替换为新的管理界面
- `package.json` - 添加存储依赖

### 配置文件
- `data/storage.json` - 本地数据存储文件

## Functions

实现数据存储、分组管理、CRUD 操作和 IPC 通信功能。

### 新增函数

#### 主进程函数 (src/main/index.ts)
- `createMenuBar()` - 创建菜单栏应用
- `toggleWindow()` - 切换窗口显示/隐藏
- `setupMenuEvents()` - 设置菜单事件监听

#### 存储管理函数 (src/main/storage.ts)
- `initializeStorage()` - 初始化存储
- `readData()` - 读取数据
- `writeData()` - 写入数据
- `backupData()` - 备份数据

#### 数据管理函数 (src/main/dataManager.ts)
- `getAllItems(type: string)` - 获取所有项目
- `getItemById(type: string, id: string)` - 根据 ID 获取项目
- `createItem(type: string, item: BaseItem)` - 创建项目
- `updateItem(type: string, id: string, item: Partial<BaseItem>)` - 更新项目
- `deleteItem(type: string, id: string)` - 删除项目
- `getItemsByGroup(type: string, groupId: string)` - 根据分组获取项目

#### 分组管理函数 (src/main/dataManager.ts)
- `getAllGroups()` - 获取所有分组
- `getGroupById(id: string)` - 根据 ID 获取分组
- `createGroup(group: Group)` - 创建分组
- `updateGroup(id: string, group: Partial<Group>)` - 更新分组
- `deleteGroup(id: string)` - 删除分组

#### IPC 处理函数 (src/main/index.ts)
- `handleGetAllItems()` - 处理获取所有项目请求
- `handleCreateItem()` - 处理创建项目请求
- `handleUpdateItem()` - 处理更新项目请求
- `handleDeleteItem()` - 处理删除项目请求
- `handleGetGroups()` - 处理获取分组请求
- `handleCreateGroup()` - 处理创建分组请求
- `handleUpdateGroup()` - 处理更新分组请求
- `handleDeleteGroup()` - 处理删除分组请求

#### 渲染进程函数 (src/renderer/src/hooks/useDataManager.ts)
- `useDataManager()` - 数据管理 Hook
- `fetchItems()` - 获取项目数据
- `createItem()` - 创建项目
- `updateItem()` - 更新项目
- `deleteItem()` - 删除项目

## Classes

创建数据管理类、分组管理类和存储适配器类。

### 新增类

#### StorageManager (src/main/storage.ts)
```typescript
class StorageManager {
  private dbPath: string;
  private backupPath: string;
  
  constructor(dbPath: string);
  async initialize(): Promise<void>;
  async read(): Promise<StorageData>;
  async write(data: StorageData): Promise<void>;
  async backup(): Promise<void>;
  async restore(): Promise<StorageData>;
}
```

#### DataManager (src/main/dataManager.ts)
```typescript
class DataManager {
  private storage: StorageManager;
  
  constructor(storage: StorageManager);
  async getAllItems<T>(type: string): Promise<T[]>;
  async getItemById<T>(type: string, id: string): Promise<T | null>;
  async createItem<T>(type: string, item: T): Promise<T>;
  async updateItem<T>(type: string, id: string, updates: Partial<T>): Promise<T>;
  async deleteItem(type: string, id: string): Promise<boolean>;
  async getItemsByGroup<T>(type: string, groupId: string): Promise<T[]>;
}
```

#### GroupManager (src/main/dataManager.ts)
```typescript
class GroupManager {
  private storage: StorageManager;
  
  constructor(storage: StorageManager);
  async getAllGroups(): Promise<Group[]>;
  async getGroupById(id: string): Promise<Group | null>;
  async createGroup(group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group>;
  async updateGroup(id: string, updates: Partial<Group>): Promise<Group>;
  async deleteGroup(id: string): Promise<boolean>;
}
```

## Dependencies

需要添加本地存储相关的依赖（推荐使用 lowdb 作为轻量级 JSON 数据库）。

### 新增依赖
```json
{
  "dependencies": {
    "lowdb": "^7.0.1",
    "lodash-es": "^4.17.21"
  },
  "devDependencies": {
    "@types/lodash-es": "^4.17.12"
  }
}
```

## Testing

创建单元测试和集成测试来验证功能。

### 测试文件
- `src/main/__tests__/storage.test.ts` - 存储功能测试
- `src/main/__tests__/dataManager.test.ts` - 数据管理测试
- `src/main/__tests__/groupManager.test.ts` - 分组管理测试
- `src/renderer/src/__tests__/hooks/useDataManager.test.ts` - Hook 测试
- `src/renderer/src/__tests__/components/ItemManager.test.tsx` - 组件测试

### 测试策略
- 单元测试：测试每个函数和类的基本功能
- 集成测试：测试 IPC 通信和数据流
- UI 测试：测试组件渲染和用户交互

## Implementation Order

按照数据层 → 业务逻辑层 → UI 层 → 集成测试的顺序实现。

1. 创建存储管理模块 (StorageManager)
2. 实现数据管理类 (DataManager, GroupManager)
3. 设置主进程 IPC 处理和菜单栏功能
4. 创建类型定义和 Hook
5. 开发 UI 组件 (ItemManager, GroupManager, Editors)
6. 集成所有组件到主应用
7. 添加测试用例
8. 进行集成测试和调试
9. 优化性能和用户体验
10. 文档编写和最终测试
