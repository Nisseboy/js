let globalI = 0;

function render(parent, list) {
  let rendered = [];
  let existing = [];

  for (let i = 0; i < parent.children.length; i++) {
    let elem = parent.children[i];
    if (!elem.dataset.id) continue;
    rendered.push(elem.dataset.id);
  }

  for (let i = 0; i < list.length; i++) {
    let item = list[i];
    if (!item.renderInfo || !rendered.includes(item.renderInfo.id)) {
      createRenderedElement(parent, item);
    }
    existing.push(item.renderInfo.id);

    updateRenderedElement(item);
  }

  for (let i of rendered) {
    if (!existing.includes(i)) {
      for (let j of parent.children) {
        if (j.dataset.id == i) {
          j.remove();
          break;
        }
      }
    }
  }
}


function createRenderedElement(parent, item) {
  let id = globalI++;
  let elem = document.createElement("div");
  switch(item.type) {
    case "gate":
      elem.className = "gate";
      elem.dataset.id = id;
      break;
  }
  parent.appendChild(elem);
  item.renderInfo = new RenderInfo(id, elem);
  return elem;
}
function updateRenderedElement(item) {
  let ri = item.renderInfo;

  switch(item.type) {
    case "gate":
      ri.elem.style.setProperty("--color", `var(--c-${item.color})`);
      ri.elem.style.setProperty("--x", item.x);
      ri.elem.style.setProperty("--y", item.y);
      ri.elem.style.backgroundImage = `${item.on?"" : "url(\"assets/gate_dark.png\"), "}url("assets/gate_${item.gate}.png"), url("assets/logic_gate.png")`;
      ri.elem.classList.toggle("selected", selectedGates.includes(item) || semiSelectedGates.includes(item));
      break;
  }
}


class RenderInfo {
  constructor(id, elem) {
    this.id = id;
    this.elem = elem;
  }
}