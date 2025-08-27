// 数据项基础接口
export interface BaseItem {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  groupId?: string;
  tags?: string[];
}

// 分组接口
export interface Group {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  itemType: 'prompt' | 'mcp' | 'agent';
}

// Prompt 数据结构
export interface PromptItem extends BaseItem {
  content: string;
  variables?: Record<string, string>;
  template?: string;
}

// MCP 配置数据结构
export interface MCPConfig extends BaseItem {
  serverName: string;
  config: Record<string, any>;
  enabled: boolean;
}

// Agent 配置数据结构
export interface AgentConfig extends BaseItem {
  provider: string;
  model: string;
  apiKey: string;
  settings: Record<string, any>;
  enabled: boolean;
}

// 存储数据结构
export interface StorageData {
  prompts: PromptItem[];
  mcpConfigs: MCPConfig[];
  agentConfigs: AgentConfig[];
  groups: Group[];
}
