let res = await fetch("/dir").then(a => a.json());
res.forEach(async dir => {
  createCard(dir, dir + "/favicon.jpg");
});

async function createCard(file, imgSrc) {
  let card = document.createElement("div");
  card.className = "card";
  card.onclick = () => {
    window.location.href = file;
  };

  let icon = document.createElement("img");
  icon.className = "card-icon";
  let req = await fetch(imgSrc);
  icon.src = (req.ok)?imgSrc : "favicon.jpg";

  let text = document.createElement("div");
  text.className = "card-text";
  text.innerText = file;

  card.appendChild(icon);
  card.appendChild(text);
  document.getElementsByClassName("cards")[0].appendChild(card);
}