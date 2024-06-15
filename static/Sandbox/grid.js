class Grid {
  constructor(w, h, preset) {
    this.w = w;
    this.h = h;
    
    this.g = new Array(w).fill(undefined).map((e, x)=>new Array(h).fill(undefined).map((e, y)=>{      
      if (x == 0 || x == w - 1 || y == 0 || y == h - 1) return {type: 2};
      
      if (preset == "ball") {
        if (((x-w/2)*(x-w/2)+(y-h/2)*(y-h/2)>(w / 4) * (h / 4))) return undefined;
        return {
          //type: Math.round(Math.random()),
          type:0,
          vel: {x: (x - w / 2) / 10, y: (y - h / 2) / 10},
        }
      } else {
        return undefined;
      }
    }));
    
    if (preset == "dot") {
      this.set(w / 2, h / 2, {type: 0});
      this.set(w / 2, h / 2 + 5, {type: 2});
      this.set(w / 2 - 1, h / 2 + 5, {type: 2});
      this.set(w / 2 + 1, h / 2 + 5, {type: 2});
    }
  }
  
  get(x, y) {
    return this.g[x][y];
  }
  set(x, y, v) {
    this.g[x][y] = v;
  }
  swap(x1, y1, x2, y2) {
    let temp = this.get(x1, y1);
    this.set(x1, y1, this.get(x2, y2));
    this.set(x2, y2, temp);
  }
  
  isInside(x, y) {
    return !(x < 0 || y < 0 || x >= this.w || y >= this.h);
  }
  
  connectPoints(x1_, y1_, x2_, y2_) {
    let x1 = Math.floor(x1_);
    let x2 = Math.floor(x2_);
    let y1 = Math.floor(y1_);
    let y2 = Math.floor(y2_);
    
    let pts = [];
    let diff = {x: x2 - x1, y: y2 - y1};
    
    let vertical = Math.abs(diff.y) > Math.abs(diff.x);
    
    let slope;
    if (vertical) slope = diff.x / diff.y;
    else          slope = diff.y / diff.x;
    
    for (let i = 0; i < Math.abs(vertical?diff.y:diff.x); i++) {
      let j = i * Math.sign(vertical?diff.y:diff.x);
      if (vertical) pts.push({x: x1 + Math.round(j * slope), y: y1 + j});
      else          pts.push({x: x1 + j, y: y1 + Math.round(j * slope)});
    }
    
    if (pts.length == 0 || pts[pts.length - 1].x != x2 || pts[pts.length - 1].y != y2) pts.push({x: x2, y: y2});
   
    return pts;
  }
  
  resetPass() {
    for (let x = 0; x < this.w; x++) {
      let col = this.g[x];
      for (let y = 0; y < this.h; y++) {
        let dust = col[y];
        if (!dust) continue;
        if (!dust.pos) dust.pos = {x, y};
        if (!dust.vel) dust.vel = {x: 0, y: 0};
        if (!dust.noise) dust.noise = Math.random() / 20 + 0.95;
        dust.simulated = false;
      }
    }
  }
}