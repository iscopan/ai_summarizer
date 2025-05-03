// --- Settings ---
// CHANGE THIS TO YOUR REAL API URL!
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';
const AI_MODEL = 'gemini-2.0-flash'; // Or 'gemini-1.0-pro', 'gemini-pro', etc.
const API_ACTION = ':generateContent'; // API Action

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    // Retrieve the saved API Key
    chrome.storage.local.get(['apiKey'], async (result) => {
      const apiKey = result.apiKey;

      if (!apiKey) {
        console.error("Background: API Key not found.");
        sendResponse({ error: "API key not configured. Please set it in the extension options." });
        return; // Exit if no key
      }

      // Text received from the popup
      const textToSummarize = request.text;

      // Call the function that interacts with the API
      try {
        const summary = await callAI_API(textToSummarize, apiKey);
        sendResponse({ summary: summary });
      } catch (error) {
        console.error("Background: Error calling AI API:", error);
        sendResponse({ error: error.message || "Unknown error contacting the API." });
      }
    });

    // IMPORTANT! Return true to indicate that sendResponse will be called asynchronously
    return true;
  }
  // You can handle other message types here if needed
});

// Function to call the AI API (Example with OpenAI Chat Completions)
// --- MODIFIED FUNCTION to call the Gemini API ---
async function callAI_API(text, apiKey) {
    // Build the full URL with the API key as a parameter
    const fullApiUrl = `${API_BASE_URL}${AI_MODEL}${API_ACTION}?key=${apiKey}`;

    // Limit text length (also important for Gemini)
    const MAX_TEXT_LENGTH = 15000; // Gemini can handle more, but it's still good to limit. Adjust as needed!
                                  // Consider the input token limits of the specific model.
    const truncatedText = text.length > MAX_TEXT_LENGTH ? text.substring(0, MAX_TEXT_LENGTH) + "..." : text;

    // Create the prompt for Gemini
    const prompt = `You are an expert assistant in summarizing web page content. Provide a concise and clear summary of the following text on the original languaje of it:\n\n"${truncatedText}"`;

    // Create the request body according to the Gemini format
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      // Optional: Generation settings (adjust as needed)
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 256, // Limit the summary length (in tokens)
        // topK: 40,          // Other possible settings
        // topP: 0.95,
      },
      // Optional: Safety settings (you can adjust these if necessary)
      // safetySettings: [
      //   { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      //   { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      //   { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      //   { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
      // ]
    };

    try {
      const response = await fetch(fullApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // NO 'Authorization' header needed here for Gemini
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json(); // Always try to parse JSON

      if (!response.ok) {
        // Handle specific Google API errors if available
        let errorDetails = `HTTP Error ${response.status}: ${response.statusText}`;
        if (responseData && responseData.error && responseData.error.message) {
            errorDetails += ` - ${responseData.error.message}`;
        } else {
            errorDetails += ` - ${JSON.stringify(responseData)}`;
        }
        console.error("Gemini API Error Response:", errorDetails, responseData);
        // Try to give a useful message to the user
        let userMessage = `API Error (${response.status}).`;
        if (responseData.error?.message.includes("API key not valid")) {
            userMessage += " The API Key is invalid or misconfigured.";
        } else {
            userMessage += " Check the background console for more details.";
        }
        throw new Error(userMessage);
      }

      // Extract the summary from the Gemini response
      // The structure is usually: responseData.candidates[0].content.parts[0].text
      if (responseData.candidates && responseData.candidates.length > 0 &&
          responseData.candidates[0].content &&
          responseData.candidates[0].content.parts && responseData.candidates[0].content.parts.length > 0 &&
          responseData.candidates[0].content.parts[0].text)
      {
         return responseData.candidates[0].content.parts[0].text.trim();
      } else {
         // Handle cases where the response is valid (200 OK) but contains no text
         // (e.g., blocked by safety, empty response)
         let reason = "Unexpected or empty response from API.";
         if (responseData.promptFeedback && responseData.promptFeedback.blockReason) {
             reason = `Content blocked by API: ${responseData.promptFeedback.blockReason}`;
             if (responseData.promptFeedback.safetyRatings) {
                 reason += ` Ratings: ${JSON.stringify(responseData.promptFeedback.safetyRatings)}`;
             }
         } else if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].finishReason) {
              reason = `Finish reason: ${responseData.candidates[0].finishReason}`;
         }
         console.error("Gemini response without expected content:", reason, JSON.stringify(responseData, null, 2));
         throw new Error(`Could not extract summary. ${reason}`);
      }

    } catch (error) {
      console.error("Error in fetch or Gemini processing:", error);
      // Re-throw the error so it's caught in the message listener
      // Make sure the message is useful for the end user
      throw new Error(error.message || "Unknown error contacting the Gemini API.");
    }
  }

// Optional: Listen for when the extension is installed to open the options page
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});
