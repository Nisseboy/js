let gatesElem = document.getElementsByClassName("gates")[0];
let gatesBox;
let placingElem = document.getElementsByClassName("placing")[0];

let gates = [{
  type: "gate",
  gate: "or",
  on: true,
  color: 19,
  x: 5,
  y: 3,
}];

let defaultPlacing = {
  type: "gate",
  gate: "and",
  on: false,
  color: 19,
  x: 0,
  y: 0,
  ox: 0,
  oy: 0,
};
let placing = [defaultPlacing];

let selecting = false;
let selectedGates = [];
let semiSelectedGates = [];

let unit;
function resize() {
  gatesBox = gatesElem.getBoundingClientRect();
  unit = gatesBox.width / (3 * 16);
  document.body.style.setProperty("--unit", unit + "px");
}
window.onresize = resize;
resize();


render(gatesElem, gates);


gatesElem.addEventListener("mousemove", e => {
  let {x, y} = toGrid(e.clientX, e.clientY);
  for (let i of placing) {
    i.x = x + i.ox;
    i.y = y + i.oy;
  }
  render(placingElem, placing);
  placingElem.style.display = selecting?"none":"block";
  placingElem.style.zIndex = placing.length > 1 ? 1 : 0;
});
gatesElem.addEventListener("mouseleave", e => {
  placingElem.style.display = "none";
});
gatesElem.addEventListener("mousedown", e => {
  if (selecting) return;
  let {x, y} = toGrid(e.clientX, e.clientY);

  if (e.button == 0) {
    if (!e.ctrlKey) selectedGates = [];
    startDrag(0, {sel: new Selection(x, y, "#bbbb00", false)}, 
    (e, data)=>{
      let {x, y} = toGrid(e.clientX, e.clientY);
      if (data.sel.nx != x || data.sel.ny != y) {
        data.sel.move(x, y);
        let selected = data.sel.getSelected();
        semiSelectedGates = selected;
        render(gatesElem, gates);
      }

    }, (e, data)=>{
      if (!data.sel.moved) {
        for (let i of placing) {
          let gate = copyOb(i);
          delete gate.ox;
          delete gate.oy;
    
          let replacing = gateAtPoint(gate.x, gate.y);
          if (replacing) {
            if (placing.length > 1)
              gates.splice(gates.indexOf(replacing), 1);
            else {
              if (e.ctrlKey) selectedGates.push(replacing);
              else openSettings(replacing);
              render(gatesElem, gates);
              return;
            }
          }
    
          gates.push(gate);
          if (e.ctrlKey) selectedGates.push(gate);
        }
        render(gatesElem, gates);
      } else {
        for (let i of semiSelectedGates) {
          if (!selectedGates.includes(i)) selectedGates.push(i);
        }
        semiSelectedGates = [];
        render(gatesElem, gates);
      }
    }, (data)=>{
      data.sel.stop();
    });
  }

  else if (e.button == 2) {
    startDrag(2, {sel: new Selection(x, y, "#ff0000")}, 
      (e, data)=>{ 
        let {x, y} = toGrid(e.clientX, e.clientY);
        data.sel.move(x, y);
      }, (e, data)=>{
        let selected = data.sel.getSelected();
        for (let i of selected) {
          removeGate(i);
        }
      }, (data)=>{
        data.sel.stop();
      }
    );
  }
});

function openSettings(gate) {
  console.log(gate);
}

function createColorSelector(callback) {
  let elem = document.createElement("div");
  elem.className = "color-selector";
  for (let i = 0; i < 40; i++) {
    let c = document.createElement("div");
    c.style.backgroundColor = `var(--c-${i})`;
    c.addEventListener("mousedown", e=>{callback(i)});
    elem.appendChild(c);
  }
  return elem;
}
document.addEventListener("keydown", e => {
  let other = document.getElementsByClassName("color-selector independent");
  if (e.key == "q") {
    if (other.length == 0) {
      let elem = createColorSelector(i => {
        for (let j of placing) j.color = i;
        elem.remove();
      });
      elem.classList.add("independent");
      document.body.appendChild(elem);
    } else {
      other[0].remove();
    }
  }
});

document.addEventListener("keydown", e => {
  if (e.key != "Escape") return;

  let colorSelector = document.getElementsByClassName("color-selector independent")[0];
  if (colorSelector) {
    colorSelector.remove();
    return;
  }
});

function toGrid(x, y) {
  return {
    x: Math.floor((x - gatesBox.x) / unit),
    y: Math.floor((y - gatesBox.y) / unit),
  };
}
function gateAtPoint(x, y) {
  for (let i = 0; i < gates.length; i++) {
    if (gates[i].x == x && gates[i].y == y) {
      return gates[i];
    }
  }
}

function copyOb(ob) {
  if (typeof(ob) == "object") {
    let nob;
    if (Array.isArray(ob)) nob = [];
    else nob = {};
    for (i in ob) {
      if (ob[i].elem) continue;
      nob[i] = copyOb(ob[i]);
    }
    return nob;
  }
  return ob;
}

function startDrag(mouseButton, data, moveFn, upFn, stopFn) {
  function move(e) {
    moveFn(e, data);
  }
  function up(e) {
    if (e.button == mouseButton) {
      upFn(e, data);
      stop();
    }
  }
  function down(e) {
    if (e.button != mouseButton)
      stop();
  }
  function stop() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
    document.removeEventListener("mousedown", down);
    stopFn(data);
  }
  
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
  document.addEventListener("mousedown", down);
}

function removeAt(x, y) {
  let gate = gateAtPoint(x, y);
  if (gate) {
    removeGate(gate);
  } 
}
function removeGate(gate) {
  gates.splice(gates.indexOf(gate), 1);
  render(gatesElem, gates);
}


class Selection {
  constructor(x, y, color, startImmediately = false) {
    this.x = x;
    this.y = y;
    this.nx = x;
    this.ny = y;

    this.elem = document.createElement("div");
    this.elem.className = "selection";
    this.elem.style.borderColor = color;
    this.elem.style.backgroundColor = color + "22";
    gatesElem.appendChild(this.elem);

    this.moved = false;

    if (startImmediately)
      this.update();
  }
  move(x, y) {
    this.nx = x;
    this.ny = y;

    this.update();
  }
  update() {
    let x1 = Math.min(this.x, this.nx);
    let x2 = Math.max(this.x, this.nx);
    let y1 = Math.min(this.y, this.ny);
    let y2 = Math.max(this.y, this.ny);

    this.elem.style.setProperty("--x", x1);
    this.elem.style.setProperty("--y", y1);
    this.elem.style.setProperty("--x2", x2 + 1);
    this.elem.style.setProperty("--y2", y2 + 1);

    placingElem.style.display = "none";
    selecting = true;

    this.moved = true;
  }
  stop() {
    this.elem.remove();
    placingElem.style.display = "block";
    selecting = false;
  }
  getSelected() {
    let selected = [];

    let x1 = Math.min(this.x, this.nx);
    let x2 = Math.max(this.x, this.nx);
    let y1 = Math.min(this.y, this.ny);
    let y2 = Math.max(this.y, this.ny);

    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        let gate = gateAtPoint(x, y);
        if (gate) selected.push(gate);
      }
    }
    return selected;
  }
}