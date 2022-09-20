const Rotation = {
  front: 0,
  right: 1,
  back: 2,
  left: 3,
}

class Field {

}

class Coati {
  constructor(f, x, y, r) {
    this.__f = f;
    this.__x = x || 0;
    this.__y = y || 0;
    this.__r = r || Rotation.right;
  }

  __front() {
    var coords = {
      x: this.__x,
      y: this.__y
    }

    // Edit vars
    if (this.__r === Rotation.front) {
      coords.y ++;
    } else if (this.__r === Rotation.back) {
      coords.y --;
    } else if (this.__r === Rotation.left) {
      coords.x ++;
    } else if (this.__r === Rotation.right) {
      coords.x --;
    }

    // Check World end
    if (coords.y < 0) {
      coords.y = this.__f.height;
    } else if (coords.y > this.__f.height) {
      coords.y = 0;
    } else if (coords.x < 0) {
      coords.x = this.__f.width;
    } else if (coords.x > this.__f.width) {
      coords.x = 0;
    }

    return coords
  }

  __left() {
    this.turnLeft();
    var coords = this.__front();
    this.turnRight();
  }

  __right() {
    this.turnRight();
    var coords = this.__front();
    this.turnLeft();
  }

  move() {
    var coords = this.__front();
    this.x = coords.x;
    this.y = coords.y;
  }

  turnLeft() {
    // Change var
    this.__r --;

    // Check overflow
    if (this.__r < 0) {
      this.__r = 3;
    }
  }

  turnRight() {
    // Change var
    this.__r ++;

    // Check overflow
    if (this.__r > 3) {
      this.__r = 0;
    }
  }

  putLeaf() {
    this.__f.setLeaf(this.__x, this.__y);
  }

  removeLeaf() {
    this.__f.delLeaf(this.__x, this.__y);
  }

  onLeaf() {
    return this.__f.getLeaf(this.__x, this.__y);
  }

  mushroomFront() {
    var coords = this.__front();
    return this.__f.getLeaf(coords.x, coords.y);
  }

  treeFront() {
    var coords = this.__front();
    return this.__f.getTree(coords.x, coords.y);
  }

  treeLeft() {
    var coords = this.__left();
    return this.__f.getLeaf(coords.x, coords.y);
  }

  treeRight() {
    var coords = this.__right();
    return this.__f.getLeaf(coords.x, coords.y);
  }
}

field = new Field()
coati = new Coati(window.field);
window.pycoati = Proxy(coati, {
  get: () => {
    this.__f.update();
  },
  set: () => {
    this.__f.update();
  }
});
