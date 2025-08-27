import { StorageManager } from './storage';
import { BaseItem, Group } from '../renderer/src/types';
import { v4 as uuidv4 } from 'uuid';

export class DataManager {
  private storage: StorageManager;

  constructor(storage: StorageManager) {
    this.storage = storage;
  }

  async getAllItems<T extends BaseItem>(type: string): Promise<T[]> {
    const data = await this.storage.read();
    return (data as any)[this.getCollectionName(type)] || [];
  }

  async getItemById<T extends BaseItem>(type: string, id: string): Promise<T | null> {
    const items = await this.getAllItems<T>(type);
    return items.find(item => item.id === id) || null;
  }

  async createItem<T extends BaseItem>(type: string, item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const data = await this.storage.read();
    const collectionName = this.getCollectionName(type);
    const now = new Date();
    
    const newItem = {
      ...item,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    } as T;

    if (!data[collectionName]) {
      data[collectionName] = [];
    }
    
    data[collectionName].push(newItem);
    await this.storage.write(data);
    
    return newItem;
  }

  async updateItem<T extends BaseItem>(type: string, id: string, updates: Partial<T>): Promise<T> {
    const data = await this.storage.read();
    const collectionName = this.getCollectionName(type);
    const items = data[collectionName] || [];
    const index = items.findIndex((item: BaseItem) => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }
    
    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date()
    } as T;
    
    items[index] = updatedItem;
    data[collectionName] = items;
    await this.storage.write(data);
    
    return updatedItem;
  }

  async deleteItem(type: string, id: string): Promise<boolean> {
    const data = await this.storage.read();
    const collectionName = this.getCollectionName(type);
    const items = data[collectionName] || [];
    const initialLength = items.length;
    
    const filteredItems = items.filter((item: BaseItem) => item.id !== id);
    data[collectionName] = filteredItems;
    await this.storage.write(data);
    
    return filteredItems.length < initialLength;
  }

  async getItemsByGroup<T extends BaseItem>(type: string, groupId: string): Promise<T[]> {
    const items = await this.getAllItems<T>(type);
    return items.filter(item => item.groupId === groupId);
  }

  private getCollectionName(type: string): string {
    switch (type) {
      case 'prompt':
        return 'prompts';
      case 'mcp':
        return 'mcpConfigs';
      case 'agent':
        return 'agentConfigs';
      default:
        return type;
    }
  }
}

export class GroupManager {
  private storage: StorageManager;

  constructor(storage: StorageManager) {
    this.storage = storage;
  }

  async getAllGroups(): Promise<Group[]> {
    const data = await this.storage.read();
    return data.groups || [];
  }

  async getGroupById(id: string): Promise<Group | null> {
    const groups = await this.getAllGroups();
    return groups.find(group => group.id === id) || null;
  }

  async createGroup(group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group> {
    const data = await this.storage.read();
    const now = new Date();
    
    const newGroup = {
      ...group,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };

    if (!data.groups) {
      data.groups = [];
    }
    
    data.groups.push(newGroup);
    await this.storage.write(data);
    
    return newGroup;
  }

  async updateGroup(id: string, updates: Partial<Group>): Promise<Group> {
    const data = await this.storage.read();
    const groups = data.groups || [];
    const index = groups.findIndex(group => group.id === id);
    
    if (index === -1) {
      throw new Error(`Group with id ${id} not found`);
    }
    
    const updatedGroup = {
      ...groups[index],
      ...updates,
      updatedAt: new Date()
    };
    
    groups[index] = updatedGroup;
    data.groups = groups;
    await this.storage.write(data);
    
    return updatedGroup;
  }

  async deleteGroup(id: string): Promise<boolean> {
    const data = await this.storage.read();
    const groups = data.groups || [];
    const initialLength = groups.length;
    
    const filteredGroups = groups.filter(group => group.id !== id);
    data.groups = filteredGroups;
    await this.storage.write(data);
    
    return filteredGroups.length < initialLength;
  }
}
