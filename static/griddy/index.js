let width = 100;
let height = 100;

let w, h;

let grid = document.getElementsByClassName("grid")[0];
let squares = [];

//init();

let colors = [
  [248, 20, 58],
  [105, 255, 46],
  [48, 160, 255],
  [252, 251, 33],
  [208, 45, 255],
  [22, 241, 244],
  [113, 115, 124],
  [255, 255, 255]
];


function init() {
  size();
  grid.style.setProperty("--cols", w);
  grid.style.setProperty("--rows", h);

  grid.replaceChildren();

  squares = [];
  for (let i = 0; i < w * h; i++) {
    squares.push(createSquare(i));
  }
  console.log(squares);
}

function createSquare(index) {
  let square = document.createElement("div");

  square.className = "square";
  square.style.width = width + "px";
  square.style.height = height + "px";

  let ob = {
    i: index,
    elem: square,
    x: (index % w) * width,
    y: Math.floor(index / h) * height,
  };

  square.onmousedown = () => {
    for (let i = 0; i < 1000; i++) clearInterval(i);
    let col = colors[Math.floor(Math.random() * colors.length)];

    let t = 0;
    let step = 5;
    let int = setInterval(()=>{
      for (let i = 0; i < squares.length; i++) {
        let a = squares[i].x - ob.x;
        let b = squares[i].y - ob.y;
        let dist = Math.sqrt(a * a + b * b) / 2000;

        let x = Math.max(t / 5 / 100 - dist, 0);
        let n = Math.sin(x * 3) / (x * 3);
        let mult = 1 + n / 2;

        squares[i].elem.style.backgroundColor = rgb(col[0] * mult, col[1] * mult, col[2] * mult);
      }
      t += step;
    }, step);

    setTimeout(()=>{
      clearInterval(int);
    }, Math.PI * 5000);
  }

  grid.appendChild(square);
  return (ob); 
}

function size() {
  w = Math.ceil(window.innerWidth / width);
  h = Math.ceil(window.innerHeight / height);
}

function rgb(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}