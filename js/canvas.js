import { ASSETS, CONFIG } from './config.js';

export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");

// Preload Images
const images = {};
export const loadImages = () => {
    return new Promise((resolve) => {
        let loaded = 0;
        const total = Object.keys(ASSETS).length;
        
        Object.keys(ASSETS).forEach(key => {
            const img = new Image();
            img.src = ASSETS[key];
            img.onload = () => {
                loaded++;
                images[key] = img;
                if (loaded === total) resolve(images);
            };
            // Thêm xử lý lỗi nếu ảnh không load được
            img.onerror = () => {
                console.error(`Failed to load image: ${ASSETS[key]}`);
                loaded++;
                if (loaded === total) resolve(images);
            };
        });
    });
};

export const getImages = () => images;

// Responsive Logic
export let responsiveConstant = 1;

export function resizeCanvas(pitchType) {
    const container = document.querySelector('.canvas-area'); 
    
    // Lấy kích thước thật của vùng chứa (nếu không tìm thấy thì lấy full màn hình)
    const containerWidth = container ? container.clientWidth : window.innerWidth;
    const containerHeight = container ? container.clientHeight : window.innerHeight;

    // 2. Lấy tỉ lệ màn hình (High DPI)
    const dpr = window.devicePixelRatio || 1;

    // 3. Tính toán kích thước chuẩn (Logical Size) sao cho VỪA KHÍT khung chứa
    let baseW = CONFIG.baseWidth;  // 900
    let baseH = CONFIG.baseHeight; // 600

    if (pitchType === "half") {
        baseW = baseW * 0.82; 
    }

    // Tìm tỉ lệ co giãn (Scale) để sân nằm gọn trong khung (Contain)
    // Nhân 0.95 để chừa lại 5% khoảng trống cho đẹp
    const scaleX = containerWidth / baseW;
    const scaleY = containerHeight / baseH;
    responsiveConstant = Math.min(scaleX, scaleY) * 0.95;

    // 4. Áp dụng kích thước
    const cssWidth = baseW * responsiveConstant;
    const cssHeight = baseH * responsiveConstant;

    // Set kích thước bộ nhớ đệm (Nhân dpr cho nét)
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);

    // Set kích thước hiển thị CSS (Giữ nguyên)
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    // 5. Scale Context (Quan trọng: Chỉ scale 1 lần ở đây)
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform cũ
    ctx.scale(dpr, dpr);

    return responsiveConstant;
}

export function drawPitch(pitchType) {
    // SỬA LỖI DOUBLE SCALING Ở ĐÂY:
    // Vì context đã scale theo dpr, nên ta phải vẽ theo kích thước Logical (CSS Width)
    // Cách dễ nhất là lấy width thực / dpr
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    if (pitchType === "horizontal") {
        if(images.pitchHorizontal) ctx.drawImage(images.pitchHorizontal, 0, 0, w, h);
    } else if (pitchType === "vertical") {
        if(images.pitchVertical) ctx.drawImage(images.pitchVertical, 0, 0, w, h);
    } else if (pitchType === "half") {
        if(images.pitchHalf) ctx.drawImage(images.pitchHalf, 0, 0, w, h);
    }
}

export function clearCanvas() {
    // Cũng phải xóa theo kích thước Logical
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
}