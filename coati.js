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

function applyTheme(theme, base) {
  base = (base || "themes") + "/" + theme;
  $("style").text(`
    .imgu-0 {
      background-image: url("${base}/0.png");
    }

    .imgu-1 {
      background-image: url("${base}/1.png");
    }

    .imgu-2 {
      background-image: url("${base}/2.png");
    }

    .imgu-3 {
      background-image: url("${base}/3.png");
    }

    .imgu-4 {
      background-image: url("${base}/4.png");
    }

    .imgu-0.imgu-1 {
      background-image: url("${base}/1+0.png");
    }

    .imgu-2.imgu-1 {
      background-image: url("${base}/1+2.png");
    }
  `)
}

function createPopup(title, text, disable, closeable, buttons, buttonsListed, onclose) {
  if (!window.popupcount) {
    window.popupcount = 0;
  }
  var id = window.popupcount ++;
  if (buttonsListed) {
    var buttonhtml = "<ul>";
    for (var button in buttons) {
      buttonhtml += `<li popup="${id}" button="${button}">${buttons[button].text}</li>`;
    }
    buttonhtml += "</ul>";
  } else {
    var buttonhtml = "";
    for (var button in buttons) {
      buttonhtml += `<button popup="${id}" button="${button}">${buttons[button].text}</button>`;
    }
  }
  var html = `
  <div popup="${id}" class="popup container">
    <div popup="${id}" class="popup title">${title}</div>
    <div popup="${id}" class="popup content">${text}</div>
    <div popup="${id}" class="popup buttons">${buttonhtml}</div>
  </div>
  `;
  $("#popups").append(html);
  $(`#cover`).css("display", "block");
  if (closeable) {
    $(`#cover`).click(()=>{closePopup(id);if(onclose)onclose();});
  }
  if (buttonsListed) {
    for (var button in buttons) {
      $(`li[popup='${id}'][button='${button}']`).click(buttons[button].onclick);
    }
  } else {
    for (var button in buttons) {
      $(`button[popup='${id}'][button='${button}']`).click(buttons[button].onclick);
    }
  }
  return id;
}

function closePopup(id) {
  $(`.container[popup='${id}']`).css("opacity", "0");
  $(`#cover`).css("display", "none");
  setTimeout(function() {
    $(`.container[popup='${id}']`).remove();
  }, 300)
}

function getPopup(_this) {
  return parseInt($(_this).attr("button"));
}

function getNewestPopup() {
  return window.popupcount - 1;
}

function iframePopup(title, url, disable, closable, buttons, buttonsListed) {
  return createPopup(title, `<iframe src="${url}">iFrames are not supported on your device/browser.</iframe>`, disable, closable, buttons, buttonsListed);
}

async function showPopup(title, content, buttons, buttonsListed) {
  return new Promise(function(resolve, reject) {
    var id = 0;
    var popbuttons = [];
    for (var button in buttons) {
      const bid = button;
      popbuttons.push({
        text: buttons[bid],
        onclick: (() => {
          resolve(bid);
          closePopup(id);
        })
      })
    }
    id = createPopup(title, content, true, true, popbuttons, buttonsListed, reject);
  });
}

async function confirmPopup(title, content) {
  return new Promise(async function(resolve, reject) {
    try {
      var result = await showPopup(title, content, ["Yes", "No"], false);
    } catch (e) {
      reject();
    }
    resolve(result=="0"?true:false);
  });
}

/* hidden async */ function alertPopup(title, content) {
  return showPopup(title, content, ["Ok"], false);
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
      window.field.cset(parseInt($(this).attr("x")), parseInt($(this).attr("y")), eval(window.uiclick));
    })
    $("td").on("mousedown", function (e1) {
      if (window.running) {
        return alertPopup("Failed", "You can't edit the map while the program is running.");
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
      window.field.cset(parseInt($(this).attr("x")), parseInt($(this).attr("y")), Item.delete);
      event.preventDefault();
    })
    $("td").hover(function() {
      if (window.running) {
        return;
      }
      if (window.left_pressed) {
        window.field.cset(parseInt($(this).attr("x")), parseInt($(this).attr("y")), eval(window.uiclick));
      } else if (window.right_pressed) {
        window.field.cset(parseInt($(this).attr("x")), parseInt($(this).attr("y")), Item.delete);
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
    cell.removeClass('imgr-0');
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

    var cell = this.render_get(x, y);
    cell.addClass('imgu-' + i);
    cell.addClass('imgr-' + r);
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
    var transaction = Sentry.startTransaction({ op: "update()", name: "update()" });
    const span = transaction.startChild({ op: "update()", name: "update()" }); // This function returns a Span
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
    span.finish();
    transaction.finish();
  }

  cset(x, y, i) {
    if (x < 0 || x > this.size) {
      throw new Error("x is out of bounds: " + x?.toString());
    }
    if (y < 0 || y > this.size) {
      throw new Error("y is out of bounds: " + y?.toString());
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
      throw new Error("towardsstone");
    }
    if (this.__f.maps.balls[coords.x][coords.y]) {
      var mushcoords = this.__front(coords.x, coords.y);
      if (this.__f.maps.balls[mushcoords.x][mushcoords.y]) {
        throw new Error("multipleballs");
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
      throw new Error("aworm")
    }
    this.__f.maps.worms[this.__x][this.__y] = true;
  }

  removeWorm() {
    if (!this.onWorm()) {
      throw new Error("noworm")
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
  localStorage.setItem("map", JSON.stringify(getMapAndCode()))
}

function saveState() {
  window.lastState = getMapAndCode();
  window.queue.push(["update", [window.lastState]]);
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
    "update": function (a) {
      window.field.update(a);
    },
    "error": function (a) {
      alertPopup("Error", "Your code raised an uncaught error!<br><br>Tip: Mostly, only the last 1-3 lines are important!<br>It was:<br><br>" + a.message)
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
    window.lastState = getMapAndCode();
    window.lastError = null;
    $("#run").text("▶");
    window.running = false;
    $("#skip").css("opacity", "0.5");
  }
  setTimeout(applyUpdate, window.speed);
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
    worms: window.field.maps.worms
  });
}


async function main() {
  applyTheme(localStorage.getItem("theme") || "default");
  window.pyodide = await loadPyodide();
  window.pyodide.FS.create("coati.py");
  window.pyodide.FS.writeFile("coati.py", (await (await window.fetch("coati.py")).text()));
  window.pyodide.FS.create("kara.py");
  window.pyodide.FS.writeFile("kara.py", (await (await window.fetch("kara.py")).text()));
  window.savedMap = JSON.parse(localStorage.getItem("map"));
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
      window.field.maps.stones = window.field.shownState.stones;
      window.field.maps.balls = window.field.shownState.balls;
      window.field.maps.worms = window.field.shownState.worms;
      window.coati.__x = window.field.shownState.figure.x;
      window.coati.__y = window.field.shownState.figure.y;
      window.coati.__r = window.field.shownState.figure.r;
      window.queue.length = 0;
      window.lastError = null;
      $("#run").text("▶");
      window.running = false;
      $("#skip").css("opacity", "0.5");
    } else {
      window.running = true;
      $("#skip").css("opacity", "1");
      try {
        const transaction = Sentry.startTransaction({ name: "runPython()", op: "runPython()" });
        const span = transaction.startChild({ name: "runPython()", op: "runPython()" }); // This function returns a Span
        pyodide.runPython($("#input").val(), {})
        span.finish(); // Remember that only finished spans will be sent with the transaction
        transaction.finish(); // Finishing the transaction will send it to Sentry
      } catch (e) {
        window.lastError = e;
        window.queue.push(["error", [e]])
      }
    }
  })
  $("#skip").click(() => {
    if (window.running) {
      window.field.update(window.lastState);
      window.field.maps.stones = window.lastState.stones;
      window.field.maps.balls = window.lastState.balls;
      window.field.maps.worms = window.lastState.worms;
      window.coati.__x = window.lastState.figure.x;
      window.coati.__y = window.lastState.figure.y;
      window.coati.__r = window.lastState.figure.r;
      window.queue.length = 0;
      if (window.lastError) {
        window.queue.push(["error", [window.lastError]])
      }
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
    localStorage.setItem("code", $("#input").val())
  })

  console.log(window.savedMap);

  $("#input").val(localStorage.getItem("code") || "import coati\n\n# To see a list of functions available,\n# go to https://l.jojojux.de/MTk3Nj\n\nwhile not coati.stone_front():\n    coati.move()")


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
    createPopup("Export", "What do you want to export?", true, true, [
      {
        text: "Map (.coati)",
        onclick: () => {
          var name = prompt("Name your file:");
          if (name) {
            var blob = new Blob([JSON.stringify(getMapAndCode())], {type: "text/plain;charset=utf-8"});
            saveAs(blob, name + ".coati");
          }
          closePopup(getNewestPopup());
        }
      },
      {
        text: "Code (.py)",
        onclick: () => {
          var name = prompt("Name your file:");
          if (name) {
            var blob = new Blob([$("#input").val()], {type: "text/plain;charset=utf-8"});
            saveAs(blob, name + ".py");
          }
          closePopup(getNewestPopup());
        }
      }
    ], false)
  })
  $("#import-file").click(function() {
    createPopup("Import", "What do you want to import?", true, true, [
      {
        text: "Map (.coati)",
        onclick: () => {
          $("#upload-map").css("display", "block");
          $("#upload-map").click();
          $("#upload-map").css("display", "none");
          closePopup(getNewestPopup());
        }
      },
      {
        text: "Code (.py)",
        onclick: () => {
          $("#upload-code").css("display", "block");
          $("#upload-code").click();
          $("#upload-code").css("display", "none");
          closePopup(getNewestPopup());
        }
      }
    ], false)
  })
  $("#upload-map").on('change', async function() {
    if (await confirmPopup("Import", "Are you sure you want to import this file?<br>This will override any unsaved changes to your current map.")) {
      var content = await $("#upload-map")[0].files[0].text();
      var backup = JSON.parse(content);

      window.field.maps.stones = backup.stones;
      window.field.maps.balls = backup.balls;
      window.field.maps.worms = backup.worms;

      window.coati.__x = backup.figure.x;
      window.coati.__y = backup.figure.y;
      window.coati.__r = backup.figure.r;

      window.field.update(getMapAndCode())
      saveMap();
      window.savedMap = getMapAndCode();
      localStorage.setItem("lastImport", JSON.stringify(getMapAndCode()));
    }
  })
  $("#upload-code").on('change', async function() {
    if (await confirmPopup("Import", "Are you sure you want to import this file?<br>This will override any unsaved changes to your current code.")) {
      var code = await $("#upload-code")[0].files[0].text();
      $("#input").val(code);
      localStorage.setItem("code", code)
    }
  })
  $("#reset-map").click(async function() {
    if (await confirmPopup("Reset", "Are you sure you want to reset the map?<br>This will reset the map to the last imported map.")) {
      var backup = JSON.parse(localStorage.getItem("lastImport"));
      if (!backup) {
        return alertPopup("Failed", "No import found to set to.");
      }

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
    var size = prompt("Are you sure you want to clear the map?\nThis will delete all contents of map.\n\nSize (3-20):");
    if (size && parseInt(size)) {
      size = parseInt(size);
      if (size < 3 || size > 20) {
        return alertPopup("Failed", "Size must be between 3 and 20.")
      }
      window.field.resize(size);
      saveMap();
      window.savedMap = getMapAndCode();
    }
  })
  $("#select-theme").click(function() {
    function _(name) {
      localStorage.setItem("theme", name);
      applyTheme(name);
    }
    createPopup("Select Theme", "Select a theme to apply:", true, true, [
      {
        text: "Standard",
        onclick: function() {
          _("default");
          closePopup(getNewestPopup());
        }
      },
      {
        text: "Kara-Design",
        onclick: function() {
          _("kara");
          closePopup(getNewestPopup());
        }
      }
    ], true)
  })
  $("#welcome-guide").click(function() {
    showWelcomeGuide();
  })
  $("#source").click(function() {
    window.location.href = "https://github.com/J0J0HA/CoatiPython";
  })
  setInterval(updateSpeed, 100);
  applyUpdate();
}

function showWelcomeGuide() {
  iframePopup("Welcome Guide", "/welcome", true, false, [
    {
      text: "Show again in 30 days",
      onclick: () => {
        localStorage.setItem("welcome", Date.now());
        closePopup(getNewestPopup());
        main();
      }
    },
    {
      text: "Show again next time",
      onclick: () => {
        localStorage.setItem("welcome", Date.now() - 1000 * 60 * 60 * 24 * 30);
        closePopup(getNewestPopup());
        main();
      }
    }
  ], false);
}


$(async () => {
  window.addEventListener('error', (event) => {
    alert("An error occurred at line " + event.lineno + " in column " + event.colno + ":\n" + event.message);
    Sentry.captureException(event)
  });

  var welcome = localStorage.getItem("welcome");
  var sentry = localStorage.getItem("sentry");

  if (!sentry) {
    var allowed = await confirmPopup("Sentry", "Do you want to enable Sentry?<br><br>This will help fixing issues and improving performance.<br>The site will sent your IP-Adress, OS and Browser if you enable this.<br>There is no other way to identify you than these values.<br>Due to the way data is captured, it might contain parts<br>of your python code, your map or your settings.");
    await alertPopup("Notice", "Currently there is no intended way to change this setting,<br>but it is planned to be added.<br>See <a target='_blank' href='https://github.com/J0J0HA/CoatiPython/issues/22#issuecomment-1268519476'>here</a> if you need to change it.")
    localStorage.setItem("sentry", allowed ? "ok" : "fb");
  }

  if (sentry == "ok") {
    Sentry.init({
      dsn: "https://2ca320a25f7d4a489293f9fe8b6f53df@o1162425.ingest.sentry.io/4503931212988416",
      integrations: [new Sentry.BrowserTracing()],
      tracesSampleRate: 1.0,
    });
  }

  if ((!welcome) || (welcome < (Date.now() - 1000 * 60 * 60 * 24 * 30))) {
    showWelcomeGuide();
  } else {
    main();
  }
})
