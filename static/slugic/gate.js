class Gate {
  constructor (name, inputs, outputs) {
    this.name = name;
    this.inputs = inputs;
    this.outputs = outputs;

    this.baseGate = false;
    this.gates = {};
    this.wires = {};

    //Color
    this.color = generateColor();
  }
}

let gates = {
  and: {
    name: "and", 
    color: "#277bb5",
    baseGate: true, 
    inputs: [{type: "bit", name: "a"}, {type: "bit", name: "b"}],
    outputs: [{type: "bit", name: "a AND b"}],
  },
  or: {
    name: "or", 
    color: "#ac56ce",
    baseGate: true, 
    inputs: [{type: "bit", name: "a"}, {type: "bit", name: "b"}],
    outputs: [{type: "bit", name: "a OR b"}],
  },
  xor: {
    name: "xor", 
    color: "#cd4c8c",
    baseGate: true, 
    inputs: [{type: "bit", name: "a"}, {type: "bit", name: "b"}],
    outputs: [{type: "bit", name: "a XOR b"}],
  },
  nand: {
    name: "nand", 
    color: "#7c3fcf",
    baseGate: true, 
    inputs: [{type: "bit", name: "a"}, {type: "bit", name: "b"}],
    outputs: [{type: "bit", name: "a NAND b"}],
  },
  nor: {
    name: "nor", 
    color: "#a32a4c",
    baseGate: true, 
    inputs: [{type: "bit", name: "a"}, {type: "bit", name: "b"}],
    outputs: [{type: "bit", name: "a NOR b"}],
  },
  not: {
    name: "not", 
    color: "#8d201d",
    baseGate: true, 
    inputs: [{type: "bit", name: "a"}],
    outputs: [{type: "bit", name: "NOT a"}],
  },
};

function fromName(arr, name) {
  return arr.find(elem=>{
    return (elem.name == name);
  });
}

function generateColor() {
  let hex = "0123456789abcdef";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += (hex[Math.floor(Math.random() * 16)]);
  }

  return color; 
}

function generateID() {
  return crypto.randomUUID();
}