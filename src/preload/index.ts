import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { BaseItem, Group } from '../renderer/src/types'

// Custom APIs for renderer
const api = {
  // 数据管理 API
  getAllItems: (type: string): Promise<BaseItem[]> => 
    ipcRenderer.invoke('get-all-items', type),
  
  getItemById: (type: string, id: string): Promise<BaseItem | null> => 
    ipcRenderer.invoke('get-item-by-id', type, id),
  
  createItem: (type: string, item: Omit<BaseItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<BaseItem> => 
    ipcRenderer.invoke('create-item', type, item),
  
  updateItem: (type: string, id: string, updates: Partial<BaseItem>): Promise<BaseItem> => 
    ipcRenderer.invoke('update-item', type, id, updates),
  
  deleteItem: (type: string, id: string): Promise<boolean> => 
    ipcRenderer.invoke('delete-item', type, id),
  
  getItemsByGroup: (type: string, groupId: string): Promise<BaseItem[]> => 
    ipcRenderer.invoke('get-items-by-group', type, groupId),

  // 分组管理 API
  getAllGroups: (): Promise<Group[]> => 
    ipcRenderer.invoke('get-all-groups'),
  
  getGroupById: (id: string): Promise<Group | null> => 
    ipcRenderer.invoke('get-group-by-id', id),
  
  createGroup: (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group> => 
    ipcRenderer.invoke('create-group', group),
  
  updateGroup: (id: string, updates: Partial<Group>): Promise<Group> => 
    ipcRenderer.invoke('update-group', id, updates),
  
  deleteGroup: (id: string): Promise<boolean> => 
    ipcRenderer.invoke('delete-group', id),

  // 存储管理 API
  backupData: (): Promise<boolean> => 
    ipcRenderer.invoke('backup-data'),
  
  restoreData: (backupFile?: string): Promise<any> => 
    ipcRenderer.invoke('restore-data', backupFile),
  
  getStoragePath: (): Promise<string> => 
    ipcRenderer.invoke('get-storage-path'),

  // 事件监听
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => func(...args))
  },
  
  off: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.off(channel, (_, ...args) => func(...args))
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
