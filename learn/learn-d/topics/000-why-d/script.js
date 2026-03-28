// Wires all .copy-btn elements to copy the target <pre> text to the clipboard.
// Shows "copied" for 1.8 s then reverts to "copy".
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const pre = document.getElementById(btn.dataset.target);
        navigator.clipboard.writeText(pre.innerText).then(() => {
            btn.textContent = 'copied';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = 'copy';
                btn.classList.remove('copied');
            }, 1800);
        });
    });
});
