/* GA Creatives Lead Chat Widget — starter version
   This version runs in the browser only. It does NOT call an AI service
   and does NOT save or transmit lead information. It lets a visitor prepare
   and copy a project brief. A secure backend will be added in a later step. */

(function () {
  "use strict";

  if (document.getElementById("ga-chat-widget")) return;

  const root = document.createElement("div");
  root.id = "ga-chat-widget";
  root.innerHTML = `
    <button class="ga-chat-launcher" type="button" aria-label="Open GA Creatives chat" aria-expanded="false">✦</button>
    <section class="ga-chat-panel" role="dialog" aria-label="GA Creatives project enquiry" aria-modal="false">
      <header class="ga-chat-header">
        <div class="ga-chat-brand">
          <strong>GA CREATIVES</strong>
          <span>Let's talk about your next project</span>
        </div>
        <button class="ga-chat-close" type="button" aria-label="Close chat">×</button>
      </header>
      <div class="ga-chat-messages" aria-live="polite" aria-relevant="additions"></div>
      <div class="ga-chat-choices" aria-label="Suggested answers"></div>
      <div class="ga-chat-status">Project enquiry assistant · Preview version</div>
      <div class="ga-chat-input-area">
        <form class="ga-chat-form">
          <textarea class="ga-chat-input" rows="1" aria-label="Type your answer" placeholder="Type your answer..."></textarea>
          <button class="ga-chat-send" type="submit">Send</button>
        </form>
        <p class="ga-chat-note">Please don't share passwords or sensitive financial information. Your answers stay in this browser preview and are not submitted.</p>
      </div>
    </section>
  `;

  document.body.appendChild(root);

  const launcher = root.querySelector(".ga-chat-launcher");
  const panel = root.querySelector(".ga-chat-panel");
  const closeButton = root.querySelector(".ga-chat-close");
  const messages = root.querySelector(".ga-chat-messages");
  const choices = root.querySelector(".ga-chat-choices");
  const form = root.querySelector(".ga-chat-form");
  const input = root.querySelector(".ga-chat-input");

  const lead = {
    service: "",
    business: "",
    details: "",
    timeline: "",
    budget: "",
    name: "",
    email: "",
    phone: "",
    ongoingSupport: ""
  };

  let step = "service";
  let finished = false;

  const prompts = {
    service: {
      text: "Hello! Welcome to GA Creatives. I can help organise your project enquiry. What service are you interested in?",
      options: ["Graphic Design", "Video Editing", "Property Marketing", "Social Media Design", "Monthly Creative Support", "Not sure yet"]
    },
    business: {
      text: "Great. What is your business or project name? If you don't have one yet, you can type “Not decided”."
    },
    details: {
      text: "Please briefly describe what you need us to create. What is the goal of the project?"
    },
    timeline: {
      text: "When would you ideally like the project to start or be completed?",
      options: ["As soon as possible", "Within 1–2 weeks", "Within a month", "Flexible / still planning"]
    },
    budget: {
      text: "Do you have an estimated budget range? This helps us understand the scope. You can also choose “Need guidance”.",
      options: ["Under US$250", "US$250–500", "US$500–1,000", "US$1,000+", "Need guidance"]
    },
    name: {
      text: "Thanks. What is your name?"
    },
    email: {
      text: "What is the best email address to reach you?"
    },
    phone: {
      text: "Would you like to share a phone or WhatsApp number? You can type “Skip” if you prefer email."
    },
    ongoingSupport: {
      text: "One last question: are you also interested in ongoing monthly creative support?",
      options: ["Yes", "Maybe — tell me more", "No, one project only"]
    }
  };

  function addMessage(text, who) {
    const bubble = document.createElement("div");
    bubble.className = "ga-chat-message " + (who === "user" ? "ga-user" : "ga-bot");
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function showChoices(options) {
    choices.innerHTML = "";
    (options || []).forEach(function (option) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ga-chat-choice";
      button.textContent = option;
      button.addEventListener("click", function () {
        handleAnswer(option);
      });
      choices.appendChild(button);
    });
  }

  function ask(currentStep) {
    const prompt = prompts[currentStep];
    if (!prompt) return;
    addMessage(prompt.text, "bot");
    showChoices(prompt.options || []);
    input.placeholder = currentStep === "details" ? "Describe your project..." : "Type your answer...";
    input.focus();
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function handleAnswer(rawAnswer) {
    const answer = String(rawAnswer || "").trim();
    if (!answer || finished) return;

    if (step === "email" && !validEmail(answer)) {
      addMessage("That email address doesn't look quite right. Please check it and try again.", "bot");
      return;
    }

    addMessage(answer, "user");
    choices.innerHTML = "";

    if (step === "service") lead.service = answer;
    else if (step === "business") lead.business = answer;
    else if (step === "details") lead.details = answer;
    else if (step === "timeline") lead.timeline = answer;
    else if (step === "budget") lead.budget = answer;
    else if (step === "name") lead.name = answer;
    else if (step === "email") lead.email = answer;
    else if (step === "phone") lead.phone = answer.toLowerCase() === "skip" ? "Not provided" : answer;
    else if (step === "ongoingSupport") lead.ongoingSupport = answer;

    const order = ["service", "business", "details", "timeline", "budget", "name", "email", "phone", "ongoingSupport"];
    const index = order.indexOf(step);

    if (index < order.length - 1) {
      step = order[index + 1];
      window.setTimeout(function () { ask(step); }, 180);
    } else {
      finishConversation();
    }
  }

  function createBrief() {
    return [
      "GA CREATIVES — PROJECT ENQUIRY",
      "--------------------------------",
      "Service: " + lead.service,
      "Business / project: " + lead.business,
      "Project details: " + lead.details,
      "Timeline: " + lead.timeline,
      "Estimated budget: " + lead.budget,
      "Contact name: " + lead.name,
      "Email: " + lead.email,
      "Phone / WhatsApp: " + lead.phone,
      "Monthly support: " + lead.ongoingSupport
    ].join("\n");
  }

  function finishConversation() {
    finished = true;
    addMessage("Thank you, " + lead.name + "! Your project brief is ready. This preview does not send your details to GA Creatives yet. You can copy the brief below and send it through the website contact form or email amorgamboa1@gmail.com.", "bot");

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "ga-chat-copy";
    copyButton.textContent = "Copy project brief";
    copyButton.addEventListener("click", async function () {
      const brief = createBrief();
      try {
        await navigator.clipboard.writeText(brief);
        copyButton.textContent = "Brief copied!";
      } catch (error) {
        const temporary = document.createElement("textarea");
        temporary.value = brief;
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.appendChild(temporary);
        temporary.select();
        try {
          document.execCommand("copy");
          copyButton.textContent = "Brief copied!";
        } catch (copyError) {
          copyButton.textContent = "Copy unavailable — please select the text manually";
        }
        temporary.remove();
      }
    });
    messages.appendChild(copyButton);
    messages.scrollTop = messages.scrollHeight;
    input.disabled = true;
    input.placeholder = "Enquiry preview complete";
    form.querySelector("button").disabled = true;
    form.querySelector("button").style.opacity = "0.55";
  }

  function openChat() {
    panel.classList.add("ga-open");
    launcher.setAttribute("aria-expanded", "true");
    launcher.style.display = "none";
    if (messages.childElementCount === 0) ask(step);
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
    const answer = input.value.trim();
    if (!answer) return;
    input.value = "";
    input.style.height = "auto";
    handleAnswer(answer);
  });

  input.addEventListener("input", function () {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 90) + "px";
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
})();
