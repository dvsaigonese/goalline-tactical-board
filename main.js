const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const horizontalPitch = new Image();
horizontalPitch.src = "assets/img/horizontal_pitch.png";
const verticalPitch = new Image();
verticalPitch.src = "assets/img/vertical_pitch.png";
const halfPitch = new Image();
halfPitch.src = "assets/img/half_pitch.png";
const ballImg = new Image();
ballImg.src = "assets/img/ball.png";

var screenWidth = window.innerWidth;
var responsiveConstant;
console.log(screenWidth);

//define to save canvas in local storage when closing window
let canvasObj = JSON.parse(localStorage.getItem("canvasObj"));
let circleObj = JSON.parse(localStorage.getItem("circleObj"));
let arrowObj = JSON.parse(localStorage.getItem("arrowObj"));
let textObj = JSON.parse(localStorage.getItem("textObj"));
let polygonObj = JSON.parse(localStorage.getItem("polygonObj"));

document.getElementById("pitch-type").value = JSON.parse(
  localStorage.getItem("canvasObj")
)
  ? JSON.parse(localStorage.getItem("canvasObj"))
  : document.getElementById("pitch-type").value;
let circles = JSON.parse(localStorage.getItem("circleObj"))
  ? JSON.parse(localStorage.getItem("circleObj"))
  : [];
let arrows = JSON.parse(localStorage.getItem("arrowObj"))
  ? JSON.parse(localStorage.getItem("arrowObj"))
  : [];
let texts = JSON.parse(localStorage.getItem("textObj"))
  ? JSON.parse(localStorage.getItem("textObj"))
  : [];
let polygons = JSON.parse(localStorage.getItem("polygonObj"))
  ? JSON.parse(localStorage.getItem("polygonObj"))
  : [];

window.onload = function () {
  var today = new Date();
  var currentYear = today.getFullYear();
  document.querySelector(".copyright").innerHTML = `© ${currentYear} Goal-Line`;
  drawCanvas(true);
};

document.getElementById("pitch-type").addEventListener("change", () => {
  canvasObj = [];
  canvasObj.push(document.getElementById("pitch-type").value);
  localStorage.setItem("canvasObj", JSON.stringify(canvasObj));
  drawCanvas();
});

function drawCanvas(isFirstLoad = false) {
  let pitchType;
  let defaultWidth = 900;
  let defaultHeight = 600;
  let halfWidthDevideByHorizontalWidth = 0.82;
  if (isFirstLoad == false) {
    pitchType = document.getElementById("pitch-type").value;
  } else {
    pitchType = canvasObj[0]
      ? canvasObj[0]
      : document.getElementById("pitch-type").value;
  }
  if (screenWidth < 768) {
    alert("Nghèo quá v, mua máy màn hình to lên rồi hẵng xài nhé!");
  } else if (screenWidth >= 768 && screenWidth < 1024) {
    responsiveConstant = 0.82;
    if (pitchType == "horizontal") {
      canvas.width = defaultWidth * responsiveConstant;
      canvas.height = defaultHeight * responsiveConstant;
    } else if (pitchType == "vertical") {
      canvas.width = defaultWidth * responsiveConstant;
      canvas.height = defaultHeight * responsiveConstant;
    } else if (pitchType == "half") {
      canvas.width =
        defaultWidth * responsiveConstant * halfWidthDevideByHorizontalWidth;
      canvas.height = defaultHeight * responsiveConstant;
    }
  } else if (screenWidth >= 1024 && screenWidth < 1440) {
    responsiveConstant = 1;
    if (pitchType == "horizontal") {
      canvas.width = defaultWidth;
      canvas.height = defaultHeight;
    } else if (pitchType == "vertical") {
      canvas.width = defaultWidth;
      canvas.height = defaultHeight;
    } else if (pitchType == "half") {
      canvas.width = defaultWidth * halfWidthDevideByHorizontalWidth;
      canvas.height = defaultHeight;
    }
  } else if (screenWidth >= 1440) {
    responsiveConstant = 1.18;
    if (pitchType == "horizontal") {
      canvas.width = defaultWidth * responsiveConstant;
      canvas.height = defaultHeight * responsiveConstant;
    } else if (pitchType == "vertical") {
      canvas.width = defaultWidth * responsiveConstant;
      canvas.height = defaultHeight * responsiveConstant;
    } else if (pitchType == "half") {
      canvas.width =
        defaultWidth * responsiveConstant * halfWidthDevideByHorizontalWidth;
      canvas.height = defaultHeight * responsiveConstant;
    }
  }
  if (pitchType == "horizontal") {
    ctx.drawImage(horizontalPitch, 0, 0, canvas.width, canvas.height);
  } else if (pitchType == "half") {
    ctx.drawImage(halfPitch, 0, 0, canvas.width, canvas.height);
  } else if (pitchType == "vertical") {
    ctx.drawImage(verticalPitch, 0, 0, canvas.width, canvas.height);
  }
  drawAllCircles(isFirstLoad);
  drawAllArrows(isFirstLoad);
  drawAllPolygons(isFirstLoad);
  drawAllTexts(isFirstLoad);
}
//
//
//
//
//
//
//
//
//
//
//
//handle arrow and polygon checkboxes
const checkboxDrawArrow = document.getElementById("draw-arrow-input");
const checkboxDrawPolygon = document.getElementById("draw-polygon-input");

function handleCheckboxDrawArrow() {
  if (checkboxDrawArrow.checked) {
    checkboxDrawPolygon.checked = false;
    checkboxDrawPolygon.disabled = true;
  } else {
    checkboxDrawPolygon.disabled = false;
  }
}

function handleCheckboxDrawPolygon() {
  if (checkboxDrawPolygon.checked) {
    checkboxDrawArrow.checked = false;
    checkboxDrawArrow.disabled = true;
  } else {
    checkboxDrawArrow.disabled = false;
  }
}

checkboxDrawArrow.addEventListener('change', handleCheckboxDrawArrow);
checkboxDrawPolygon.addEventListener('change', handleCheckboxDrawPolygon);

function toggleCheckboxDrawArrow() {
  checkboxDrawArrow.checked = !checkboxDrawArrow.checked;
  handleCheckboxDrawArrow(); 
}

function toggleCheckboxDrawPolygon() {
  checkboxDrawPolygon.checked = !checkboxDrawPolygon.checked;
  handleCheckboxDrawPolygon(); 
}
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
let selectedCircleIndex;
let selectedArrowIndex;
let selectedTextIndex;
let selectedPolygonIndex;

//Circle

function drawAllCircles(isFirstLoad = false) {
  if (isFirstLoad == false) {
    circleObj = [];
  }
  circles.forEach((circle, index) => {
    if (isFirstLoad == false) {
      circleObj.push(circle);
    }
    drawCircle(circle, index === selectedCircleIndex);
  });
  localStorage.setItem("circleObj", JSON.stringify(circleObj));
}

const addCircleBtn = document.getElementById("circle-btn");
let isCircleDragging = false;
let draggingCircleIndex = -1;

function drawCircle(circle, isSelected = false) {
  if (circle.color == "ball") {
    ctx.save();
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      ballImg,
      circle.x - circle.radius,
      circle.y - circle.radius,
      circle.radius * 2,
      circle.radius * 2
    );
  } else {
    ctx.save();
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.fillStyle = circle.color;
    ctx.fill();
  }

  if (isSelected) {
    ctx.lineWidth = 3 * responsiveConstant;
    ctx.strokeStyle = "white";
    ctx.stroke();
  }

  let fontSize = 20 * responsiveConstant;
  ctx.font = `bold ${fontSize}px Albula`;
  ctx.textAlign = "center";
  ctx.fillStyle = circle.textColor;
  ctx.fillText(circle.text, circle.x, circle.y + 6);

  let fontDetailsSize = 15 * responsiveConstant;
  ctx.font = `bold ${fontDetailsSize}px Albula`;
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText(circle.detailsText, circle.x, circle.y + 26);

  ctx.closePath();
  ctx.restore();
  document.querySelector(".circle-count").innerText = circles.length;
}

function isInsideCircle(x, y, circle) {
  const dx = x - circle.x;
  const dy = y - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

addCircleBtn.addEventListener("click", () => {
  let circleColor = document.getElementById("circle-color").value;
  let circleText = document.getElementById("circle-text").value
    ? document.getElementById("circle-text").value
    : "";
  let circleDetailsText = document.getElementById("circle-details-text").value
    ? document.getElementById("circle-details-text").value
    : "";
  let circleTextColor = document.getElementById("circle-text-color").value
    ? document.getElementById("circle-text-color").value
    : "white";
  const newCircle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20 * responsiveConstant,
    color: circleColor,
    text: circleText,
    textColor: circleTextColor,
    detailsText: circleDetailsText,
  };
  circles.push(newCircle);
  document.getElementById("circle-text").value = "";
  document.getElementById("circle-details-text").value = "";
  circles.forEach((circle, index) =>
    drawCircle(circle, index === selectedCircleIndex)
  );
});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// Arrow
const addArrowBtn = document.getElementById("arrow-btn");

let draggingArrow = null;
let draggingArrowPoint = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function drawArrow(
  ctx,
  fromX,
  fromY,
  toX,
  toY,
  color,
  type,
  isArrow = false,
  isSelected = false
) {
  var headlen = 13 * responsiveConstant; // Chiều dài đầu mũi tên
  var angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.save();
  // Vẽ thân mũi tên
  ctx.beginPath();
  if (type == "dash") {
    ctx.setLineDash([15 * responsiveConstant, 15 * responsiveConstant]);
  }
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3 * responsiveConstant;
  ctx.stroke();

  // Vẽ đầu mũi tên
  if (isArrow) {
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headlen * Math.cos(angle - Math.PI / 6),
      toY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headlen * Math.cos(angle + Math.PI / 6),
      toY - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(toX, toY);
    ctx.lineTo(
      toX - headlen * Math.cos(angle - Math.PI / 6),
      toY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.stroke();
    ctx.fill();
  }

  // Vẽ các chấm tròn ở hai đầu mũi tên
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(fromX, fromY, 10 * responsiveConstant, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(toX, toY, 10 * responsiveConstant, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
  document.querySelector(".arrow-count").innerText = arrows.length;
}

function drawAllArrows(isFirstLoad = false) {
  if (isFirstLoad == false) {
    arrowObj = [];
  }
  arrows.forEach((arrow, index) => {
    if (isFirstLoad == false) {
      arrowObj.push(arrow);
    }
    drawArrow(
      ctx,
      arrow.fromX,
      arrow.fromY,
      arrow.toX,
      arrow.toY,
      arrow.color,
      arrow.type,
      arrow.isArrow,
      index === selectedArrowIndex
    );
  });
  localStorage.setItem("arrowObj", JSON.stringify(arrowObj));
}

function isMouseOnArrowPoint(x, y, point) {
  const dx = x - point.x;
  const dy = y - point.y;
  return (
    dx * dx + dy * dy <= 10 * responsiveConstant * (10 * responsiveConstant)
  );
}

function isMouseOnArrow(mx, my, arrow) {
  var distance =
    Math.sqrt(Math.pow(mx - arrow.fromX, 2) + Math.pow(my - arrow.fromY, 2)) +
    Math.sqrt(Math.pow(mx - arrow.toX, 2) + Math.pow(my - arrow.toY, 2));
  var arrowLength = Math.sqrt(
    Math.pow(arrow.toX - arrow.fromX, 2) + Math.pow(arrow.toY - arrow.fromY, 2)
  );
  return Math.abs(distance - arrowLength) < 3;
}

// addArrowBtn.addEventListener("click", function () {
//   let color = document.querySelector("#arrow-color").value;
//   let type = document.querySelector("#arrow-type").value;
//   var centerX = canvas.width / 2;
//   var centerY = canvas.height / 2;
//   var newArrow = {
//     fromX: centerX - 50,
//     fromY: centerY,
//     toX: centerX + 50,
//     toY: centerY,
//     dragging: false,
//     offsetX: 0,
//     offsetY: 0,
//     color: color,
//     isArrow: document.getElementById("is-arrow").checked ? true : false,
//     type: type,
//   };
//   arrows.push(newArrow);
//   drawAllArrows();
// });

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//Text

const addTextBtn = document.getElementById("text-btn");
let isTextDragging = false;
let isTextRotating = false;

function drawAllTexts(isFirstLoad = false) {
  if (isFirstLoad == false) {
    textObj = [];
  }
  texts.forEach((text, index) => {
    if (isFirstLoad == false) {
      textObj.push(text);
    }
    drawText(text, index === selectedTextIndex);
  });
  localStorage.setItem("textObj", JSON.stringify(textObj));
}

function drawText(text, isSelected = false) {
  ctx.save();
  ctx.translate(text.x, text.y);
  ctx.rotate(text.rotate * (Math.PI / 180));
  ctx.font = `${text.fontSize}px Albula`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(text.text, 0, 0);
  ctx.restore();

  if (isSelected) {
    let textWidth = ctx.measureText(text.text).width;
    ctx.beginPath();
    ctx.moveTo(text.x - textWidth / 2, text.y + 2);
    ctx.lineTo(text.x + textWidth / 2, text.y + 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3 * responsiveConstant;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
  document.querySelector(".text-count").innerText = texts.length;
}

function isInsideText(x, y, text) {
  const textWidth = ctx.measureText(text.text).width;
  const textHeight = text.fontSize; // Chiều cao font ước lượng
  return (
    x >= text.x - textWidth / 2 &&
    x <= text.x + textWidth / 2 &&
    y >= text.y - textHeight / 2 &&
    y <= text.y + textHeight / 2
  );
}

//rotate when press Shift + roll mouse wheel
let isShiftPressed = false;
let isRotateTextKeyUp = false;
let rotateValue = 0;

function handleKeyDown(event) {
  if (event.key === "Shift") {
    isShiftPressed = true;
  }
}

function handleKeyUp(event) {
  if (event.key === "Shift") {
    isShiftPressed = false;
  }
}

function handleWheelEvent(event) {
  if (isShiftPressed) {
    if (event.deltaY > 0) {
      rotateValue = rotateValue + 2;
    } else if (event.deltaY < 0) {
      rotateValue = rotateValue - 2;
    }
    if (selectedTextIndex != -1) {
      texts[selectedTextIndex].rotate = rotateValue;
    }
    drawCanvas();
  } else {
    isRotateTextKeyUp = false;
  }
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
window.addEventListener("wheel", handleWheelEvent);

/////////////////////////

addTextBtn.addEventListener("click", function () {
  let textInput = document.getElementById("text-input").value;
  let textFontSize = document.getElementById("text-font-size").value
    ? document.getElementById("text-font-size").value
    : 20 * responsiveConstant;

  if (textInput == "") {
    alert("Please enter a text");
  } else {
    const text = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      text: textInput,
      rotate: 0,
      fontSize: textFontSize,
    };
    texts.push(text);
  }

  document.getElementById("text-input").value = "";
  texts.forEach((text, index) => drawText(text, index === selectedTextIndex));
});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// Polygons
let currentPolygon = [];
function drawAllPolygons(isFirstLoad = false) {
  if (isFirstLoad == false) {
    polygonObj = [];
  }
  polygons.forEach((polygon, index) => {
    if (isFirstLoad == false) {
      polygonObj.push(polygon);
    }
  });
  localStorage.setItem("polygonObj", JSON.stringify(polygonObj));
  polygons.forEach((polygon, index) => {
    ctx.fillStyle =
      index == selectedPolygonIndex
        ? "rgba(255, 0, 0, 0.3)"
        : "rgba(255, 255, 255, 0.3)";

    ctx.beginPath();
    ctx.moveTo(polygon[0].x, polygon[0].y);
    for (let i = 1; i < polygon.length; i++) {
      ctx.lineTo(polygon[i].x, polygon[i].y);
    }
    ctx.closePath();
    ctx.fill();

    for (let i = 0; i < polygon.length; i++) {
      if (i > 0) {
        drawLine(polygon[i - 1], polygon[i]);
      }
    }
    drawLine(polygon[polygon.length - 1], polygon[0]);
  });

  ctx.fillStyle = "white";
  for (let i = 0; i < currentPolygon.length; i++) {
    ctx.beginPath();
    ctx.arc(currentPolygon[i].x, currentPolygon[i].y, 3, 0, Math.PI * 2);
    ctx.fill();

    if (i > 0) {
      drawLine(currentPolygon[i - 1], currentPolygon[i]);
    }
  }
  document.querySelector(".polygon-count").innerText = polygons.length;
}

function getPolygonAtPoint(x, y) {
  for (let i = 0; i < polygons.length; i++) {
    if (isPointInPolygon({ x, y }, polygons[i])) {
      return i;
    }
  }
  return null;
}

function drawLine(p1, p2) {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.strokeStyle = "white";
  ctx.stroke();
}

function isPointInPolygon(point, polygon) {
  let isInside = false;
  let minX = polygon[0].x,
    maxX = polygon[0].x;
  let minY = polygon[0].y,
    maxY = polygon[0].y;

  for (let n = 1; n < polygon.length; n++) {
    const q = polygon[n];
    minX = Math.min(q.x, minX);
    maxX = Math.max(q.x, maxX);
    minY = Math.min(q.y, minY);
    maxY = Math.max(q.y, maxY);
  }

  if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
    return false;
  }

  let i = 0,
    j = polygon.length - 1;
  for (i, j; i < polygon.length; j = i++) {
    if (
      polygon[i].y > point.y !== polygon[j].y > point.y &&
      point.x <
        ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) /
          (polygon[j].y - polygon[i].y) +
          polygon[i].x
    ) {
      isInside = !isInside;
    }
  }

  return isInside;
}

document.getElementById("closePolygon").addEventListener("click", () => {
  if (currentPolygon.length > 2) {
    drawLine(currentPolygon[currentPolygon.length - 1], currentPolygon[0]);
    polygons.push(currentPolygon);
    currentPolygon = [];
    toggleCheckboxDrawPolygon();
    drawCanvas();
  }
});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// Canvas
canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Kiểm tra nếu click xảy ra ngoài circle
  let clickedOutside = true;
  for (let i = 0; i < circles.length; i++) {
    if (isInsideCircle(mouseX, mouseY, circles[i])) {
      clickedOutside = false;
      drawCanvas();
      break;
    }
  }

  if (clickedOutside) {
    selectedCircleIndex = -1;
    drawCanvas();
  }
});

let xDrawingArrow,
  yDrawingArrow,
  isDrawingArrow = false;

canvas.addEventListener("mousedown", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // circle
  selectedCircleIndex = -1;
  for (let i = 0; i < circles.length; i++) {
    if (isInsideCircle(mouseX, mouseY, circles[i])) {
      isCircleDragging = true;
      draggingCircleIndex = i;
      selectedCircleIndex = i;
      drawCanvas();
      break;
    }
  }

  // arrow
  if (document.getElementById("draw-arrow-input").checked) {
    xDrawingArrow = mouseX;
    yDrawingArrow = mouseY;
    isDrawingArrow = true;
  }
  selectedArrowIndex = -1;
  for (let i = 0; i < arrows.length; i++) {
    const arrow = arrows[i];

    if (isMouseOnArrow(mouseX, mouseY, arrow)) {
      draggingArrow = arrow;
      selectedArrowIndex = i;
      dragOffsetX = mouseX - arrow.fromX;
      dragOffsetY = mouseY - arrow.fromY;
      drawCanvas();
    }

    if (
      isMouseOnArrowPoint(mouseX, mouseY, {
        x: arrow.fromX,
        y: arrow.fromY,
      })
    ) {
      draggingArrow = arrow;
      draggingArrowPoint = "from";
      dragOffsetX = mouseX - arrow.fromX;
      dragOffsetY = mouseY - arrow.fromY;
      selectedArrowIndex = i;
      drawCanvas();
      break;
    } else if (
      isMouseOnArrowPoint(mouseX, mouseY, {
        x: arrow.toX,
        y: arrow.toY,
      })
    ) {
      draggingArrow = arrow;
      draggingArrowPoint = "to";
      dragOffsetX = mouseX - arrow.toX;
      dragOffsetY = mouseY - arrow.toY;
      selectedArrowIndex = i;
      drawCanvas();
      break;
    }
  }

  //text
  selectedTextIndex = -1;
  for (let i = 0; i < texts.length; i++) {
    if (isInsideText(mouseX, mouseY, texts[i])) {
      isTextDragging = true;
      selectedTextIndex = i;
      drawCanvas();
      break;
    }
  }

  //polygon
  const x = e.offsetX;
  const y = e.offsetY;
  if (document.getElementById("draw-polygon-input").checked) {
    const clickedPolygonIndex = getPolygonAtPoint(mouseX, mouseY);
    if (clickedPolygonIndex != null) {
      selectedPolygonIndex = clickedPolygonIndex;
      drawCanvas();
    } else {
      currentPolygon.push({ x, y });
      drawCanvas();
    }
  } else if (document.getElementById("draw-polygon-input").checked == false) {
    selectedPolygonIndex = getPolygonAtPoint(mouseX, mouseY);
    drawCanvas();
  }
});

let newArrow;
canvas.addEventListener("mousemove", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // circle
  if (isCircleDragging) {
    circles[draggingCircleIndex].x = mouseX;
    circles[draggingCircleIndex].y = mouseY;

    drawCanvas();
  }

  // arrow
  if (isDrawingArrow) {
    let color = document.querySelector("#arrow-color").value;
    let type = document.querySelector("#arrow-type").value;
    newArrow = {
      fromX: xDrawingArrow,
      fromY: yDrawingArrow,
      toX: mouseX,
      toY: mouseY,
      dragging: false,
      offsetX: 0,
      offsetY: 0,
      color: color,
      isArrow: document.getElementById("is-arrow").checked ? true : false,
      type: type,
    };
    drawAllArrows();
    drawArrow(newArrow);
  }

  if (draggingArrow) {
    if (draggingArrowPoint === "from") {
      draggingArrow.fromX = mouseX - dragOffsetX;
      draggingArrow.fromY = mouseY - dragOffsetY;
    } else if (draggingArrowPoint === "to") {
      draggingArrow.toX = mouseX - dragOffsetX;
      draggingArrow.toY = mouseY - dragOffsetY;
    } else {
      const newX = mouseX - dragOffsetX;
      const newY = mouseY - dragOffsetY;

      const length = Math.sqrt(
        Math.pow(draggingArrow.toX - draggingArrow.fromX, 2) +
          Math.pow(draggingArrow.toY - draggingArrow.fromY, 2)
      );
      const angle = Math.atan2(
        draggingArrow.toY - draggingArrow.fromY,
        draggingArrow.toX - draggingArrow.fromX
      );
      draggingArrow.fromX = newX;
      draggingArrow.fromY = newY;
      draggingArrow.toX = draggingArrow.fromX + length * Math.cos(angle);
      draggingArrow.toY = draggingArrow.fromY + length * Math.sin(angle);
    }
    drawCanvas();
  }
  //text
  if (isTextDragging) {
    texts[selectedTextIndex].x = mouseX;
    texts[selectedTextIndex].y = mouseY;

    drawCanvas();
  }
});

canvas.addEventListener("mouseup", function () {
  draggingArrow = null;
  draggingArrowPoint = null;
  isCircleDragging = false;
  isTextDragging = false;
  draggingCircleIndex = -1;
  if (isDrawingArrow) {
    arrows.push(newArrow);
    toggleCheckboxDrawArrow();
    isDrawingArrow = false;
  }
});

canvas.addEventListener("mouseout", function () {
  draggingArrow = null;
  draggingArrowPoint = null;
  isCircleDragging = false;
  isTextDragging = false;
  draggingCircleIndex = -1;
  drawCanvas();
});

document.getElementById("export-btn").addEventListener("click", exportCanvas);

function exportCanvas() {
  const exportCanvas = document.createElement("canvas");
  const exportCtx = exportCanvas.getContext("2d");
  const scale = 4;

  exportCanvas.width = canvas.width * scale;
  exportCanvas.height = canvas.height * scale;

  exportCtx.scale(scale, scale);

  let pitchType = document.getElementById("pitch-type").value;
  if (pitchType === "horizontal") {
    exportCtx.drawImage(horizontalPitch, 0, 0, canvas.width, canvas.height);
  } else if (pitchType === "half") {
    exportCtx.drawImage(halfPitch, 0, 0, canvas.width, canvas.height);
  } else if (pitchType === "vertical") {
    exportCtx.drawImage(verticalPitch, 0, 0, canvas.width, canvas.height);
  }

  if (typeof polygons !== "undefined" && Array.isArray(polygons)) {
    polygons.forEach((polygon) => {
      if (polygon.length > 0) {
        exportCtx.fillStyle = "rgba(255, 255, 255, 0.3)";

        exportCtx.beginPath();
        exportCtx.moveTo(polygon[0].x, polygon[0].y);
        for (let i = 1; i < polygon.length; i++) {
          exportCtx.lineTo(polygon[i].x, polygon[i].y);
        }
        exportCtx.closePath();
        exportCtx.fill();

        exportCtx.strokeStyle = "white";
        exportCtx.lineWidth = 1;
        exportCtx.stroke();
      }
    });
  }

  circles.forEach((circle) => {
    if (circle.color === "ball") {
      exportCtx.save();
      exportCtx.beginPath();
      exportCtx.arc(circle.x, circle.y, circle.radius / 2, 0, Math.PI * 2);
      exportCtx.closePath();
      exportCtx.clip();
      exportCtx.drawImage(
        ballImg,
        circle.x - circle.radius,
        circle.y - circle.radius,
        circle.radius * 2,
        circle.radius * 2
      );
      exportCtx.restore();
    } else if (circle.color !== "ball") {
      exportCtx.save();
      exportCtx.beginPath();
      exportCtx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      exportCtx.fillStyle = circle.color;
      exportCtx.fill();
      exportCtx.restore();
    }

    // text
    let fontSize = 20 * responsiveConstant;
    exportCtx.font = `bold ${fontSize}px Albula`;
    exportCtx.textAlign = "center";
    exportCtx.fillStyle = circle.textColor;
    exportCtx.fillText(circle.text, circle.x, circle.y + 6);
    exportCtx.closePath();

    let fontDetailsSize = 15 * responsiveConstant;
    exportCtx.font = `bold ${fontDetailsSize}px Albula`;
    exportCtx.textAlign = "center";
    exportCtx.fillStyle = "white";
    exportCtx.fillText(circle.detailsText, circle.x, circle.y + 26);
  });

  // arrow
  arrows.forEach((arrow) => {
    var headlen = 13 * responsiveConstant;
    var angle = Math.atan2(arrow.toY - arrow.fromY, arrow.toX - arrow.fromX);

    exportCtx.beginPath();
    if (arrow.type === "dash") {
      exportCtx.setLineDash([15 * responsiveConstant, 15 * responsiveConstant]);
    }
    exportCtx.moveTo(arrow.fromX, arrow.fromY);
    exportCtx.lineTo(arrow.toX, arrow.toY);
    exportCtx.strokeStyle = arrow.color;
    exportCtx.fillStyle = arrow.color;
    exportCtx.lineWidth = 3 * responsiveConstant;
    exportCtx.stroke();

    if (arrow.isArrow) {
      exportCtx.setLineDash([]);
      exportCtx.beginPath();
      exportCtx.moveTo(arrow.toX, arrow.toY);
      exportCtx.lineTo(
        arrow.toX - headlen * Math.cos(angle - Math.PI / 6),
        arrow.toY - headlen * Math.sin(angle - Math.PI / 6)
      );
      exportCtx.lineTo(
        arrow.toX - headlen * Math.cos(angle + Math.PI / 6),
        arrow.toY - headlen * Math.sin(angle + Math.PI / 6)
      );
      exportCtx.lineTo(arrow.toX, arrow.toY);
      exportCtx.lineTo(
        arrow.toX - headlen * Math.cos(angle - Math.PI / 6),
        arrow.toY - headlen * Math.sin(angle - Math.PI / 6)
      );
      exportCtx.stroke();
      exportCtx.fill();
    }
  });

  texts.forEach((text) => {
    let fontSize = text.fontSize * responsiveConstant;
    exportCtx.save();
    exportCtx.font = `${fontSize}px Albula`;
    exportCtx.fillStyle = "white";
    exportCtx.textAlign = "center";

    exportCtx.translate(text.x, text.y);
    exportCtx.rotate(text.rotate * (Math.PI / 180));
    exportCtx.fillText(text.text, 0, 0);
    exportCtx.restore();
  });

  const dataURL = exportCanvas.toDataURL("image/jpeg");

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "Goal-Line Tactical Board.jpg";
  link.click();
}

document.getElementById("reset-btn").addEventListener("click", () => {
  circles = [];
  arrows = [];
  texts = [];
  polygons = [];
  document.querySelector(".circle-count").innerText = circles.length;
  document.querySelector(".arrow-count").innerText = arrows.length;
  document.querySelector(".text-count").innerText = texts.length;
  document.querySelector(".polygon-count").innerText = polygons.length;
  drawCanvas();
});

document.getElementById("delete-btn").addEventListener("click", () => {
  if (selectedCircleIndex !== -1) {
    circles.splice(selectedCircleIndex, 1);
    selectedCircleIndex = -1;
    drawCanvas();
  }
  if (selectedArrowIndex !== -1) {
    arrows.splice(selectedArrowIndex, 1);
    selectedArrowIndex = -1;
    drawCanvas();
  }
  if (selectedTextIndex !== -1) {
    texts.splice(selectedTextIndex, 1);
    selectedTextIndex = -1;
    drawCanvas();
  }
  if (selectedPolygonIndex !== null) {
    polygons.splice(selectedPolygonIndex, 1);
    selectedPolygonIndex = null;
    drawCanvas();
  }

  document.querySelector(".circle-count").innerText = circles.length;
  document.querySelector(".arrow-count").innerText = arrows.length;
  document.querySelector(".text-count").innerText = texts.length;
  document.querySelector(".polygon-count").innerText = polygons.length;
});
