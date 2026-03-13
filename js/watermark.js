// js/watermark.js

const canvas = document.getElementById('wm-canvas');
const ctx = canvas.getContext('2d');
const imgInput = document.getElementById('upload-img');
const titleInput = document.getElementById('wm-title');
const exportBtn = document.getElementById('export-wm-btn');
const emptyState = document.getElementById('empty-state');

// Các phần tử UI mới cho tính năng Crop
const cropModeInput = document.getElementById('crop-mode-input');
const cropModeLabel = document.getElementById('crop-mode-label');
const cropperContainer = document.getElementById('cropper-container');
const imageToCrop = document.getElementById('image-to-crop');
const confirmCropBtn = document.getElementById('confirm-crop-btn');
const cancelCropBtn = document.getElementById('cancel-crop-btn');
const cropControls = document.getElementById('crop-controls');
const wtmSettingsPanel = document.getElementById('wtm-settings-panel');

let baseImage = null; // Ảnh gốc user upload
let processedImage = null; // Ảnh đã được crop và scale
let logoImage = null;
let logoTxtImage = null;
let cropper = null; // Biến lưu instance của Cropper.js

// CẤU HÌNH CỐ ĐỊNH TỈ LỆ VÀ ĐỘ PHÂN GIẢI
const TARGET_ASPECT_RATIO = 4 / 5; // Tỉ lệ 4:5
const MIN_WIDTH = 1200; // Chiều rộng HD tối thiểu
const MIN_HEIGHT = 1500; // Chiều cao HD tối thiểu

// Tải các Logo
const loadImages = () => {
    const imagesToLoad = [
        { name: 'logoImage', src: 'assets/img/GL_logo.jpg' }, 
        { name: 'logoTxtImage', src: 'assets/img/GL_text_logo.png' }
    ];

    let loadedCount = 0;

    imagesToLoad.forEach(imageData => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            
            // Gán ảnh vào đúng biến
            if (imageData.name === 'logoImage') logoImage = img;
            if (imageData.name === 'logoTxtImage') logoTxtImage = img;

            if (loadedCount === imagesToLoad.length && processedImage) renderWatermark();
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${imageData.src}`);
            loadedCount++;
            if (loadedCount === imagesToLoad.length && processedImage) renderWatermark();
        };
        img.src = imageData.src;
    });
};

// --- HÀM TẠO HIỆU ỨNG NHIỄU HẠT (GRAIN/NOISE) ---
function addFilmGrain(ctx, width, height, intensity = 0.08) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
        // Cộng cùng 1 giá trị noise cho RGB để ra nhiễu hạt đơn sắc (monochrome grain) đẹp hơn
        const noise = (Math.random() - 0.5) * intensity * 255;
        pixels[i] = Math.min(255, Math.max(0, pixels[i] + noise));     // R
        pixels[i + 1] = Math.min(255, Math.max(0, pixels[i + 1] + noise)); // G
        pixels[i + 2] = Math.min(255, Math.max(0, pixels[i + 2] + noise)); // B
    }
    ctx.putImageData(imageData, 0, 0);
}

// --- HÀM RENDER CHÍNH ---
const renderWatermark = () => {
    if (!processedImage) return;

    const width = processedImage.naturalWidth;
    const height = processedImage.naturalHeight;
    canvas.width = width;
    canvas.height = height;

    canvas.style.display = 'block';
    emptyState.style.display = 'none';
    cropperContainer.style.display = 'none'; 

    // 2. Vẽ nền
    ctx.drawImage(processedImage, 0, 0, width, height);

    // 3. Phủ Gradient (Làm vùng đen dưới đáy cao hơn xíu để chữ nổi bật)
    const gradient = ctx.createLinearGradient(0, height * 0.45, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');    
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.75)'); 
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');  
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 4. Logo chìm khổng lồ
    if (logoImage) {
        ctx.save();
        ctx.globalAlpha = 0.06; // Tăng opacity lên 0.06 cho rõ hơn
        ctx.globalCompositeOperation = 'screen'; 
        const giantSize = width * 0.75; 
        ctx.drawImage(
            logoImage, 
            width - giantSize * 0.65, 
            height - giantSize * 0.8, 
            giantSize, 
            giantSize
        );
        ctx.restore();
    }

    // 5. Logo nhỏ trái 
    if (logoImage) {
        const smallSize = width * 0.08; 
        const padding = width * 0.035;
        ctx.drawImage(logoImage, padding, padding, smallSize, smallSize);
    }

    // 6. Logo text phải 
    if (logoTxtImage) {
        const logoHeight = width * 0.06;
        const logoWidth = logoHeight * (logoTxtImage.naturalWidth / logoTxtImage.naturalHeight);
        const padding = width * 0.035;
        ctx.drawImage(logoTxtImage, width - padding - logoWidth, padding, logoWidth, logoHeight);
    }

    // 7. Vẽ Title 
    const rawTitle = titleInput.value || "Hãy nhập {title}"; 
    const titleFontSize = width * 0.04; 
    const titlePaddingX = width * 0.04; 
    const bottomMargin = width * 0.05; // Lề dưới cùng

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${titleFontSize}px Albula, Arial, sans-serif`;

    // Tách các dòng dựa vào phím Enter (\n)
    const lines = rawTitle.split('\n');
    const lineHeight = titleFontSize * 1.3; // Khoảng cách giữa các dòng
    
    // Thuật toán: Dòng cuối cùng luôn neo ở bottomMargin. Đẩy các dòng trên lên cao dần.
    const startY = height - bottomMargin - (lines.length - 1) * lineHeight;

    // A. Vẽ thanh dọc (Vertical bar) tự động dài ra theo số dòng
    const barWidth = titleFontSize * 0.15;
    const barHeight = (lines.length - 1) * lineHeight + titleFontSize * 1.2;
    ctx.fillStyle = 'white';
    ctx.fillRect(titlePaddingX, startY - titleFontSize * 0.6, barWidth, barHeight);

    // B. Quét và vẽ từng dòng
    lines.forEach((line, index) => {
        let currentX = titlePaddingX + barWidth + (titleFontSize * 0.4); 
        const currentY = startY + (index * lineHeight); // Tọa độ Y của dòng hiện tại
        
        // Tách chuỗi theo định dạng {màu vàng}
        const textParts = line.split(/({[^}]+})/g); 

        textParts.forEach(part => {
            if (part.startsWith('{') && part.endsWith('}')) {
                ctx.fillStyle = '#facc15'; 
                const text = part.slice(1, -1); 
                ctx.fillText(text, currentX, currentY);
                currentX += ctx.measureText(text).width;
            } else if (part.length > 0) {
                ctx.fillStyle = 'white';
                ctx.fillText(part, currentX, currentY);
                currentX += ctx.measureText(part).width;
            }
        });
    });
    ctx.restore();

    // 8. Grain
    addFilmGrain(ctx, width, height, 0.08);
};

// --- QUẢN LÝ WORKFLOW CROP VÀ SCALE ---

function enterCropMode() {
    if (!baseImage) return;

    // UI
    canvas.style.display = 'none';
    wtmSettingsPanel.style.display = 'none';
    cropperContainer.style.display = 'flex'; 
    cropControls.style.display = 'block';
    
    // Tắt các nút (Dùng ?. để tránh lỗi Crash JS nếu thiếu ID)
    exportBtn.disabled = true;
    exportBtn.classList.add('disabled');
    document.getElementById("home-btn")?.classList.add('disabled');

    // Khởi tạo Cropper (Dùng setTimeout để đảm bảo container đã hiện ra)
    imageToCrop.src = baseImage.src;
    
    setTimeout(() => {
        if (cropper) cropper.destroy();
        cropper = new Cropper(imageToCrop, {
            aspectRatio: TARGET_ASPECT_RATIO, 
            viewMode: 1, 
            dragMode: 'crop', 
            autoCropArea: 0.9, 
            restore: false,
            zoomable: true, 
            cropBoxResizable: true, 
            cropBoxMovable: true, 
        });
    }, 50);
}

function applyCropAndContinue() {
    if (!cropper) return;

    const croppedCanvas = cropper.getCroppedCanvas({
        width: MIN_WIDTH,
        height: MIN_HEIGHT,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });

    processedImage = new Image();
    processedImage.onload = () => {
        exitCropMode();
        renderWatermark();
    };
    processedImage.src = croppedCanvas.toDataURL("image/png", 1.0);
}

function cancelCrop() {
    if (!processedImage) {
        window.location.reload(); 
    } else {
        exitCropMode();
        renderWatermark(); 
    }
}

function exitCropMode() {
    cropperContainer.style.display = 'none';
    cropControls.style.display = 'none';
    wtmSettingsPanel.style.display = 'block';
    
    canvas.style.display = 'block';

    exportBtn.disabled = false;
    exportBtn.classList.remove('disabled');
    document.getElementById("home-btn")?.classList.remove('disabled');
    
    cropModeInput.checked = false;

    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

// --- XỬ LÝ SỰ KIỆN ---

imgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                baseImage = img; 
                cropModeLabel.classList.remove('disabled');
                cropModeInput.disabled = false;
                cropModeInput.checked = true; 
                enterCropMode(); 

                emptyState.style.display = 'none'; // Ẩn div "Upload image to start"
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

cropModeLabel.addEventListener('click', (e) => {
    if (cropModeLabel.classList.contains('disabled')) {
        alert("Please upload an image first!");
        return;
    }
    if (!cropModeInput.checked) {
        enterCropMode();
    } else {
        cancelCrop();
    }
});

confirmCropBtn.addEventListener('click', applyCropAndContinue);
cancelCropBtn.addEventListener('click', cancelCrop);

titleInput.addEventListener('input', () => {
    if (processedImage) renderWatermark();
});

exportBtn.addEventListener('click', () => {
    if (!processedImage) {
        alert("Please upload and crop an image first!");
        return;
    }
    const link = document.createElement('a');
    link.download = 'Goal-Line_Watermark.jpg';
    link.href = canvas.toDataURL("image/jpeg", 1.0); 
    link.click();
});

// Start
loadImages();