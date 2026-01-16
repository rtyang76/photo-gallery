document.addEventListener('DOMContentLoaded', () => {
    // 轮播图功能
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let currentSlide = 0;
    const slideCount = slides.length;
    
    // 初始显示第一张
    showSlide(0);
    
    // 自动轮播
    let slideInterval = setInterval(nextSlide, 5000);
    
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        
        currentSlide = (n + slideCount) % slideCount;
        slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // 修改事件监听器
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });
    
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });
    
    // 示例图片数据 - 使用缩略图展示，点击时加载原图
    const photos = Array.from({length: 50}, (_, i) => {
        const photoName = `photo-${i+1}`;
        return {
            thumbnail: `image_thumbnail/${photoName}_thumbnail.jpg`, // 缩略图路径
            src: `images/${photoName}.jpg`, // 原图路径
            alt: `摄影作品 ${i+1}`,
        };
    });

    // 定义全局模态框变量
    const modal = document.querySelector('.modal');
    const modalImg = document.getElementById('modal-image');
    const exifInfoDiv = document.querySelector('.exif-info');
    const closeBtn = document.querySelector('.close');
    const exifToggleBtn = document.querySelector('.exif-toggle-btn');

    // 全局图片缩放和拖拽状态
    let scale = 1;
    let isDragging = false;
    let dragStarted = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let startImgX = 0;
    let startImgY = 0;
    let imgX = 0;  // 图片当前X偏移
    let imgY = 0;  // 图片当前Y偏移
    let clickTimer = null;
    let mouseDownTime = 0;
    let exifVisible = false;

    // 更新transform样式 - 使用transform-origin和正确的顺序
    function updateTransform() {
        if (modalImg) {
            // 先translate后scale，这样translate不会被scale影响
            modalImg.style.transform = `translate(${imgX}px, ${imgY}px) scale(${scale})`;
            modalImg.style.cursor = scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in';
        }
    }
    
    // 更新缩放比例指示器
    function updateZoomIndicator() {
        let indicator = document.querySelector('.zoom-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'zoom-indicator';
            modal.appendChild(indicator);
        }
        indicator.textContent = Math.round(scale * 100) + '%';
    }

    // 处理图片点击 - 通用函数
    function handleImageClick(imgSrc) {
        if (!modal || !modalImg || !exifInfoDiv) return;
        
        // 重置模态框状态
        scale = 1;
        imgX = 0;
        imgY = 0;
        exifVisible = false;
        
        // 隐藏EXIF面板
        exifInfoDiv.classList.remove('show');
        exifInfoDiv.innerHTML = '<p><span class="label">加载中...</span></p>';
        
        // 显示模态框和图片
        modal.style.display = 'flex';
        modalImg.src = imgSrc;
        updateTransform();
        updateZoomIndicator();
        
        // 使用ExifReader读取EXIF信息
        fetch(imgSrc)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                try {
                    const tags = ExifReader.load(buffer);
                    console.log('EXIF tags:', tags);
                    
                    // 检查是否有EXIF数据
                    const hasExifData = tags && Object.keys(tags).length > 0;
                    
                    if (hasExifData) {
                        // 获取相机信息
                        const make = tags.Make?.description || '未知';
                        const model = tags.Model?.description || '未知';
                        
                        // 获取拍摄参数
                        const exposureTime = tags.ExposureTime?.description || '未知';
                        const fNumber = tags.FNumber?.description || '未知';
                        const iso = tags.ISOSpeedRatings?.description || tags.ISO?.description || '未知';
                        const focalLength = tags.FocalLength?.description || '未知';
                        const lensModel = tags.LensModel?.description || '未知';
                        
                        // 更新EXIF信息显示
                        let html = `
                            <p><span class="label">相机品牌</span><span class="value">${make}</span></p>
                            <p><span class="label">相机型号</span><span class="value">${model}</span></p>
                            <p><span class="label">光圈</span><span class="value">${fNumber}</span></p>
                            <p><span class="label">快门速度</span><span class="value">${exposureTime}</span></p>
                            <p><span class="label">ISO</span><span class="value">${iso}</span></p>
                            <p><span class="label">焦距</span><span class="value">${focalLength}</span></p>
                        `;
                        
                        if (lensModel !== '未知') {
                            html += `<p><span class="label">镜头</span><span class="value">${lensModel}</span></p>`;
                        }
                        
                        exifInfoDiv.innerHTML = html;
                    } else {
                        // 如果没有EXIF数据，显示友好提示
                        exifInfoDiv.innerHTML = `
                            <p style="text-align: center; padding: 20px;">
                                <span class="label" style="display: block; margin-bottom: 10px;">📷</span>
                                <span class="value" style="display: block;">该照片未包含EXIF信息</span>
                                <span class="value" style="display: block; font-size: 12px; color: #999; margin-top: 5px;">可能已被处理或压缩</span>
                            </p>
                        `;
                    }
                } catch (error) {
                    console.error('EXIF读取错误:', error);
                    exifInfoDiv.innerHTML = `
                        <p style="text-align: center; padding: 20px;">
                            <span class="label" style="display: block; margin-bottom: 10px;">📷</span>
                            <span class="value" style="display: block;">该照片未包含EXIF信息</span>
                            <span class="value" style="display: block; font-size: 12px; color: #999; margin-top: 5px;">可能已被处理或压缩</span>
                        </p>
                    `;
                }
            })
            .catch(error => {
                console.error('图片加载失败:', error);
                exifInfoDiv.innerHTML = '<p><span class="label">错误</span><span class="value">图片加载失败</span></p>';
            });
    }

    // 初始化模态框交互
    function initModalInteractions() {
        // EXIF信息显示/隐藏按钮
        if (exifToggleBtn) {
            exifToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                exifVisible = !exifVisible;
                if (exifVisible) {
                    exifInfoDiv.classList.add('show');
                } else {
                    exifInfoDiv.classList.remove('show');
                }
            });
        }
        
        // 移动端：点击EXIF面板的关闭按钮（伪元素区域）
        if (exifInfoDiv) {
            exifInfoDiv.addEventListener('click', (e) => {
                // 检查是否点击在右上角关闭按钮区域
                const rect = exifInfoDiv.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                
                // 右上角30x30区域
                if (window.innerWidth <= 768 && clickX > rect.width - 45 && clickY < 40) {
                    exifVisible = false;
                    exifInfoDiv.classList.remove('show');
                }
            });
        }
        
        // 修改后的拖拽开始逻辑 - 真正跟手的实现
        modalImg.addEventListener('mousedown', (e) => {
            if (scale <= 1) return;
            
            e.preventDefault();
            e.stopPropagation();
            mouseDownTime = Date.now();
            dragStarted = false;
            
            // 记录鼠标起始位置和图片当前位置
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            startImgX = imgX;
            startImgY = imgY;
            
            isDragging = true;
            modalImg.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        });

        // 鼠标移动处理 - 1:1跟手
        modal.addEventListener('mousemove', (e) => {
            if (!isDragging || scale <= 1) return;
            
            e.preventDefault();
            dragStarted = true;
            
            // 计算鼠标移动距离，直接应用到图片位置
            const deltaX = e.clientX - startMouseX;
            const deltaY = e.clientY - startMouseY;
            
            // 直接设置新位置 = 起始位置 + 移动距离
            imgX = startImgX + deltaX;
            imgY = startImgY + deltaY;
            
            updateTransform();
        });

        // 鼠标释放处理
        const handleMouseUp = (e) => {
            if (!isDragging) return;
            
            const clickDuration = Date.now() - mouseDownTime;
            
            // 如果是短按且没有移动，视为单击复位
            if (clickDuration < 200 && !dragStarted) {
                scale = 1;
                imgX = 0;
                imgY = 0;
                updateTransform();
                updateZoomIndicator();
            }
            
            isDragging = false;
            dragStarted = false;
            modalImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
            document.body.style.userSelect = '';
        };
        
        document.addEventListener('mouseup', handleMouseUp);
        modal.addEventListener('mouseleave', handleMouseUp);
        
        // 触摸事件支持 - 移动端拖拽
        let lastTouchDistance = 0;
        
        modalImg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && scale > 1) {
                // 单指拖拽
                e.preventDefault();
                const touch = e.touches[0];
                startMouseX = touch.clientX;
                startMouseY = touch.clientY;
                startImgX = imgX;
                startImgY = imgY;
                isDragging = true;
                dragStarted = false;
                mouseDownTime = Date.now();
            } else if (e.touches.length === 2) {
                // 双指缩放
                e.preventDefault();
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: false });
        
        modalImg.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && isDragging && scale > 1) {
                // 单指拖拽
                e.preventDefault();
                dragStarted = true;
                const touch = e.touches[0];
                const deltaX = touch.clientX - startMouseX;
                const deltaY = touch.clientY - startMouseY;
                imgX = startImgX + deltaX;
                imgY = startImgY + deltaY;
                updateTransform();
            } else if (e.touches.length === 2) {
                // 双指缩放
                e.preventDefault();
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (lastTouchDistance > 0) {
                    const scaleChange = distance / lastTouchDistance;
                    const oldScale = scale;
                    scale = Math.min(Math.max(1, scale * scaleChange), 4);
                    
                    if (scale <= 1) {
                        imgX = 0;
                        imgY = 0;
                    }
                    
                    updateTransform();
                    updateZoomIndicator();
                }
                lastTouchDistance = distance;
            }
        }, { passive: false });
        
        modalImg.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                const clickDuration = Date.now() - mouseDownTime;
                
                // 短按且没有移动，视为单击复位
                if (clickDuration < 200 && !dragStarted && scale > 1) {
                    scale = 1;
                    imgX = 0;
                    imgY = 0;
                    updateTransform();
                    updateZoomIndicator();
                }
                
                isDragging = false;
                dragStarted = false;
                lastTouchDistance = 0;
            } else if (e.touches.length === 1) {
                // 从双指变为单指
                lastTouchDistance = 0;
                if (scale > 1) {
                    const touch = e.touches[0];
                    startMouseX = touch.clientX;
                    startMouseY = touch.clientY;
                    startImgX = imgX;
                    startImgY = imgY;
                    isDragging = true;
                    dragStarted = false;
                }
            }
        });
    
        // 添加滚轮缩放功能 - 以鼠标位置为中心缩放
        modal.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = -e.deltaY;
            const oldScale = scale;
            
            // 计算新的缩放比例
            if (delta > 0) {
                scale *= 1.03;
            } else {
                scale *= 0.97;
            }
            scale = Math.min(Math.max(1, scale), 4); // 限制缩放范围，最小为1
            
            // 如果缩放到1，重置位置
            if (scale <= 1) {
                imgX = 0;
                imgY = 0;
            } else if (oldScale !== scale) {
                // 以鼠标位置为中心进行缩放
                const rect = modalImg.getBoundingClientRect();
                const imgCenterX = rect.left + rect.width / 2;
                const imgCenterY = rect.top + rect.height / 2;
                
                // 鼠标相对于图片中心的位置
                const mouseOffsetX = e.clientX - imgCenterX;
                const mouseOffsetY = e.clientY - imgCenterY;
                
                // 缩放比例变化
                const scaleRatio = scale / oldScale;
                
                // 调整位置以保持鼠标下的点不变
                imgX = imgX - mouseOffsetX * (scaleRatio - 1);
                imgY = imgY - mouseOffsetY * (scaleRatio - 1);
            }
            
            updateTransform();
            updateZoomIndicator();
        });

        // 关闭模态框
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (modal) {
                    modal.style.display = "none";
                    scale = 1;
                    imgX = 0;
                    imgY = 0;
                    exifVisible = false;
                    exifInfoDiv.classList.remove('show');
                }
            });
        }
    
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
                scale = 1;
                imgX = 0;
                imgY = 0;
                exifVisible = false;
                exifInfoDiv.classList.remove('show');
            }
        });
    }

    // 品牌轮播图初始化
    initBrandCarousel();
    
    // 瀑布流布局
    const galleryContainer = document.querySelector('.gallery-container');
    
    function createGallery() {
        // 处理图片点击和EXIF信息显示
        photos.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            const img = document.createElement('img');
            img.src = photo.thumbnail; // 显示缩略图
            img.alt = photo.alt;
            img.loading = "lazy";
            img.dataset.fullsize = photo.src; // 存储原图路径
            
            // 图片点击事件 - 显示原图和EXIF信息
            img.addEventListener('click', function() {
                handleImageClick(this.dataset.fullsize); // 使用原图路径
            });
            
            item.appendChild(img);
            galleryContainer.appendChild(item);
        });
    }
    
    // 初始化相册
    createGallery();
    
    // 初始化竖屏照片区域
    initVerticalPhotos();

    // 初始化模态框交互
    initModalInteractions();
    
    // 图片懒加载功能
    const images = document.querySelectorAll('.gallery-item img');
    
    // 使用IntersectionObserver实现懒加载
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // 初始化动画效果观察器
    initAnimationObserver();
    
    // 品牌轮播图功能
    function initBrandCarousel() {
        const brandCarouselContainer = document.querySelector('.brand-carousel-container');
        const brandPrevBtn = document.querySelector('.brand-carousel-btn.prev');
        const brandNextBtn = document.querySelector('.brand-carousel-btn.next');
        
        // 品牌轮播图图片 - 使用缩略图
        const brandSlides = Array.from({length: 10}, (_, i) => {
            const brandName = `brand-${i+1}`;
            return {
                thumbnail: `image_thumbnail/${brandName}_thumbnail.jpg`, // 缩略图
                src: `images/${brandName}.jpg`, // 原图
                alt: `品牌展示 ${i+1}`
            };
        });
        
        // 填充品牌轮播图
        brandSlides.forEach(slide => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'brand-slide';
            
            const img = document.createElement('img');
            img.src = slide.thumbnail; // 显示缩略图
            img.alt = slide.alt;
            img.loading = "lazy";
            img.dataset.fullsize = slide.src; // 存储原图路径
            
            // 添加点击查看大图功能
            img.addEventListener('click', function() {
                handleImageClick(this.dataset.fullsize); // 使用原图路径
            });
            
            // 根据图片加载后的自然宽高比动态调整宽度
            img.onload = function() {
                const aspectRatio = this.naturalWidth / this.naturalHeight;
                slideDiv.style.width = `${350 * aspectRatio}px`; // 基于350px的高度计算宽度
            };
            
            slideDiv.appendChild(img);
            brandCarouselContainer.appendChild(slideDiv);
        });
        
        // 克隆前两个和最后两个滑块用于无限循环滚动
        const allSlides = brandCarouselContainer.querySelectorAll('.brand-slide');
        const firstSlide = allSlides[0].cloneNode(true);
        const secondSlide = allSlides[1].cloneNode(true);
        const lastSlide = allSlides[allSlides.length - 1].cloneNode(true);
        const secondLastSlide = allSlides[allSlides.length - 2].cloneNode(true);
        
        brandCarouselContainer.appendChild(firstSlide);
        brandCarouselContainer.appendChild(secondSlide);
        brandCarouselContainer.insertBefore(lastSlide, allSlides[0]);
        brandCarouselContainer.insertBefore(secondLastSlide, allSlides[0]);
        
        // 为克隆的元素也添加点击事件
        brandCarouselContainer.querySelectorAll('.brand-slide img').forEach(img => {
            if (!img.hasClickEvent) {
                img.addEventListener('click', function() {
                    handleImageClick(this.dataset.fullsize); // 使用原图路径
                });
                img.hasClickEvent = true;
            }
        });
        
        // 滚动控制 - 实现循环滚动
        let currentPosition = 0;
        const slideWidth = 450; // 预估平均宽度，实际会根据图片调整
        const gap = 15; // 与CSS中的gap保持一致
        
        brandPrevBtn.addEventListener('click', () => {
            if (currentPosition <= 0) {
                // 如果已经在最左侧，快速无动画滚动到最右侧的克隆位置
                currentPosition = (allSlides.length - 2) * (slideWidth + gap);
                brandCarouselContainer.scrollTo({
                    left: currentPosition,
                    behavior: 'auto'
                });
            }
            
            currentPosition -= slideWidth + gap;
            brandCarouselContainer.scrollTo({
                left: currentPosition,
                behavior: 'smooth'
            });
        });
        
        brandNextBtn.addEventListener('click', () => {
            if (currentPosition >= (allSlides.length - 2) * (slideWidth + gap)) {
                // 如果已经在最右侧，快速无动画滚动到最左侧的克隆位置
                currentPosition = 0;
                brandCarouselContainer.scrollTo({
                    left: currentPosition,
                    behavior: 'auto'
                });
            }
            
            currentPosition += slideWidth + gap;
            brandCarouselContainer.scrollTo({
                left: currentPosition,
                behavior: 'smooth'
            });
        });
        
        // 监听滚动结束事件，如果到达边界位置，重置位置实现无限循环
        brandCarouselContainer.addEventListener('scroll', () => {
            currentPosition = brandCarouselContainer.scrollLeft;
        });
    }
    
    // 竖屏照片区域
    function initVerticalPhotos() {
        const verticalPhotosContainer = document.querySelector('.vertical-photos-container');
        
        // 竖屏照片 - 使用缩略图
        const verticalPhotos = Array.from({length: 4}, (_, i) => {
            const verticalName = `vertical-${i+1}`;
            return {
                thumbnail: `image_thumbnail/${verticalName}_thumbnail.jpg`, // 缩略图
                src: `images/${verticalName}.jpg`, // 原图
                alt: `竖屏照片 ${i+1}`
            };
        });
        
        // 填充竖屏照片
        verticalPhotos.forEach(photo => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'vertical-photo';
            
            const img = document.createElement('img');
            img.src = photo.thumbnail; // 显示缩略图
            img.alt = photo.alt;
            img.loading = "lazy";
            img.dataset.fullsize = photo.src; // 存储原图路径
            
            // 添加点击查看大图功能
            img.addEventListener('click', function() {
                handleImageClick(this.dataset.fullsize); // 使用原图路径
            });
            
            photoDiv.appendChild(img);
            verticalPhotosContainer.appendChild(photoDiv);
        });
    }
    
    // 初始化动画效果观察器
    function initAnimationObserver() {
        if ('IntersectionObserver' in window) {
            const options = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };
            
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        animationObserver.unobserve(entry.target);
                    }
                });
            }, options);
            
            // 观察所有需要动画的元素
            const verticalPhotos = document.querySelectorAll('.vertical-photo');
            verticalPhotos.forEach(photo => {
                animationObserver.observe(photo);
            });
            
            // 观察所有品牌轮播图元素
            const brandSlides = document.querySelectorAll('.brand-slide');
            brandSlides.forEach(slide => {
                animationObserver.observe(slide);
            });
            
            // 观察所有相册图片
            const galleryItems = document.querySelectorAll('.gallery-item');
            galleryItems.forEach(item => {
                animationObserver.observe(item);
            });
        } else {
            // 对于不支持IntersectionObserver的浏览器，默认显示所有元素
            document.querySelectorAll('.vertical-photo, .brand-slide, .gallery-item').forEach(el => {
                el.classList.add('active');
            });
        }
    }
    
    // 动态调整图片尺寸的功能
    window.addEventListener('resize', () => {
        // 如果有需要，可以在这里添加调整逻辑
    });
});