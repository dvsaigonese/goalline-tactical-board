export class TextObj {
    constructor(x, y, text, fontSize = 20, rotate = 0) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.fontSize = fontSize;
        this.rotate = rotate;
    }

    draw(ctx, responsiveConstant = 1, isSelected = false) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotate * (Math.PI / 180));
        
        const currentFontSize = this.fontSize * responsiveConstant;
        ctx.font = `bold ${currentFontSize}px Albula, Arial`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle"; // Căn giữa theo chiều dọc
        ctx.fillText(this.text, 0, 0);

        // Vẽ gạch chân/khung khi được chọn
        if (isSelected) {
            const textWidth = ctx.measureText(this.text).width;
            const lineY = currentFontSize / 2 + 2;
            
            ctx.beginPath();
            ctx.moveTo(-textWidth / 2, lineY);
            ctx.lineTo(textWidth / 2, lineY);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2 * responsiveConstant;
            ctx.stroke();
        }
        ctx.restore();
    }

    isHit(mouseX, mouseY, ctx, responsiveConstant = 1) {
        // Cần setup font để đo kích thước chính xác
        const currentFontSize = this.fontSize * responsiveConstant;
        ctx.font = `bold ${currentFontSize}px Albula, Arial`;
        const textWidth = ctx.measureText(this.text).width;
        const textHeight = currentFontSize; 

        // Tính toán đơn giản (chưa tính xoay để đỡ phức tạp logic hit test)
        // Nếu muốn chính xác khi xoay, cần ma trận biến đổi ngược
        return (
            mouseX >= this.x - textWidth / 2 &&
            mouseX <= this.x + textWidth / 2 &&
            mouseY >= this.y - textHeight / 2 &&
            mouseY <= this.y + textHeight / 2
        );
    }
}