import React, { useState, useEffect } from 'react';
import { PromptItem } from '../types';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PromptEditorProps {
  prompt?: PromptItem;
  onSave: (prompt: Omit<PromptItem, 'id' | 'createdAt' | 'updatedAt'> | PromptItem) => Promise<void>;
  onCancel: () => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onSave, onCancel }) => {
  const [name, setName] = useState(prompt?.name || '');
  const [description, setDescription] = useState(prompt?.description || '');
  const [content, setContent] = useState(prompt?.content || '');
  const [tags, setTags] = useState<string>(prompt?.tags?.join(', ') || '');
  const [groupId, setGroupId] = useState<string>(prompt?.groupId || '');
  const [variables, setVariables] = useState<Record<string, string>>(prompt?.variables || {});
  const [template, setTemplate] = useState<string>(prompt?.template || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取分组列表
  const [groups, setGroups] = useState<any[]>([]);
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const allGroups = await window.api.getAllGroups();
        const promptGroups = allGroups.filter(group => group.itemType === 'prompt');
        setGroups(promptGroups);
      } catch (err) {
        console.error('获取分组失败:', err);
      }
    };
    fetchGroups();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      setError('名称和内容不能为空');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const promptData = {
        name,
        description,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        groupId: groupId || undefined,
        variables: Object.keys(variables).length > 0 ? variables : undefined,
        template: template || undefined
      };

      await onSave(prompt ? { ...promptData, id: prompt.id, createdAt: prompt.createdAt, updatedAt: new Date() } : promptData);
    } catch (err) {
      setError('保存失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const addVariable = () => {
    setVariables(prev => ({ ...prev, '': '' }));
  };

  const updateVariable = (index: number, key: string, value: string) => {
    const entries = Object.entries(variables);
    entries[index] = [key, value];
    setVariables(Object.fromEntries(entries));
  };

  const removeVariable = (index: number) => {
    const entries = Object.entries(variables);
    entries.splice(index, 1);
    setVariables(Object.fromEntries(entries));
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
              placeholder="输入 Prompt 名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入描述（可选）"
              rows={2}
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

        {/* Prompt 内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prompt 内容 *</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入 Prompt 内容"
            rows={12}
            className="font-mono text-sm"
          />
        </div>

        {/* 变量定义 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">变量定义</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addVariable}
            >
              + 添加变量
            </Button>
          </div>
          <div className="space-y-2">
            {Object.entries(variables).map(([key, value], index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  value={key}
                  onChange={(e) => updateVariable(index, e.target.value, value)}
                  placeholder="变量名"
                />
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => updateVariable(index, key, e.target.value)}
                  placeholder="默认值"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeVariable(index)}
                >
                  删除
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* 模板 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">模板</label>
          <Textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="输入模板（可选）"
            rows={4}
            className="font-mono text-sm"
          />
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

export default PromptEditor;
