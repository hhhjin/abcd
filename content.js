// Detect all inputs and textareas on web pages and capture submit events

(function() {
  'use strict';

  // Check if already initialized
  if (window.translationExtensionInitialized) {
    return;
  }
  window.translationExtensionInitialized = true;

  // Form submit event listener
  function handleFormSubmit(event) {
    const form = event.target;
    console.log('Form submitted', form);
    const inputs = form.querySelectorAll('input[type="text"], input[type="search"], textarea');
    
    inputs.forEach(input => {
      const value = input.value.trim();
      if (value) {
        console.log('Sending message to background script');
        // Send message to background script
        chrome.runtime.sendMessage({
          type: 'TRANSLATE_TEXT',
          text: value
        });
      }
    });
  }

  // Detect Enter key submission
  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      const target = event.target;
      console.log('Key down', target);
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const value = target.value.trim();
        console.log('Value', value);
        if (value) {
          console.log('Sending message to background script');
          // Add slight delay to capture before actual submit
          setTimeout(() => {
            chrome.runtime.sendMessage({
              type: 'TRANSLATE_TEXT',
              text: value
            });
          }, 100);
        }
      } else if (target.isContentEditable) {
        const value = target.textContent.trim();
        console.log('Value', value);
        if (value) {
          console.log('Sending message to background script');
          // Add slight delay to capture before actual submit
          setTimeout(() => {
            chrome.runtime.sendMessage({
              type: 'TRANSLATE_TEXT',
              text: value
            });
          }, 100);
        }
      }
    }
  }

  // Add event listeners to all forms on the page
  function attachListeners() {
    // Existing forms
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
    });

    // MutationObserver for dynamically added forms
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'FORM') {
              node.addEventListener('submit', handleFormSubmit);
            }
            // Also detect inputs added inside forms
            node.querySelectorAll?.('form').forEach(form => {
              form.addEventListener('submit', handleFormSubmit);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Enter key event listener
    document.addEventListener('keydown', handleKeyDown, true);
  }

  // Add listeners when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setTimeout(attachListeners, 1000));
  } else {
    setTimeout(attachListeners, 1000);
  }
})();

