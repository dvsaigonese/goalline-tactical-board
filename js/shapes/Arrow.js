export class Arrow {
    constructor(fromX, fromY, toX, toY, color, type = "solid", isArrow = true) {
        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;
        this.color = color;
        this.type = type; // 'solid' hoặc 'dash'
        this.isArrow = isArrow;
    }

    draw(ctx, responsiveConstant = 1, isSelected = false) {
        const headlen = 13 * responsiveConstant; 
        const angle = Math.atan2(this.toY - this.fromY, this.toX - this.fromX);

        ctx.save();
        ctx.beginPath();
        
        // Xử lý nét đứt
        if (this.type === "dash") {
            ctx.setLineDash([15 * responsiveConstant, 15 * responsiveConstant]);
        } else {
            ctx.setLineDash([]);
        }

        // Vẽ thân
        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(this.toX, this.toY);
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = 3 * responsiveConstant;
        ctx.stroke();

        // Vẽ đầu mũi tên
        if (this.isArrow) {
            ctx.setLineDash([]); // Đầu mũi tên luôn nét liền
            ctx.beginPath();
            ctx.moveTo(this.toX, this.toY);
            ctx.lineTo(
                this.toX - headlen * Math.cos(angle - Math.PI / 6),
                this.toY - headlen * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                this.toX - headlen * Math.cos(angle + Math.PI / 6),
                this.toY - headlen * Math.sin(angle + Math.PI / 6)
            );
            ctx.lineTo(this.toX, this.toY);
            ctx.lineTo(
                this.toX - headlen * Math.cos(angle - Math.PI / 6),
                this.toY - headlen * Math.sin(angle - Math.PI / 6)
            );
            ctx.stroke();
            ctx.fill();
        }

        // Vẽ 2 điểm tròn để kéo khi được chọn
        if (isSelected) {
            this.drawHandle(ctx, this.fromX, this.fromY, responsiveConstant);
            this.drawHandle(ctx, this.toX, this.toY, responsiveConstant);
        }
        ctx.restore();
    }

    drawHandle(ctx, x, y, responsiveConstant) {
        ctx.beginPath();
        ctx.arc(x, y, 10 * responsiveConstant, 0, Math.PI * 2);
        ctx.fillStyle = this.color; // Hoặc màu khác để dễ nhìn
        ctx.fill();
        ctx.closePath();
    }

    // Kiểm tra click vào thân mũi tên (để di chuyển cả mũi tên)
    isHitBody(mx, my) {
        const distance =
            Math.sqrt(Math.pow(mx - this.fromX, 2) + Math.pow(my - this.fromY, 2)) +
            Math.sqrt(Math.pow(mx - this.toX, 2) + Math.pow(my - this.toY, 2));
        const arrowLength = Math.sqrt(
            Math.pow(this.toX - this.fromX, 2) + Math.pow(this.toY - this.fromY, 2)
        );
        return Math.abs(distance - arrowLength) < 5; // Tăng biên độ lên 5 cho dễ click
    }

    // Kiểm tra click vào điểm đầu hoặc cuối (để resize)
    isHitHandle(mx, my, pointType = 'from', responsiveConstant = 1) {
        const targetX = pointType === 'from' ? this.fromX : this.toX;
        const targetY = pointType === 'from' ? this.fromY : this.toY;
        const radius = 10 * responsiveConstant;
        
        const dx = mx - targetX;
        const dy = my - targetY;
        return dx * dx + dy * dy <= radius * radius;
    }
}