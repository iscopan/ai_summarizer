const summarizeBtn = document.getElementById('summarizeBtn');
const statusDiv = document.getElementById('status');
const summaryDiv = document.getElementById('summary');

// Check for API key when the popup loads
document.addEventListener('DOMContentLoaded', () => {
  // Use chrome.storage.local to match where options.js saves the key
  chrome.storage.local.get(['apiKey'], (result) => {
    if (result.apiKey) {
      // API Key exists: Ensure button is enabled and status is clear
      statusDiv.textContent = ''; // Clear any potential message
      summarizeBtn.disabled = false;
      summarizeBtn.style.backgroundColor = ''; // Reset to default CSS color
      summarizeBtn.style.cursor = 'pointer';
    } else {
      // API Key missing: Show message, disable and grey out button
      statusDiv.innerHTML = `API key not set. Please <a href="#" id="optionsLink">configure it</a>.`;
      const optionsLink = document.getElementById('optionsLink');
      if (optionsLink) {
        optionsLink.addEventListener('click', (e) => {
          e.preventDefault();
          chrome.runtime.openOptionsPage();
        });
      }
      summarizeBtn.disabled = true;
      summarizeBtn.style.backgroundColor = '#cccccc'; // Grey color
      summarizeBtn.style.cursor = 'not-allowed';
    }
  });
});

// Función para extraer el contenido (se ejecutará en el contexto de la página)
function extractPageContent() {
  // Intenta obtener el contenido principal, si no, usa el cuerpo entero
  // Puedes mejorar esto buscando etiquetas específicas como <article>, <main>
  // O usando librerías como Readability.js (más complejo de integrar)
  const mainContent = document.querySelector('main') || document.querySelector('article') || document.body;
  return mainContent.innerText;
}

summarizeBtn.addEventListener('click', () => {
  statusDiv.textContent = 'Extracting content...';
  summaryDiv.textContent = ''; // Clear previous summary

  // Get the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
        statusDiv.textContent = 'Error: Active tab not found.';
        return;
    }
    const tabId = tabs[0].id;

    // Inyectar y ejecutar la función para extraer contenido
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        function: extractPageContent,
      },
      (injectionResults) => {
        // Check for injection errors
        if (chrome.runtime.lastError || !injectionResults || injectionResults.length === 0) {
          statusDiv.textContent = `Error extracting: ${chrome.runtime.lastError?.message || 'Unexpected result'}`;
          console.error("Injection error or no results:", chrome.runtime.lastError, injectionResults);
          return;
        }

        // The result is in injectionResults[0].result
        if (injectionResults[0].result) {
          const pageText = injectionResults[0].result;
          statusDiv.textContent = 'Sending to AI for summary...';

          // Send the text to the background script to process with the API
          chrome.runtime.sendMessage(
            { action: "summarize", text: pageText },
            (response) => {
              if (chrome.runtime.lastError) {
                  // Error communicating with the background script
                  statusDiv.textContent = `Communication error: ${chrome.runtime.lastError.message}`;
                  console.error("Message sending error:", chrome.runtime.lastError);
                  return;
              }

              // Process response from background script
              if (response && response.summary) {
                statusDiv.textContent = 'Summary completed:';
                summaryDiv.textContent = response.summary;
              } else if (response && response.error) {
                 statusDiv.textContent = `Error: ${response.error}`;
                 // Suggest configuring the API key if that is the error
                 if (response.error.includes("API key")) {
                    statusDiv.innerHTML += ` <a href="#" id="openOptionsLink">Configure API Key</a>`;
                    document.getElementById('openOptionsLink')?.addEventListener('click', (e) => {
                        e.preventDefault();
                        chrome.runtime.openOptionsPage();
                    });
                 }
              } else {
                  statusDiv.textContent = 'Error: Unexpected response from background script.';
                  console.error("Unexpected response:", response);
              }
            }
          );
        } else {
          statusDiv.textContent = 'Could not extract content from the page.';
        }
      }
    );
  });
});
