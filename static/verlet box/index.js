let minRadius = 10;
let maxRadius = 30;
let ballCount = 2000;
let subSteps = 8;
let gravity = {x: 0, y: 1000};
let spawnDelay = 0.01;
let lastSpawn = spawnDelay;

let width;
let height;

let balls = new Array(ballCount).fill(false).map((e) => {
  let r = minRadius + Math.floor(Math.random() * (maxRadius - minRadius));
  let ob = new Object({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.window.innerHeight
    },
    r
  );
  ob.setVel({x: Math.random() * 100 - 50, y: Math.random() * 100 - 50}, 0.01);
  return ob;
});

balls = [];


/*
let a = new Object({x: 0, y: 1000}, 20);
a.accelerate({x: 10000000, y: 0});
let b = new Object({x: 800, y: 1000}, 20);

balls = [a,b];
*/

let canvas = document.getElementById("canvas");

let lastTime = performance.now();
let dt;

function draw(time) {
  dt = (time - lastTime) / 1000;
  dt = 1 / 60;


  while(lastSpawn > spawnDelay && balls.length < ballCount) {
    let r = minRadius + Math.floor((Math.sin(balls.length * 100) / 2 + 0.5) * (maxRadius - minRadius));
    let ob = new Object({
        x: 0.5 * width,
        y: 0.5 * height
      },
      r
    );
    ob.setVel({x: (Math.sin(balls.length * 61302) / 2 + 0.5) * 200 - 10, y: (Math.sin(balls.length * 1300) / 2 + 0.5) * 200 - 100}, 0.01);
    balls.push(ob);
    lastSpawn -= spawnDelay;
  }


  for (let i = 0; i < subSteps; i++) {
    step(dt / subSteps);
  }


  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(ball.pos.x, ball.pos.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }


  lastTime = time;
  lastSpawn += dt;
  requestAnimationFrame(draw);
}



function resize() {
  let box = canvas.getBoundingClientRect();
  canvas.width = width = box.width;
  canvas.height = height = box.height;
}
window.addEventListener("resize", resize);
resize();

requestAnimationFrame(draw);



function step(dt) {
  applyGravity();
  applyConstraints();
  applyCollisions();
  updatePositions(dt);
}


function applyGravity() {
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];

    ball.accelerate(gravity);
  }
}

function applyConstraints() {
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];

    ball.pos.x = Math.max(Math.min(ball.pos.x, width - ball.r), ball.r);
    ball.pos.y = Math.max(Math.min(ball.pos.y, height - ball.r), ball.r);
  }
}
function applyCollisions() {
  let size = maxRadius * 2;
  let grid = new Array(Math.ceil(width / size)).fill(false).map(e=>{
    return new Array(Math.ceil(height / size)).fill(false).map(e=>{
      return [];
    });
  });

  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];
  
    grid[Math.floor(ball.pos.x / size)][Math.floor(ball.pos.y / size)].push(i);
  }

  for (let x = 0; x < grid.length; x++) {
    let col = grid[x];
    for (let y = 0; y < col.length; y++) {
      let box1 = col[y];

      for (let dx = ((x > 0)?-1:0); dx <= ((x < grid.length - 1)?1:0); dx++) {
        for (let dy = ((y > 0)?-1:0); dy <= ((y < col.length - 1)?1:0); dy++) {
          let box2 = grid[x+dx][y+dy];

          for (let i of box1) {
            for (let j of box2) {
              if (i == j) continue;
              let ball1 = balls[i];
              let ball2 = balls[j];

              let diff = {
                x: ball1.pos.x - ball2.pos.x,
                y: ball1.pos.y - ball2.pos.y,
              };
              let dist = Math.max(Math.sqrt(diff.x * diff.x + diff.y * diff.y), 1);

              if (dist < ball1.r + ball2.r) {
                let n = {
                  x: diff.x / dist,
                  y: diff.y / dist,
                };
        
                let delta = (ball1.r + ball2.r) - dist;
                if (isNaN(n.x)) throw new Error("Position of object is NaN");
                
                ball1.pos.x += 0.5 * delta * n.x;
                ball1.pos.y += 0.5 * delta * n.y;
        
                ball2.pos.x -= 0.5 * delta * n.x;
                ball2.pos.y -= 0.5 * delta * n.y;
                if (isNaN(ball1.pos.x)) throw new Error("Position of object is NaN");
              }
            }
          }
        }
      }
    }
  }
}
function updatePositions(dt) {
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];

    ball.update(dt);
  }
}
