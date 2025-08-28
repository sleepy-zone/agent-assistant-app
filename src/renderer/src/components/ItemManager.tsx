import React, { useState, useEffect } from 'react';
import { BaseItem } from '../types';
import { useDataManager } from '../hooks/useDataManager';
import { useGroups } from '../hooks/useGroups';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Plus, Search, Edit, Copy, Trash2, FolderOpen, Folder } from 'lucide-react';

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
    <div className="flex h-[calc(100vh-80px)]">
      {/* 左侧分组侧边栏 */}
      <Sidebar className="w-64 border-r">
        <SidebarContent>
          <SidebarGroup className="pt-8">
            <SidebarGroupLabel>分组管理</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={selectedGroup === 'all'}
                  onClick={() => setSelectedGroup('all')}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>所有项目</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {items.length}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {currentTypeGroups.map(group => (
                <SidebarMenuItem key={group.id}>
                  <SidebarMenuButton
                    isActive={selectedGroup === group.id}
                    onClick={() => setSelectedGroup(group.id)}
                  >
                    <Folder className="w-4 h-4" />
                    <span>{group.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {items.filter(item => item.groupId === group.id).length}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setShowGroupDrawer(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>新建分组</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          
          {/* 搜索框 */}
          <SidebarGroup>
            <SidebarGroupLabel>搜索</SidebarGroupLabel>
            <div className="px-2">
              <Input
                type="text"
                placeholder={`搜索${getItemTypeLabel()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedGroup === 'all' 
                ? '所有项目' 
                : getGroupById(selectedGroup)?.name || '未知分组'
              }
            </h2>
            <Badge variant="secondary">
              {filteredItems.length} 个项目
            </Badge>
          </div>
          
          <Button onClick={onCreateItem}>
            <Plus className="w-4 h-4 mr-2" />
            新建{getItemTypeLabel()}
          </Button>
        </div>

        {/* 项目列表 */}
        <div className="flex-1 overflow-auto p-4">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FolderOpen className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedGroup === 'all' ? '暂无项目' : '该分组暂无项目'}
              </h3>
              <p className="text-gray-500 mb-4">
                开始创建您的第一个{getItemTypeLabel()}吧
              </p>
              <Button onClick={onCreateItem}>
                <Plus className="w-4 h-4 mr-2" />
                新建{getItemTypeLabel()}
              </Button>
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
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEditItem?.(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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
        </div>
      </div>

      {/* 创建分组抽屉 */}
      {/* 这里可以保持原有的抽屉逻辑 */}
    </div>
  );
};

export default ItemManager;
