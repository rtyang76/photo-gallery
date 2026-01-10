# GitHub Pages 部署指南

## 快速部署步骤

### 1. 创建GitHub仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角的 `+` 号，选择 `New repository`
3. 填写仓库信息：
   - Repository name: `photo-gallery` (或你喜欢的名字)
   - Description: `个人摄影作品展示网站`
   - 选择 `Public` (公开仓库才能免费使用GitHub Pages)
   - 不要勾选 "Initialize this repository with a README"
4. 点击 `Create repository`

### 2. 推送代码到GitHub

在项目目录下执行以下命令：

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 摄影作品展示网站"

# 添加远程仓库（替换YOUR_USERNAME和YOUR_REPO为你的信息）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

### 3. 启用GitHub Pages

1. 在GitHub仓库页面，点击 `Settings`
2. 在左侧菜单找到 `Pages`
3. 在 `Source` 部分：
   - Branch: 选择 `main`
   - Folder: 选择 `/ (root)`
4. 点击 `Save`
5. 等待几分钟，页面会显示你的网站地址：
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/
   ```

### 4. 访问你的网站

部署完成后，访问：
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

## 更新网站

每次修改后，执行以下命令更新：

```bash
git add .
git commit -m "更新描述"
git push
```

等待1-2分钟，GitHub Pages会自动更新。

## 自定义域名（可选）

如果你有自己的域名：

1. 在仓库根目录创建 `CNAME` 文件，内容为你的域名：
   ```
   www.yourdomain.com
   ```

2. 在你的域名DNS设置中添加CNAME记录：
   - Type: `CNAME`
   - Name: `www`
   - Value: `YOUR_USERNAME.github.io`

3. 在GitHub Pages设置中填入你的域名

## 注意事项

- ✅ GitHub Pages 完全支持静态HTML/CSS/JS
- ✅ EXIF信息读取在GitHub Pages上可以正常工作
- ✅ 所有图片和资源都会正常加载
- ⚠️ 首次部署可能需要等待5-10分钟
- ⚠️ 确保仓库是Public（公开）状态

## 故障排除

### 网站显示404
- 检查GitHub Pages是否已启用
- 确认分支选择正确（main）
- 等待几分钟让部署完成

### 图片无法加载
- 检查图片路径是否正确（相对路径）
- 确保images文件夹已上传到GitHub

### EXIF信息无法显示
- GitHub Pages使用HTTPS，EXIF库会正常工作
- 检查浏览器控制台是否有错误信息
