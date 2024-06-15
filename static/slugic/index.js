const headElem = document.getElementsByClassName("head")[0];
const mainElem = document.getElementsByClassName("main")[0];
const footElem = document.getElementsByClassName("foot")[0];

let u; // One unit is the height of a not gate

function resize() {
  mainElem.style.width = "95dvw";
  u = (mainElem.getBoundingClientRect().width - 8) / 60; // The main width minus border divided by something
  mainElem.style.width = "";
  document.body.style.setProperty("--u", Math.floor(u) + "px");
}
resize();
window.addEventListener("resize", resize);