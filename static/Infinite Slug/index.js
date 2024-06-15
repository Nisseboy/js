let parts = {
  uno: new Part({
    name: "Uno",
    x: 50,
    y: 50,
    visibleReq: e => true,
  }),
};
parts.uno.unlocked = true;

//Display all the parts
updateParts();
function updateParts() {
  for (let i in parts) {
    let part = parts[i];
    
    part.visible = part.visible || part.visibleReq();
  }
}