document.addEventListener("DOMContentLoaded", () => {
    const aiBox = document.getElementById("ai-assistant");
    const aiIcon = document.getElementById("ai-icon");
    const aiInput = document.getElementById("ai-input");
    const aiMessages = document.getElementById("ai-messages");
    const closeBtn = document.getElementById('close-btn');
    const submitBtn = document.getElementById('submit-btn');

  
    // Show assistant if enabled
    if (localStorage.getItem("aiActive") !== "false") {
      aiBox.style.display = "block";
      const greeting = "Hello! I'm TechZonn. How can I help you navigate this site today?";
      speak(greeting);
      addMessage("TechZonn", greeting);
    }
  
    aiIcon.addEventListener("click", () => {
      aiBox.style.display = aiBox.style.display === "none" ? "block" : "none";
    });
  
    aiInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && aiInput.value.trim()) {
        const userInput = aiInput.value.trim();
        aiInput.value = "";
        addMessage("You", userInput);
  
        if (/services?/i.test(userInput)) {
          window.location.href = "#services";
          const msg = "Sure! We offer Web Development, Hosting, SEO, Systems, and Domains.";
          speak(msg);
          addMessage("TechZonn", msg);
        } else if (/contact|form/i.test(userInput)) {
          window.location.href = "#contact";
          const msg = "Here is the contact form. Please fill it in carefully.";
          speak(msg);
          addMessage("TechZonn", msg);
        } else if (/deactivate/i.test(userInput)) {
          localStorage.setItem("aiActive", "false");
          aiBox.style.display = "none";
          const msg = "TechZonn has been deactivated. Have a great time browsing!";
          speak(msg);
          addMessage("TechZonn", msg);
        } else {
          fetch("ai_Assistant.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: userInput })
          })
            .then(res => res.json())
            .then(data => {
              const response = data.response || "I'm not sure how to help with that.";
              addMessage("TechZonn", response);
              speak(response);
            })
            .catch(() => {
              const errorMsg = "Sorry, something went wrong. Please try again.";
              addMessage("TechZonn", errorMsg);
              speak(errorMsg);
            });
        }
      }
    });
  
    function addMessage(sender, text) {
      const msg = document.createElement("div");
      msg.classList.add("ai-message");
      msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
      aiMessages.appendChild(msg);
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }
  
    function speak(text) {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utter);
      }
    }
  
    // Optional: Toggle menu for responsive design
    const menuToggle = document.getElementById("menu-toggle");
    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        const nav = document.getElementById("main-nav");
        if (nav) nav.classList.toggle("active");
      });
    }
  });
  // Voice Recognition Setup
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.continuous = false;

        // Voice Button Elements
        const voiceBtn = document.getElementById("voice-btn");
        const aiInput = document.getElementById("ai-input");
        const aiMessages = document.getElementById("ai-messages");

        // Add event listener for voice button click
        voiceBtn.addEventListener("click", () => {
            voiceBtn.innerHTML = "Listening...";
            recognition.start();
        });

        // Voice recognition result event
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            aiInput.value = transcript;
            // Process input
            processInput(transcript);
        };

        // Voice recognition error event
        recognition.onerror = (event) => {
            alert("Voice input error: " + event.error);
            voiceBtn.innerHTML = "Record";
        };

        // Voice recognition end event
        recognition.onend = () => {
            voiceBtn.innerHTML = "Record";
        };

        // Speak function for voice output
        function speak(text) {
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = "en-US";
            speechSynthesis.speak(utter);
        }

        // Process input function
        function processInput(input) {
            // Add logic to process input
            const response = "You said: " + input;
            speak(response);
            addMessage("User", input);
            addMessage("AI", response);
        }

        // Add message to chat function
        function addMessage(sender, text) {
            const msg = document.createElement("p");
            msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
            aiMessages.appendChild(msg);
            aiMessages.scrollTop = aiMessages.scrollHeight;
        }

        function toggleAI() {
            document.getElementById('aiBox').classList.toggle('show');
        }

closeBtn.addEventListener('click', () => {
aiBox.style.display = 'none';
});

submitBtn.addEventListener('click', () => {
  const input = aiInput.value.trim();
  if (input) {
    processUserInput(input);
    aiInput.value = ''; // Clear the input field
  }
});

function processUserInput(input) {
  // Add logic to process the user input
  console.log(input); // For testing purposes
  // You can add your logic here to handle the input
}

const aiBox = document.getElementById('ai-box');
let isDown = false;
let offset = [0, 0];

aiBox.addEventListener('mousedown', (e) => {
  if (e.button === 0) { // Left mouse button
    isDown = true;
    offset = [aiBox.offsetLeft - e.clientX, aiBox.offsetTop - e.clientY];
  }
});

document.addEventListener('mouseup', () => {
  isDown = false;
});

document.addEventListener('mousemove', (e) => {
  if (isDown) {
    aiBox.style.left = `${e.clientX + offset[0]}px`;
    aiBox.style.top = `${e.clientY + offset[1]}px`;
    aiBox.style.position = 'absolute'; // Change position to absolute
  }
});
const aiIcon = document.getElementById('ai-icon');


aiIcon.addEventListener('click', () => {
  aiBox.classList.toggle('show');
});