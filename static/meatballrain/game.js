let player = {type: "img", src: "imgs/player.png", x: 5, y: 5, w: 5, h: 5 / 9 * 16};
let gun = {type: "img", src: "imgs/gun.png", w: 5, h: 5 / 9 * 16, style: {rotate: "90deg"}};

let game = {
  elem: document.getElementsByClassName("game")[0],
  mouse: {x: 0, y: 0},

  init: () => {
    game.ntd = new NTD(game.elem.getElementsByClassName("ntd")[0]);
    game.ntd.parent.addEventListener("mousemove", e => {
      let box = game.elem.getBoundingClientRect();
      game.mouse.x = e.clientX / box.width * 100;
      game.mouse.y = e.clientY / box.height * 100;
    });
  },


  enter: () => {
    game.elem.classList.add("active");
  },


  exit: () => {
    game.elem.classList.remove("active");
  },


  update: (dt) => {
    gun.x = player.x + 1;
    gun.y = player.y - 0.5;
    gun.style.rotate = Math.atan2(game.mouse.y - gun.y - gun.h / 2, game.mouse.x - gun.x - gun.w / 2) / Math.PI * 180 + "deg";
    game.ntd.draw([player, gun]);
  }
};