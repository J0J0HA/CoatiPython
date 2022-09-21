function getCursorPos(input) {
    if ("selectionStart" in input && document.activeElement == input) {
        return {
            start: input.selectionStart,
            end: input.selectionEnd
        };
    }
    else if (input.createTextRange) {
        var sel = document.selection.createRange();
        if (sel.parentElement() === input) {
            var rng = input.createTextRange();
            rng.moveToBookmark(sel.getBookmark());
            for (var len = 0;
                     rng.compareEndPoints("EndToStart", rng) > 0;
                     rng.moveEnd("character", -1)) {
                len++;
            }
            rng.setEndPoint("StartToStart", input.createTextRange());
            for (var pos = { start: 0, end: len };
                     rng.compareEndPoints("EndToStart", rng) > 0;
                     rng.moveEnd("character", -1)) {
                pos.start++;
                pos.end++;
            }
            return pos;
        }
    }
    return -1;
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}









const Item = {
  figure: 0,
  leaf: 1,
  mushroom: 2,
  tree: 3,
}

const Rotation = {
  front: 0,
  right: 1,
  back: 2,
  left: 3,
}

class Field {
  constructor(id, width, height) {
    this.width = width;
    this.height = height;
    this.figure = null;
    this.id = id;
  }

  render_get(x, y) {
    return $($($($(this.id).children()[0]).children()[y]).children()[x]);
  }

  render_clear() {
    for (var y = 0; y <= this.height; y++) {
      for (var x = 0; x <= this.width; x++) {
        this.render_get(x, y).attr("class", "")
      }
    }
  }

  render_show(i, x, y, r) {
    if (!(i in Object.values(Item))) {
      throw new Error("No valid Item: " + i.toString());
    }

    if (!(r in Object.values(Rotation))) {
      throw new Error("No valid Rotation: " + r.toString());
    }

    if (x < 0 || x > this.width) {
      throw new Error("x is out of bounds: " + x.toString());
    }

    if (y < 0 || y > this.height) {
      throw new Error("y is out of bounds: " + y.toString());
    }

    this.render_get(x, y).attr("class", "img-"+i+"-"+r);
  }

  update(th, obj) {
    th.render_clear();
    th.render_show(Item.figure, obj.coati.__x, obj.coati.__y, obj.coati.__r);
  }
}

class Coati {
  constructor(f, x, y, r) {
    this.__f = f;
    this.__f.figure = this;
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
    if (this.__r == Rotation.front) {
      coords.y ++;
    } else if (this.__r == Rotation.back) {
      coords.y --;
    } else if (this.__r == Rotation.left) {
      coords.x ++;
    } else if (this.__r == Rotation.right) {
      coords.x --;
    }

    // Check World end
    if (coords.y < 0) {
      coords.y = this.__f.height - 1;
    } else if (coords.y >= this.__f.height) {
      coords.y = 0;
    } else if (coords.x < 0) {
      coords.x = this.__f.width - 1;
    } else if (coords.x >= this.__f.width) {
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
    this.__x = coords.x;
    this.__y = coords.y;
  }

  turnLeft() {
    this.__r --;
    if (this.__r < 0) {
      this.__r = 3;
    }
  }

  turnRight() {
    this.__r ++;
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


window.speed = 1000;
window.field = new Field("#output", 10, 10)
window.coati = new Coati(window.field);
window.queue = [];
function saveState() {
  window.queue.push([window.field.update, [window.field, structuredClone({coati:window.coati, field:window.field})]]);
}
setInterval(function() {
  console.log(window.queue)
  if (window.queue.length > 0) {
    d = window.queue.shift();
    d[0](...d[1]);
  }
}, window.speed)

//window.pycoati = coati;

var pyodide = null;

async function main() {
  pyodide = await loadPyodide();
  pyodide.FS.create("coati.py");
  pyodide.FS.writeFile("coati.py", (await (await window.fetch("coati.py")).text()));
  $("#run").css("display", "block");
  $("#norun").css("display", "none");
}
$(() => {
  main()

  $("#input").keydown(() => {
    if ((event.which || event.keyCode) == 9) {
      var $input = $("#input");
      var caretPos = $input[0].selectionStart;
      var textAreaTxt = $input.val();
      var txtToAdd = "    ";
      $input.val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos) );
      event.preventDefault()
    } else if ((event.which || event.keyCode) == 8) {
      var $input = $("#input");
      var caretPos = $input[0].selectionStart;
      var textAreaTxt = $input.val();
      if (textAreaTxt.substring(0, caretPos).endsWith("    ")) {
        $input.val(textAreaTxt.substring(0, caretPos - 4) + textAreaTxt.substring(caretPos) );
        event.preventDefault()
      }
    }
  })

  $("#input").keyup(() => {
    localStorage.setItem("coatiCode", $("#input").val())
  })

  if (!localStorage.getItem("coatiCode")) {
    localStorage.setItem("coatiCode", "import coati\n\nwhile not coati.treeFront():\n    coati.move()")
  }

  $("#input").val(localStorage.getItem("coatiCode"))


  $("#title").click(() => {
    alert("Menu not built.")
  })

  $("#run").click(() => {
    try {
      pyodide.runPython($("#input").val())
    } catch (e) {
      alert(e)
    }
  })
})
