import { StorageManager } from '../storage';
import { app } from 'electron';
import path from 'path';
import fs from 'fs-extra';

// Mock Electron app
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/mock/user/data')
  }
}));

// Mock fs-extra
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(),
  writeJSON: jest.fn(),
  readJSON: jest.fn(),
  readdir: jest.fn()
}));

describe('StorageManager', () => {
  let storageManager: StorageManager;
  const mockDbPath = '/mock/user/data/data/storage.json';
  const mockBackupPath = '/mock/user/data/backups';

  beforeEach(async () => {
    (app.getPath as jest.Mock).mockReturnValue('/mock/user/data');
    storageManager = new StorageManager();
    await storageManager.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create data and backup directories', async () => {
      expect(fs.ensureDir).toHaveBeenCalledWith(path.dirname(mockDbPath));
      expect(fs.ensureDir).toHaveBeenCalledWith(mockBackupPath);
    });

    it('should initialize with default data structure', async () => {
      const data = await storageManager.read();
      expect(data).toEqual({
        prompts: [],
        mcpConfigs: [],
        agentConfigs: [],
        groups: []
      });
    });
  });

  describe('read', () => {
    it('should return stored data', async () => {
      const mockData = {
        prompts: [],
        mcpConfigs: [],
        agentConfigs: [],
        groups: []
      };
      
      // Mock the LowDB read method
      (storageManager as any).db.data = mockData;
      
      const data = await storageManager.read();
      expect(data).toEqual(mockData);
    });
  });

  describe('write', () => {
    it('should write data to storage', async () => {
      const testData = {
        prompts: [],
        mcpConfigs: [],
        agentConfigs: [],
        groups: []
      };

      await storageManager.write(testData);
      expect((storageManager as any).db.data).toEqual(testData);
    });
  });

  describe('backup', () => {
    it('should create a backup file', async () => {
      await storageManager.backup();
      expect(fs.writeJSON).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore from backup file', async () => {
      const mockData = {
        prompts: [],
        mcpConfigs: [],
        agentConfigs: [],
        groups: []
      };
      
      (fs.readJSON as jest.Mock).mockResolvedValue(mockData);
      
      const data = await storageManager.restore('/mock/backup.json');
      expect(data).toEqual(mockData);
      expect(fs.readJSON).toHaveBeenCalledWith('/mock/backup.json');
    });
  });
});
