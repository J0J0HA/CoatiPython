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


var __root = document.querySelector(':root');
function get_css_var(name) {
  var __root_style = getComputedStyle(__root);
  return __root_style.getPropertyValue(name);
}

function set_css_var(name, value) {
  __root.style.setProperty(name, value);
}








const Item = {
  nothing: -1,
  figure: 0,
  worm: 1,
  ball: 2,
  stone: 3,
  delete: 4
}

const Rotation = {
  front: 0,
  right: 1,
  back: 2,
  left: 3
}

class Field {
  constructor(id, onupdate) {
    this.figure = null;
    this.id = id;
    this.onupdate = onupdate || (()=>{});
    this.shownState = {};
  }

  resize(size) {
    this.size = size;
    this.maps = {
      stones: [],
      balls: [],
      worms: []
    };
    var code = "";
    for (var y = 0; y < size; y++) {
      var icode = "";
      var istones = [];
      var iballs = [];
      var iworms = [];
      for (var x = 0; x < size; x++) {
        icode += "<td x='" + x + "' y='" + y + "'></td>";
        istones.push(false);
        iballs.push(false);
        iworms.push(false);
      }
      this.maps.stones.push(istones);
      this.maps.balls.push(iballs);
      this.maps.worms.push(iworms);
      code += "<tr>" + icode + "</tr>"
    }
    $(this.id).html("<tbody>" + code + "</tbody>");
    set_css_var("--cell-amount", this.size);
    this.bind_events();
    this.update(getMapAndCode());
  }

  bind_events() {
    $("td").click(function() {
      if (window.running) {
        return;
      }
      window.field.cset($(this).attr("x"), $(this).attr("y"), eval(window.uiclick));
    })
    $("td").on("mousedown", function (e1) {
      if (window.running) {
        return alert("You can't edit the map while the program is running.");
      }
      $("td").one("mouseup", function (e2) {
        if (e1.which == 2 && e1.target == e2.target) {
          var $this = $(this);
          var imguclass = "-1";
          if ($this.hasClass("imgu-0")) {
            imguclass = "0";
          } else if ($this.hasClass("imgu-1")) {
            imguclass = "1";
          } else if ($this.hasClass("imgu-2")) {
            imguclass = "2";
          } else if ($this.hasClass("imgu-3")) {
            imguclass = "3";
          }
          if (imguclass == "-1") {
            $(".itemimg").removeClass("selected");
          } else {
            $(".itemimg.imgu-" + imguclass).click();
          }
        }
      });
    });
    $("td").contextmenu(function() {
      if (window.running) {
        return;
      }
      if ($(this).hasClass("imgu-0")) {
        window.coati.turnRight();
      }
      window.field.cset($(this).attr("x"), $(this).attr("y"), Item.delete);
      event.preventDefault();
    })
    $("td").hover(function() {
      if (window.running) {
        return;
      }
      if (window.left_pressed) {
        window.field.cset($(this).attr("x"), $(this).attr("y"), eval(window.uiclick));
      } else if (window.right_pressed) {
        window.field.cset($(this).attr("x"), $(this).attr("y"), Item.delete);
      }
    })
  }

  render_get(x, y) {
    return $("td[x='" + x + "'][y='" + y + "']");
  }

  render_clear_cell(x, y) {
    var cell = this.render_get(x, y);
    cell.removeClass('imgu-0');
    cell.removeClass('imgu-1');
    cell.removeClass('imgu-2');
    cell.removeClass('imgu-3');
    cell.removeClass('imgr-1');
    cell.removeClass('imgr-2');
    cell.removeClass('imgr-3');
  }

  render_clear() {
    for (var y = 0; y <= this.size; y++) {
      for (var x = 0; x <= this.size; x++) {
        this.render_clear_cell(x, y);
      }
    }
  }

  render_show(i, x, y, r) {
    if (!(i in Object.values(Item))) {
      throw new Error("No valid Item: " + i?.toString());
    }

    if (!(r in Object.values(Rotation))) {
      throw new Error("No valid Rotation: " + r?.toString());
    }

    if (x < 0 || x > this.size) {
      throw new Error("x is out of bounds: " + x?.toString());
    }

    if (y < 0 || y > this.size) {
      throw new Error("y is out of bounds: " + y?.toString());
    }

    this.render_get(x, y).addClass('imgu-' + i);
    this.render_get(x, y).addClass('imgr-' + r);
  }

  setMap(map) {
    this.resize(map.size || 10);
    this.figure.__x = map.figure.x || 0;
    this.figure.__y = map.figure.y || 0;
    this.figure.__r = map.figure.r || 0;
    if (map.stones && map.balls && map.worms) {
      this.maps = {
        stones: map.stones,
        balls: map.balls,
        worms: map.worms
      };
    }
  }

  update(obj) {
    this.shownState = obj;
    this.render_clear();
    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        if (obj.stones[x][y]) {
          this.render_show(Item.stone, x, y, 0);
        }
        if (obj.balls[x][y]) {
          this.render_show(Item.ball, x, y, 0);
        }
        if (obj.worms[x][y]) {
          this.render_show(Item.worm, x, y, 0);
        }
        if (!(obj.stones[x][y] || obj.balls[x][y] || obj.worms[x][y])) {
          this.render_clear_cell(x, y);
        }
      }
    }
    this.render_show(Item.figure, obj.figure.x, obj.figure.y, obj.figure.r);

    this.onupdate();
  }

  cset(x, y, i) {
    if (x < 0 || x > this.size) {
      throw new Error("x is out of bounds: " + x);
    }

    if (y < 0 || y > this.size) {
      throw new Error("y is out of bounds: " + y);
    }

    if (i == Item.figure) {
      if (!(this.maps.stones[x][y] || this.maps.balls[x][y])) {
        this.figure.__x = x;
        this.figure.__y = y;
      }
    } else if (i == Item.worm) {
      if (!this.maps.stones[x][y]) {
        this.maps.worms[x][y] = true;
      }
    } else if (i == Item.ball) {
      if (!this.maps.stones[x][y]) {
        if (!(x == this.figure.__x && y == this.figure.__y)) {
          this.maps.balls[x][y] = true;
        }
      }
    } else if (i == Item.stone) {
      if (!(this.maps.worms[x][y] || this.maps.balls[x][y])) {
        if (!(x == this.figure.__x && y == this.figure.__y)) {
          this.maps.stones[x][y] = true;
        }
      }
    } else if (i == Item.delete) {
      this.maps.stones[x][y] = false;
      this.maps.worms[x][y] = false;
      this.maps.balls[x][y] = false;
    } else if (i == Item.nothing) {

    } else {
      throw new Error("Could not cset! Item does not exist: " + i);
    }

    this.update(getMapAndCode())
  }
}

class Coati {
  constructor(f, x, y, r) {
    this.__f = f;
    this.__f.figure = this;
    this.__x = x || 0;
    this.__y = y || 0;
    this.__r = r || Rotation.front;
  }

  __front(x, y) {
    var coords = {
      x: x || this.__x,
      y: y || this.__y
    }

    // Edit vars
    if (this.__r == Rotation.front) {
      coords.y --;
    } else if (this.__r == Rotation.back) {
      coords.y ++;
    } else if (this.__r == Rotation.right) {
      coords.x ++;
    } else if (this.__r == Rotation.left) {
      coords.x --;
    }

    // Check World end
    if (coords.y < 0) {
      coords.y = this.__f.size - 1;
    } else if (coords.y >= this.__f.size) {
      coords.y = 0;
    } else if (coords.x < 0) {
      coords.x = this.__f.size - 1;
    } else if (coords.x >= this.__f.size) {
      coords.x = 0;
    }

    return coords
  }

  __left() {
    this.turnLeft();
    var coords = this.__front();
    this.turnRight();
    return coords;
  }

  __right() {
    this.turnRight();
    var coords = this.__front();
    this.turnLeft();
    return coords;
  }

  move() {
    var coords = this.__front();
    if (this.__f.maps.stones[coords.x][coords.y]) {
      throw new Error("Can't move! There is a stone in the way!");
    }
    if (this.__f.maps.balls[coords.x][coords.y]) {
      var mushcoords = this.__front(coords.x, coords.y);
      if (this.__f.maps.balls[mushcoords.x][mushcoords.y]) {
        throw new Error("Can't move multiple balls at the same time!");
      }
      this.__f.maps.balls[coords.x][coords.y] = false;
      this.__f.maps.balls[mushcoords.x][mushcoords.y] = true;
      this.__f.maps.stones[mushcoords.x][mushcoords.y] = false;
    }
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

  putWorm() {
    if (this.onWorm()) {
      throw new Error("There is already a Worm")
    }
    this.__f.maps.worms[this.__x][this.__y] = true;
  }

  removeWorm() {
    if (!this.onWorm()) {
      throw new Error("No Worm to remove")
    }
    this.__f.maps.worms[this.__x][this.__y] = false;
  }

  onWorm() {
    return this.__f.maps.worms[this.__x][this.__y];
  }

  ballFront() {
    var coords = this.__front();
    return this.__f.maps.balls[coords.x][coords.y];
  }

  stoneFront() {
    var coords = this.__front();
    return this.__f.maps.stones[coords.x][coords.y];
  }

  stoneLeft() {
    var coords = this.__left();
    return this.__f.maps.stones[coords.x][coords.y];
  }

  stoneRight() {
    var coords = this.__right();
    return this.__f.maps.stones[coords.x][coords.y];
  }
}

function saveMap() {
  localStorage.setItem("coatiField", JSON.stringify(getMapAndCode()))
}

function saveState() {
  window.queue.push(["update", [getMapAndCode()]]);
}

function updateSpeed() {
  window.speed = $("#speed").val();
  if (window.speed == 0) {
    $("#timespeed").text("immediately");
  } else {
    $("#timespeed").text(Math.round(window.speed) / 1000 + "sec/move");
  }
}

function applyUpdate() {
  var f = {
    "update": function(a) {
      window.field.update(a);
    }
  }
  if (window.queue.length > 0) {
    window.qcd = 2;
    d = window.queue.shift();
    f[d[0]](...d[1]);
  } else if (window.queue.length == 0) {
    window.qcd --;
  }
  if (window.qcd == 0) {
    $("#run").text("▶");
    window.running = false;
    $("#skip").css("opacity", "0.5");
  }
  setTimeout(applyUpdate, window.speed);
}

function ealert(e) {
  alert("Failed!\n\n" + e)
}

function getMapAndCode() {
  return structuredClone({
    size: window.field.size,
    figure: {
      x: window.coati.__x,
      y: window.coati.__y,
      r: window.coati.__r
    },
    stones: window.field.maps.stones,
    balls: window.field.maps.balls,
    worms: window.field.maps.worms,
    code: $("#input").val()
  });
}


async function main() {
  window.pyodide = await loadPyodide();
  window.pyodide.FS.create("coati.py");
  window.pyodide.FS.writeFile("coati.py", (await (await window.fetch("coati.py")).text()));
  window.pyodide.FS.create("kara.py");
  window.pyodide.FS.writeFile("kara.py", (await (await window.fetch("kara.py")).text()));
  window.savedMap = JSON.parse(localStorage.getItem("coatiField"));
  window.speed = 250;
  window.field = new Field("#output", saveMap);
  window.field.onupdate = saveMap
  window.coati = new Coati(window.field);
  if (window.savedMap) {
    window.field.setMap(window.savedMap);
  } else {
    window.field.resize(10);
  }
  window.uiclick = "Item.nothing";
  window.left_pressed = false;
  window.right_pressed = false;
  window.scroll_position = -1;
  window.queue = [];
  window.qcd = 2;
  $("#run").text("▶")
  $(".itembar").draggable({
    cancel: ".itemimg",
    axis: "y",
    scroll: false,
    containment: "body"
  });
  $(".itemimg").click(function() {
    var $this = $(this);
    if (!$this.hasClass("selected")) {
      $(".itemimg").removeClass("selected");
      $this.addClass("selected");
      window.uiclick = $this.attr("data-set");
    } else {
      $(".itemimg").removeClass("selected");
      window.uiclick = "Item.nothing";
    }
    var imguclass = "4";
    if ($this.hasClass("imgu-0")) {
      imguclass = 0;
    } else if ($this.hasClass("imgu-1")) {
      imguclass = 1;
    } else if ($this.hasClass("imgu-2")) {
      imguclass = 2;
    } else if ($this.hasClass("imgu-3")) {
      imguclass = 3;
    }
    window.scroll_position = imguclass;
  })

  $(".right").on('DOMMouseScroll', function(event) {
    if (event.originalEvent.detail <= 0) {
      window.scroll_position ++;
    }
    else {
      window.scroll_position --;
    }
    if (window.scroll_position < -1) {
      window.scroll_position = 4;
    } else if (window.scroll_position > 4) {
      window.scroll_position = -1;
    }
    if (window.scroll_position == -1) {
      $(".itemimg").removeClass("selected");
      window.uiclick = "Item.nothing";
    } else {
      $(".itemimg.imgu-" + window.scroll_position).click();
    }
  })
  $(".right").on('mousewheel', function(event) {
    if (event.originalEvent.wheelDelta >= 0) {
      window.scroll_position ++;
    }
    else {
      window.scroll_position --;
    }
    if (window.scroll_position < -1) {
      window.scroll_position = 4;
    } else if (window.scroll_position > 4) {
      window.scroll_position = -1;
    }
    if (window.scroll_position == -1) {
      $(".itemimg").removeClass("selected");
      window.uiclick = "Item.nothing";
    } else {
      $(".itemimg.imgu-" + window.scroll_position).click();
    }
  })


  $("#run").click(() => {
    $("#run").text("⏹")
    if (window.running) {
      window.field.update(window.field.shownState);
      window.field.maps.stones = d[1][1].stones;
      window.field.maps.balls = d[1][1].balls;
      window.field.maps.worms = d[1][1].worms;
      window.coati.__x = d[1][1].figure.x;
      window.coati.__y = d[1][1].figure.y;
      window.coati.__r = d[1][1].figure.r;
      window.queue.length = 0;
      $("#run").text("▶");
      window.running = false;
      $("#skip").css("opacity", "0.5");
    } else {
      window.running = true;
      $("#skip").css("opacity", "1");
      try {
        pyodide.runPython($("#input").val(), {})
      } catch (e) {
        window.queue.push([ealert, [e.message]])
      }
    }
  })
  $("#skip").click(() => {
    if (window.running) {
      window.field.update(getMapAndCode());
      window.queue.length = 0;
      $("#run").text("▶");
      window.running = false;
      $("#skip").css("opacity", "0.5");
    }
  })
  $("#speed").change(updateSpeed);
  $("#speed").val(1000);

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

  $("#input").val(window.savedMap?.code || "import coati\n\n# To see a list of functions availible,\n# go to https://l.jojojux.de/MTk3Nj\n\nwhile not coati.stone_front():\n    coati.move()")


  $("#title").click(() => {
    $("#sidebar").addClass("shown")
  })


  $(".itembar").disableSelection();
  $(".itemimg").disableSelection();
  $("table").disableSelection();
  $("#title").disableSelection();
  $("#sidebar").disableSelection();
  $(".vhandle").disableSelection();
  $("#run").disableSelection();
  $("#skip").disableSelection();

  window.field.update(getMapAndCode());

  $("body").mouseup(function() {
    if (event.which === 1) {
      window.left_pressed = false;
    } else if (event.which === 3) {
      window.right_pressed = false;
    }

    $("#sidebar").removeClass("shown")
  })
  $("body").mousedown(function() {
    if (event.which === 1) {
      window.left_pressed = true;
    } else if (event.which === 3) {
      window.right_pressed = true;
    }
  })
  $("#export-file").click(function() {
    var blob = new Blob([JSON.stringify(getMapAndCode())], {type: "text/plain;charset=utf-8"});
    saveAs(blob, prompt("Name your file:") + ".coati");
  })
  $("#import-file").click(function() {
    $("#upload").css("display", "block");
    $("#upload").click();
    $("#upload").css("display", "none");
  })
  $("#upload").on('change', async function() {
    if (confirm("Are you sure you want to upload this project? This will clear your current project.")) {
      var content = await $("#upload")[0].files[0].text();
      var backup = JSON.parse(content);

      $("#input").val(backup.code);

      window.field.maps.stones = backup.stones;
      window.field.maps.balls = backup.balls;
      window.field.maps.worms = backup.worms;

      window.coati.__x = backup.figure.x;
      window.coati.__y = backup.figure.y;
      window.coati.__r = backup.figure.r;

      window.field.update(getMapAndCode())
      saveMap();
      window.savedMap = getMapAndCode();
    }
  })
  $("#reset-map").click(function() {
    if (confirm("Are you sure you want to reset the map? This will clear all your changes made after the last page reload, or since the last import, if you didn't reload the page since then.")) {
      var backup = window.savedMap;

      $("#input").val(backup.code);

      window.field.maps.stones = backup.stones;
      window.field.maps.balls = backup.balls;
      window.field.maps.worms = backup.worms;

      window.coati.__x = backup.figure.x;
      window.coati.__y = backup.figure.y;
      window.coati.__r = backup.figure.r;

      window.field.update(getMapAndCode())
      saveMap();
      window.savedMap = getMapAndCode();
    }
  })
  $("#clear-map").click(function() {
    if (confirm("Are you sure you want to clear the map? This will delete all contents of map.")) {
      for (var y = 0; y < 10; y++) {
        for (var x = 0; x < 10; x++) {
          window.field.maps.stones[x][y] = false;
          window.field.maps.balls[x][y] = false;
          window.field.maps.worms[x][y] = false;
        }
      }

      window.coati.__x = 0;
      window.coati.__y = 0;
      window.coati.__r = 0;

      window.field.update(getMapAndCode())
      saveMap();
      window.savedMap = getMapAndCode();
    }
  })
  $("#welcome-guide").click(function() {
    window.location.href = "welcome";
  })
  $("#source").click(function() {
    window.location.href = "https://github.com/J0J0HA/CoatiPython";
  })
  setInterval(updateSpeed, 100);
  applyUpdate();
}


$(() => {
  if (window.location.hash == "#welcome") {
    localStorage.setItem("welcome", Date.now());
  } else if (window.location.hash == "#welcome-again") {
    localStorage.setItem("welcome", Date.now() - 1000 * 60 * 60 * 24 * 30);
  }
  window.location.hash = "#";

  var welcome = localStorage.getItem("welcome");

  if ((!welcome) || (welcome < (Date.now() - 1000 * 60 * 60 * 24 * 30))) {
    window.location.href = "welcome";
  } else {
    main();
  }
})
