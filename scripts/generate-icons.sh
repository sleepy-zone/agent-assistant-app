#!/bin/bash

# 图标生成脚本
# 将 SVG 转换为多种格式的图标

set -e

echo "🚀 开始生成图标..."

# 检查必要的工具
if ! command -v magick &> /dev/null; then
    echo "❌ 未找到 ImageMagick，请先安装：brew install imagemagick"
    exit 1
fi

# 定义路径
SVG_PATH="src/renderer/src/assets/app-icon.svg"
PNG_PATH="build/icon.png"
OUTPUT_DIR="build"

# 确保输出目录存在
mkdir -p "$OUTPUT_DIR"

echo "📄 检查源文件..."
if [ ! -f "$SVG_PATH" ]; then
    echo "❌ 未找到 SVG 源文件: $SVG_PATH"
    exit 1
fi

# 如果 PNG 文件不存在，则从 SVG 生成
if [ ! -f "$PNG_PATH" ]; then
    echo "🔄 从 SVG 生成 PNG..."
    magick -background none "$SVG_PATH" -resize 512x512 "$PNG_PATH"
fi

echo "🎨 生成 ICO 图标..."
magick -background none "$PNG_PATH" -define icon:auto-resize=256,128,64,48,32,16 "$OUTPUT_DIR/icon.ico"

echo "🍎 生成 ICNS 图标..."
magick -background none "$PNG_PATH" -define icon:auto-resize=256,128,64,48,32,16 "$OUTPUT_DIR/icon.icns"

echo "✅ 图标生成完成！"
echo "📁 生成的文件："
echo "   - $OUTPUT_DIR/icon.ico ($(du -h "$OUTPUT_DIR/icon.ico" | cut -f1))"
echo "   - $OUTPUT_DIR/icon.icns ($(du -h "$OUTPUT_DIR/icon.icns" | cut -f1))"
echo "   - $OUTPUT_DIR/icon.png ($(du -h "$PNG_PATH" | cut -f1))"

echo "🎉 所有图标已成功生成！"
