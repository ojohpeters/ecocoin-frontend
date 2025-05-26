// Utility function to copy text to clipboard
export async function copyToClipboard(text) {
  try {
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand("copy")
    document.body.removeChild(textArea)

    if (successful) {
      return true
    } else {
      throw new Error("Copy command failed")
    }
  } catch (err) {
    console.error("Failed to copy text to clipboard:", err)
    throw new Error("Failed to copy to clipboard")
  }
}

// Function to check if clipboard API is available
export function isClipboardSupported() {
  return !!(navigator.clipboard || document.execCommand)
}

// Function to copy with fallback and user feedback
export async function copyWithFeedback(text, successCallback, errorCallback) {
  try {
    await copyToClipboard(text)
    if (successCallback) successCallback()
  } catch (err) {
    if (errorCallback) errorCallback(err)
  }
}
