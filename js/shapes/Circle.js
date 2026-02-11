import { CONFIG } from '../config.js';
export class Circle {
    constructor(x, y, radius, color, text = "", textColor = "white", detailsText = "") {
        this.x = x;
        this.y = y;
        this.radius = radius; // Lưu ý: Radius này nên là giá trị gốc chưa nhân responsiveConstant nếu muốn scale mượt
        this.color = color;
        this.text = text;
        this.textColor = textColor;
        this.detailsText = detailsText;
    }

    /**
     * Vẽ đối tượng lên Canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Image} ballImg - Hình ảnh quả bóng (nếu color là 'ball')
     * @param {number} responsiveConstant - Hệ số co giãn màn hình
     * @param {boolean} isSelected - Có đang được chọn không
     */
    draw(ctx, ballImg, responsiveConstant = 1, isSelected = false) {
        // Cập nhật lại bán kính thực tế theo màn hình
        const currentRadius = this.radius; 

        if (this.color === "ball") {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            // Vẽ ảnh quả bóng
            if (ballImg) {
                ctx.drawImage(
                    ballImg,
                    this.x - currentRadius,
                    this.y - currentRadius,
                    currentRadius * 2,
                    currentRadius * 2
                );
            }
            ctx.restore();
        } else {
            // Vẽ hình tròn màu
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Viền khi được chọn
        if (isSelected) {
            ctx.lineWidth = 3 * responsiveConstant;
            ctx.strokeStyle = "white";
            ctx.stroke();
        }

        // 1. Vẽ Số Áo (Dùng font number)
        let fontSize = 20 * responsiveConstant;
        ctx.font = `bold ${fontSize}px ${CONFIG.fonts.number}`; 
        ctx.textAlign = "center";
        ctx.fillStyle = this.textColor;
        ctx.fillText(this.text, this.x, this.y + (6 * responsiveConstant));

        // 2. Vẽ Tên Cầu Thủ (Dùng font name)
        if (this.detailsText) {
            let fontDetailsSize = 15 * responsiveConstant;
            ctx.font = `bold ${fontDetailsSize}px ${CONFIG.fonts.name}`; 
            ctx.fillStyle = "white";
            ctx.fillText(this.detailsText, this.x, this.y + (26 * responsiveConstant));
        }

        ctx.closePath();
        ctx.restore();
    }

    /**
     * Kiểm tra chuột có click vào hình này không
     */
    isHit(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }
}