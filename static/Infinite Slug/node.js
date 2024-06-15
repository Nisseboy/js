class Part {
  constructor(properties) {
    for (let i in properties) this[i] = properties[i];
    this.unlocked = false;
    this.visible = false;
  }
}