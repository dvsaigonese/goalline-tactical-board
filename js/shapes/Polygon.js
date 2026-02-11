export class Polygon {
    constructor(points = []) {
        this.points = points; 
    }

    draw(ctx, isSelected = false, userScale = 1.0) {
        if (this.points.length < 1) return;

        ctx.save();
        ctx.fillStyle = isSelected ? "rgba(255, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.3)";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2 * userScale;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        if (isSelected) {
            ctx.fillStyle = "yellow";
            for (let p of this.points) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3 * userScale, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    // --- TÍNH NĂNG MỚI: Move cả khối ---
    move(dx, dy) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].x += dx;
            this.points[i].y += dy;
        }
    }

    // --- FIX LỖI: Nhận x, y riêng biệt để đồng bộ với main.js ---
    isHit(x, y) { 
        // Logic Ray-Casting (Point in Polygon)
        let isInside = false;
        
        // 1. Check nhanh biên (Bounding Box) để tối ưu
        let minX = this.points[0].x, maxX = this.points[0].x;
        let minY = this.points[0].y, maxY = this.points[0].y;

        for (let n = 1; n < this.points.length; n++) {
            const q = this.points[n];
            minX = Math.min(q.x, minX);
            maxX = Math.max(q.x, maxX);
            minY = Math.min(q.y, minY);
            maxY = Math.max(q.y, maxY);
        }

        if (x < minX || x > maxX || y < minY || y > maxY) {
            return false;
        }

        // 2. Thuật toán chính
        let i = 0, j = this.points.length - 1;
        for (i, j; i < this.points.length; j = i++) {
            if (
                (this.points[i].y > y) !== (this.points[j].y > y) &&
                x <
                ((this.points[j].x - this.points[i].x) * (y - this.points[i].y)) /
                (this.points[j].y - this.points[i].y) +
                this.points[i].x
            ) {
                isInside = !isInside;
            }
        }
        return isInside;
    }
}