import { Menu, MenuItemConstructorOptions, app, BrowserWindow } from 'electron';

export class MenuManager {
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  createMenuBar(): void {
    const menuTemplate: MenuItemConstructorOptions[] = [
      {
        label: '文件',
        submenu: [
          {
            label: '新建',
            submenu: [
              {
                label: 'Prompt',
                click: () => this.handleNewPrompt()
              },
              {
                label: 'MCP 配置',
                click: () => this.handleNewMCP()
              },
              {
                label: 'Agent 配置',
                click: () => this.handleNewAgent()
              }
            ]
          },
          {
            type: 'separator'
          },
          {
            label: '退出',
            accelerator: 'CmdOrCtrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: '编辑',
        submenu: [
          {
            label: '撤销',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
          },
          {
            label: '重做',
            accelerator: 'Shift+CmdOrCtrl+Z',
            role: 'redo'
          },
          {
            type: 'separator'
          },
          {
            label: '剪切',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
          },
          {
            label: '复制',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
          },
          {
            label: '粘贴',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
          }
        ]
      },
      {
        label: '数据',
        submenu: [
          {
            label: '备份数据',
            click: () => this.handleBackup()
          },
          {
            label: '恢复数据',
            click: () => this.handleRestore()
          },
          {
            type: 'separator'
          },
          {
            label: '导出数据',
            click: () => this.handleExport()
          },
          {
            label: '导入数据',
            click: () => this.handleImport()
          }
        ]
      },
      {
        label: '窗口',
        submenu: [
          {
            label: '重新加载',
            accelerator: 'CmdOrCtrl+R',
            click: () => this.mainWindow.reload()
          },
          {
            label: '开发者工具',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click: () => this.mainWindow.webContents.toggleDevTools()
          },
          {
            type: 'separator'
          },
          {
            label: '最小化',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
          }
        ]
      },
      {
        label: '帮助',
        submenu: [
          {
            label: '关于',
            click: () => this.handleAbout()
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
  }

  toggleWindow(): void {
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  private handleNewPrompt(): void {
    this.mainWindow.webContents.send('create-new-item', 'prompt');
  }

  private handleNewMCP(): void {
    this.mainWindow.webContents.send('create-new-item', 'mcp');
  }

  private handleNewAgent(): void {
    this.mainWindow.webContents.send('create-new-item', 'agent');
  }

  private handleBackup(): void {
    this.mainWindow.webContents.send('backup-data');
  }

  private handleRestore(): void {
    this.mainWindow.webContents.send('restore-data');
  }

  private handleExport(): void {
    this.mainWindow.webContents.send('export-data');
  }

  private handleImport(): void {
    this.mainWindow.webContents.send('import-data');
  }

  private handleAbout(): void {
    this.mainWindow.webContents.send('show-about');
  }
}
