import React, { useState, useEffect } from 'react';
import ItemManager from './components/ItemManager';
import PromptEditor from './components/PromptEditor';
import MCPEditor from './components/MCPEditor';
import AgentEditor from './components/AgentEditor';
import { BaseItem, PromptItem, MCPConfig, AgentConfig } from './types';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'prompt' | 'mcp' | 'agent'>('prompt');
  const [showEditor, setShowEditor] = useState<'prompt' | 'mcp' | 'agent' | null>(null);
  const [editingItem, setEditingItem] = useState<BaseItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // 监听菜单事件
  useEffect(() => {
    const handleCreateNewItem = (_: any, itemType: 'prompt' | 'mcp' | 'agent') => {
      setEditingItem(null);
      setShowEditor(itemType);
    };

    const handleShowAbout = () => {
      alert('Agent Assistant App\n版本 1.0.0\n一个用于管理 Prompt、MCP 配置和 Agent 配置的 Electron 应用');
    };

    window.api.on('create-new-item', handleCreateNewItem);
    window.api.on('show-about', handleShowAbout);

    return () => {
      window.api.off('create-new-item', handleCreateNewItem);
      window.api.off('show-about', handleShowAbout);
    };
  }, []);

  const handleEditItem = (item: BaseItem) => {
    setEditingItem(item);
    if ('content' in item) {
      setShowEditor('prompt');
    } else if ('serverName' in item) {
      setShowEditor('mcp');
    } else if ('provider' in item) {
      setShowEditor('agent');
    }
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setShowEditor(activeTab);
  };

  const handleSaveItem = async (item: any) => {
    try {
      if (editingItem) {
        // 更新现有项目
        await window.api.updateItem(activeTab, editingItem.id, item);
      } else {
        // 创建新项目
        await window.api.createItem(activeTab, item);
      }
      setShowEditor(null);
      setEditingItem(null);
      
      // 触发刷新
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 - 简化版本 */}
      <header className="h-12 bg-white shadow-sm border-b border-gray-200 flex items-center px-4 draggable-area">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold text-transparent">Agent Assistant</h1>
          <div className="flex items-center space-x-2 no-drag">
            {/* 分类 Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'prompt' | 'mcp' | 'agent')}>
              <TabsList className="h-8">
                <TabsTrigger value="prompt" className="text-xs px-2">Prompts</TabsTrigger>
                <TabsTrigger value="mcp" className="text-xs px-2">MCP</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <SidebarProvider>
        <div className="px-2 py-2" style={{ height: 'calc(600px - 48px - 16px)', width: '100%' }}>
          {/* 主内容区 */}
          <ItemManager
            itemType={activeTab}
            onEditItem={handleEditItem}
            onCreateItem={handleCreateItem}
            refreshTrigger={refreshTrigger}
          />
        </div>
        
        {/* Drawer 编辑器 */}
        <Drawer open={!!showEditor} onOpenChange={(open) => !open && setShowEditor(null)} dismissible={false}>
          <DrawerContent className="h-5/6">
            <div className="flex flex-col h-full">
              <DrawerHeader className="flex-shrink-0">
                <DrawerTitle>
                  {showEditor === 'prompt' && (editingItem ? '编辑 Prompt' : '新建 Prompt')}
                  {showEditor === 'mcp' && (editingItem ? '编辑 MCP 配置' : '新建 MCP 配置')}
                  {showEditor === 'agent' && (editingItem ? '编辑 Agent 配置' : '新建 Agent 配置')}
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {showEditor === 'prompt' && (
                  <PromptEditor
                    prompt={editingItem as PromptItem}
                    onSave={handleSaveItem}
                    onCancel={() => {
                      setShowEditor(null);
                      setEditingItem(null);
                    }}
                  />
                )}
                {showEditor === 'mcp' && (
                  <MCPEditor
                    mcp={editingItem as MCPConfig}
                    onSave={handleSaveItem}
                    onCancel={() => {
                      setShowEditor(null);
                      setEditingItem(null);
                    }}
                  />
                )}
                {showEditor === 'agent' && (
                  <AgentEditor
                    agent={editingItem as AgentConfig}
                    onSave={handleSaveItem}
                    onCancel={() => {
                      setShowEditor(null);
                      setEditingItem(null);
                    }}
                  />
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </SidebarProvider>
      <Toaster />
    </div>
  );
}

export default App;
