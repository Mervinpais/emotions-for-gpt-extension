// Regex to match allowed domains: chat.openai.com or chatgpt.com
const allowedDomains = /^(.*\.)?(chat\.openai\.com|chatgpt\.com)$/i;

// Only run if we're on an allowed domain
if (allowedDomains.test(window.location.hostname)) {

  // Ensure the script only runs once
  if (!document.querySelector(".emotion-overlay")) {
    // Create the overlay container
    const container = document.createElement("div");
    container.className = "emotion-overlay";

    // Create the image element
    const img = document.createElement("img");
    img.src = browser.runtime.getURL("images/default.png");
    img.alt = "Emotion Not Detected";
    img.className = "emotion-image";

    container.appendChild(img);
    document.body.appendChild(container);
  }

  // Define mappings from keywords to image filenames
  const emotionMappings = {
    sob: "sob.png",
    anger: "anger.png",
    happy: "happy.png",
    love: "love.png",
    mondo: "mondo.png",
    scared: "scared.png",
    shock: "shock.png",
    worried: "worried.png",
    curious: "curious.png",
    // Add more if needed...
  };

  /**
   * Get the first sentence of the latest ChatGPT reply.
   */
  function getLatestReplyFirstSentence() {
    // Get all ChatGPT reply containers
    const chatMessages = document.querySelectorAll(".markdown");
    if (!chatMessages.length) return null;

    // Get the last message
    const latestMessage = chatMessages[chatMessages.length - 1];

    // Extract its text content
    const textContent = latestMessage.textContent.trim();
    if (!textContent) return null;

    // Split into sentences, use the first one
    // This is a naive approach that splits on '.' or '!' or '?'
    const firstSentenceMatch = textContent.match(/[^.?!]+[.?!]/);
    if (!firstSentenceMatch) return null;

    return firstSentenceMatch[0].toLowerCase(); // Convert to lower for matching
  }

  /**
   * Check the first sentence for known keywords
   * and update the overlay image if matched.
   */
  function updateEmotionOverlay() {
    const firstSentence = getLatestReplyFirstSentence();
    if (!firstSentence) return;

    let matchedImage = "default.png";

    // Loop through our emotion mapping
    for (let keyword in emotionMappings) {
      if (firstSentence.includes(keyword)) {
        matchedImage = emotionMappings[keyword];
        break;
      }
    }

    // Update the existing overlay image source
    const overlayImg = document.querySelector(".emotion-image");
    if (overlayImg) {
      overlayImg.src = browser.runtime.getURL(`images/${matchedImage}`);
    }
  }

  // MutationObserver to monitor new messages
  const observer = new MutationObserver(() => {
    updateEmotionOverlay();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Check once on initial load
  updateEmotionOverlay();
}
