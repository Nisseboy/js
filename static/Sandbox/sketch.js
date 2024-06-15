let gridSize = 10; //Multiple of pixelSize plz 
let pixelSize = 1;

let ctx;
let imageData;

let w = 70;
let h = 70;

//name: display name, c: color, weight: weight/m3, state: solid/powder/liquid/gas
let dusts = [
  {name: "sand", c: [203, 179, 141], weight: 1682, state: 1},
  {name: "dirt", c: [88, 57, 39], weight: 2400, state: 1},
  {name: "wall", c: [51, 51, 51], weight: 2400, state: 0},
  {name: "water", c: [51, 51, 203], weight: 2400, state: 2, flow: 4},
];

let brush = {
  type: 0,
};

let grid = new Grid(w, h, "ball");

function setup() {
  createCanvas(w * gridSize, h * gridSize);
  background(0);
  ctx = canvas.getContext("2d");
  imageData = ctx.getImageData(0, 0, width, height);
  pxls = imageData.data;
}

function draw() {
  if (mouseIsPressed) {
    let pts = grid.connectPoints(pmouseX / gridSize, pmouseY / gridSize, mouseX / gridSize, mouseY / gridSize);
    for (let pt of pts) {
      grid.set(pt.x, pt.y, {type: brush.type});
    }
  }
  /*print(isHarder(dusts[brush.type], type(grid.get(Math.floor(mouseX / gridSize), Math.floor(mouseY / gridSize)))));
  let a = dusts[brush.type];
  let b = type(grid.get(Math.floor(mouseX / gridSize), Math.floor(mouseY / gridSize)));
  print(a, b);*/
  
  grid.resetPass();
  
  simulatePass();
  
  drawDust();
  
  if (grid.isInside(Math.floor(mouseX / gridSize), Math.floor(mouseY / gridSize))) {
    stroke(0);
    fill(255);
    let mouse = grid.get(Math.floor(mouseX / gridSize), Math.floor(mouseY / gridSize));
    if (mouse)text(JSON.stringify(mouse), mouseX, mouseY);
  }
  
  
  fill(...dusts[brush.type].c);
  rect(0, 0, 30, 30);
}

function mouseWheel(e) {
  if (e.delta > 0) brush.type++;
  else brush.type--;
  
  brush.type = (brush.type + dusts.length) % dusts.length;
}

function simulatePass() {
  for (let x = 0; x < w; x++) {
    for (let y = h-1; y >= 0; y--) {
      let dust = grid.get(x, y);
      if (!dust || dust.simulated) continue;
      
      let dustType = dusts[dust.type];
      let vel = dust.vel;
      let pos = dust.pos;
      pos.x = pos.x % 1 + x;
      pos.y = pos.y % 1 + y;
      
      let lastpos = {x: pos.x, y: pos.y};
      
      if (dustType.state != 0) {
        
        dust.vel.y += 0.1;

        let pts = grid.connectPoints(pos.x, pos.y, pos.x + vel.x, pos.y + vel.y);
        pos.x += vel.x;
        pos.y += vel.y;
        for (let i = 1; i < pts.length; i++) {
          let lastpt = pts[i - 1];
          let pt = pts[i];
          
          let other = grid.get(pt.x, pt.y);

          if (!isHarder(dustType, type(other))) {
            if (other.type == 2) vel.x = 0;
            
            pos.x = lastpt.x;
            pos.y = lastpt.y;
            break;
          }

          grid.swap(lastpt.x, lastpt.y, pt.x, pt.y);
        }

        let fpos = {x: Math.floor(pos.x), y: Math.floor(pos.y)};
        if (lastpos.x == pos.x && lastpos.y == pos.y && !isHarder(dustType, type(grid.get(fpos.x, fpos.y + 1)))) {
          vel.x *= 0.8;
          
          let l = isHarder(dustType, type(grid.get(fpos.x - 1, fpos.y + 1)));
          let r = isHarder(dustType, type(grid.get(fpos.x + 1, fpos.y + 1)));
          
          if      (l) {grid.swap(fpos.x, fpos.y, fpos.x - 1, fpos.y + 1); pos.x += -1; pos.y += 1;}
          else if (r) {grid.swap(fpos.x, fpos.y, fpos.x + 1, fpos.y + 1); pos.x += 1; pos.y += 1;}
          else {
            vel.y = 0;
            if (dustType.state == 2) {
              vel.x = Math.round(Math.random()) * dustType.flow * 2 - dustType.flow;
            }
          }
        }
        
        dust.simulated = true;
      }
    }
  }
}

function type(a) {
  if (!a) return undefined;
  return dusts[a.type];
}
function isHarder(a, b) {
  if (a == undefined) return false;
  if (b == undefined) return true;
  if (a.state < b.state) return true;
  if (a.state > b.state) return false;
  if (a.weight > b.weight) return true;
  return false;
}

function drawDust() {
  let pxls = imageData.data;
  for (let x = 0; x < width; x+=pixelSize) {
    for (let y = 0; y < height; y+=pixelSize) {
      let dust = grid.get(Math.floor(x / gridSize), Math.floor(y / gridSize));
      let c;
      if (dust) c = dusts[dust.type].c.map(e => e*dust.noise);
      else c = [0,0,0];
        
      let k = (x + y * width) * 4;
      pxls[k++] = c[0];
      pxls[k++] = c[1];
      pxls[k++] = c[2];
      pxls[k++] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}