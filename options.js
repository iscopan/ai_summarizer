const apiKeyInput = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const statusDiv = document.getElementById('status');

// Load the saved key when the page opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['apiKey'], (result) => {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey; // We show the key (consider security if you prefer not to show it)
      // You could show asterisks or a "Key saved" message instead of the actual value
    }
  });
});

// Save the key when the button is clicked
saveBtn.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    chrome.storage.local.set({ apiKey: apiKey }, () => {
      statusDiv.textContent = 'API Key saved successfully!';
      setTimeout(() => { statusDiv.textContent = ''; }, 3000); // Clear message after 3 seconds
    });
  } else {
    // Optional: Delete the key if the field is empty
    chrome.storage.local.remove('apiKey', () => {
       statusDiv.textContent = 'API Key removed.';
       setTimeout(() => { statusDiv.textContent = ''; }, 3000);
    });
  }
});
