import { app, BrowserWindow, ipcMain, Tray, nativeImage, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { StorageManager } from './storage'
import { DataManager, GroupManager } from './dataManager'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let storageManager: StorageManager
let dataManager: DataManager
let groupManager: GroupManager

function createWindow(): void {
  // 获取系统托盘位置
  const trayBounds = tray?.getBounds() || { x: 0, y: 0, width: 0, height: 0 }
  const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y })
  
  // 计算窗口位置，使其显示在托盘图标附近
  const windowWidth = 800
  const windowHeight = 600
  let x = trayBounds.x + Math.floor(trayBounds.width / 2) - Math.floor(windowWidth / 2)
  let y = trayBounds.y

  // 确保窗口不会超出屏幕边界
  if (x + windowWidth > display.workArea.x + display.workArea.width) {
    x = display.workArea.x + display.workArea.width - windowWidth
  }
  if (x < display.workArea.x) {
    x = display.workArea.x
  }
  
  // 根据托盘位置决定窗口显示在上方还是下方
  if (trayBounds.y > display.workArea.height / 2) {
    // 托盘在屏幕下半部分，窗口显示在上方
    y = trayBounds.y - windowHeight
  } else {
    // 托盘在屏幕上半部分，窗口显示在下方
    y = trayBounds.y + trayBounds.height
  }

  // Create the browser window as a popup window
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    fullscreenable: false,
    skipTaskbar: true,
    backgroundColor: '#333333',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  // 隐藏菜单栏
  mainWindow.setMenuBarVisibility(false)

  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide()
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createTray(): void {
  // 创建系统托盘图标
  const trayIcon = nativeImage.createFromPath(join(__dirname, '../../resources/icon.png'))
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))
  
  // 不设置上下文菜单，只通过点击事件控制窗口显示/隐藏
  tray.setIgnoreDoubleClickEvents(true)
  
  // 点击托盘图标切换窗口显示
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        // 重新计算窗口位置
        const trayBounds = tray?.getBounds() || { x: 0, y: 0, width: 0, height: 0 }
        const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y })
        
        const windowWidth = 800
        const windowHeight = 600
        let x = trayBounds.x + Math.floor(trayBounds.width / 2) - Math.floor(windowWidth / 2)
        let y = trayBounds.y

        if (x + windowWidth > display.workArea.x + display.workArea.width) {
          x = display.workArea.x + display.workArea.width - windowWidth
        }
        if (x < display.workArea.x) {
          x = display.workArea.x
        }
        
        if (trayBounds.y > display.workArea.height / 2) {
          y = trayBounds.y - windowHeight
        } else {
          y = trayBounds.y + trayBounds.height
        }

        mainWindow.setPosition(x, y, false)
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // 隐藏 dock 图标 (macOS)
  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide()
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 初始化数据管理器
  await initializeDataManagers()

  // 创建系统托盘
  createTray()

  // 创建主窗口
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

// Cleanup on quit
app.on('before-quit', () => {
  if (tray) {
    tray.destroy()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
