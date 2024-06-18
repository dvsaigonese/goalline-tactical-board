const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const horizontalPitch = new Image();
horizontalPitch.src = "assets/img/horizontal_pitch.png";
const halfPitch = new Image();
halfPitch.src = "assets/img/half_pitch.png";

var screenWidth = window.innerWidth;
var responsiveConstant;
console.log(screenWidth);

window.onload = function () {
  //document.body.style.transform = "scale(scaleConstant)";
  drawCanvas();
};

document.getElementById("pitch-type").addEventListener("change", drawCanvas);

function drawCanvas() {
  let pitchType = document.getElementById("pitch-type").value;
  if (screenWidth < 768) {
    alert("Nghèo quá v, mua máy màn hình to lên rồi hẵng xài nhé!");
  } else if (screenWidth >= 768 && screenWidth < 1024) {
    if (pitchType == "horizontal") {
      canvas.width = 567;
      canvas.height = 397;
    } else if (pitchType == "half") {
      canvas.width = 468;
      canvas.height = 398;
    }
    responsiveConstant = 0.63;
  } else if (screenWidth >= 1024 && screenWidth < 1440) {
    if (pitchType == "horizontal") {
      canvas.width = 684;
      canvas.height = 477;
    } else if (pitchType == "half") {
      canvas.width = 567;
      canvas.height = 482;
    }
    responsiveConstant = 0.765;
  } else if (screenWidth >= 1440) {
    if (pitchType == "horizontal") {
      canvas.width = 810;
      canvas.height = 567;
    } else if (pitchType == "half") {
      canvas.width = 668;
      canvas.height = 567;
    }
    responsiveConstant = 0.9;
  }
  if (pitchType == "horizontal") {
    ctx.drawImage(horizontalPitch, 0, 0, canvas.width, canvas.height);
  } else if (pitchType == "half") {
    ctx.drawImage(halfPitch, 0, 0, canvas.width, canvas.height);
  }
  drawAllCircles();
  drawAllArrows();
  drawAllTexts();
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

//Circle

function drawAllCircles() {
  circles.forEach((circle, index) =>
    drawCircle(circle, index === selectedCircleIndex)
  );
}

const addCircleBtn = document.getElementById("circle-btn");
let circles = [];
let isCircleDragging = false;
let draggingCircleIndex = -1;

function drawCircle(circle, isSelected = false) {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  ctx.fillStyle = circle.color;
  ctx.fill();

  if (isSelected) {
    ctx.lineWidth = 3 * responsiveConstant;
    ctx.strokeStyle = "white";
    ctx.stroke();
  }

  let fontSize = 20 * responsiveConstant;
  ctx.font = `bold ${fontSize}px Albula`;
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText(circle.text, circle.x, circle.y + 6);

  ctx.closePath();
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
  const newCircle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20 * responsiveConstant,
    color: circleColor,
    text: circleText,
  };
  circles.push(newCircle);
  document.getElementById("circle-text").value = "";
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

let arrows = [];
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
  document.querySelector(".arrow-count").innerText = arrows.length;
}

function drawAllArrows() {
  arrows.forEach((arrow, index) => {
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

addArrowBtn.addEventListener("click", function () {
  let color = document.querySelector("#arrow-color").value;
  let type = document.querySelector("#arrow-type").value;
  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  var newArrow = {
    fromX: centerX - 50,
    fromY: centerY,
    toX: centerX + 50,
    toY: centerY,
    dragging: false,
    offsetX: 0,
    offsetY: 0,
    color: color,
    isArrow: document.getElementById("is-arrow").checked ? true : false,
    type: type,
  };
  arrows.push(newArrow);
  drawAllArrows();
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
//Text

const addTextBtn = document.getElementById("text-btn");
let texts = [];
let isTextDragging = false;

function drawAllTexts() {
  texts.forEach((text, index) => drawText(text, index === selectedTextIndex));
}

function drawText(text, isSelected = false) {
  let fontSize = 20 * responsiveConstant;
  ctx.font = `${fontSize}px Albula`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(text.text, text.x, text.y);

  if (isSelected) {
    let textWidth = ctx.measureText(text.text).width;
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.rect(text.x - textWidth / 2, text.y - fontSize, textWidth, fontSize * 2);
    ctx.stroke();
  }
}

function isInsideText(x, y, text) {
  const textWidth = ctx.measureText(text.text).width;
  const textHeight = 20 * responsiveConstant; // Chiều cao font ước lượng
  return (
    x >= text.x - textWidth / 2 &&
    x <= text.x + textWidth / 2 &&
    y >= text.y - textHeight / 2 &&
    y <= text.y + textHeight / 2
  );
}

addTextBtn.addEventListener("click", function () {
  let textInput = document.getElementById("text-input").value;

  if (textInput == "") {
    alert("Please enter a text");
  } else {
    const text = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      text: textInput,
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
//
// Canvas
canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left);
  const mouseY = (e.clientY - rect.top);

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

canvas.addEventListener("mousedown", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left);
  const mouseY = (e.clientY - rect.top); 

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
});

canvas.addEventListener("mousemove", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left);
  const mouseY = (e.clientY - rect.top);

  // circle
  if (isCircleDragging) {
    circles[draggingCircleIndex].x = mouseX;
    circles[draggingCircleIndex].y = mouseY;

    drawCanvas();
  }

  // arrow
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
});

canvas.addEventListener("mouseout", function () {
  draggingArrow = null;
  draggingArrowPoint = null;
  isCircleDragging = false;
  isTextDragging = false;
  draggingCircleIndex = -1;
});

document.getElementById("export-btn").addEventListener("click", exportCanvas);
function exportCanvas() {
  // Create a temporary canvas to export a high-resolution image
  const exportCanvas = document.createElement("canvas");
  const exportCtx = exportCanvas.getContext("2d");
  const scale = 3; // Scale factor for higher resolution

  // Set the size of the temporary canvas
  exportCanvas.width = canvas.width * scale;
  exportCanvas.height = canvas.height * scale;

  // Scale the context to increase resolution
  exportCtx.scale(scale, scale);

  // Draw everything onto the temporary canvas
  let pitchType = document.getElementById("pitch-type").value;
  if (pitchType == "horizontal") {
    exportCtx.drawImage(horizontalPitch, 0, 0, canvas.width, canvas.height);
  } else if (pitchType == "half") {
    exportCtx.drawImage(halfPitch, 0, 0, canvas.width, canvas.height);
  }

  circles.forEach((circle) => {
    exportCtx.beginPath();
    exportCtx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    exportCtx.fillStyle = circle.color;
    exportCtx.fill();
    let fontSize = 20 * responsiveConstant;
    exportCtx.font = `bold ${fontSize}px Albula`;
    exportCtx.textAlign = "center";
    exportCtx.fillStyle = "white";
    exportCtx.fillText(circle.text, circle.x, circle.y + 6);
    exportCtx.closePath();
  });

  arrows.forEach((arrow) => {
    var headlen = 13 * responsiveConstant; // Chiều dài đầu mũi tên
    var angle = Math.atan2(arrow.toY - arrow.fromY, arrow.toX - arrow.fromX);

    // Vẽ thân mũi tên
    exportCtx.beginPath();
    if (arrow.type == "dash") {
      exportCtx.setLineDash([15 * responsiveConstant, 15 * responsiveConstant]);
    }
    exportCtx.moveTo(arrow.fromX, arrow.fromY);
    exportCtx.lineTo(arrow.toX, arrow.toY);
    exportCtx.strokeStyle = arrow.color;
    exportCtx.fillStyle = arrow.color;
    exportCtx.lineWidth = 3 * responsiveConstant;
    exportCtx.stroke();

    // Vẽ đầu mũi tên
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

  //text
  texts.forEach((text) => {
    let fontSize = 20 * responsiveConstant;
    exportCtx.font = `${fontSize}px Albula`;
    exportCtx.fillStyle = "white";
    exportCtx.textAlign = "center";
    exportCtx.fillText(text.text, text.x, text.y);
  });

  // Convert the temporary canvas to a data URL
  const dataURL = exportCanvas.toDataURL("image/jpeg");

  // Create a link to download the image
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "Goal-Line Tactical Board.jpg";
  link.click();
}

document.getElementById("reset-btn").addEventListener("click", () => {
  circles = [];
  arrows = [];
  texts = [];
  document.querySelector(".circle-count").innerText = circles.length;
  document.querySelector(".arrow-count").innerText = arrows.length;
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

  document.querySelector(".circle-count").innerText = circles.length;
  document.querySelector(".arrow-count").innerText = arrows.length;
});
