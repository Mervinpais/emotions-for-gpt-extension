// contentScript.js

(function() {
console.log("Extension loaded, about to set watchers and background!");
// Mapping of keywords to image file names in the /images folder
// Feel free to expand this table as needed.
const EMOTION_MAP = {
    sob: "sob.png",
    anger: "anger.png",
    curious: "curious.png",
    happy: "happy.png",
    love: "love.png",
    mondo: "mondo.png",
    scared: "scared.png",
    shock: "shock.png",
    worried: "worried.png"
};

// Default image filename
const DEFAULT_IMAGE = "default.png";

// The ID for the banner element in the ChatGPT HTML
// (In your provided HTML, there's an element: <div id="emotion-banner">)
const BANNER_ID = "emotion-banner";

/**
 * Extracts the first sentence from text.
 * We split by '.' or '?' or '!' – whichever first is found, just as an example.
 * You can refine how you parse “first sentence”.
 */
function getFirstSentence(text) {
    if (!text) return "";
    // A crude approach: check for common sentence-ending punctuation
    const match = text.match(/^.*?[.!?]/);
    if (match) {
    return match[0].trim().toLowerCase();
    }
    // if no punctuation found, just return the entire text (lowercased)
    return text.trim().toLowerCase();
}

/**
 * Check if any of our known keywords is in the sentence.
 */
function detectEmotion(firstSentence) {
    // Look through the EMOTION_MAP keys and see if the first sentence has that word
    for (const key of Object.keys(EMOTION_MAP)) {
    // We do a simple indexOf check or includes
    if (firstSentence.includes(key)) {
        return EMOTION_MAP[key];
    }
    }
    return DEFAULT_IMAGE;
}

/**
 * Updates the #emotion-banner element's background-image URL
 */
function setBannerImage(filename) {
    const bannerEl = document.getElementById(BANNER_ID);
    if (!bannerEl) return;
    // Construct extension-based URL
    // "moz-extension://" is the scheme, but the actual ID 
    // is appended automatically. We can do relative path from the extension root:
    const url = browser.runtime.getURL(`images/${filename}`);
    bannerEl.style.backgroundImage = `url("${url}")`;
}

/**
 * Observe new assistant messages
 */
function watchAssistantReplies() {
    // We'll watch the entire document for new <article data-message-author-role="assistant">
    const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // 1 = Element
            const el = node;
            if (
                el.tagName === "ARTICLE" &&
                el.getAttribute("data-message-author-role") === "assistant"
            ) {
                // Grab the message text
                const messageText = el.innerText || "";
                // Extract the first sentence
                const firstSentence = getFirstSentence(messageText);
                // Determine the correct image
                const imageFilename = detectEmotion(firstSentence);
                // Set the banner image
                setBannerImage(imageFilename);
            }
            }
        });
        }
    }
    });

    observer.observe(document.documentElement, {
    childList: true,
    subtree: true
    });
}

// Immediately apply a custom background to the entire ChatGPT interface
// so we can confirm the extension is active.
(function setCustomBackground() {
    const noiseUrl = browser.runtime.getURL("images/noise.png");
    // Using document.documentElement or document.body, whichever you prefer
    document.documentElement.style.backgroundImage = `url("${noiseUrl}")`;
    document.documentElement.style.backgroundSize = "cover";
    document.documentElement.style.backgroundRepeat = "no-repeat";
})();

// Start the main logic as soon as possible
watchAssistantReplies();
})();
