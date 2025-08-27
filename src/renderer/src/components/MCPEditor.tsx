import React, { useState, useEffect } from 'react';
import { MCPConfig } from '../types';

interface MCPEditorProps {
  mcp?: MCPConfig;
  onSave: (mcp: Omit<MCPConfig, 'id' | 'createdAt' | 'updatedAt'> | MCPConfig) => Promise<void>;
  onCancel: () => void;
}

const MCPEditor: React.FC<MCPEditorProps> = ({ mcp, onSave, onCancel }) => {
  const [name, setName] = useState(mcp?.name || '');
  const [description, setDescription] = useState(mcp?.description || '');
  const [serverName, setServerName] = useState(mcp?.serverName || '');
  const [config, setConfig] = useState<string>(mcp?.config ? JSON.stringify(mcp.config, null, 2) : '{}');
  const [enabled, setEnabled] = useState(mcp?.enabled ?? true);
  const [tags, setTags] = useState<string>(mcp?.tags?.join(', ') || '');
  const [groupId, setGroupId] = useState<string>(mcp?.groupId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取分组列表
  const [groups, setGroups] = useState<any[]>([]);
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const allGroups = await window.api.getAllGroups();
        const mcpGroups = allGroups.filter(group => group.itemType === 'mcp');
        setGroups(mcpGroups);
      } catch (err) {
        console.error('获取分组失败:', err);
      }
    };
    fetchGroups();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !serverName.trim()) {
      setError('名称和服务器名称不能为空');
      return;
    }

    try {
      // 验证 JSON 配置
      JSON.parse(config);
    } catch (err) {
      setError('配置必须是有效的 JSON 格式');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mcpData = {
        name,
        description,
        serverName,
        config: JSON.parse(config),
        enabled,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        groupId: groupId || undefined
      };

      await onSave(mcp ? { ...mcpData, id: mcp.id, createdAt: mcp.createdAt, updatedAt: new Date() } : mcpData);
    } catch (err) {
      setError('保存失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {mcp ? '编辑 MCP 配置' : '新建 MCP 配置'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">名称 *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入 MCP 配置名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">服务器名称 *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="输入服务器名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入描述（可选）"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分组</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">无分组</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="输入标签，用逗号分隔（可选）"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <label className="ml-2 block text-sm text-gray-700">启用配置</label>
          </div>
        </div>

        {/* MCP 配置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">配置 (JSON) *</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            placeholder='{"apiKey": "your-api-key", "baseUrl": "https://api.example.com"}'
            rows={12}
          />
          <p className="mt-1 text-sm text-gray-500">输入有效的 JSON 配置</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-8 flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={onCancel}
          disabled={loading}
        >
          取消
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
};

export default MCPEditor;
