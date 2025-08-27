import { app } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { StorageData } from '../renderer/src/types';

export class StorageManager {
  private db: Low<StorageData>;
  private dbPath: string;
  private backupPath: string;

  constructor(dbPath?: string) {
    const userDataPath = app.getPath('userData');
    this.dbPath = dbPath || path.join(userDataPath, 'data', 'storage.json');
    this.backupPath = path.join(userDataPath, 'backups');
    const adapter = new JSONFile<StorageData>(this.dbPath);
    // 提供默认数据以避免 lowdb 错误
    this.db = new Low<StorageData>(adapter, {
      prompts: [],
      mcpConfigs: [],
      agentConfigs: [],
      groups: []
    });
  }

  async initialize(): Promise<void> {
    // 确保数据目录存在
    await fs.ensureDir(path.dirname(this.dbPath));
    await fs.ensureDir(this.backupPath);

    // 初始化数据库
    await this.db.read();
    
    // 如果数据不存在，初始化默认结构
    if (this.db.data == null) {
      this.db.data = {
        prompts: [],
        mcpConfigs: [],
        agentConfigs: [],
        groups: []
      };
      await this.db.write();
    }
  }

  async read(): Promise<StorageData> {
    await this.db.read();
    return this.db.data || {
      prompts: [],
      mcpConfigs: [],
      agentConfigs: [],
      groups: []
    };
  }

  async write(data: StorageData): Promise<void> {
    this.db.data = data;
    await this.db.write();
  }

  async backup(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupPath, `storage-${timestamp}.json`);
    
    await this.db.read();
    await fs.writeJSON(backupFile, this.db.data, { spaces: 2 });
  }

  async restore(backupFile?: string): Promise<StorageData> {
    if (backupFile) {
      const data = await fs.readJSON(backupFile);
      this.db.data = data;
      await this.db.write();
      return data;
    }
    
    // 恢复最新的备份
    const backups = await fs.readdir(this.backupPath);
    if (backups.length > 0) {
      const latestBackup = backups
        .filter(file => file.startsWith('storage-') && file.endsWith('.json'))
        .sort()
        .reverse()[0];
      
      if (latestBackup) {
        const backupFile = path.join(this.backupPath, latestBackup);
        const data = await fs.readJSON(backupFile);
        this.db.data = data;
        await this.db.write();
        return data;
      }
    }
    
    // 如果没有备份，返回当前数据
    return await this.read();
  }
}
