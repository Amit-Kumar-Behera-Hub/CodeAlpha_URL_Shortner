const form = document.querySelector("#shorten-form");
const urlInput = document.querySelector("#url");
const submitButton = document.querySelector("#submit-button");
const result = document.querySelector("#result");
const shortUrlLink = document.querySelector("#short-url");
const copyButton = document.querySelector("#copy-button");
const message = document.querySelector("#message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  result.hidden = true;
  submitButton.disabled = true;
  submitButton.textContent = "Shortening…";

  try {
    const response = await fetch("/api/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: urlInput.value })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not shorten this URL.");
    }

    shortUrlLink.href = data.shortUrl;
    shortUrlLink.textContent = data.shortUrl;
    result.hidden = false;
  } catch (error) {
    message.textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Shorten link";
  }
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shortUrlLink.href);
    copyButton.textContent = "Copied!";
    window.setTimeout(() => {
      copyButton.textContent = "Copy";
    }, 1600);
  } catch {
    message.textContent = "Copy failed. Select and copy the link instead.";
  }
});
