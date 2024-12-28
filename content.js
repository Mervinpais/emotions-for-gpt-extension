// Regex to match allowed domains
const allowedDomains = /^(.*\.)?(chat\.openai\.com|chatgpt\.com)$/i;

// Check the current domain
if (allowedDomains.test(window.location.hostname)) {
  // Ensure the script only runs once
  if (!document.querySelector(".emotion-overlay")) {
    // Create an image element
    const img = document.createElement("img");
    img.src = browser.runtime.getURL("images/default.png"); // Path to the default image
    img.alt = "Emotion Not Detected";
    img.className = "emotion-overlay"; // Add a class for styling

    // Append the image to the body
    document.body.appendChild(img);
  }
}
