let t = {
  empty: "empty.png",
  red: "red.png",
  green: "green.png",

  grid: "grid.png",
  
  grass: "grass.png",
};

let cam = {
  x: 0,
  y: 40,
  tileSize: 40,
  moveSpeed: 20,
};

let lastTime = performance.now();
let dt;

let pressed = {};

function preload() {
  for (let i in t) t[i] = loadImage("assets/" + t[i]);
}

function setup() {
  createCanvas(innerWidth, innerHeight);
}

function draw() {
  let time = performance.now();
  dt = (time - lastTime) / 1000;

  background(10);

  let movement = {x: !!pressed["d"] - !!pressed["a"], y: !!pressed["s"] - !!pressed["w"]};
  cam.x += movement.x * cam.moveSpeed * dt;
  cam.y += movement.y * cam.moveSpeed * dt;

  imageMode(CENTER);
  textAlign(CENTER);
  fill(0);
  for (let x = 0; x < 80; x++) {
    for (let y = 0; y < 80; y++) {
      let {cx, cy, inView} = gridToCam({x, y});
      if (!inView) continue;

      image(t.grass, cx, cy, cam.tileSize * 2, cam.tileSize);
      image(t.grid, cx, cy, cam.tileSize * 2, cam.tileSize);
    }
  }

  let pos = gridToCam(camToGrid({cx: mouseX, cy: mouseY}));
  image(t.red, pos.cx, pos.cy, cam.tileSize * 2, cam.tileSize);

  lastTime = time;

//  line(0, 0, width, height);
//  line(width, 0, 0, height);
}


function keyPressed() {
  pressed[key] = true;
}
function keyReleased() {
  delete pressed[key];
}

//Convert world-space to camera-space
function gridToCam(g) {
  let cx = ((g.x - g.y) - cam.x) * cam.tileSize + width / 2;
  let cy = ((g.x + g.y) / 2 - cam.y) * cam.tileSize + height / 2;

  return {cx, cy, inView: !(cx < -cam.tileSize || cy < -cam.tileSize || cx > width + cam.tileSize || cy > height + cam.tileSize)};
}
//Convert camera-space to world-space
function camToGrid(c) {
  let tx = (c.cx - width / 2) / cam.tileSize + cam.x;
  let ty = ((c.cy - height / 2) / cam.tileSize + cam.y) * 2;

  let x = ((tx + ty) / 2);
  let y = (ty - x);

  let points = [
    {x: floor(x), y: floor(y)},
    {x: floor(x), y: ceil(y)},
    {x: ceil(x), y: floor(y)},
    {x: ceil(x), y: ceil(y)},
  ];

  for (let i of points) {
    let ob = gridToCam(i);
    i.dist = dist(c.cx, c.cy * 2, ob.cx, ob.cy * 2);
  }

  let m;
  points.forEach(e=>{m = (!m || e.dist < m.dist)?e:m});

  return { x: m.x, y: m.y };
}