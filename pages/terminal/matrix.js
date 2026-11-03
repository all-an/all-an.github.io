// matrix.js — Matrix digital rain backdrop rendered behind the terminal window

(function () {
    // Character pool sampled randomly for each falling glyph
    const CHARSET           = "黑客帝国abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%+-/~{[|`]}";
    const FONT_SIZE_PX      = 10;    // glyph height and column width in pixels
    const DRAW_INTERVAL_MS  = 35;    // frame interval in milliseconds (~28 fps)
    const TRAIL_ALPHA       = 0.04;  // translucent black fade per frame to leave glowing trails
    const TEXT_COLOR        = "#00FF46";
    const RESET_PROBABILITY = 0.975; // threshold above which an off-screen drop wraps to the top

    const canvas = document.createElement('canvas');
    canvas.id    = 'c';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let drops = [];

    // Recompute canvas dimensions and reset column drop positions when the viewport resizes.
    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        const columns = Math.floor(canvas.width / FONT_SIZE_PX);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
    }

    // Advance every column by one row and paint a random character at the new head position.
    function drawFrame() {
        ctx.fillStyle = 'rgba(0, 0, 0, ' + TRAIL_ALPHA + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = TEXT_COLOR;
        ctx.font      = FONT_SIZE_PX + 'px arial';

        for (let i = 0; i < drops.length; i++) {
            const char = CHARSET[Math.floor(Math.random() * CHARSET.length)];
            const x    = i * FONT_SIZE_PX;
            const y    = drops[i] * FONT_SIZE_PX;

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
