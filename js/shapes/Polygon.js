export class Polygon {
    constructor(points = []) {
        this.points = points; 
    }

    draw(ctx, isSelected = false, userScale = 1.0) {
        if (this.points.length < 1) return;

        ctx.save();
        ctx.fillStyle = isSelected ? "rgba(255, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.3)";
        ctx.strokeStyle = "white";
        // Scale độ dày nét
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
                // Scale điểm neo
                ctx.arc(p.x, p.y, 3 * userScale, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    // Hitbox của Polygon dựa trên tọa độ đỉnh nên không cần nhân userScale vào tọa độ
    isHit(point) {
        let isInside = false;
        let minX = this.points[0].x, maxX = this.points[0].x;
        let minY = this.points[0].y, maxY = this.points[0].y;

        for (let n = 1; n < this.points.length; n++) {
            const q = this.points[n];
            minX = Math.min(q.x, minX);
            maxX = Math.max(q.x, maxX);
            minY = Math.min(q.y, minY);
            maxY = Math.max(q.y, maxY);
        }

        if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
            return false;
        }

        let i = 0, j = this.points.length - 1;
        for (i, j; i < this.points.length; j = i++) {
            if (
                (this.points[i].y > point.y) !== (this.points[j].y > point.y) &&
                point.x <
                ((this.points[j].x - this.points[i].x) * (point.y - this.points[i].y)) /
                (this.points[j].y - this.points[i].y) +
                this.points[i].x
            ) {
                isInside = !isInside;
            }
        }
        return isInside;
    }
}