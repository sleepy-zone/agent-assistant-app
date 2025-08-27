import React, { useState, useEffect } from 'react';
import { AgentConfig } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AgentEditorProps {
  agent?: AgentConfig;
  onSave: (agent: Omit<AgentConfig, 'id' | 'createdAt' | 'updatedAt'> | AgentConfig) => Promise<void>;
  onCancel: () => void;
}

const AgentEditor: React.FC<AgentEditorProps> = ({ agent, onSave, onCancel }) => {
  const [name, setName] = useState(agent?.name || '');
  const [description, setDescription] = useState(agent?.description || '');
  const [provider, setProvider] = useState(agent?.provider || '');
  const [model, setModel] = useState(agent?.model || '');
  const [apiKey, setApiKey] = useState(agent?.apiKey || '');
  const [settings, setSettings] = useState<string>(agent?.settings ? JSON.stringify(agent.settings, null, 2) : '{}');
  const [enabled, setEnabled] = useState(agent?.enabled ?? true);
  const [tags, setTags] = useState<string>(agent?.tags?.join(', ') || '');
  const [groupId, setGroupId] = useState<string>(agent?.groupId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取分组列表
  const [groups, setGroups] = useState<any[]>([]);
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const allGroups = await window.api.getAllGroups();
        const agentGroups = allGroups.filter(group => group.itemType === 'agent');
        setGroups(agentGroups);
      } catch (err) {
        console.error('获取分组失败:', err);
      }
    };
    fetchGroups();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !provider.trim() || !model.trim()) {
      setError('名称、提供商和模型不能为空');
      return;
    }

    try {
      // 验证 JSON 设置
      JSON.parse(settings);
    } catch (err) {
      setError('设置必须是有效的 JSON 格式');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const agentData = {
        name,
        description,
        provider,
        model,
        apiKey,
        settings: JSON.parse(settings),
        enabled,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        groupId: groupId || undefined
      };

      await onSave(agent ? { ...agentData, id: agent.id, createdAt: agent.createdAt, updatedAt: new Date() } : agentData);
    } catch (err) {
      setError('保存失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{agent ? '编辑 Agent 配置' : '新建 Agent 配置'}</CardTitle>
      </CardHeader>
      <CardContent>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">名称 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入 Agent 配置名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">提供商 *</Label>
              <Input
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="例如: openai, anthropic, gemini"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">模型 *</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="例如: gpt-4, claude-3, gemini-pro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入 API Key（可选）"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入描述（可选）"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupId">分组</Label>
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

            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="输入标签，用逗号分隔（可选）"
              />
            </div>

            <div className="md:col-span-2 flex items-center space-x-2">
              <Checkbox
                id="enabled"
                checked={enabled}
                onCheckedChange={(checked) => setEnabled(checked as boolean)}
              />
              <Label htmlFor="enabled">启用配置</Label>
            </div>
          </div>

          {/* Agent 设置 */}
          <div className="space-y-2">
            <Label htmlFor="settings">设置 (JSON)</Label>
            <Textarea
              id="settings"
              value={settings}
              onChange={(e) => setSettings(e.target.value)}
              placeholder='{"temperature": 0.7, "maxTokens": 2048, "topP": 0.9}'
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">输入额外的模型设置（可选）</p>
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
      </CardContent>
    </Card>
  );
};

export default AgentEditor;
