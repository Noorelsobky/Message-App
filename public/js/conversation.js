const emojiToggle = document.querySelector("#emoji-toggle");
const emojiPicker = document.querySelector("#emoji-picker");
const messageInput = document.querySelector("#message-content");
const imageInput = document.querySelector("#message-image");
const imageName = document.querySelector("#selected-image-name");

const messageForm = document.querySelector("#message-form");
const messagesList = document.querySelector("#messages-list");
const sendButton = document.querySelector("#send-button");
const chatStatus = document.querySelector("#chat-status");

const conversationUserId = messageForm.action.split("/").pop();
const currentUserId = Number(messagesList.dataset.currentUserId);

// Keep the latest message visible inside the chat area.
function scrollToLatestMessage() {
  messagesList.scrollTop = messagesList.scrollHeight;
}

// Display an error or status message.
function showStatus(message = "") {
  chatStatus.textContent = message;
}

// Create message elements safely.
// We use textContent for user-written text rather than inserting HTML.
function createMessageElement(message) {
  const messageElement = document.createElement("div");

  messageElement.className =
    Number(message.senderId) === currentUserId
      ? "message message-sent"
      : "message message-received";

  messageElement.dataset.messageId = message.id;

  const username = document.createElement("strong");
  username.textContent = message.sender.username;
  messageElement.appendChild(username);

  if (message.content) {
    const content = document.createElement("p");
    content.className = "message-content";
    content.textContent = message.content;
    messageElement.appendChild(content);
  }

  if (message.imagePath) {
    const image = document.createElement("img");
    image.src = message.imagePath;
    image.alt = "Image sent in conversation";
    image.className = "message-image";
    image.loading = "lazy";
    messageElement.appendChild(image);
  }

  const timestamp = document.createElement("small");
  timestamp.className = "message-time";
  timestamp.textContent = new Date(message.createdAt).toLocaleString();
  messageElement.appendChild(timestamp);

  // Only add the delete button to our own messages.
  if (Number(message.senderId) === currentUserId) {
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-message-button";
    deleteButton.dataset.deleteMessage = message.id;
    deleteButton.setAttribute("aria-label", "Delete this message");
    deleteButton.title = "Delete message";

    deleteButton.innerHTML = `
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true">
        <path d="M3 6h18"></path>
        <path d="M8 6V4h8v2"></path>
        <path d="m19 6-1 14H6L5 6"></path>
        <path d="M10 11v5M14 11v5"></path>
      </svg>
    `;

    messageElement.appendChild(deleteButton);
  }

  return messageElement;
}

// Remove the "No messages yet" text when the first message arrives.
function removeEmptyMessageNotice() {
  const emptyNotice = document.querySelector("#empty-messages");

  if (emptyNotice) {
    emptyNotice.remove();
  }
}

// Emoji picker
emojiToggle.addEventListener("click", () => {
  emojiPicker.hidden = !emojiPicker.hidden;

  emojiToggle.setAttribute(
    "aria-expanded",
    String(!emojiPicker.hidden)
  );
});

emojiPicker.addEventListener("emoji-click", (event) => {
  const emoji = event.detail.unicode;
  const start = messageInput.selectionStart;
  const end = messageInput.selectionEnd;

  messageInput.setRangeText(emoji, start, end, "end");
  messageInput.focus();
});

document.addEventListener("click", (event) => {
  if (
    !emojiPicker.hidden &&
    !event.target.closest(".emoji-picker-wrapper")
  ) {
    emojiPicker.hidden = true;
    emojiToggle.setAttribute("aria-expanded", "false");
  }
});

// Show the selected image's filename.
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  imageName.textContent = file ? file.name : "";
});

// Send messages without reloading the page.
messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const content = messageInput.value.trim();
  const image = imageInput.files[0];

  if (!content && !image) {
    showStatus("Write a message or select an image.");
    return;
  }

  showStatus("");
  sendButton.disabled = true;

  try {
    const formData = new FormData(messageForm);

    const response = await fetch(messageForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not send the message.");
    }

    removeEmptyMessageNotice();

    const newMessage = createMessageElement(data.message);
    messagesList.appendChild(newMessage);

    // Clear the input only after the server confirms success.
    messageInput.value = "";
    imageInput.value = "";
    imageName.textContent = "";

    scrollToLatestMessage();
    messageInput.focus();
  } catch (error) {
    showStatus(error.message || "Something went wrong. Please try again.");
  } finally {
    sendButton.disabled = false;
  }
});

// Delete messages without reloading the page.
messagesList.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-message]");

  if (!deleteButton) {
    return;
  }

  const messageId = deleteButton.dataset.deleteMessage;

  if (!window.confirm("Delete this message?")) {
    return;
  }

  deleteButton.disabled = true;
  showStatus("");

  try {
    const response = await fetch(
      `/messages/${conversationUserId}/${messageId}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not delete the message.");
    }

    const messageElement = messagesList.querySelector(
      `[data-message-id="${messageId}"]`
    );

    if (messageElement) {
      messageElement.remove();
    }

    // Restore the empty state if all messages have been deleted.
    const remainingMessages = messagesList.querySelectorAll(".message");

    if (remainingMessages.length === 0) {
      const emptyNotice = document.createElement("p");
      emptyNotice.className = "empty-messages";
      emptyNotice.id = "empty-messages";
      emptyNotice.textContent = "No messages yet. Start the conversation!";
      messagesList.appendChild(emptyNotice);
    }
  } catch (error) {
    showStatus(error.message || "Something went wrong. Please try again.");
    deleteButton.disabled = false;
  }
});

// Start with the newest messages visible.
window.addEventListener("load", scrollToLatestMessage);