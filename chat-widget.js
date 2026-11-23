
/* GA CREATIVES — AI LEAD CHATBOT
   Connected to Supabase Edge Function
   Preserves existing GA Creatives chat-widget.css classes.
*/

(function () {
  "use strict";

  if (document.getElementById("ga-chat-widget")) return;

  const CHAT_ENDPOINT =
    "https://opxcipvlvdospbossyaq.supabase.co/functions/v1/ga-creatives-chat";

  const root = document.createElement("div");
  root.id = "ga-chat-widget";

  root.innerHTML = `
    <button class="ga-chat-launcher" type="button"
      aria-label="Open GA Creatives chat"
      aria-expanded="false">✦</button>

    <section class="ga-chat-panel" role="dialog"
      aria-label="GA Creatives AI Assistant"
      aria-modal="false">

      <header class="ga-chat-header">
        <div class="ga-chat-brand">
          <strong>GA CREATIVES</strong>
          <span>Your AI Project Assistant</span>
        </div>
        <button class="ga-chat-close" type="button"
          aria-label="Close chat">×</button>
      </header>

      <div class="ga-chat-messages"
        aria-live="polite" aria-relevant="additions"></div>

      <div class="ga-chat-choices"
        aria-label="Suggested answers"></div>

      <div class="ga-chat-status">
        GA Creatives AI Assistant · Online
      </div>

      <div class="ga-chat-input-area">
        <form class="ga-chat-form">
          <textarea class="ga-chat-input" rows="1"
            aria-label="Type your message"
            placeholder="Type your message..."></textarea>
          <button class="ga-chat-send" type="submit">Send</button>
        </form>

        <p class="ga-chat-note">
          Your messages are processed to generate replies.
          Contact details are saved for follow-up only with
          your explicit permission. Please don't share passwords
          or payment card information.
        </p>
      </div>
    </section>
  `;

  document.body.appendChild(root);

  const launcher = root.querySelector(".ga-chat-launcher");
  const panel = root.querySelector(".ga-chat-panel");
  const closeButton = root.querySelector(".ga-chat-close");
  const messages = root.querySelector(".ga-chat-messages");
  const choices = root.querySelector(".ga-chat-choices");
  const status = root.querySelector(".ga-chat-status");
  const form = root.querySelector(".ga-chat-form");
  const input = root.querySelector(".ga-chat-input");
  const sendButton = root.querySelector(".ga-chat-send");

  // Conversation history is kept in memory for this chat session.
  let history = [];
  let sending = false;
  let finished = false;
  let welcomed = false;

  function addMessage(text, who) {
    const bubble = document.createElement("div");

    bubble.className =
      "ga-chat-message " +
      (who === "user" ? "ga-user" : "ga-bot");

    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;

    return bubble;
  }

  function setStatus(text) {
    status.textContent = text;
  }

  function setBusy(value) {
    sending = value;
    sendButton.disabled = value;
    input.disabled = value || finished;
    sendButton.style.opacity = value ? "0.55" : "1";
    sendButton.textContent = value ? "..." : "Send";
  }

  function showChoices(options) {
    choices.innerHTML = "";

    if (!Array.isArray(options)) return;

    options.forEach(function (option) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "ga-chat-choice";
      button.textContent = option;
      button.disabled = sending || finished;

      button.addEventListener("click", function () {
        sendMessage(option);
      });

      choices.appendChild(button);
    });
  }

  function showWelcome() {
    if (welcomed) return;

    welcomed = true;

    addMessage(
      "Hello! Welcome to GA Creatives. I'm your AI project assistant. Tell me a little about your business or the creative service you're looking for, and I'll help you get started.",
      "bot"
    );

    showChoices([
      "Graphic Design",
      "Video Editing",
      "Property Marketing",
      "Social Media Design",
      "Monthly Creative Support",
      "Website Development"
    ]);
  }

  function showTyping() {
    const bubble = addMessage("Thinking...", "bot");
    bubble.classList.add("ga-chat-typing");
    return bubble;
  }

  function showLeadConfirmation() {
    addMessage(
      "Thank you! Your enquiry has been successfully recorded in the GA Creatives system. Our team can now review your project details and follow up using the contact information you provided. We appreciate your interest in GA Creatives!",
      "bot"
    );

    finished = true;
    choices.innerHTML = "";
    input.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = "Completed";
    input.placeholder = "Enquiry submitted";

    setStatus("Enquiry successfully recorded");
  }

  async function sendMessage(rawMessage) {
    const message = String(rawMessage || "").trim();

    if (!message || sending || finished) return;

    addMessage(message, "user");
    choices.innerHTML = "";
    input.value = "";
    input.style.height = "auto";

    setBusy(true);
    setStatus("GA Creatives AI is responding...");

    const typingBubble = showTyping();

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message,
          history: history.slice(-10)
        })
      });

      const result = await response.json();

      typingBubble.remove();

      if (!response.ok) {
        throw new Error(
          result.error || "The assistant is temporarily unavailable."
        );
      }

      if (!result.reply || typeof result.reply !== "string") {
        throw new Error("The assistant returned an invalid response.");
      }

      // Save both sides of the conversation for the next AI request.
      history.push({
        role: "user",
        content: message
      });

      history.push({
        role: "assistant",
        content: result.reply
      });

      // Keep the browser conversation reasonably small.
      history = history.slice(-20);

      addMessage(result.reply, "bot");

      if (result.leadSaved === true) {
        showLeadConfirmation();
      } else {
        setStatus("GA Creatives AI Assistant · Online");
      }

    } catch (error) {
      typingBubble.remove();

      console.error("GA Creatives chatbot error:", error);

      addMessage(
        "I'm sorry, but I'm having trouble connecting to our assistant right now. Please try sending your message again in a moment.",
        "bot"
      );

      setStatus("Connection issue · Please try again");

    } finally {
      setBusy(false);

      if (!finished) {
        input.focus();
      }
    }
  }

  function openChat() {
    panel.classList.add("ga-open");
    launcher.setAttribute("aria-expanded", "true");
    launcher.style.display = "none";

    showWelcome();

    input.focus();
  }

  function closeChat() {
    panel.classList.remove("ga-open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.style.display = "flex";
    launcher.focus();
  }

  launcher.addEventListener("click", openChat);
  closeButton.addEventListener("click", closeChat);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendMessage(input.value);
  });

  input.addEventListener("input", function () {
    input.style.height = "auto";
    input.style.height =
      Math.min(input.scrollHeight, 90) + "px";
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

})();
