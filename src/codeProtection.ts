// Code protection - disable right-click context menu and common copy shortcuts
(function() {
  // Disable right-click context menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Disable common keyboard shortcuts for viewing source/dev tools
  document.addEventListener('keydown', function(e) {
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    // Ctrl+S (Save)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I (Dev Tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
  });

  // Disable text selection on the page (except inputs/textareas)
  document.addEventListener('selectstart', function(e) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // Disable drag
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  });
})();
