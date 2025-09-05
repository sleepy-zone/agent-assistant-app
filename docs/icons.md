# 图标系统文档

## 概述

Agent Assistant App 使用一套统一的 SVG 图标系统，可以自动生成多种格式和尺寸的图标文件，适用于不同平台和用途。

## 图标文件结构

```
src/renderer/src/assets/
├── app-icon.svg          # 主 SVG 图标源文件
build/
├── icon.png             # 主 PNG 图标 (512x512)
├── icon.ico             # Windows ICO 图标 (多尺寸)
├── icon.icns            # macOS ICNS 图标 (多尺寸)
└── entitlements.mac.plist # macOS 权限配置
```

## 图标设计规范

### SVG 图标 (app-icon.svg)
- **尺寸**: 128x128 像素
- **主题**: AI/神经网络概念
- **颜色**: 
  - 主色: `#4F46E5` (深蓝色背景)
  - 辅助色: `#818CF8` (节点颜色)
  - 强调色: `#FFFFFF` (中心元素和连线)
- **元素**:
  - 中央白色圆圈代表 AI 核心
  - 8个外围彩色节点代表不同的 AI 组件
  - 连接线表示神经网络连接

## 自动生成流程

### 1. 图标生成脚本

使用 `pnpm run build:icons` 命令可以自动生成所有平台所需的图标文件。

```bash
# 手动执行脚本
bash scripts/generate-icons.sh
```

### 2. 生成的文件格式

| 文件 | 格式 | 用途 | 尺寸 |
|------|------|------|------|
| `build/icon.png` | PNG | 通用图标 | 512x512 |
| `build/icon.ico` | ICO | Windows 应用图标 | 多尺寸 (16-256px) |
| `build/icon.icns` | ICNS | macOS 应用图标 | 多尺寸 (16-256px) |

## 手动转换方法

### 使用 ImageMagick

```bash
# 安装 ImageMagick
brew install imagemagick

# 从 SVG 生成 PNG
magick -background none src/renderer/src/assets/app-icon.svg -resize 512x512 build/icon.png

# 生成 ICO (多尺寸)
magick -background none build/icon.png -define icon:auto-resize=256,128,64,48,32,16 build/icon.ico

# 生成 ICNS
magick -background none build/icon.png -define icon:auto-resize=256,128,64,48,32,16 build/icon.icns
```

### 在线转换工具

如果无法安装本地工具，可以使用以下在线服务：

1. [Convertio](https://convertio.co/svg-png/)
2. [CloudConvert](https://cloudconvert.com/svg-to-png)
3. [Online-Convert](https://online-convert.com)

## 平台特定要求

### Windows (ICO)
- 支持多尺寸: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
- 使用 PNG 压缩以获得最佳质量

### macOS (ICNS)
- 支持 Retina 显示屏的高分辨率图标
- 包含多种尺寸以适应不同显示场景

### Linux
- 通常使用 PNG 格式
- 可以从主 PNG 文件派生不同尺寸

## 维护指南

### 更新图标设计

1. 修改 `src/renderer/src/assets/app-icon.svg` 文件
2. 运行 `pnpm run build:icons` 重新生成所有格式
3. 验证生成的图标文件

### 验证图标质量

```bash
# 检查文件信息
file build/*.png build/*.ico build/*.icns

# 查看 PNG 信息
magick identify build/icon.png

# 验证 ICO 尺寸
magick identify build/icon.ico
```

## 故障排除

### 常见问题

1. **ImageMagick 未找到**
   ```bash
   brew install imagemagick
   ```

2. **权限错误**
   ```bash
   chmod +x scripts/generate-icons.sh
   ```

3. **SVG 文件缺失**
   - 确保 `src/renderer/src/assets/app-icon.svg` 存在
   - 检查文件路径是否正确

### 支持的平台

- ✅ macOS (使用 ICNS)
- ✅ Windows (使用 ICO)
- ✅ Linux (使用 PNG)

## 最佳实践

1. **保持设计一致性**: 所有图标格式应反映相同的设计元素
2. **定期更新**: 设计变更后及时重新生成所有图标
3. **版本控制**: 将生成的图标文件纳入版本控制
4. **备份源文件**: SVG 是图标设计的唯一真实来源
