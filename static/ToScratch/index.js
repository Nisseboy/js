let sprites = [];
let selectedSprite = 1;

let backdrop = createSprite("backdrop0");
backdrop.isStage = true;
backdrop.costumes[0].name = "backdrop0";

createSprite("sprite1");

let editor = CodeMirror.fromTextArea(document.getElementsByClassName("code")[0], {
  lineNumbers: true,
  matchBrackets: true,
  theme: "ayu-mirage"
});

showSprite();

document.addEventListener("keydown", (e)=>{
  if (e.ctrlKey) {
    if (e.key == "s") {
      e.preventDefault();
      save();
    }
    if (e.key == "l") {
      e.preventDefault();
      load();
    }
  }
});

editor.on("change", ()=>{
  sprites[selectedSprite].code = editor.getValue()
});

function createSprite(name) {
  let sprite = {
    isStage: false,
    name: name,
    variables: {},
    lists: {},
    broadcasts: {},
    blocks: {},
    comments: {},
    currentCostume: 0,
    costumes: [createCostume("costume0")],
    sounds: [],
    layerOrder: 0,
    volume: 100,
    stage: {
      tempo: 50,
      videoState: "on",
      videoTransparency: 50,
      textToSpeechLanguage: null
    },
    sprite: {
      visible: true,
      x: 0,
      y: 0,
      size: 100,
      direction: 90,
      draggable: false,
      rotationStyle: "all around"
    },
    code: "",
    tab: null
  };
  sprites.push(sprite);
  selectedSprite = sprites.length - 1;

  let tab = document.getElementsByClassName("tab")[0];
  let tablinks = createElem(tab, "button");
  tablinks.className = "tablinks";
  tablinks.onclick = (e)=>{selectSprite(e)};
  tablinks.innerText = name;
  tablinks.addEventListener("keydown", (e)=>{
    if (e.key == "Delete" || e.key == "Backspace") {
      sprites.splice(selectedSprite, 1);
      tablinks.remove();
    }
  });
  sprite.tab = tablinks;

  selectedSprite = sprites.length - 1;

  return sprite;
}

function createCostume(name) {
  let costume = {
    name: name,
    dataFormat: "svg",
    rotationCenterX: 240,
    rotationCenterY: 180
  };
  return costume;
}

function createSound(name) {
  let costume = {
    name: name,
    dataFormat: "wav",
    rate: 48000,
    sampleCount: 1123
  };
  return costume;
}

function createBlock(opcode) {
  let block = {
    opcode: opcode,
    next: null,
    parent: null,
    inputs: {},
    fields: {},
    shadow: false,
    topLevel: false,
    x: 0,
    y: 0
  };
}

function showSprite() {
  let tableSettings = document.getElementsByClassName("spriteSettings")[0];
  let tableCostumes = document.getElementsByClassName("spriteCostumes")[0];
  let tableSounds = document.getElementsByClassName("spriteSounds")[0];
  let codeBox = document.getElementsByClassName("code")[0];

  clearTable(tableSettings);
  clearTable(tableCostumes);
  clearTable(tableSounds);

  let s = sprites[selectedSprite];
  addTableElems(tableSettings, [
    ["name:", createInput("text", s.name, (n)=>{s.name=n; s.tab.innerText = n;})],
    ["isStage:", createInput("checkbox", s.isStage, (n)=>{s.isStage=n;showSprite()})],
    ["currentCostume:", createInput("number", s.currentCostume, (n)=>{s.currentCostume=n;})],
    ["layerOrder:", createInput("number", s.layerOrder, (n)=>{s.layerOrder=n})],
    ["volume:", createInput("number", s.volume, (n)=>{s.volume=n})],
    ["tempo:", createInput("number", s.stage.tempo, (n)=>{s.stage.tempo=n})],
    ["videoState:", createInput("text", s.stage.videoState, (n)=>{s.stage.videoState=n})],
    ["videoTransparency:", createInput("number", s.stage.videoTransparency, (n)=>{s.stage.videoTransparency=n})],
    ["textToSpeechLanguage:", createInput("text", s.stage.textToSpeechLanguage, (n)=>{s.stage.textToSpeechLanguage=n})],
    ["visible:", createInput("checkbox", s.sprite.visible, (n)=>{s.sprite.visible=n})],
    ["x:", createInput("number", s.sprite.x, (n)=>{s.sprite.x=n})],
    ["y:", createInput("number", s.sprite.y, (n)=>{s.sprite.y=n})],
    ["size:", createInput("number", s.sprite.size, (n)=>{s.sprite.size=n})],
    ["direction:", createInput("number", s.sprite.direction, (n)=>{s.sprite.direction=n})],
    ["draggable:", createInput("checkbox", s.sprite.draggable, (n)=>{s.sprite.draggable=n})],
    ["rotationStyle:", createInput("text", s.sprite.rotationStyle, (n)=>{s.sprite.rotationStyle=n})]
  ]);

  for (let i = 0; i < s.costumes.length; i++) {
    let c = s.costumes[i];
    let svg = (c.src) ?
      createElem(null, "object", [
        ["type", "image/svg+xml"],
        ["data", c.src],
        ["width", "480px"],
        ["height", "360px"],
        ["style", "background-color: rgb(215, 215, 205);"]
      ]) :
      createElem(null, "input", [
        ["type", "file"],
        ["accept", "image/*"],
        ["onchange", "loadSvg(event, " + i + ")"]
      ]);
    addTableElem(tableCostumes, [
      createInput("button", "X", (n)=>{s.costumes.splice(i, 1); showSprite()}, [["style", "background-color: red;"]]),
      "name:", createInput("text", c.name, (n)=>{c.name=n;}),
      "centerX:", createInput("number", c.rotationCenterX, (n)=>{c.rotationCenterX=n;}),
      "centerY:", createInput("number", c.rotationCenterY, (n)=>{c.rotationCenterY=n;}),
      svg
    ]);
  }
  addTableElem(tableCostumes, [
    createInput("button", "+", (n)=>{s.costumes.push(createCostume(rand(10000))); showSprite()}, [["style", "background-color: green;"]])
  ]);

  for (let i = 0; i < s.sounds.length; i++) {
    let c = s.sounds[i];
    addTableElem(tableSounds, [
      createInput("button", "X", (n)=>{s.sounds.splice(i, 1); showSprite()}, [["style", "background-color: red;"]]),
      "name:", createInput("text", c.name, (n)=>{c.name=n;}),
      "rate:", createInput("number", c.rate, (n)=>{c.rate=n;}),
      "sampleCount:", createInput("number", c.sampleCount, (n)=>{c.sampleCount=n;})
    ]);
  }
  addTableElem(tableSounds, [
    createInput("button", "+", (n)=>{s.sounds.push(createSound(rand(10000))); showSprite()}, [["style", "background-color: green;"]])
  ]);

  //Displaying code
  editor.setValue(s.code);

  //Hide code if stage
  document.getElementsByClassName("codeArea")[0].style.display = (s.isStage)?"none":"block";
}

function createElem(parent, className, params = []) {
    let elem = document.createElement(className);
    for (let i = 0; i < params.length; i++) {
      elem.setAttribute(params[i][0], params[i][1]);
    }
    if (parent == null)
      return elem;
    return parent.appendChild(elem);
}

function clearTable(table) {
  let header = table.children[0];
  table.replaceChildren();
  table.appendChild(header);
}

function addTableElem(table, array) {
  let tr = createElem(table, "tr");
  for (let i = 0; i < array.length; i++) {
    let elem = array[i];
    if (typeof(elem) == "function") {
      elem = elem(i);
    }
    if (typeof(elem) != "object") {
      let temp = document.createElement("div");
      temp.innerText = elem;
      elem = temp;
    }

    let td = createElem(tr, "td");
    td.appendChild(elem);
  }
}

function addTableElems(table, array) {
  for (let i = 0; i < array.length; i++) {
    addTableElem(table, array[i]);
  }
}

function createInput(type, val, change, params = []) {
  let elem = document.createElement("input");
  elem.type = type;
  elem.value = val;
  elem.onchange = (a)=>{change(a.target.value)};

  if (type == "checkbox") {
    elem.checked = val;
    elem.onchange = (a)=>{change(a.target.checked)};
  }

  if (type == "button") {
    elem.onclick = change;
  }

  for (let i = 0; i < params.length; i++) {
    elem.setAttribute(params[i][0], params[i][1]);
  }

  return elem;
}

function selectSprite(e) {
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  e.currentTarget.className += " active";
  selectedSprite = sprites.findIndex((elem)=>{
    return (elem.name == e.currentTarget.innerText)
  });
  showSprite();
}

function rand(n) {
  return Math.round(Math.random()*n);
}

function loadSvg(e, n) {
  console.log(e.target.files[0]);
  let url = URL.createObjectURL(e.target.files[0]);
  sprites[selectedSprite].costumes[n].src = url;
  showSprite();
}

function save() {
  let output = {};
  output.targets = [];

  for (let i = 0; i < sprites.length; i++) {
    let s = JSON.parse(JSON.stringify(sprites[i]));
    let stage = s.stage;
    let sprite = s.sprite;
    let code = s.code.split("\n");

    delete s.stage;
    delete s.sprite;
    delete s.code;

    if (s.isStage) {
      s.tempo = stage.tempo;
      s.videoState = stage.videoState;
      s.videoTransparency = stage.videoTransparency;
      s.textToSpeechLanguage = stage.textToSpeechLanguage;
    } else {
      s.visible = sprite.visible;
      s.x = sprite.x;
      s.y = sprite.y;
      s.size = sprite.size;
      s.direction = sprite.direction;
      s.draggable = sprite.draggable;
      s.rotationStyle = sprite.rotationStyle;
    }

    for (let j = 0; j < s.costumes.length; j++) {
      let c = s.costumes[j];
      c.assetId = s.name + "." + c.name;
      c.md5ext = c.assetId + ".svg";
    }
    for (let j = 0; j < s.sounds.length; j++) {
      let c = s.sounds[j];
      c.assetId = s.name + "." + c.name;
      c.md5ext = c.assetId + ".wav";
      c.format = "";
    }

    if (!s.isStage) {
      let variables = [];
      let sCode = [];
      for (let i = 0; i < code.length; i++) { //topLevel
        let line = code[i];
        if (line != "") {
          let lastLine = code[i - 1];
          let topLevel = (lastLine == undefined || lastLine == "")
          sCode.push({
            line: line,
            topLevel: topLevel,
            id: rand(10000000)
          });
        }
      }
      for (let i = 0; i < sCode.length; i++) { //parent, next
        let before = sCode[i - 1];
        let line = sCode[i];
        let after = sCode[i + 1];

        if (before == undefined || line.topLevel) {
          line.parent = null;
        } else {
          line.parent = before.id;
        }
        if (after == undefined || after.topLevel) {
          line.next = null;
        } else {
          line.next = after.id;
        }
      }
    }
  }

  output.extensions = [];
  output.meta = {
		semver: "3.0.0",
		vm: "0.2.0-prerelease.20220501145413",
		agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36"
	};
}
