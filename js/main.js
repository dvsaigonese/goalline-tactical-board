import { Circle } from './shapes/Circle.js';
import { Arrow } from './shapes/Arrow.js';
import { TextObj } from './shapes/TextObj.js';
import { Polygon } from './shapes/Polygon.js';
import { Storage } from './storage.js';
import { canvas, ctx, loadImages, resizeCanvas, drawPitch, clearCanvas, getImages, responsiveConstant } from './canvas.js';
import { getMousePos } from './utils.js';

// --- STATE MANAGEMENT ---
const AppState = {
    circles: [],
    arrows: [],
    texts: [],
    polygons: [],
    pitchType: 'horizontal',
    
    // Selection & Dragging
    selectedObj: null,
    selectedType: null, // 'circle', 'arrow', 'text', 'polygon'
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    
    // Drawing Modes
    mode: 'select', // 'select', 'drawArrow', 'drawPolygon'
    drawingArrow: null,
    drawingPolygonPoints: [],
    
    // Cache Arrow dragging point
    arrowDragPoint: null // 'from' or 'to'
};

// --- INITIALIZATION ---
async function init() {
    // 1. Load Images
    await loadImages();
    
    // 2. Load Data from Storage
    const data = Storage.load();
    // Re-instantiate objects from plain JSON data
    AppState.pitchType = data.pitchType;
    document.getElementById("pitch-type").value = AppState.pitchType;

    AppState.circles = data.circles.map(d => new Circle(d.x, d.y, d.radius, d.color, d.text, d.textColor, d.detailsText));
    AppState.arrows = data.arrows.map(d => new Arrow(d.fromX, d.fromY, d.toX, d.toY, d.color, d.type, d.isArrow));
    AppState.texts = data.texts.map(d => new TextObj(d.x, d.y, d.text, d.fontSize, d.rotate));
    AppState.polygons = data.polygons.map(d => new Polygon(d)); // Polygon constructor takes array of points
    
    // 3. Initial Render
    resizeCanvas(AppState.pitchType);
    render();
    updateCounts();

    // 4. Update Copyright
    document.querySelector(".copyright").innerHTML = `© ${new Date().getFullYear()} Goal-Line`;
}

// --- RENDER LOOP ---
function render() {
    clearCanvas();
    drawPitch(AppState.pitchType);
    const imgs = getImages();

    // Draw Polygons
    AppState.polygons.forEach((p, i) => {
        const isSelected = (AppState.selectedObj === p);
        p.draw(ctx, isSelected);
    });
    // Draw current drawing polygon
    if (AppState.drawingPolygonPoints.length > 0) {
        new Polygon(AppState.drawingPolygonPoints).draw(ctx, true);
    }

    // Draw Arrows
    AppState.arrows.forEach((a, i) => {
        const isSelected = (AppState.selectedObj === a);
        a.draw(ctx, responsiveConstant, isSelected);
    });
    if (AppState.drawingArrow) {
        AppState.drawingArrow.draw(ctx, responsiveConstant, true);
    }

    // Draw Circles
    AppState.circles.forEach((c, i) => {
        const isSelected = (AppState.selectedObj === c);
        c.draw(ctx, imgs.ball, responsiveConstant, isSelected);
    });

    // Draw Texts
    AppState.texts.forEach((t, i) => {
        const isSelected = (AppState.selectedObj === t);
        t.draw(ctx, responsiveConstant, isSelected);
    });
    
    // Save state
    Storage.save(AppState.circles, AppState.arrows, AppState.texts, AppState.polygons, AppState.pitchType);
}

// --- EVENT HANDLERS ---

// 1. Mouse Events on Canvas
canvas.addEventListener("mousedown", (e) => {
    const pos = getMousePos(canvas, e);
    
    // Mode: Draw Arrow
    if (document.getElementById("draw-arrow-input").checked) {
        AppState.mode = 'drawArrow';
        const color = document.getElementById("arrow-color").value;
        const type = document.getElementById("arrow-type").value;
        const isArrow = document.getElementById("is-arrow").checked;
        
        AppState.drawingArrow = new Arrow(pos.x, pos.y, pos.x, pos.y, color, type, isArrow);
        return;
    }

    // Mode: Draw Polygon
    if (document.getElementById("draw-polygon-input").checked) {
        AppState.mode = 'drawPolygon';
        // Check if clicking on existing polygon to select it (optional) or just add point
        AppState.drawingPolygonPoints.push({x: pos.x, y: pos.y});
        render();
        return;
    }

    // Mode: Select / Drag
    AppState.mode = 'select';
    AppState.selectedObj = null;
    AppState.isDragging = false;

    // Check hit (Priority: Text > Circle > Arrow > Polygon)
    
    // Check Texts
    for (let i = AppState.texts.length - 1; i >= 0; i--) {
        if (AppState.texts[i].isHit(pos.x, pos.y, ctx, responsiveConstant)) {
            AppState.selectedObj = AppState.texts[i];
            AppState.selectedType = 'text';
            AppState.isDragging = true;
            AppState.dragOffset = { x: pos.x - AppState.texts[i].x, y: pos.y - AppState.texts[i].y };
            render();
            return;
        }
    }

    // Check Circles
    for (let i = AppState.circles.length - 1; i >= 0; i--) {
        if (AppState.circles[i].isHit(pos.x, pos.y)) {
            AppState.selectedObj = AppState.circles[i];
            AppState.selectedType = 'circle';
            AppState.isDragging = true;
            // Center dragging for circles usually feels better, or calc offset
            AppState.dragOffset = { x: pos.x - AppState.circles[i].x, y: pos.y - AppState.circles[i].y };
            render();
            return;
        }
    }

    // Check Arrows (Handles first, then Body)
    for (let i = AppState.arrows.length - 1; i >= 0; i--) {
        const arr = AppState.arrows[i];
        if (arr.isHitHandle(pos.x, pos.y, 'from', responsiveConstant)) {
            AppState.selectedObj = arr;
            AppState.selectedType = 'arrow';
            AppState.isDragging = true;
            AppState.arrowDragPoint = 'from';
            render(); return;
        }
        if (arr.isHitHandle(pos.x, pos.y, 'to', responsiveConstant)) {
            AppState.selectedObj = arr;
            AppState.selectedType = 'arrow';
            AppState.isDragging = true;
            AppState.arrowDragPoint = 'to';
            render(); return;
        }
        if (arr.isHitBody(pos.x, pos.y)) {
            AppState.selectedObj = arr;
            AppState.selectedType = 'arrow';
            AppState.isDragging = true;
            AppState.arrowDragPoint = 'body';
            AppState.dragOffset = { 
                fromX: pos.x - arr.fromX, fromY: pos.y - arr.fromY,
                toX: pos.x - arr.toX, toY: pos.y - arr.toY
            };
            render(); return;
        }
    }

    // Check Polygons
    for (let i = AppState.polygons.length - 1; i >= 0; i--) {
        if (AppState.polygons[i].isHit(pos)) {
            AppState.selectedObj = AppState.polygons[i];
            AppState.selectedType = 'polygon';
            // Polygon dragging not implemented yet, just select
            render();
            return;
        }
    }

    render(); // Clear selection if clicked outside
});

canvas.addEventListener("mousemove", (e) => {
    const pos = getMousePos(canvas, e);

    if (AppState.mode === 'drawArrow' && AppState.drawingArrow) {
        AppState.drawingArrow.toX = pos.x;
        AppState.drawingArrow.toY = pos.y;
        render();
        return;
    }

    if (AppState.isDragging && AppState.selectedObj) {
        if (AppState.selectedType === 'circle') {
            AppState.selectedObj.x = pos.x - AppState.dragOffset.x;
            AppState.selectedObj.y = pos.y - AppState.dragOffset.y;
        } 
        else if (AppState.selectedType === 'text') {
            AppState.selectedObj.x = pos.x - AppState.dragOffset.x;
            AppState.selectedObj.y = pos.y - AppState.dragOffset.y;
        }
        else if (AppState.selectedType === 'arrow') {
            const arr = AppState.selectedObj;
            if (AppState.arrowDragPoint === 'from') {
                arr.fromX = pos.x; arr.fromY = pos.y;
            } else if (AppState.arrowDragPoint === 'to') {
                arr.toX = pos.x; arr.toY = pos.y;
            } else if (AppState.arrowDragPoint === 'body') {
                arr.fromX = pos.x - AppState.dragOffset.fromX;
                arr.fromY = pos.y - AppState.dragOffset.fromY;
                arr.toX = pos.x - AppState.dragOffset.toX;
                arr.toY = pos.y - AppState.dragOffset.toY;
            }
        }
        render();
    }
});

canvas.addEventListener("mouseup", () => {
    if (AppState.mode === 'drawArrow' && AppState.drawingArrow) {
        AppState.arrows.push(AppState.drawingArrow);
        AppState.drawingArrow = null;
        AppState.mode = 'select';
        document.getElementById("draw-arrow-input").checked = false; // Toggle off UI
        document.getElementById("draw-polygon-input").disabled = false;
        updateCounts();
    }
    
    AppState.isDragging = false;
    AppState.arrowDragPoint = null;
    render();
});


// 2. UI Controls Logic

// Pitch Type Change
document.getElementById("pitch-type").addEventListener("change", (e) => {
    AppState.pitchType = e.target.value;
    resizeCanvas(AppState.pitchType);
    render();
});

// Add Circle
document.getElementById("circle-btn").addEventListener("click", () => {
    const color = document.getElementById("circle-color").value;
    const text = document.getElementById("circle-text").value;
    const details = document.getElementById("circle-details-text").value;
    const textColor = document.getElementById("circle-text-color").value || "white";
    
    // Add to center of canvas
    const newCircle = new Circle(canvas.width/2, canvas.height/2, 20 * responsiveConstant, color, text, textColor, details);
    AppState.circles.push(newCircle);
    
    // Reset inputs
    document.getElementById("circle-text").value = "";
    document.getElementById("circle-details-text").value = "";
    updateCounts();
    render();
});

// Add Text
document.getElementById("text-btn").addEventListener("click", () => {
    const val = document.getElementById("text-input").value;
    if(!val) return alert("Please enter text");
    const fontSize = parseInt(document.getElementById("text-font-size").value) || 20;
    
    AppState.texts.push(new TextObj(canvas.width/2, canvas.height/2, val, fontSize));
    document.getElementById("text-input").value = "";
    updateCounts();
    render();
});

// Finish Polygon
document.getElementById("closePolygon").addEventListener("click", () => {
    if (AppState.drawingPolygonPoints.length > 2) {
        AppState.polygons.push(new Polygon(AppState.drawingPolygonPoints));
        AppState.drawingPolygonPoints = [];
        document.getElementById("draw-polygon-input").checked = false;
        document.getElementById("draw-arrow-input").disabled = false;
        updateCounts();
        render();
    }
});

// Delete Button
document.getElementById("delete-btn").addEventListener("click", () => {
    if (!AppState.selectedObj) return;
    
    if (AppState.selectedType === 'circle') {
        AppState.circles = AppState.circles.filter(o => o !== AppState.selectedObj);
    } else if (AppState.selectedType === 'arrow') {
        AppState.arrows = AppState.arrows.filter(o => o !== AppState.selectedObj);
    } else if (AppState.selectedType === 'text') {
        AppState.texts = AppState.texts.filter(o => o !== AppState.selectedObj);
    } else if (AppState.selectedType === 'polygon') {
        AppState.polygons = AppState.polygons.filter(o => o !== AppState.selectedObj);
    }
    
    AppState.selectedObj = null;
    updateCounts();
    render();
});

// Reset Button
document.getElementById("reset-btn").addEventListener("click", () => {
    if(confirm("Clear current pitch?")) {
        AppState.circles = [];
        AppState.arrows = [];
        AppState.texts = [];
        AppState.polygons = [];
        Storage.clear();
        updateCounts();
        render();
    }
});

// Export
document.getElementById("export-btn").addEventListener("click", () => {
    // Tạm thời dùng lại logic render nhưng trên canvas tạm
    // Vì code cũ khá dài, bạn có thể tái sử dụng logic export cũ
    // Hoặc đơn giản là:
    const link = document.createElement('a');
    link.download = 'tactical-board.jpg';
    link.href = canvas.toDataURL("image/jpeg", 1.0);
    link.click();
});

// Checkbox Logic (Arrow vs Polygon exclusive)
document.getElementById("draw-arrow-input").addEventListener("change", (e) => {
    document.getElementById("draw-polygon-input").disabled = e.target.checked;
    if(e.target.checked) AppState.selectedObj = null; // Deselect
});
document.getElementById("draw-polygon-input").addEventListener("change", (e) => {
    document.getElementById("draw-arrow-input").disabled = e.target.checked;
    if(e.target.checked) AppState.selectedObj = null;
});

// Rotate Text (Shift + Scroll)
window.addEventListener("wheel", (e) => {
    if (e.shiftKey && AppState.selectedObj && AppState.selectedType === 'text') {
        AppState.selectedObj.rotate += (e.deltaY > 0 ? 5 : -5);
        render();
    }
});

// Helper
function updateCounts() {
    document.querySelector(".circle-count").innerText = AppState.circles.length;
    document.querySelector(".arrow-count").innerText = AppState.arrows.length;
    document.querySelector(".text-count").innerText = AppState.texts.length;
    document.querySelector(".polygon-count").innerText = AppState.polygons.length;
}

// Start App
init();