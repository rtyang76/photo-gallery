#!/bin/bash

# GitHub Pages 一键部署脚本
# 仓库: rtyang76/photo-gallery

echo "🚀 开始部署到 GitHub Pages..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否安装了git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ 错误: 未安装Git，请先安装Git${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Git已安装${NC}"

# 检查是否安装了git-lfs（用于处理大文件）
if ! command -v git-lfs &> /dev/null; then
    echo -e "${YELLOW}⚠️  Git LFS未安装，正在安装...${NC}"
    
    # macOS安装git-lfs
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install git-lfs
        else
            echo -e "${RED}❌ 请先安装Homebrew或手动安装Git LFS: https://git-lfs.github.com/${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ 请手动安装Git LFS: https://git-lfs.github.com/${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Git LFS已安装${NC}"

# 初始化Git LFS
git lfs install
echo -e "${GREEN}✓ Git LFS已初始化${NC}"

# 配置Git LFS跟踪大文件（图片）
echo -e "${YELLOW}📦 配置Git LFS跟踪大文件...${NC}"
git lfs track "*.jpg"
git lfs track "*.jpeg"
git lfs track "*.png"
git lfs track "*.JPG"
git lfs track "*.JPEG"
git lfs track "*.PNG"

# 添加.gitattributes
git add .gitattributes

echo -e "${GREEN}✓ Git LFS配置完成${NC}"

# 检查是否已经初始化git仓库
if [ ! -d .git ]; then
    echo -e "${YELLOW}📁 初始化Git仓库...${NC}"
    git init
    echo -e "${GREEN}✓ Git仓库初始化完成${NC}"
else
    echo -e "${GREEN}✓ Git仓库已存在${NC}"
fi

# 配置Git用户信息（如果未配置）
if [ -z "$(git config user.name)" ]; then
    echo -e "${YELLOW}⚙️  请输入你的Git用户名:${NC}"
    read git_username
    git config user.name "$git_username"
fi

if [ -z "$(git config user.email)" ]; then
    echo -e "${YELLOW}⚙️  请输入你的Git邮箱:${NC}"
    read git_email
    git config user.email "$git_email"
fi

# 检查是否已添加远程仓库
if ! git remote | grep -q origin; then
    echo -e "${YELLOW}🔗 添加远程仓库...${NC}"
    git remote add origin https://github.com/rtyang76/photo-gallery.git
    echo -e "${GREEN}✓ 远程仓库已添加${NC}"
else
    echo -e "${GREEN}✓ 远程仓库已存在${NC}"
    # 更新远程仓库URL（以防万一）
    git remote set-url origin https://github.com/rtyang76/photo-gallery.git
fi

# 添加所有文件
echo -e "${YELLOW}📦 添加文件到Git...${NC}"
git add .

# 检查是否有文件需要提交
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  没有新的更改需要提交${NC}"
else
    # 提交
    echo -e "${YELLOW}💾 提交更改...${NC}"
    git commit -m "Deploy: 更新摄影作品展示网站 $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${GREEN}✓ 提交完成${NC}"
fi

# 推送到GitHub
echo -e "${YELLOW}🚀 推送到GitHub...${NC}"
echo -e "${YELLOW}   (首次推送可能需要较长时间，因为需要上传所有图片)${NC}"

# 设置默认分支为main
git branch -M main

# 推送（如果失败，尝试强制推送）
if git push -u origin main; then
    echo -e "${GREEN}✓ 推送成功！${NC}"
else
    echo -e "${YELLOW}⚠️  常规推送失败，尝试强制推送...${NC}"
    echo -e "${RED}   注意: 这将覆盖远程仓库的内容${NC}"
    read -p "   是否继续? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push -u origin main --force
        echo -e "${GREEN}✓ 强制推送成功！${NC}"
    else
        echo -e "${RED}❌ 部署已取消${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📍 你的网站将在几分钟后可以访问："
echo -e "${YELLOW}   https://rtyang76.github.io/photo-gallery/${NC}"
echo ""
echo -e "⚙️  下一步："
echo -e "   1. 访问 https://github.com/rtyang76/photo-gallery/settings/pages"
echo -e "   2. 确认 GitHub Pages 已启用"
echo -e "   3. Source 选择: main 分支 / (root)"
echo -e "   4. 等待 5-10 分钟让网站部署完成"
echo ""
echo -e "🔄 更新网站："
echo -e "   修改文件后，再次运行: ${YELLOW}./deploy.sh${NC}"
echo ""
