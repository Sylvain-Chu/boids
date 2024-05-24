// Constants for the simulation parameters
const NUM_BOIDS = 100;
const VISUAL_RANGE = 75;
const SPEED_LIMIT = 15;
const MARGIN = 100;
const TURN_FACTOR = 1;
const CENTERING_FACTOR = 0.005;
const AVOID_FACTOR = 0.05;
const MATCHING_FACTOR = 0.05;
const MIN_DISTANCE = 20;
const DRAW_TRAIL = true;
const GRID_SIZE = 50;

// Size of the canvas, updated to fill the whole browser
let width = window.innerWidth;
let height = window.innerHeight;

// Mouse position
let mouseX = width / 2;
let mouseY = height / 2;
const MOUSE_AVOIDANCE_RANGE = 100;
const MOUSE_AVOIDANCE_FACTOR = 0.1;

// Boids array
let boids = [];
let selectedBoid = null;

// Initialize boids with random positions and velocities
function initBoids() {
  boids = Array.from({ length: NUM_BOIDS }, (_, id) => ({
    id,
    x: Math.random() * width,
    y: Math.random() * height,
    dx: Math.random() * 10 - 5,
    dy: Math.random() * 10 - 5,
    history: [],
  }));
  selectedBoid = boids[0]; // Select the first boid by default
}

// Calculate distance between two points
function calculateDistance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

// Adjust the canvas size and update width/height variables
function resizeCanvas() {
  const canvas = document.getElementById("boids");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

// Constrain a boid within the window bounds
function keepWithinBounds(boid) {
  if (boid.x < MARGIN) boid.dx += TURN_FACTOR;
  if (boid.x > width - MARGIN) boid.dx -= TURN_FACTOR;
  if (boid.y < MARGIN) boid.dy += TURN_FACTOR;
  if (boid.y > height - MARGIN) boid.dy -= TURN_FACTOR;
}

// Adjust velocity to point towards the center of mass of nearby boids
function flyTowardsCenter(boid) {
  let centerX = 0, centerY = 0, numNeighbors = 0;

  for (let otherBoid of boids) {
    if (calculateDistance(boid.x, boid.y, otherBoid.x, otherBoid.y) < VISUAL_RANGE) {
      centerX += otherBoid.x;
      centerY += otherBoid.y;
      numNeighbors++;
    }
  }

  if (numNeighbors) {
    centerX /= numNeighbors;
    centerY /= numNeighbors;
    boid.dx += (centerX - boid.x) * CENTERING_FACTOR;
    boid.dy += (centerY - boid.y) * CENTERING_FACTOR;
  }
}

// Adjust velocity to avoid colliding with nearby boids
function avoidOthers(boid) {
  let moveX = 0, moveY = 0;

  for (let otherBoid of boids) {
    if (otherBoid !== boid && calculateDistance(boid.x, boid.y, otherBoid.x, otherBoid.y) < MIN_DISTANCE) {
      moveX += boid.x - otherBoid.x;
      moveY += boid.y - otherBoid.y;
    }
  }

  boid.dx += moveX * AVOID_FACTOR;
  boid.dy += moveY * AVOID_FACTOR;
}

// Adjust velocity to match the average velocity of nearby boids
function matchVelocity(boid) {
  let avgDX = 0, avgDY = 0, numNeighbors = 0;

  for (let otherBoid of boids) {
    if (calculateDistance(boid.x, boid.y, otherBoid.x, otherBoid.y) < VISUAL_RANGE) {
      avgDX += otherBoid.dx;
      avgDY += otherBoid.dy;
      numNeighbors++;
    }
  }

  if (numNeighbors) {
    avgDX /= numNeighbors;
    avgDY /= numNeighbors;
    boid.dx += (avgDX - boid.dx) * MATCHING_FACTOR;
    boid.dy += (avgDY - boid.dy) * MATCHING_FACTOR;
  }
}

// Limit the speed of a boid to the specified speed limit
function limitSpeed(boid) {
  const speed = Math.hypot(boid.dx, boid.dy);
  if (speed > SPEED_LIMIT) {
    boid.dx = (boid.dx / speed) * SPEED_LIMIT;
    boid.dy = (boid.dy / speed) * SPEED_LIMIT;
  }
}

// Adjust velocity to avoid the mouse
function avoidMouse(boid) {
  const distToMouse = calculateDistance(boid.x, boid.y, mouseX, mouseY);
  if (distToMouse < MOUSE_AVOIDANCE_RANGE) {
    boid.dx += (boid.x - mouseX) * MOUSE_AVOIDANCE_FACTOR;
    boid.dy += (boid.y - mouseY) * MOUSE_AVOIDANCE_FACTOR;
  }
}

// Map a speed value to a color
function speedToColor(speed) {
  const speedPercent = Math.min(speed / SPEED_LIMIT, 1);
  const hue = (1 - speedPercent) * 240;
  return `hsl(${hue}, 100%, 50%)`;
}

// Draw a single boid on the canvas
function drawBoid(ctx, boid) {
  const speed = Math.hypot(boid.dx, boid.dy);
  const color = speedToColor(speed);
  const size = 5 + 10 * (speed / SPEED_LIMIT);
  const angle = Math.atan2(boid.dy, boid.dx);

  ctx.save();
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);
  ctx.fillStyle = boid === selectedBoid ? 'red' : color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, size / 2);
  ctx.lineTo(-size, -size / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  if (DRAW_TRAIL) {
    ctx.strokeStyle = "#558cf466";
    ctx.beginPath();
    ctx.moveTo(boid.history[0][0], boid.history[0][1]);
    for (const point of boid.history) {
      ctx.lineTo(point[0], point[1]);
    }
    ctx.stroke();
  }
}

function drawCircle(ctx, x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawLine(ctx, x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawGrid(ctx) {
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 0.5;

  for (let x = 0; x < width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

// Main animation loop
function animationLoop() {
  for (let boid of boids) {
    flyTowardsCenter(boid);
    avoidOthers(boid);
    matchVelocity(boid);
    limitSpeed(boid);
    keepWithinBounds(boid);
    avoidMouse(boid);

    boid.x += boid.dx;
    boid.y += boid.dy;
    boid.history.push([boid.x, boid.y]);
    boid.history = boid.history.slice(-50);
  }

  const ctx = document.getElementById("boids").getContext("2d");
  ctx.clearRect(0, 0, width, height);

  drawGrid(ctx);

  for (let boid of boids) {
    drawBoid(ctx, boid);
  }

  if (selectedBoid) {
    drawCircle(ctx, selectedBoid.x, selectedBoid.y, VISUAL_RANGE, 'yellow');
    const neighbors = boids.filter(boid => calculateDistance(selectedBoid.x, selectedBoid.y, boid.x, boid.y) < VISUAL_RANGE);
    
    let centerX = 0, centerY = 0, avgDX = 0, avgDY = 0;

    for (let neighbor of neighbors) {
      drawLine(ctx, selectedBoid.x, selectedBoid.y, neighbor.x, neighbor.y, 'yellow');
      centerX += neighbor.x;
      centerY += neighbor.y;
      avgDX += neighbor.dx;
      avgDY += neighbor.dy;
    }

    if (neighbors.length) {
      centerX /= neighbors.length;
      centerY /= neighbors.length;
      avgDX /= neighbors.length;
      avgDY /= neighbors.length;
      drawLine(ctx, selectedBoid.x, selectedBoid.y, centerX, centerY, 'green');
      drawLine(ctx, selectedBoid.x, selectedBoid.y, selectedBoid.x + avgDX * 10, selectedBoid.y + avgDY * 10, 'blue');
    }
  }

  requestAnimationFrame(animationLoop);
}

// Event listeners and initialization
window.onload = () => {
  window.addEventListener("resize", resizeCanvas, false);
  resizeCanvas();

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  document.getElementById('boids').addEventListener('click', (event) => {
    const rect = event.target.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    selectedBoid = boids.find(boid => calculateDistance(boid.x, boid.y, mouseX, mouseY) < 10);
  });

  initBoids();
  requestAnimationFrame(animationLoop);
};
