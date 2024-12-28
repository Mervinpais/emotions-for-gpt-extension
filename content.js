// Regex matching chat.openai.com or chatgpt.com
const allowedDomains = /^(.*\.)?(chat\.openai\.com|chatgpt\.com)$/i;

// Current displayed emotion image filename
let currentEmotion = "default.gif";

/**
 * A small helper to get the file name for the detected emotion in the latest message.
 * Returns "default.gif" if no known emotion is found.
 */
function detectEmotion() {
  const chatMessages = document.querySelectorAll(".markdown");
  if (!chatMessages.length) return "default.gif";

  // Get the text of the most recent ChatGPT reply
  const latestMessage = chatMessages[chatMessages.length - 1];
  const text = (latestMessage.textContent || "").toLowerCase();

  // Simple mapping
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
  };

  for (const keyword in emotionMappings) {
    if (text.includes(keyword)) {
      return emotionMappings[keyword];
    }
  }
  return "default.gif";
}

/**
 * Transition from the current image -> default.gif -> newEmotion,
 * with a short delay if we want an immediate/snappy effect.
 * 
 * @param {string} newEmotion  The filename of the new emotion
 * @param {number} delay       Delay in ms before showing the new emotion
 */
function transitionEmotion(newEmotion, delay = 200) {
  const overlayImg = document.querySelector(".emotion-image");
  if (!overlayImg) return;

  // Step 1: Immediately show default.gif
  overlayImg.src = browser.runtime.getURL("images/default.gif");

  // Step 2: After 'delay' ms, show the new emotion
  setTimeout(() => {
    overlayImg.src = browser.runtime.getURL(`images/${newEmotion}`);
    currentEmotion = newEmotion;
  }, delay);
}

/**
 * Called whenever we suspect a new message has appeared.
 * If there's a newly detected emotion, we transition immediately.
 */
function checkForNewEmotion() {
  const latestDetected = detectEmotion();
  if (latestDetected !== currentEmotion) {
    // Quick transition
    transitionEmotion(latestDetected, 200);
  }
}

/**
 * Every 4 seconds, do:
 *   1) Check if there's a newly detected emotion -> immediate transition if found
 *   2) If after that, we're still on a custom emotion (not default.gif),
 *      do a short "blip" ( default.gif -> currentEmotion ) with a slower transition.
 */
function periodicBlip() {
  // 1) Re-check for a new emotion right now
  const latestDetected = detectEmotion();
  if (latestDetected !== currentEmotion) {
    // If something new is found, do an immediate 200ms transition
    transitionEmotion(latestDetected, 200);
    return;
  }

  // 2) If we remain on a non-default emotion, do the "blip"
  if (currentEmotion !== "default.gif") {
    // Slightly longer 1s transition for the periodic effect
    transitionEmotion(currentEmotion, 1000);
  }
}

if (allowedDomains.test(window.location.hostname)) {

  // Inject only once
  if (!document.querySelector(".emotion-overlay")) {
    const container = document.createElement("div");
    container.className = "emotion-overlay";

    const img = document.createElement("img");
    img.src = browser.runtime.getURL("images/default.gif");
    img.alt = "Emotion Overlay";
    img.className = "emotion-image";

    container.appendChild(img);
    document.body.appendChild(container);
  }

  // Watch for new messages
  const observer = new MutationObserver(() => {
    checkForNewEmotion();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial check
  checkForNewEmotion();

  // Periodic 4-second cycle
  setInterval(periodicBlip, 4000);
}
