//Nils' Temporary Drawer
class NTD {
  constructor(parent) {
    this.parent = parent;

    this.drawn = {};
  }
  draw(elements) {
    for (let i in this.drawn) {
      let elem = this.drawn[i];
      let old = elements.find(e => {return i == e.id});

      if (old == undefined) {
        elem.classList.add("ntd-dead");
        setTimeout(() => {elem.remove()}, 1000);
      } else {
        let ntdType = ntdTypes[old.type];
        elem.style.left = old.x + "%";
        elem.style.top = old.y + "%";
        ntdType.update(old, elem);
      }
    }

    for (let element of elements) {
      let old = this.drawn[element.id];
      let ntdType = ntdTypes[element.type];

      if (!old) {
        if (!element.id) element.id = Math.random();
        if (!element.x) element.x = 0;
        if (!element.y) element.y = 0;

        let elem = ntdType.create(element);
        elem.classList.add("ntd-element");
        this.parent.appendChild(elem);
        this.drawn[element.id] = elem;
        elem.style.left = element.x + "%";
        elem.style.top = element.y + "%";
      }
    }
  }
}

let ntdTypes = {
  text: {
    create: (element) => {
      return createElement("div", {innerText: element.text, style: element.style});
    },
    update: (element, dom) => {
      dom.innerText = element.text;
    }
  },
  button: {
    create: (element) => {
      return createElement("button", {innerText: element.text, onclick: element.onclick, style: element.style});
    },
    update: (element, dom) => {
      dom.innerText = element.text;
    }
  },
  img: {
    create: (element) => {
      let img = new Image(25,25);
      img.src = element.src;
      return createElement("img", {src: element.src, style: Object.assign({}, ...[element.style?element.style:{}, {width: element.w + "%", height: element.h + "%"}])});
    },
    update: (element, dom) => {
      if (dom.src != element.src) {
        let img = new Image(25,25);
        img.src = element.src;
        dom.src = element.src;

        if (element.style) for (let i in element.style) dom.style[i] = element.style[i];
        dom.style.width = element.w + "%";
        dom.style.height = element.h + "%";
      }
    }
  }
};

function createElement(type, props) {
  let elem = document.createElement(type);
  for (let i in props) elem[i] = props[i];
  if (props.style) {
    for (let i in props.style) elem.style[i] = props.style[i];
  }
  return elem;
}