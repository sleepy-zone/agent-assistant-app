import { useState, useCallback } from 'react';
import { BaseItem, Group } from '../types';

interface UseDataManagerResult {
  // 数据状态
  items: BaseItem[];
  groups: Group[];
  loading: boolean;
  error: string | null;

  // 数据操作函数
  fetchItems: (type: string) => Promise<void>;
  fetchGroups: () => Promise<void>;
  createItem: (type: string, item: Omit<BaseItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<BaseItem | null>;
  updateItem: (type: string, id: string, updates: Partial<BaseItem>) => Promise<BaseItem | null>;
  deleteItem: (type: string, id: string) => Promise<boolean>;
  getItemsByGroup: (type: string, groupId: string) => Promise<BaseItem[]>;

  // 分组操作函数
  createGroup: (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Group | null>;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<Group | null>;
  deleteGroup: (id: string) => Promise<boolean>;
}

export const useDataManager = (): UseDataManagerResult => {
  const [items, setItems] = useState<BaseItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 错误处理
  const handleError = useCallback((err: any) => {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    setError(errorMessage);
    console.error('DataManager error:', errorMessage);
  }, []);

  // 获取所有项目
  const fetchItems = useCallback(async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.api.getAllItems(type);
      setItems(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

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

  // 创建项目
  const createItem = useCallback(async (type: string, item: Omit<BaseItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await window.api.createItem(type, item);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 更新项目
  const updateItem = useCallback(async (type: string, id: string, updates: Partial<BaseItem>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedItem = await window.api.updateItem(type, id, updates);
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: updatedItem.updatedAt } : item));
      return updatedItem;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 删除项目
  const deleteItem = useCallback(async (type: string, id: string) => {
    setLoading(true);
    setError(null);
    try {
      const success = await window.api.deleteItem(type, id);
      if (success) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
      return success;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 根据分组获取项目
  const getItemsByGroup = useCallback(async (type: string, groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.api.getItemsByGroup(type, groupId);
      return data;
    } catch (err) {
      handleError(err);
      return [];
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

  return {
    // 数据状态
    items,
    groups,
    loading,
    error,

    // 数据操作函数
    fetchItems,
    fetchGroups,
    createItem,
    updateItem,
    deleteItem,
    getItemsByGroup,

    // 分组操作函数
    createGroup,
    updateGroup,
    deleteGroup
  };
};
