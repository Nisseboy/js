//Global variables
let currentGate = undefined;
let state = {};

const plugsPerGate = 2;
const gateHeight = 2.4;

let width = window.innerWidth;
let height = window.innerHeight;

//Storing dom elements
const footer = document.getElementsByTagName("footer")[0];
const main = document.getElementsByTagName("main")[0];
const selectionDiv = document.getElementsByClassName("selection")[0];
const wirePreview = document.getElementsByClassName("wire preview")[0];
const wireScreen = document.getElementsByClassName("wires")[0];
const ioRibLeft = document.getElementsByClassName("io-rib")[0];
const ioRibRight = document.getElementsByClassName("io-rib")[1];

//Setting the current gate to the world
if (count(customGates) == 0) {
  let gate = new GateType("computer", ["testA", "testB", "testC", "testD"], ["testA", "testB", "testC", "testD"], [255, 0, 0]);
  customGates["computer"] = gate;
  gateTypes["computer"] = gate;

  setGate(gateTypes["computer"]);
} else {  
  setGate(gateTypes[Object.keys(customGates)[0]]);
}

//Handling mouse position
let mousePosition = {x: 0, y: 0};
document.addEventListener("mousemove", e => {
  mousePosition = {
    x: e.clientX,
    y: e.clientY
  };
});

//Preventing context menu from showing up when right clicking
document.addEventListener("contextmenu", e => {
  e.preventDefault();
  return false;
});

//Putting all the gates in the footer
putGatesInFooter();
function putGatesInFooter() {
  footer.replaceChildren();
  //Putting the create new gate button there
  let gate = gateElement({
    type: "Create...",
    color: [128, 128, 128]
  }, 0, 0, false); 
  gate.dataset.inFooter = true;
  gate.addEventListener("click", async e => {
    let name = await popupPrompt("Name the gate");
    while (true) {
      if (name == null)
        return;
      let isValid = isGateNameValid(name);
      if (!isValid.bool)
        name = await popupPrompt(isValid.msg);
      else 
        break;
    }

    let gate = new GateType(name, [], []);
    customGates[name] = gate;
    gateTypes[name] = gate;

    putGatesInFooter();

    setGate(gateTypes[name]);
  });
  footer.appendChild(gate);

  //Putting in the rest of them
  let lastGate;
  for (let i in gateTypes) {
    if (!gateTypes[i].baseGate && lastGate.baseGate) {
     let separator = document.createElement("div");
     separator.className = "separator";
     footer.appendChild(separator);
    }
    putGateInFooter(gateTypes[i]);
    lastGate = gateTypes[i];
  }
}
function putGateInFooter(gateType) {
  let gateElem = gateElement(gateType, undefined, undefined, false);
  gateElem.dataset.inFooter = true;
  if (gateType.type == currentGate.type)
    gateElem.classList.add("shining");

  let btnHolder = document.createElement("div");
  btnHolder.className = "btn-holder";
  if (!gateType.baseGate) {
    let deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.addEventListener("mousedown", async e => {
      e.stopPropagation();
      if (gateType.baseGate) {
        popupAlert("You can't delete a base gate");
        return;
      }
      if (count(customGates) == 1) {
        popupAlert("That is your only gate left");
        return;
      }
      if (!e.shiftKey && !(await popupConfirm(`Are you sure you want to delete ${gateType.type}? Hold shift to bypass`))) 
        return;
      
      let isIn = "";
      outer: for (let i in gateTypes) {
        let type = gateTypes[i];
        for (let j in type.gates) {
          let gate = type.gates[j];
          if (gate.type == gateType.type) {
            isIn += ", " + i;
            continue outer;
          }
        }
      }
      if (isIn) {
        popupAlert("Nuh uh this gate is in" + isIn);
        return;
      }


      delete customGates[gateType.type];
      delete gateTypes[gateType.type];

      if (currentGate == gateType) {
        setGate(Object.values(customGates)[0]);
      }

      putGatesInFooter();
    });
    btnHolder.appendChild(deleteBtn);
  }

  gateElem.appendChild(btnHolder);

  gateElem.addEventListener("mousedown", e=>{
    let newGate = {
      type: gateType.type,
      x: mousePosition.x / width,
      y: mousePosition.y / height,
      id: generateID()
    };
    let newGateElem = gateElement(newGate, newGate.x * width, newGate.y * height);
    newGateElem.dataset.rooted = false;
    main.appendChild(newGateElem);
    startDrag(newGate, e);
  });

  footer.appendChild(gateElem);
}

//Creates a gate element
function gateElement(gate, x, y, real = true) {
  let gateType = gateTypes[gate.type] || gate;

  let gateElem = document.createElement("gate");
  gateElem.innerText = gate.type;
  gateElem.draggable = false;
  gateElem.style.backgroundColor = `rgb(${gateType.color[0]}, ${gateType.color[1]}, ${gateType.color[2]})`;
  gateElem.style.borderColor = gateElem.style.backgroundColor;

  if (real) {
    gateElem.style.position = "absolute";
    gateElem.style.left = x + "px";
    gateElem.style.top = y + "px";
    gateElem.dataset.rooted = true;

    gate.x = x / width;
    gate.y = y / height;

    gateElem.dataset.id = gate.id;

    gateElem.addEventListener("mousedown", e=>{
      if (e.button == 2) {
        removeByElement(gate.elem);
        return;
      }
      startDrag(gate, e)

      e.stopPropagation();
    });

    let inputs = gateType.inputs;
    let outputs = gateType.outputs;

    gateElem.style.height = Math.max(Math.max(inputs.length, outputs.length) / (plugsPerGate - 0.5), 1) * gateHeight + "vh";

    let plugHolderInputs = document.createElement("div");
    plugHolderInputs.className = "plug-holder";
    let inputHeight = 100 + "%";
    plugHolderInputs.style.height = inputHeight;
    gateElem.prepend(plugHolderInputs);

    let plugHolderOutputs = document.createElement("div");
    plugHolderOutputs.className = "plug-holder";
    let outputHeight = 100 + "%";
    plugHolderOutputs.style.height = outputHeight;
    gateElem.appendChild(plugHolderOutputs);


    for (let i in inputs) {
      let input = inputs[i];
      let plug = document.createElement("div");
      plug.className = "plug";
      plug.style.height = gateHeight / plugsPerGate + "vh";
      plug.dataset.id = gate.id;
      plug.dataset.input = true;
      plug.dataset.i = i;

      let tooltip = document.createElement("div");
      tooltip.className = "tooltip left hidden";
      tooltip.innerText = input;
      plug.appendChild(tooltip);

      plug.addEventListener("mousedown", e => {
        startWire(plug);
        e.stopPropagation();
      });

      plugHolderInputs.appendChild(plug);
    }
    for (let i in outputs) {
      let output = outputs[i];
      let plug = document.createElement("div");
      plug.className = "plug";
      plug.style.height = gateHeight / plugsPerGate + "vh";
      plug.dataset.id = gate.id;
      plug.dataset.input = false;
      plug.dataset.i = i;

      let tooltip = document.createElement("div");
      tooltip.className = "tooltip right hidden";
      tooltip.innerText = output;
      plug.appendChild(tooltip);

      plug.addEventListener("mousedown", e => {
        startWire(plug);
        e.stopPropagation();
      });

      plugHolderOutputs.appendChild(plug);
    }
  }
  
  gateElem.dataset.gateType = gateType.type;
  gate.elem = gateElem;
  return gateElem;
}



//Main loop
let mainLoopInterval = setInterval(mainLoop, 16.66);
function mainLoop() {
  let spoofGate = {
    type: currentGate.type,
    x: 0.5,
    y: 0.5,
    id: "spoof"
  };

  state["spoof"] = {};
  state["spoof"].inputs = [];
  state["spoof"].allGood = true;

  let inputBtnElements = Array.from(ioRibLeft.getElementsByClassName("io-button"));
  for (let i in inputBtnElements) {
    state["spoof"].inputs[i] = inputBtnElements[i].classList.contains("on");
  }

  simulate(spoofGate);
  
  let outputBtnElements = ioRibRight.getElementsByClassName("io-button");
  for (let i in state["spoof"].outputs) {
    let out = state["spoof"].outputs[i];
    outputBtnElements[i].classList.toggle("on", out);
  }

  for (let i in currentGate.wires) {
    let wire = currentGate.wires[i];

    let inpState = state[wire.input.id];
    let input = inpState?.outputs;

    if (wire.input.id == "input") {
      input = state["spoof"].inputs;
    }

    wire.elem.classList.toggle("on", input[wire.input.i]);
  }
}

//Selecting several gates
main.addEventListener("mousedown", startSelect);

let selectStart = {x: 0, y: 0};
let deselect;

function startSelect(e) {
  if (e.button !== 0) return;
  deselect = !e.ctrlKey;

  selectStart = {
    x: mousePosition.x, 
    y: mousePosition.y
  };

  if (deselect) {
    deselectAll();
  }
  
  document.body.addEventListener("mousemove", whileSelect);
  document.body.addEventListener("mouseup", stopSelect);
}
function whileSelect() {
  let x1 = selectStart.x;
  let y1 = selectStart.y;
  let x2 = mousePosition.x;
  let y2 = mousePosition.y;

  if (x1 > x2) {
    let temp = x1;
    x1 = x2;
    x2 = temp;
  }
  if (y1 > y2) {
    let temp = y1;
    y1 = y2;
    y2 = temp;
  }

  selectionDiv.style.left = x1 + "px";
  selectionDiv.style.top = y1 + "px";
  selectionDiv.style.width = x2 - x1 + "px";
  selectionDiv.style.height = y2 - y1 + "px";

  selectionDiv.style.display = "block";

  if (deselect) {
    deselectAll();
  }
  for (let i in currentGate.gates) {
    let gate = currentGate.gates[i];
    let box = gate.elem.getBoundingClientRect();

    let gx = parseFloat(box.x);
    let gy = parseFloat(box.y);
    let gw = parseFloat(box.width);
    let gh = parseFloat(box.height);

    if (
      gx < x2 && 
      gx + gw >= x1 && 
      gy < y2 && gy + 
      gh >= y1
    ) {
      gate.elem.classList.add("selected");
    }
  }
  for (let point of Array.from(document.getElementsByClassName("wire-point"))) {
    let box = point.getBoundingClientRect();

    let px = parseFloat(box.x);
    let py = parseFloat(box.y);
    let d = parseFloat(box.width);

    if (
      px < x2 &&
      px + d >= x1 &&
      py < y2 &&
      py + d >= y1
    ) {
      point.classList.add("selected");
    }
  }
}
function stopSelect() {
  document.body.removeEventListener("mousemove", whileSelect);
  document.body.removeEventListener("mouseup", stopSelect);

  selectionDiv.style.display = "none";
}

//Deselects every selected object
function deselectAll() {
  for (let elem of Array.from(document.getElementsByTagName("gate"))) {
    elem.classList.remove("selected");
  }
  for (let elem of Array.from(document.getElementsByClassName("wire-point"))) {
    elem.classList.remove("selected");
  }
}

let wirePlug;
let wireStart;
let wireGate;
let wireOptions;
let wireStops = [];
function startWire(plug, options) {
  let box = plug.getBoundingClientRect();

  wirePlug = plug;
  wireStart = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  wireGate = currentGate.gates[plug.dataset.id];
  wireOptions = options;
  wireStops = [];

  if (options?.gate)
    wireGate = options.gate;

  wirePreview.style.display = "block";
  wirePreview.setAttribute("d", "");
  
  document.body.addEventListener("mousemove", whileWire);
  document.body.addEventListener("mouseup", stopWire);
}
function whileWire() {
  let atMouse = document.elementsFromPoint(mousePosition.x, mousePosition.y);
  let newPlug;
  if (
    atMouse[0].className == "plug" && 
    atMouse[0].dataset.id != wirePlug.dataset.id && 
    atMouse[0].dataset.input != wirePlug.dataset.input
  ) {
    let box = atMouse[0].getBoundingClientRect();
    newPlug = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  }

  wirePreview.setAttribute("d", createWirePath({
    start: wireStart,
    end: newPlug || mousePosition,
    stops: wireStops
  }, (wirePlug.dataset.input === "true")?2:1));
}
function stopWire(e) {
  if (e.button === 1)
    return;

  wirePreview.style.display = "none";

  document.body.removeEventListener("mousemove", whileWire);
  document.body.removeEventListener("mouseup", stopWire);


  let atMouse = document.elementsFromPoint(mousePosition.x, mousePosition.y);

  if (!(
    atMouse[0].className == "plug" && 
    atMouse[0].dataset.id != wirePlug.dataset.id && 
    atMouse[0].dataset.input != wirePlug.dataset.input
  )) {
    return;
  }
  let box = atMouse[0].getBoundingClientRect();
  newPlug = {x: box.x + box.width / 2, y: box.y + box.height / 2};

  let input = {
    id: wireGate?.id || wireGate,
    i: wirePlug.dataset.i
  }
  let output = {
    id: atMouse[0].dataset.id,
    i: atMouse[0].dataset.i
  }
  if (wirePlug.dataset.input === "true") {
    let temp = input;
    input = output;
    output = temp;

    temp = wireStart;
    wireStart = newPlug;
    newPlug = temp;
    wireStops.reverse();
  }

  for (let i in currentGate.wires) {
    let wire = currentGate.wires[i];
    if (wire.output.id == output.id && wire.output.i == output.i)
      return;
  }


  let stops = wireStops.map(elem => {
    return {
      x: elem.x / width,
      y: elem.y / height
    }
  });

  let id = generateID();

  currentGate.wires[id] = {
    id: id,
    input: input,
    output: output,
    stops: stops
  };

  let path = createWirePathElem({
    start: wireStart,
    end: newPlug,
    stops: stops,
    id: id,
    resize: true,
  });
  
  currentGate.wires[id].elem = path;
}

//Adding stops between
document.body.addEventListener("mousedown", e => {
  if (e.button === 1) {
    wireStops.push({x: mousePosition.x, y: mousePosition.y});
  }
});

//Removes and replaces all wires in the current gate
function replaceWires() {
  for (let elem of Array.from(document.getElementsByClassName("wire"))) {
    if (elem.classList.contains("preview"))
      continue;
    elem.remove();
  }
  for (let elem of Array.from(document.getElementsByClassName("wire-point"))) {
    elem.remove();
  }
  for (let i in currentGate.wires) {
    let wire = currentGate.wires[i];

    let iGate = currentGate.gates[wire.input.id]?.elem;
    let oGate = currentGate.gates[wire.output.id]?.elem;
    
    let leftSide = iGate?.getElementsByClassName("plug-holder")[1];
    let rightSide = oGate?.getElementsByClassName("plug-holder")[0];

    let leftPlugbox = leftSide?.getElementsByClassName("plug")[wire.input.i].getBoundingClientRect();
    let rightPlugbox = rightSide?.getElementsByClassName("plug")[wire.output.i].getBoundingClientRect();
    
    if (wire.input.id === "input") {
      leftPlugbox = ioRibLeft.children[wire.input.i].children[2].getBoundingClientRect();
    }
    if (wire.output.id === "output") {
      rightPlugbox = ioRibRight.children[wire.output.i].children[2].getBoundingClientRect();
    }

    let start = {
      x: leftPlugbox.x + leftPlugbox.width / 2,
      y: leftPlugbox.y + leftPlugbox.height / 2,
    };
    let end = {
      x: rightPlugbox.x + rightPlugbox.width / 2,
      y: rightPlugbox.y + rightPlugbox.height / 2,
    };

    createWirePathElem({
      start: start,
      end: end,
      stops: wire.stops,
      id: wire.id,
      resize: true,
    });
  }
}

//Deleting with delete/backspace
document.addEventListener("keydown", e => {
  if (e.key === "Delete" || e.key === "Backspace") {
    Array.from(document.getElementsByClassName("selected")).forEach(elem => {
      removeByElement(elem);
    });
  }
});

//Dragging and selecting of gates
let dragged = [];
function startDrag(gate, e, skipSelecting = false) {
  let dragSettings = {};

  dragSettings.isWire = (gate.elem.dataset.wire !== undefined);
  if (dragSettings.isWire) {
    dragSettings.wire = currentGate.wires[gate.elem.dataset.wire];
    dragSettings.stop = dragSettings.wire.stops[gate.elem.dataset.i];
  }

  dragSettings.dragGate = gate;
  dragSettings.wasSelected = gate.elem.classList.contains("selected");

  if (e?.ctrlKey) {
    dragSettings.wasSelected = true;
  }

  if (!skipSelecting) {
    if (!dragSettings.wasSelected) {
      deselectAll();
    } else {
      for (let i in currentGate.gates) {
        if (currentGate.gates[i].elem.classList.contains("selected")) {
          startDrag(currentGate.gates[i], e, true);
        }
      }
      for (let stop of Array.from(document.getElementsByClassName("wire-point"))) {
        if (stop.classList.contains("selected")) {
          startDrag(currentGate.wires[stop.dataset.wire].stops[stop.dataset.i], e, true);
        }
      }
    }
    gate.elem.classList.add("selected");
  }


  let box = gate.elem.getBoundingClientRect();

  dragSettings.dragOffset = {
    x: mousePosition.x - box.x, 
    y: mousePosition.y - box.y
  };

  if (dragSettings.isWire) {
    dragSettings.dragOffset.x -= box.width / 2;
    dragSettings.dragOffset.y -= box.height / 2;
  }

  if (gate.elem.dataset.rooted == "false") {
    dragSettings.dragOffset.x += box.width / 2;
    dragSettings.dragOffset.y += box.height / 2;
  }

  dragged.push(dragSettings);
  document.body.addEventListener("mousemove", whileDrag);
  document.body.addEventListener("mouseup", stopDrag);
}

function whileDrag() {
  for (let i in dragged) {
    let dragGate = dragged[i].dragGate;
    let dragOffset = dragged[i].dragOffset;

    dragGate.x = (mousePosition.x - dragOffset.x);
    dragGate.y = (mousePosition.y - dragOffset.y);
  
    dragGate.elem.style.left = dragGate.x + "px";
    dragGate.elem.style.top = dragGate.y + "px";
  
    dragGate.x /= width;
    dragGate.y /= height;
  }

  for (let i in currentGate.wires) {
    let wire = currentGate.wires[i];
    for (let i in wire.stops) {
      let stop = wire.stops[i];
      stop.isSelected = stop.elem.classList.contains("selected");
    }
  }
  replaceWires();
  for (let i in currentGate.wires) {
    let wire = currentGate.wires[i];
    for (let i in wire.stops) {
      let stop = wire.stops[i];
      if (stop.isSelected)
        stop.elem.classList.add("selected");
    }
  }
}

function stopDrag() {
  let atMouse = document.elementsFromPoint(mousePosition.x, mousePosition.y);
  for (let i = 0; i < dragged.length; i++) {
    let dragGate = dragged[i].dragGate;

    if (atMouse[0].tagName == "FOOTER" || atMouse[1].tagName == "FOOTER") {
      removeByElement(dragGate.elem);
    } else if (dragGate.elem.dataset.rooted == "false") {
      addGate(dragGate);
    }

    dragGate.elem.dataset.rooted = true;

    if (atMouse[0].dataset.gateType == dragGate.type && atMouse[0].dataset.rooted !== "true" && !dragged[i].isWire) {
      setGate(gateTypes[dragGate.type]);
    }


    dragged.splice(i, 1);
    i--;
  }

  document.body.removeEventListener("mousemove", whileDrag);
  document.body.removeEventListener("mouseup", stopDrag);
}


//Adds a gate to the current gate
function addGate(gate) {
  currentGate.gates[gate.id] = gate;
}

//Handles renaming of gates
document.getElementsByClassName("gate-name")[0].addEventListener("input", async e => {
  delete customGates[currentGate.type];
  delete gateTypes[currentGate.type];

  let name = e.target.value;
  while (true) {
    let isValid = isGateNameValid(name);
    if (!isValid.bool) {
      name = await popupPrompt(isValid.msg);
      e.target.value = name;
    }
    else 
      break;
  }

  customGates[name] = currentGate;
  gateTypes[name] = currentGate;
  currentGate.type = name;

  putGatesInFooter();
});

//Removes gate/wire from the current gate by giving the element
function removeByElement(elem) {
  if (elem.dataset.gateType) {
    if (currentGate.gates[elem.dataset.id])
      removeGate(currentGate.gates[elem.dataset.id]);
    else 
      elem.remove();
  } else {
    currentGate.wires[elem.dataset.wire]?.stops.splice(elem.dataset.i, 1);
    replaceWires();
  }
}

//Removes a gate from the current gate
function removeGate(gate) {
  gate.elem?.remove();
  delete currentGate.gates[gate.id];

  for (let i in currentGate.wires) {
    let wire = currentGate.wires[i];
    if (wire.input.id == gate.id || wire.output.id == gate.id) {
      delete currentGate.wires[wire.id];
    }
  }
  replaceWires();
}


//Changes to a new gate
function setGate(gate) {
  if (gate.baseGate)
    return;
  currentGate = gate;
  document.getElementsByClassName("gate-name")[0].value = gate.type;

  for (let i of Array.from(document.getElementsByTagName("footer")[0].children)) {
    i.classList.remove("shining");
    if (i.innerText == gate.type) {
      i.classList.add("shining");
    }
  }

  //Removing from previous gate
  for (let elem of Array.from(document.getElementsByTagName("gate"))) {
    if (elem.dataset.inFooter === "true") continue;
    elem.remove();
  }

  //Repopulating
  for (let i in currentGate.gates) {
    let gate = currentGate.gates[i];
    main.appendChild(gateElement(gate, gate.x * width, gate.y * height));
  }
  replaceIO();
  replaceWires();
}

//Replaces the input and output ports on the current gate
function replaceIO() {
  ioRibLeft.replaceChildren();
  ioRibRight.replaceChildren();
  for (let i in currentGate.inputs) {
    let input = currentGate.inputs[i];

    let io = document.createElement("div");
    io.className = "io left";

    let btn = document.createElement("div");
    btn.className = "io-button";
    btn.addEventListener("mousedown", e => {
      e.stopPropagation();
      btn.classList.toggle("on");
    });
    io.appendChild(btn);

    let spacer = document.createElement("div");
    spacer.className = "io-spacer";
    io.appendChild(spacer);

    let plug = document.createElement("div");
    plug.className = "plug";
    plug.dataset.i = i;
    plug.dataset.id = "input";
    plug.dataset.input = false;
    plug.addEventListener("mousedown", e => {
      e.stopPropagation();
      startWire(plug, {gate: "input"});
    });
    io.appendChild(plug);

    let tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.innerText = input;
    tooltip.style.position = "absolute";
    tooltip.style.left = "110%";
    io.appendChild(tooltip);

    ioRibLeft.appendChild(io);
  }
  for (let i in currentGate.outputs) {
    let output = currentGate.outputs[i];

    let io = document.createElement("div");
    io.className = "io right";

    let btn = document.createElement("div");
    btn.className = "io-button";
    io.appendChild(btn);

    let spacer = document.createElement("div");
    spacer.className = "io-spacer";
    io.appendChild(spacer);

    let plug = document.createElement("div");
    plug.className = "plug";
    plug.dataset.i = i;
    plug.dataset.id = "output";
    plug.dataset.input = true;
    plug.addEventListener("mousedown", e => {
      e.stopPropagation();
      startWire(plug, {gate: "output"});
    });
    io.appendChild(plug);

    let tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.innerText = output;
    tooltip.style.position = "absolute";
    tooltip.style.right = "110%";
    tooltip.style.zIndex = 20;
    io.appendChild(tooltip);

    ioRibRight.appendChild(io);
  }
}


//Deep copies an object
function copy(ob) {
  let newOb = {};
  for (let i in ob) {
    newOb[i] = ob[i];
  }
  return ob;
}

//Returns the amount of elements in an object
function count(ob) {
  let amount = 0;

  for(let i in ob) {
    if(ob.hasOwnProperty(i))
      amount++;
  }

  return amount;
}

//Checks if a gate name is valid
function isGateNameValid(name) {
  if (!name)
    return {bool: false, msg: "You must input a name"}
  if (gateTypes[name])
    return {bool: false, msg: "That gate already exists, pick another one"}
  if (parseInt(name) == name)
    return {bool: false, msg: "The name can't be all numbers, pick another one"}
  return {bool: true, msg: "Tjoho"};
}


function createWirePathElem(instructions) {
  for (let i in instructions.stops) {
    let stop = instructions.stops[i];
    let point = document.createElement("div");
    point.className = "wire-point";
    point.style.top = ((instructions.resize)?stop.y * height:stop.y) + "px";
    point.style.left = ((instructions.resize)?stop.x * width:stop.x) + "px";
    point.style.width = gateHeight / plugsPerGate + "vh";

    point.dataset.wire = instructions.id;
    point.dataset.i = i;

    point.addEventListener("mousedown", e => {
      e.stopPropagation();
      if (e.button === 0) 
        startDrag(stop, e);
      if (e.button === 2)
        removeByElement(point);
    });

    stop.elem = point;

    main.appendChild(point);
  }

  let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.classList.add("wire");
  path.setAttribute("d", createWirePath({
    start: instructions.start,
    end: instructions.end,
    stops: instructions.stops.map(stop => {
      if (!instructions.resize)
        return;
      return {
        x: stop.x * width,
        y: stop.y * height
      };
    }),
  }));
  currentGate.wires[instructions.id].elem = path;

  path.addEventListener("mousedown", e => {
    if (e.button === 2) {
      delete currentGate.wires[instructions.id];
      replaceWires();
      e.stopPropagation();
    }
    if (e.button === 0) {
      let wire = currentGate.wires[instructions.id];
      delete currentGate.wires[instructions.id];
      replaceWires();
      console.log(wire.input);
      if (wire.input.id !== "input") {
        startWire(currentGate.gates[wire.input.id].elem.getElementsByClassName("plug-holder")[1].children[wire.input.i]);
      } else {
        startWire(ioRibLeft.children[wire.input.i].children[2], {gate: "input"});
      }
      wireStops = wire.stops.map(elem=>{return {x: elem.x * width, y: elem.y * height}});
      whileWire();
      e.stopPropagation();
    }
  });

  wireScreen.appendChild(path);

  return path;
}
function createWirePath(instructions) {
  let start = instructions.start;
  let end = instructions.end;
  let stops = instructions.stops;

  let path = "";
  path += `M ${start.x} ${start.y} `; //Move to start x,y

  let last = start;
  for (let i in stops) {
    let stop = stops[i];
    let next = (i == stops.length - 1)?end:stops[parseInt(i) + 1];

    let oldDirection = Math.atan2(stop.y - last.y, stop.x - last.x);
    path += `L ${stop.x - Math.cos(oldDirection) * 20} ${stop.y - Math.sin(oldDirection) * 20} `; //Line to start of curve

    let newDirection = Math.atan2(next.y - stop.y, next.x - stop.x);
    path += `Q ${stop.x} ${stop.y} ${stop.x + Math.cos(newDirection) * 20} ${stop.y + Math.sin(newDirection) * 20} `; //Line to start of curve

    last = stop;
  }

  path += `L ${end.x} ${end.y} `; //Line to end x,y

  return path;
}


//Makes it responsive
window.addEventListener("resize", e => {
  for (let elem of Array.from(document.getElementsByTagName("gate"))) {
    if (elem.dataset.inFooter !== "true") {
      let box = elem.getBoundingClientRect();
      elem.style.left = box.x / width * window.innerWidth + "px";
      elem.style.top = box.y / height * window.innerHeight + "px";
    }
  }

  width = window.innerWidth;
  height = window.innerHeight;

  replaceWires();
})