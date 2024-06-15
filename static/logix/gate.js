class GateType {
  constructor(type, inputs, outputs, color) {
    this.type = type;
    this.inputs = inputs;
    this.outputs = outputs;
    this.color = color;
    if (!color)
      this.color = [
        Math.floor(Math.random() * 255), 
        Math.floor(Math.random() * 255), 
        Math.floor(Math.random() * 255)
      ];

    this.gates = {};
    this.wires = {};
  }
}

const baseGates = {
  "and": {
    type: "and",
    baseGate: true, 
    inputs: ["a", "b"],
    outputs: ["out"],
    color: [41, 124, 161],
  },
  "or": {
    type: "or",
    baseGate: true, 
    inputs: ["a", "b"],
    outputs: ["out"],
    color: [138, 77, 159],
  },
  "xor": {
    type: "xor",
    baseGate: true, 
    inputs: ["a", "b"],
    outputs: ["out"],
    color: [187, 58, 118],
  },
  "not": {
    type: "not",
    baseGate: true, 
    inputs: ["a"],
    outputs: ["out"],
    color: [146, 32, 28],
  },
  "nand": {
    type: "nand",
    baseGate: true, 
    inputs: ["a", "b"],
    outputs: ["out"],
    color: [92, 35, 174],
  },
  "nor": {
    type: "nor",
    baseGate: true, 
    inputs: ["a", "b"],
    outputs: ["out"],
    color: [163, 42, 76],
  },
  "xnor": {
    type: "xnor",
    baseGate: true, 
    inputs: ["a","b"],
    outputs: ["out"],
    color: [255, 80, 80],
  },
};
const customGates = {};
const gateTypes = {};

for (let i in baseGates) {
  gateTypes[i] = baseGates[i];
}

function simulate(gate) {
  let gateType = gateTypes[gate.type];
  let inp = state[gate.id].inputs;
  state[gate.id].outputs = [];
  let out = state[gate.id].outputs;

  for (let i in gateType.outputs) {
    out[i] = false;
  }
  
  if (gateType.baseGate) {
    switch (gate.type) {
      case "and":
        out[0] = inp[0] && inp[1];
        return;
      case "or":
        out[0] = inp[0] || inp[1];
        return;
      case "xor":
        out[0] = (inp[0] + inp[1]) == 1;
        return;
      case "not":
        out[0] = !inp[0];
        return;
      case "nand":
        out[0] = !(inp[0] && inp[1]);
        return;
      case "nor":
        out[0] = !(inp[0] || inp[1]);
        return;
      case "xnor":
        out[0] = (inp[0] + inp[1]) != 1;
        return;
    }
    return;
  }

  
  for (let i in gateType.gates) {
    if (!state[i]) state[i] = {};
    state[i].reached = [];
    state[i].allGood = false;
    for (let j in gateTypes[gateType.gates[i].type].inputs) {
      state[i].reached[j] = false;
    }
  }

  for (let iteration = 0; iteration < 1024; iteration++) {
    for (let i in gateType.gates) {
      let g = gateType.gates[i];
      let gState = state[g.id];
      if (gState.allGood)
        continue;

      let wiresToThis = [];
      for (let j in gateType.wires) {
        let wire = gateType.wires[j];
        if (wire.output.id == g.id) {
          wiresToThis[wire.output.i] = wire;
        }
      }

      gState.allGood = true;
      for (let j in state[i].reached) {
        if (state[i].reached[j] == false && wiresToThis[j]) {
          gState.allGood = false;
        }
      }

      if (gState.allGood) {
        if (!gState.inputs) gState.inputs = [];
        for (let j in gateTypes[g.type].inputs) {
          if (!wiresToThis[j]) gState.inputs[j] = false;
        }
        simulate(g);
      }
    }
    for (let i in gateType.wires) {
      let wire = gateType.wires[i];

      let inpState = state[wire.input.id];
      let outState = state[wire.output.id];

      let input = inpState?.outputs;
      let output = outState?.inputs;

      if (wire.input.id == "input") {
        input = state[gate.id].inputs;
        inpState = {allGood: true};
      }
      if (wire.output.id == "output") {
        output = state[gate.id].outputs;
      }

      if (inpState.allGood) {
        output[wire.output.i] = input[wire.input.i];
        if (outState)
          outState.reached[wire.output.i] = true;
      }
    }
  }
}

function generateID() {
  let str = "";
  let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 16; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }

  return str;
}