import React, { useState } from 'react';
import { Group } from '../types';
import { useGroups } from '../hooks/useGroups';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface GroupManagerProps {
  itemType: 'prompt' | 'mcp' | 'agent';
  onGroupCreated?: () => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({ itemType, onGroupCreated }) => {
  const {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup
  } = useGroups();

  const [isCreating, setIsCreating] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  const filteredGroups = groups.filter(group => group.itemType === itemType);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      await createGroup({
        name: newGroupName,
        description: newGroupDescription,
        itemType
      });
      setNewGroupName('');
      setNewGroupDescription('');
      setIsCreating(false);
      onGroupCreated?.();
    } catch (err) {
      console.error('创建分组失败:', err);
    }
  };

  const handleUpdateGroup = async (id: string, updates: Partial<Group>) => {
    try {
      await updateGroup(id, updates);
      setEditingGroupId(null);
    } catch (err) {
      console.error('更新分组失败:', err);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('确定要删除这个分组吗？这不会删除分组内的项目，但会将项目移至"无分组"状态。')) {
      try {
        await deleteGroup(id);
      } catch (err) {
        console.error('删除分组失败:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="ml-2 text-red-800">错误: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      {/* 创建分组表单 */}
      {isCreating ? (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">创建新分组</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">分组名称</label>
              <Input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="输入分组名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">分组描述</label>
              <Textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="输入分组描述（可选）"
                rows={2}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateGroup}>
                创建
              </Button>
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setNewGroupName('');
                setNewGroupDescription('');
              }}>
                取消
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full border-2 border-dashed"
          onClick={() => setIsCreating(true)}
        >
          + 创建新分组
        </Button>
      )}

      {/* 分组列表 */}
      <div className="space-y-2">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">暂无分组</p>
          </div>
        ) : (
          filteredGroups.map(group => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-4">
            {editingGroupId === group.id ? (
              <div className="space-y-3">
                <Input
                  type="text"
                  defaultValue={group.name}
                  onBlur={(e) => handleUpdateGroup(group.id, { name: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateGroup(group.id, { name: (e.target as HTMLInputElement).value });
                    }
                  }}
                  autoFocus
                />
                <Textarea
                  defaultValue={group.description}
                  onBlur={(e) => handleUpdateGroup(group.id, { description: e.target.value })}
                  rows={2}
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => setEditingGroupId(null)}>
                    保存
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingGroupId(null)}>
                    取消
                  </Button>
                </div>
              </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                    {group.description && (
                      <p className="mt-1 text-sm text-gray-500">{group.description}</p>
                    )}
                    <div className="mt-2 text-xs text-gray-400">
                      {new Date(group.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingGroupId(group.id)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupManager;
