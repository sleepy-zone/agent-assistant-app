import React, { useState, useEffect } from 'react';
import { MCPConfig } from '../types';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface MCPEditorProps {
  mcp?: MCPConfig;
  onSave: (mcp: Omit<MCPConfig, 'id' | 'createdAt' | 'updatedAt'> | MCPConfig) => Promise<void>;
  onCancel: () => void;
}

const MCPEditor: React.FC<MCPEditorProps> = ({ mcp, onSave, onCancel }) => {
  const [name, setName] = useState(mcp?.name || '');
  const [description, setDescription] = useState(mcp?.description || '');
  const [config, setConfig] = useState<string>(mcp?.config ? JSON.stringify(mcp.config, null, 2) : '{\n  "mcpServers": {}\n}');
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
    if (!name.trim()) {
      setError('名称不能为空');
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
        serverName: name, // 使用名称作为服务器名称的默认值
        config: JSON.parse(config),
        enabled: true, // 默认启用
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
    <div className="flex flex-col h-full">
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

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">名称 *</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入 MCP 配置名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入描述（可选）"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分组</label>
            <Select value={groupId || "none"} onValueChange={(value) => setGroupId(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="选择分组" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无分组</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
            <Input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="输入标签，用逗号分隔（可选）"
            />
          </div>
        </div>

        {/* MCP 配置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">配置 (JSON) *</label>
          <Textarea
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            placeholder='{"apiKey": "your-api-key", "baseUrl": "https://api.example.com"}'
            rows={12}
            className="font-mono text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">输入有效的 JSON 配置</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-8 flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          取消
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? '保存中...' : '保存'}
        </Button>
      </div>
    </div>
  );
};

export default MCPEditor;
