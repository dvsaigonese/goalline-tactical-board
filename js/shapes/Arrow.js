export class Arrow {
    constructor(fromX, fromY, toX, toY, color, type = "solid", isArrow = true) {
        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;
        this.color = color;
        this.type = type;
        this.isArrow = isArrow;
    }

    draw(ctx, responsiveConstant = 1, isSelected = false, userScale = 1.0) {
        // Scale các thông số kích thước
        const headlen = 13 * responsiveConstant * userScale; 
        const lineWidth = 3 * responsiveConstant * userScale;
        const angle = Math.atan2(this.toY - this.fromY, this.toX - this.fromX);

        ctx.save();
        ctx.beginPath();
        
        if (this.type === "dash") {
            ctx.setLineDash([15 * responsiveConstant * userScale, 15 * responsiveConstant * userScale]);
        } else {
            ctx.setLineDash([]);
        }

        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(this.toX, this.toY);
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        if (this.isArrow) {
            ctx.setLineDash([]);
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

        if (isSelected) {
            this.drawHandle(ctx, this.fromX, this.fromY, responsiveConstant, userScale);
            this.drawHandle(ctx, this.toX, this.toY, responsiveConstant, userScale);
        }
        ctx.restore();
    }

    drawHandle(ctx, x, y, responsiveConstant, userScale) {
        ctx.beginPath();
        ctx.arc(x, y, 10 * responsiveConstant * userScale, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    isHitBody(mx, my, userScale = 1.0) {
        const distance =
            Math.sqrt(Math.pow(mx - this.fromX, 2) + Math.pow(my - this.fromY, 2)) +
            Math.sqrt(Math.pow(mx - this.toX, 2) + Math.pow(my - this.toY, 2));
        const arrowLength = Math.sqrt(
            Math.pow(this.toX - this.fromX, 2) + Math.pow(this.toY - this.fromY, 2)
        );
        // Tăng vùng click nếu scale to
        const threshold = 5 * userScale; 
        return Math.abs(distance - arrowLength) < threshold;
    }

    isHitHandle(mx, my, pointType = 'from', responsiveConstant = 1, userScale = 1.0) {
        const targetX = pointType === 'from' ? this.fromX : this.toX;
        const targetY = pointType === 'from' ? this.fromY : this.toY;
        const radius = 10 * responsiveConstant * userScale;
        
        const dx = mx - targetX;
        const dy = my - targetY;
        return dx * dx + dy * dy <= radius * radius;
    }
}