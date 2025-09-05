import { ElectronAPI } from '@electron-toolkit/preload'
import { BaseItem, Group, PromptItem, MCPConfig, AgentConfig } from './renderer/src/types'

interface Api {
  // 数据管理 API
  getAllItems: (type: string) => Promise<BaseItem[]>
  getItemById: (type: string, id: string) => Promise<BaseItem | null>
  createItem: (type: string, item: Omit<BaseItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<BaseItem>
  updateItem: (type: string, id: string, updates: Partial<BaseItem>) => Promise<BaseItem>
  deleteItem: (type: string, id: string) => Promise<boolean>
  getItemsByGroup: (type: string, groupId: string) => Promise<BaseItem[]>

  // 分组管理 API
  getAllGroups: () => Promise<Group[]>
  getGroupById: (id: string) => Promise<Group | null>
  createGroup: (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Group>
  updateGroup: (id: string, updates: Partial<Group>) => Promise<Group>
  deleteGroup: (id: string) => Promise<boolean>

  // 存储管理 API
  backupData: () => Promise<boolean>
  restoreData: (backupFile?: string) => Promise<any>
  getStoragePath: () => Promise<string>

  // 窗口管理 API
  createDetachedWindow: (windowId: string, title: string) => Promise<boolean>
  closeDetachedWindow: (windowId: string) => Promise<boolean>

  // 事件监听
  on: (channel: string, func: (...args: any[]) => void) => void
  off: (channel: string, func: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
