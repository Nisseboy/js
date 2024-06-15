const screen = document.getElementsByClassName("popup-screen")[0];
const alertElem = document.getElementsByClassName("popup alert")[0];
const confirmElem = document.getElementsByClassName("popup confirm")[0];
const promptElem = document.getElementsByClassName("popup prompt")[0];

let toReturn = false;
let returnValue;

screen.addEventListener("mousedown", e => {
  returnValue = null;
  closePopup();
});

document.addEventListener("keydown", e => {
  if (e.key == "Escape") {
    returnValue = null;
    closePopup();
  }
  if (e.key == "Enter") {
    closePopup();
  }
});

function popupAlert(msg) {
  closePopup();

  screen.style.display = "block";
  alertElem.style.display = "flex";
  alertElem.children[0].innerText = msg;

  toReturn = false;
  returnValue = null;

  alertElem.children[1].children[0].onclick = e => {
    closePopup();
    toReturn = true;
    returnValue = 0;
  }
  alertElem.children[1].children[1].onclick = e => {
    closePopup();
    toReturn = true;
    returnValue = 1;
  }

  return new Promise(resolve => {
    let interval = setInterval(() => {
      if (!toReturn) return;
      clearInterval(interval);
      resolve(returnValue);
    }, 17)
  });
}
function popupConfirm(msg) {
  closePopup();

  screen.style.display = "block";
  confirmElem.style.display = "flex";
  confirmElem.children[0].innerText = msg;

  toReturn = false;
  returnValue = null;

  confirmElem.children[1].children[0].onclick = e => {
    closePopup();
    toReturn = true;
    returnValue = 0;
  }
  confirmElem.children[1].children[1].onclick = e => {
    closePopup();
    toReturn = true;
    returnValue = 1;
  }

  return new Promise(resolve => {
    let interval = setInterval(() => {
      if (!toReturn) return;
      clearInterval(interval);
      resolve(returnValue);
    }, 17)
  });
}
function popupPrompt(msg) {
  closePopup();

  screen.style.display = "block";
  promptElem.style.display = "flex";
  promptElem.children[0].innerText = msg;
  promptElem.children[1].value = "";
  promptElem.children[1].focus();

  toReturn = false;
  returnValue = null;

  promptElem.oninput = e => {
    returnValue = promptElem.children[1].value;
  }

  return new Promise(resolve => {
    let interval = setInterval(() => {
      if (!toReturn) return;
      clearInterval(interval);
      resolve(returnValue);
    }, 17)
  });
}

function closePopup() {
  screen.style.display = "none";
  alertElem.style.display = "none";
  confirmElem.style.display = "none";
  promptElem.style.display = "none";

  toReturn = true;
}
