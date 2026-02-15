(() => {
  const copyButton = document.getElementById('iws-copy-phone');
  const copyStatus = document.getElementById('iws-copy-status');
  const placeholderPhone = '(555) 555-5555';
  let resetTimer;

  if (!copyButton || !copyStatus) {
    return;
  }

  const setStatus = (message) => {
    copyStatus.textContent = message;
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      copyStatus.textContent = '';
    }, 1200);
  };

  const fallbackCopy = (value) => {
    const tempInput = document.createElement('textarea');
    tempInput.value = value;
    tempInput.setAttribute('readonly', '');
    tempInput.style.position = 'fixed';
    tempInput.style.top = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.focus();
    tempInput.select();

    let copied = false;

    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }

    document.body.removeChild(tempInput);
    return copied;
  };

  copyButton.addEventListener('click', async () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(placeholderPhone);
        setStatus('Copied');
        return;
      } catch {
      }
    }

    if (fallbackCopy(placeholderPhone)) {
      setStatus('Copied');
      return;
    }

    setStatus('Copy failed');
  });
})();
