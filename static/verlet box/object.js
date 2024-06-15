class Object {
  constructor(position, radius) {
    this.pos = position;
    this.poslast = position;
    this.acc = {x: 0, y: 0};
    this.r = radius;
  }

  update(dt) {
    if (isNaN(this.pos.x)) throw new Error("Position of object is NaN");

    let disp = {
      x: this.pos.x - this.poslast.x,
      y: this.pos.y - this.poslast.y,
    };
    
    this.poslast = {
      x: this.pos.x,
      y: this.pos.y,
    }

    this.pos = {
      x: this.pos.x + disp.x + this.acc.x * (dt * dt),
      y: this.pos.y + disp.y + this.acc.y * (dt * dt),
    }

    this.acc = {
      x: 0, 
      y: 0
    };
  }

  accelerate(a) {
    this.acc.x += a.x;
    this.acc.y += a.y;
  }

  setVel(v, dt) {
    this.poslast = {
      x: this.pos.x - (v.x * dt),
      y: this.pos.y - (v.y * dt)
    };
  }

  addVel(v, dt) {
    this.poslast.x -= v.x * dt;
    this.poslast.y -= v.y * dt;
  }

  getVel(dt) {
    return {
      x: (this.pos.x - this.poslast.x) / dt,
      y: (this.pos.y - this.poslast.y) / dt,
    };
  }
}