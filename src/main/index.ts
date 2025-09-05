import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { StorageManager } from './storage'
import { DataManager, GroupManager } from './dataManager'

let mainWindow: BrowserWindow | null = null
let storageManager: StorageManager
let dataManager: DataManager
let groupManager: GroupManager

// 存储所有打开的窗口
const openWindows: Map<string, BrowserWindow> = new Map()

// 创建独立窗口
async function createDetachedWindow(windowId: string, title: string): Promise<boolean> {
  // 如果窗口已存在，直接显示
  if (openWindows.has(windowId)) {
    const existingWindow = openWindows.get(windowId)
    if (existingWindow) {
      existingWindow.show()
      existingWindow.focus()
      return true
    }
  }

  // 创建新窗口
  const detachedWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
    frame: true,
    resizable: true,
    movable: true,
    fullscreenable: true,
    skipTaskbar: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  // 设置窗口标题
  detachedWindow.setTitle(title)

  // 存储窗口引用
  openWindows.set(windowId, detachedWindow)

  // 监听窗口关闭事件
  detachedWindow.on('closed', () => {
    openWindows.delete(windowId)
  })

  // 显示窗口
  detachedWindow.show()
  detachedWindow.focus()

  // 加载内容
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    detachedWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    detachedWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return true
}

// 关闭独立窗口
function closeDetachedWindow(windowId: string): boolean {
  const window = openWindows.get(windowId)
  if (window) {
    window.close()
    openWindows.delete(windowId)
    return true
  }
  return false
}

function createWindow(): void {
  // Create a regular application window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    frame: true,
    autoHideMenuBar: true,
    resizable: true,
    movable: true,
    titleBarStyle: 'hiddenInset',
    fullscreenable: true,
    skipTaskbar: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  // 显示菜单栏
  mainWindow.setMenuBarVisibility(true)

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 初始化数据管理器
async function initializeDataManagers(): Promise<void> {
  storageManager = new StorageManager()
  await storageManager.initialize()
  dataManager = new DataManager(storageManager)
  groupManager = new GroupManager(storageManager)
}

// 设置 IPC 处理
function setupIPC(): void {
  // 数据管理 IPC 处理
  ipcMain.handle('get-all-items', async (_, type: string) => {
    return await dataManager.getAllItems(type)
  })

  ipcMain.handle('get-item-by-id', async (_, type: string, id: string) => {
    return await dataManager.getItemById(type, id)
  })

  ipcMain.handle('create-item', async (_, type: string, item: any) => {
    return await dataManager.createItem(type, item)
  })

  ipcMain.handle('update-item', async (_, type: string, id: string, updates: any) => {
    return await dataManager.updateItem(type, id, updates)
  })

  ipcMain.handle('delete-item', async (_, type: string, id: string) => {
    return await dataManager.deleteItem(type, id)
  })

  ipcMain.handle('get-items-by-group', async (_, type: string, groupId: string) => {
    return await dataManager.getItemsByGroup(type, groupId)
  })

  // 分组管理 IPC 处理
  ipcMain.handle('get-all-groups', async () => {
    return await groupManager.getAllGroups()
  })

  ipcMain.handle('get-group-by-id', async (_, id: string) => {
    return await groupManager.getGroupById(id)
  })

  ipcMain.handle('create-group', async (_, group: any) => {
    return await groupManager.createGroup(group)
  })

  ipcMain.handle('update-group', async (_, id: string, updates: any) => {
    return await groupManager.updateGroup(id, updates)
  })

  ipcMain.handle('delete-group', async (_, id: string) => {
    return await groupManager.deleteGroup(id)
  })

  // 存储管理 IPC 处理
  ipcMain.handle('backup-data', async () => {
    await storageManager.backup()
    return true
  })

  ipcMain.handle('restore-data', async (_, backupFile?: string) => {
    return await storageManager.restore(backupFile)
  })

  ipcMain.handle('get-storage-path', async () => {
    return storageManager['dbPath']
  })

  // 窗口管理 IPC 处理
  ipcMain.handle('create-detached-window', async (_, windowId: string, title: string) => {
    return await createDetachedWindow(windowId, title)
  })

  ipcMain.handle('close-detached-window', async (_, windowId: string) => {
    return closeDetachedWindow(windowId)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // 显示 dock 图标 (macOS) - 根据用户要求优化
  if (process.platform === 'darwin' && app.dock) {
    app.dock.show()
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 初始化数据管理器
  await initializeDataManagers()

  // 创建主窗口（不再创建系统托盘）
  createWindow()

  // 设置 IPC 处理
  setupIPC()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
