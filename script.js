// Function to save the API key to localStorage
function saveApiKey() {
    const apiKeyInput = document.getElementById('apiKey');
    if (apiKeyInput) {
        localStorage.setItem('geminiApiKey', apiKeyInput.value);
        alert('API Key saved!'); // Optional: Provide user feedback
    }
}

// Function to load the API key from localStorage and set it in the input field
function loadApiKey() {
    const apiKeyInput = document.getElementById('apiKey');
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (apiKeyInput && savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
}

// Function for the Gemini API call
async function callGeminiApi(apiKey, modelId, prompt) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }]
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API Error Response:', data);
            let errorMsg = `API Error: ${response.status} ${response.statusText}`;
            if (data && data.error && data.error.message) {
                errorMsg += ` - ${data.error.message}`;
            }
            throw new Error(errorMsg);
        }

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            console.error('Invalid API response structure:', data);
            throw new Error('API Error: Unexpected response structure from Gemini API.');
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Error in callGeminiApi:", error);
        // Re-throw the error to be caught by the caller
        throw error;
    }
}

// Event listener for the "Save Key" button
const saveApiKeyButton = document.getElementById('saveApiKey');
if (saveApiKeyButton) {
    saveApiKeyButton.addEventListener('click', saveApiKey);
}

// Event listener for the "Submit Prompt" button
const submitPromptButton = document.getElementById('submitPrompt');
if (submitPromptButton) {
    submitPromptButton.addEventListener('click', async () => {
        const apiKey = localStorage.getItem('geminiApiKey');
        const modelPicker = document.getElementById('modelPicker');
        const promptInput = document.getElementById('promptInput');
        const responseArea = document.getElementById('responseArea');

        if (!responseArea) {
            console.error("Response area element not found.");
            return;
        }
        if (!apiKey) {
            responseArea.textContent = 'API Key not set. Please save your API key.';
            return;
        }

        if (!modelPicker || !promptInput) {
            console.error("One or more elements (modelPicker, promptInput) not found.");
            responseArea.textContent = 'Error: UI elements missing.';
            return;
        }
        
        const modelId = modelPicker.value;
        const promptText = promptInput.value;

        if (!promptText.trim()) {
            responseArea.textContent = 'Please enter a prompt.';
            return;
        }

        responseArea.textContent = 'Generating response...';

        try {
            console.log("Calling Gemini API with Key:", apiKey ? 'Exists' : 'Missing', "Model:", modelId, "Prompt:", promptText);
            const responseText = await callGeminiApi(apiKey, modelId, promptText);
            responseArea.textContent = responseText;
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            responseArea.textContent = 'Error: ' + error.message;
        }
    });
}

// Load the API key when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadApiKey);
