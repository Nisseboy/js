

let mainMenu = {
  elem: document.getElementsByClassName("main-menu")[0],

  elements: [
    {type: "text", style: {fontSize: "2rem"}, text: "Meatball Rain 🎸"},
    {type: "button", y: 5, style: {fontSize: "1.5rem"}, text: "Play game yeaah", onclick: () => {switchScene(game)}},
  ],

  init: () => {
    mainMenu.ntd = new NTD(mainMenu.elem.getElementsByClassName("ntd")[0]);
  },


  enter: () => {
    mainMenu.elem.classList.add("active");
  },


  exit: () => {
    mainMenu.elem.classList.remove("active");
  },


  update: (dt) => {
    mainMenu.ntd.draw(mainMenu.elements);
  }
};