const WIDTH = 1000;
const HEIGHT = 500;
const DRAW_SIZE = 200;
const HALF_DRAW_SIZE = DRAW_SIZE/2;
const ROTATION_TIME = 3000;

let FRONT_TOP_CORNER;
let FRONT_BOTTOM_CORNER;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  FRONT_TOP_CORNER = createVector(-1, -1);
  FRONT_BOTTOM_CORNER = createVector(-1, 1);
}

function draw() {
  push();
  const t = millis() / ROTATION_TIME;
  const currentAngle = (t * TAU) % TAU;
  
  background("white");
  textAlign(LEFT, TOP);
  text(`rotation: ${degrees(currentAngle)}`, 10, 10);
  
  translate(WIDTH / 4, HEIGHT / 2);
  
  push();
  noFill();
  stroke("red");
  rect(-HALF_DRAW_SIZE,-HALF_DRAW_SIZE, DRAW_SIZE, DRAW_SIZE);
  pop();
  
  const currentAngleDirY = sin(currentAngle);
  const currentAngleCrossDirY = cos(currentAngle);
  
  const bottomEdgeY = (currentAngleDirY * FRONT_BOTTOM_CORNER.x + currentAngleCrossDirY * FRONT_BOTTOM_CORNER.y) * HALF_DRAW_SIZE;
  const topEdgeY = (currentAngleDirY * FRONT_TOP_CORNER.x + currentAngleCrossDirY * FRONT_TOP_CORNER.y) * HALF_DRAW_SIZE;
  push();
  stroke("purple");
  line(-HALF_DRAW_SIZE, bottomEdgeY, HALF_DRAW_SIZE, bottomEdgeY);
  line(-HALF_DRAW_SIZE, topEdgeY, HALF_DRAW_SIZE, topEdgeY);
  pop();
  
  translate(WIDTH/2,0)
  
  push();
  rotate(currentAngle);
  rect(-HALF_DRAW_SIZE,-HALF_DRAW_SIZE, DRAW_SIZE, DRAW_SIZE);
  pop();
  
  const currentAngleDir = createVector(cos(currentAngle), sin(currentAngle));
  const currentAngleYDir = createVector(-currentAngleDir.y, currentAngleDir.x);
  
  stroke("red");
  line(
    0, 0,
    currentAngleDir.x * HALF_DRAW_SIZE,
    currentAngleDir.y * HALF_DRAW_SIZE,
  );
  stroke("green");
  line(
    0, 0,
    currentAngleYDir.x * HALF_DRAW_SIZE,
    currentAngleYDir.y * HALF_DRAW_SIZE,
  );
  
  stroke("purple");
  const frontBottomCornerRotated = currentAngleDir.copy().mult(FRONT_BOTTOM_CORNER.x).add(
    currentAngleYDir.copy().mult(FRONT_BOTTOM_CORNER.y)
  );
  line(0, 0, frontBottomCornerRotated.x * HALF_DRAW_SIZE, frontBottomCornerRotated.y * HALF_DRAW_SIZE);
  const frontTopCornerRotated = currentAngleDir.copy().mult(FRONT_TOP_CORNER.x).add(
    currentAngleYDir.copy().mult(FRONT_TOP_CORNER.y)
  );
  line(0, 0, frontTopCornerRotated.x * HALF_DRAW_SIZE, frontTopCornerRotated.y * HALF_DRAW_SIZE);
  pop();
}