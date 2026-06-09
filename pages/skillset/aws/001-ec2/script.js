// EC2 page — copy-to-clipboard for each command block.
//
// Every command box has a "Copy" button. Clicking it copies the command text
// (the <pre> next to the button) to the clipboard and briefly confirms.

// Wires up one copy button: copy its sibling <pre>'s text, then flash "Copied".
function wireCopyButton(button) {
  button.addEventListener('click', async () => {
    const command = button.parentElement.querySelector('pre').textContent;
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      // Clipboard API needs a secure context (https/localhost); fall back to a
      // hidden textarea + execCommand so copying still works when opened as a
      // local file.
      const scratch = document.createElement('textarea');
      scratch.value = command;
      document.body.appendChild(scratch);
      scratch.select();
      document.execCommand('copy');
      scratch.remove();
    }
    // Confirm visually, then revert after a moment.
    button.textContent = 'Copied';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = 'Copy';
      button.classList.remove('copied');
    }, 1400);
  });
}

document.querySelectorAll('.copy-btn').forEach(wireCopyButton);
