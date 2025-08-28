import React, { useState, useEffect } from 'react';
import { BaseItem } from '../types';
import { useDataManager } from '../hooks/useDataManager';
import { useGroups } from '../hooks/useGroups';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ItemManagerProps {
  itemType: 'prompt' | 'mcp' | 'agent';
  onEditItem?: (item: BaseItem) => void;
  onCreateItem?: () => void;
  refreshTrigger?: number;
}

const ItemManager: React.FC<ItemManagerProps> = ({ 
  itemType, 
  onEditItem,
  onCreateItem,
  refreshTrigger = 0
}) => {
  const {
    items,
    groups,
    loading,
    error,
    fetchItems,
    fetchGroups,
    deleteItem
  } = useDataManager();
  
  const {
    createGroup,
    updateGroup,
    deleteGroup
  } = useGroups();

  const [filteredItems, setFilteredItems] = useState<BaseItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showGroupDrawer, setShowGroupDrawer] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [copySuccess, setCopySuccess] = useState<{[key: string]: boolean}>({});

  // 获取数据
  useEffect(() => {
    fetchItems(itemType);
    fetchGroups();
  }, [itemType, fetchItems, fetchGroups, refreshTrigger]);

  // 过滤项目
  useEffect(() => {
    let filtered = items as BaseItem[];
    
    // 按分组过滤
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(item => item.groupId === selectedGroup);
    }
    
    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredItems(filtered);
  }, [items, selectedGroup, searchTerm]);

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个项目吗？')) {
      await deleteItem(itemType, id);
    }
  };

  const getItemTypeLabel = () => {
    switch (itemType) {
      case 'prompt': return 'Prompt';
      case 'mcp': return 'MCP 配置';
      case 'agent': return 'Agent 配置';
      default: return '项目';
    }
  };

  const getGroupById = (groupId?: string) => {
    if (!groupId) return null;
    return groups.find(group => group.id === groupId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="ml-2 text-red-800">错误: {error}</span>
        </div>
      </div>
    );
  }

  const currentTypeGroups = groups.filter(group => group.itemType === itemType);

  return (
    <div className="space-y-4 px-4">
      {/* 分组 Tabs 和搜索栏 */}
      <Tabs value={selectedGroup} onValueChange={setSelectedGroup}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder={`搜索${getItemTypeLabel()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button onClick={onCreateItem}>
              新建{getItemTypeLabel()}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <TabsList>
              <TabsTrigger value="all">所有分组</TabsTrigger>
              {currentTypeGroups.map(group => (
                <TabsTrigger key={group.id} value={group.id}>
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowGroupDrawer(true)}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新建分组
            </Button>
          </div>
        </div>

        {/* 所有分组的项目列表 */}
        <TabsContent value="all" className="mt-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无{getItemTypeLabel()}</h3>
              <p className="mt-1 text-sm text-gray-500">开始创建您的第一个{getItemTypeLabel()}吧</p>
              <div className="mt-6">
                <Button onClick={onCreateItem}>
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  新建{getItemTypeLabel()}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900 truncate max-w-[180px]">{item.name}</h3>
                        {item.groupId && (
                          <Badge variant="secondary" className="ml-2">
                            {getGroupById(item.groupId)?.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={async () => {
                            if (itemType === 'prompt' && 'content' in item) {
                              try {
                                await navigator.clipboard.writeText(item.content as string);
                                toast.success('复制成功');
                              } catch (err) {
                                console.error('复制失败:', err);
                                toast.error('复制失败');
                              }
                            }
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEditItem?.(item)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(item.id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 flex-grow line-clamp-2">{item.description}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-400">
                      创建时间: {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 各个分组的项目列表 */}
        {currentTypeGroups.map(group => (
          <TabsContent key={group.id} value={group.id} className="mt-0">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">该分组暂无{getItemTypeLabel()}</h3>
                <p className="mt-1 text-sm text-gray-500">开始创建您的第一个{getItemTypeLabel()}吧</p>
                <div className="mt-6">
                  <Button onClick={onCreateItem}>
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    新建{getItemTypeLabel()}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900 truncate max-w-[180px]">{item.name}</h3>
                          {item.groupId && (
                            <Badge variant="secondary" className="ml-2">
                              {getGroupById(item.groupId)?.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={async () => {
                              if (itemType === 'prompt' && 'content' in item) {
                                try {
                                  await navigator.clipboard.writeText(item.content as string);
                                  toast.success('复制成功');
                                } catch (err) {
                                  console.error('复制失败:', err);
                                  toast.error('复制失败');
                                }
                              }
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEditItem?.(item)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(item.id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 flex-grow line-clamp-2">{item.description}</p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        创建时间: {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Toast 提示通过 sonner 处理 */}

      {/* 创建分组抽屉 */}
      <Drawer open={showGroupDrawer} onOpenChange={setShowGroupDrawer}>
        <DrawerContent className="w-3/4 sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>创建新分组</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">分组名称</Label>
              <Input
                id="group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="输入分组名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">分组描述</Label>
              <Textarea
                id="group-description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="输入分组描述（可选）"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowGroupDrawer(false);
                  setNewGroupName('');
                  setNewGroupDescription('');
                }}
              >
                取消
              </Button>
              <Button
                onClick={async () => {
                  if (!newGroupName.trim()) return;
                  
                  try {
                    await createGroup({
                      name: newGroupName,
                      description: newGroupDescription,
                      itemType
                    });
                    
                    // 重置表单并关闭抽屉
                    setNewGroupName('');
                    setNewGroupDescription('');
                    setShowGroupDrawer(false);
                    
                    // 刷新分组列表
                    fetchGroups();
                  } catch (err) {
                    console.error('创建分组失败:', err);
                    alert('创建分组失败: ' + (err instanceof Error ? err.message : '未知错误'));
                  }
                }}
                disabled={!newGroupName.trim()}
              >
                创建
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ItemManager;
