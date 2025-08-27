import { useState, useEffect, useCallback } from 'react';
import { Group } from '../types';

interface UseGroupsResult {
  groups: Group[];
  loading: boolean;
  error: string | null;
  fetchGroups: () => Promise<void>;
  createGroup: (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Group | null>;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<Group | null>;
  deleteGroup: (id: string) => Promise<boolean>;
  getGroupById: (id: string) => Group | null;
}

export const useGroups = (): UseGroupsResult => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 错误处理
  const handleError = useCallback((err: any) => {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    setError(errorMessage);
    console.error('Groups error:', errorMessage);
  }, []);

  // 获取所有分组
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.api.getAllGroups();
      setGroups(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 创建分组
  const createGroup = useCallback(async (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newGroup = await window.api.createGroup(group);
      setGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 更新分组
  const updateGroup = useCallback(async (id: string, updates: Partial<Group>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedGroup = await window.api.updateGroup(id, updates);
      setGroups(prev => prev.map(group => group.id === id ? { ...group, ...updates, updatedAt: updatedGroup.updatedAt } : group));
      return updatedGroup;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 删除分组
  const deleteGroup = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await window.api.deleteGroup(id);
      if (success) {
        setGroups(prev => prev.filter(group => group.id !== id));
      }
      return success;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 根据ID获取分组
  const getGroupById = useCallback((id: string) => {
    return groups.find(group => group.id === id) || null;
  }, [groups]);

  // 初始化时获取分组
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupById
  };
};
