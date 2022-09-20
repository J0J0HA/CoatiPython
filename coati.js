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

var field = new Field()
var coati = new Coati(window.field);
window.pycoati = new Proxy(coati, {
  get: () => {
    this.__f.update();
  },
  set: () => {
    this.__f.update();
  }
});

var pyodide = null;

async function main() {
  pyodide = await loadPyodide();
  pyodide.FS.create("coati.py");
  pyodide.FS.writeFile("coati.py", (await (await window.fetch("coati.py")).text()));
  while (true) {
    alert(
      pyodide.runPython(
        prompt("Run Python:")
      )
    );
  }
}
$(() => {
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


  $("#menu").click(() => {
    alert("Menu not built.")
  })
})
