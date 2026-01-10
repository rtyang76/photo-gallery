# 摄影作品展示网站

一个简洁、现代的摄影作品展示网站，前端使用HTML、CSS和JavaScript实现。

## 🚀 如何运行

**重要：** 由于EXIF信息读取需要HTTP服务器环境，请不要直接双击打开HTML文件！

### 方法1：使用启动脚本（推荐）

```bash
./start-server.sh
```

然后在浏览器中访问：http://localhost:8000

### 方法2：手动启动Python服务器

```bash
# Python 3
python3 -m http.server 8000

# 或 Python 2
python -m SimpleHTTPServer 8000
```

### 方法3：使用其他HTTP服务器

- 使用 Node.js: `npx http-server`
- 使用 PHP: `php -S localhost:8000`

## 🧪 EXIF测试工具

- **test-exif-upload.html** - 上传图片测试EXIF信息（可直接打开，无需服务器）
- **test-exif.html** - 测试项目中的图片EXIF信息（需要HTTP服务器）

## 功能特点

- 全屏轮播图展示精选作品
- 类似Unsplash的瀑布流照片墙
- 📸 **EXIF信息显示** - 查看照片的拍摄参数
- 🔍 **图片放大查看** - 支持缩放和拖拽
- 响应式设计，适配各种设备尺寸
- 图片懒加载，提升性能

## 文件结构

```
├── index.html      # 主页HTML文件
├── styles.css      # CSS样式文件
├── script.js       # JavaScript交互脚本
└── images/         # 图片资源目录
    ├── carousel-1.jpg  # 轮播图图片1
    ├── carousel-2.jpg  # 轮播图图片2
    ├── carousel-3.jpg  # 轮播图图片3
    ├── photo-1.jpg     # 照片墙图片1
    └── ...             # 更多照片
```

## 使用说明

1. 将您的摄影作品放入`images`文件夹中
2. 在`script.js`文件中的`photos`数组中更新您的照片信息
3. 修改轮播图图片：替换`images`文件夹中的`carousel-1.jpg`、`carousel-2.jpg`和`carousel-3.jpg`文件
4. 根据需要调整CSS样式

## 自定义说明

### 修改轮播图

轮播图图片和说明文字在`index.html`中定义：

```html
<div class="carousel-slide active">
    <img src="images/carousel-1.jpg" alt="摄影作品 1">
    <div class="carousel-caption">
        <h2>标题文字</h2>
        <p>描述文字</p>
    </div>
</div>
```

### 添加照片到瀑布流

在`script.js`文件中修改`photos`数组：

```javascript
const photos = [
    {
        src: 'images/photo-1.jpg',
        alt: '风景照片',
        height: 300  // 根据实际图片高度调整
    },
    // 添加更多照片...
];
```

## 注意事项

- 请确保所有图片都有适当的尺寸和优化
- 对于轮播图，建议使用尺寸相近的宽屏图片
- `height`值应该与实际图片的高度比例相匹配，以确保瀑布流排列美观 