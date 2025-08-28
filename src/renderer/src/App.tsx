import React, { useState, useEffect } from 'react';
import ItemManager from './components/ItemManager';
import GroupManager from './components/GroupManager';
import PromptEditor from './components/PromptEditor';
import MCPEditor from './components/MCPEditor';
import AgentEditor from './components/AgentEditor';
import { BaseItem, PromptItem, MCPConfig, AgentConfig } from './types';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'prompt' | 'mcp' | 'agent'>('prompt');
  const [showEditor, setShowEditor] = useState<'prompt' | 'mcp' | 'agent' | null>(null);
  const [editingItem, setEditingItem] = useState<BaseItem | null>(null);
  const [showGroups, setShowGroups] = useState(false);

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
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const getTabLabel = (tab: 'prompt' | 'mcp' | 'agent') => {
    switch (tab) {
      case 'prompt': return 'Prompts';
      case 'mcp': return 'MCP 配置';
      case 'agent': return 'Agent 配置';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-10 bg-white shadow-sm border-b border-gray-200 pl-20 draggable-area">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">Agent Assistant</h1>
            </div>
            <div className="flex items-center space-x-4 no-drag">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGroups(!showGroups)}
              >
                {showGroups ? '隐藏分组' : '显示分组'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-0 py-2">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 主内容区 */}
          <div className="flex-1">
            {/* 标签页导航 */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'prompt' | 'mcp' | 'agent')} className="px-8">
              <TabsList>
                <TabsTrigger value="prompt">Prompts</TabsTrigger>
                <TabsTrigger value="mcp">MCP 配置</TabsTrigger>
                <TabsTrigger value="agent">Agent 配置</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-4">
                {/* 编辑器或管理器 */}
                <ItemManager
                  itemType={activeTab}
                  onEditItem={handleEditItem}
                  onCreateItem={handleCreateItem}
                />
                
                {/* Drawer 编辑器 */}
                <Drawer open={!!showEditor} onOpenChange={(open) => !open && setShowEditor(null)}>
                  <DrawerContent className="w-3/4 sm:max-w-3xl">
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
              </TabsContent>
            </Tabs>
          </div>

          {/* 分组管理侧边栏 */}
          {showGroups && (
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">分组管理</h2>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowGroups(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <GroupManager
                  itemType={activeTab}
                  onGroupCreated={() => {
                    // 可以在这里刷新分组列表
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
