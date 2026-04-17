(function () {
  var CHARSET = "黑客帝国abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%+-/~{[|`]}";
  var FONT_SIZE = 10;
  var DRAW_INTERVAL_MS = 35;
  var TRAIL_ALPHA = 0.04;
  var TEXT_COLOR = "#00FF46";
  var RESET_PROBABILITY = 0.975;

  var canvas = document.createElement('canvas');
  canvas.id = 'c';
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var drops = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var columns = Math.floor(canvas.width / FONT_SIZE);
    drops = [];
    for (var i = 0; i < columns; i++) {
      drops[i] = 1;
    }
  }

  function drawFrame() {
    ctx.fillStyle = 'rgba(0, 0, 0, ' + TRAIL_ALPHA + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = FONT_SIZE + 'px arial';

    for (var i = 0; i < drops.length; i++) {
      var char = CHARSET[Math.floor(Math.random() * CHARSET.length)];
      var x = i * FONT_SIZE;
      var y = drops[i] * FONT_SIZE;

      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > RESET_PROBABILITY) {
        drops[i] = 0;
      } else {
        drops[i]++;
      }
    }
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(drawFrame, DRAW_INTERVAL_MS);
})();
