// ai_assistant.js

document.addEventListener("DOMContentLoaded", () => {
    "use strict"; // Enforce strict mode for cleaner code and error prevention

    // --- DOM Elements ---
    const aiBox = document.getElementById("ai-assistant");
    const aiIcon = document.getElementById("ai-icon"); // The icon to toggle the AI box
    const aiInput = document.getElementById("ai-input");
    const aiMessages = document.getElementById("ai-messages");
    const closeBtn = document.getElementById('close-btn');
    const submitBtn = document.getElementById('submit-btn');
    const voiceBtn = document.getElementById("voice-btn");
    const menuToggle = document.getElementById("menu-toggle"); // For responsive navigation toggle (if applicable)

    // Ensure all critical elements are found before proceeding
    if (!aiBox || !aiIcon || !aiInput || !aiMessages || !closeBtn || !submitBtn) {
        console.error("Critical AI assistant DOM elements not found. Check your HTML IDs.");
        return; // Stop execution if essential elements are missing
    }

    // --- State Variables ---
    let chatHistory = []; // Stores messages for the current session for context
    // Initialize isAiActive from localStorage, default to true if not set or is 'true'
    let isAiActive = localStorage.getItem("aiActive") !== "false";
    let isDragging = false;
    let offset = [0, 0]; // For draggable functionality

    // --- Speech Synthesis (Text-to-Speech) ---
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = "en-US"; // Set language for better pronunciation
            utter.volume = 1; // 0 to 1
            utter.rate = 1;   // 0.1 to 10
            utter.pitch = 1;  // 0 to 2
            speechSynthesis.speak(utter);
        } else {
            console.warn("Speech synthesis not supported in this browser.");
        }
    };

    // --- Speech Recognition (Voice-to-Text) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.lang = 'en-US';
        recognition.interimResults = false; // Get final results only
        recognition.continuous = false; // Stop after a single utterance
    } else {
        if (voiceBtn) voiceBtn.style.display = 'none'; // Hide voice button if not supported
        console.warn("Speech recognition not supported in this browser.");
    }

    // --- UI Update Functions ---

    /**
     * Adds a message to the chat display and scrolls to the latest message.
     * @param {string} sender - The sender of the message (e.g., "You", "TechZonn").
     * @param {string} text - The message content.
     * @param {boolean} isUser - True if the message is from the user, false otherwise.
     */
    const addMessage = (sender, text, isUser = false) => {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("ai-message"); // Base class for all messages
        if (isUser) {
            msgDiv.classList.add("user-message");
        } else {
            msgDiv.classList.add("bot-message"); // Specific class for AI messages
        }
        msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
        aiMessages.appendChild(msgDiv);
        // Scroll to the bottom to show the latest message
        aiMessages.scrollTop = aiMessages.scrollHeight;
        chatHistory.push({ sender, text, isUser }); // Add to history
    };

    /**
     * Displays a temporary loading indicator.
     */
    const showLoadingIndicator = () => {
        const loadingDiv = document.createElement("div");
        loadingDiv.classList.add("ai-message", "bot-message", "loading-indicator");
        loadingDiv.innerHTML = "<strong>TechZonn:</strong> Typing...";
        aiMessages.appendChild(loadingDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    };

    /**
     * Removes the loading indicator.
     */
    const removeLoadingIndicator = () => {
        const loadingDiv = aiMessages.querySelector(".loading-indicator");
        if (loadingDiv) {
            aiMessages.removeChild(loadingDiv);
        }
    };

    /**
     * Renders the entire chat history.
     * Useful when re-opening the chat or after an action that might clear/rebuild.
     */
    const renderChatHistory = () => {
        aiMessages.innerHTML = ''; // Clear current messages
        if (chatHistory.length === 0) {
            // Initial greeting if history is empty
            const greeting = "Hello! I'm TechZonn. How can I help you navigate this site today?";
            addMessage("TechZonn", greeting);
            speak(greeting);
        } else {
            // Re-render existing history
            chatHistory.forEach(msg => {
                addMessage(msg.sender, msg.text, msg.isUser);
            });
        }
    };

    /**
     * Toggles the visibility of the AI assistant box.
     */
    const toggleAiBox = () => {
        aiBox.classList.toggle('show');
        if (aiBox.classList.contains('show')) {
            renderChatHistory(); // Ensure chat history is displayed
            aiInput.focus(); // Focus on input for immediate typing
            // Adjust position if it somehow went off-screen
            if (aiBox.offsetLeft < 0) aiBox.style.left = '20px';
            if (aiBox.offsetTop < 0) aiBox.style.top = '20px';
        }
        localStorage.setItem("aiActive", aiBox.classList.contains('show')); // Save state
    };

    // --- AI Core Logic ---

    /**
     * Processes user input and generates a response.
     * This is the central function for handling user queries.
     * @param {string} userInput - The trimmed user input string.
     */
    const processUserInput = async (userInput) => {
        addMessage("You", userInput, true); // Display user's message immediately
        aiInput.value = ''; // Clear input field

        showLoadingIndicator(); // Show typing indicator

        let responseText = "I'm not sure how to help with that. Could you please rephrase?";
        let handledInternally = false;

        // --- Intent-based Responses (Client-side) ---
        if (/services?/i.test(userInput)) {
            window.location.href = "#services"; // Scroll to services section
            responseText = "Sure! We offer Web Development, Hosting, SEO, Systems, and Domains. You can find more details in our services section.";
            handledInternally = true;
        } else if (/contact|form|get in touch/i.test(userInput)) {
            window.location.href = "#contact"; // Scroll to contact section
            responseText = "Here is the contact form. Please fill it in carefully, and we'll get back to you soon.";
            handledInternally = true;
        } else if (/deactivate|disable|turn off/i.test(userInput)) {
            isAiActive = false;
            localStorage.setItem("aiActive", "false");
            aiBox.classList.remove('show'); // Hide with animation
            responseText = "TechZonn has been deactivated. You can reactivate me by clicking my icon. Have a great time Browse!";
            handledInternally = true;
        } else if (/activate|enable|turn on/i.test(userInput) && !isAiActive) {
            isAiActive = true;
            localStorage.setItem("aiActive", "true");
            aiBox.classList.add('show'); // Show with animation
            responseText = "Welcome back! TechZonn is now active. How can I assist you further?";
            handledInternally = true;
        } else if (/hello|hi|hey/i.test(userInput)) {
            responseText = "Hello there! How can I help you today?";
            handledInternally = true;
        } else if (/thank you|thanks/i.test(userInput)) {
            responseText = "You're most welcome! Is there anything else I can assist you with?";
            handledInternally = true;
        } else if (/about us|who are you|tell me about techzonn/i.test(userInput)) {
            window.location.href = "#about"; // Scroll to about section
            responseText = "We are TechZonn, your trusted partner for digital solutions, including web development, hosting, SEO, and more! Explore our About Us section for more.";
            handledInternally = true;
        } else if (/what is the time|current time/i.test(userInput)) {
            const now = new Date();
            const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            responseText = `The current time is ${now.toLocaleTimeString('en-US', timeOptions)} on ${now.toLocaleDateString('en-US', dateOptions)}.`;
            handledInternally = true;
        } else if (/where are you located|location/i.test(userInput)) {
            responseText = "I am a digital AI assistant, so I don't have a physical location. However, our company, TechZonn, is based in Harare, Harare Province, Zimbabwe.";
            handledInternally = true;
        }

        // --- Fallback to API for more complex queries if not handled internally ---
        if (!handledInternally) {
            try {
                // Ensure chatHistory is structured correctly for your PHP script
                const apiChatHistory = chatHistory.map(msg => ({
                    role: msg.isUser ? "user" : "assistant",
                    content: msg.text
                }));

                const res = await fetch("ai_Assistant.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: userInput, chatHistory: apiChatHistory })
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                responseText = data.response || "I apologize, I'm having trouble understanding that. Could you try rephrasing?";

            } catch (error) {
                console.error("AI API call failed:", error);
                responseText = "Oops! It seems I'm having trouble connecting to my brain right now. Please check your internet connection or try again later.";
            }
        }

        removeLoadingIndicator(); // Remove typing indicator
        speak(responseText);
        addMessage("TechZonn", responseText);
    };

    // --- Event Listeners ---

    // Initial AI Box state based on localStorage and greeting
    if (isAiActive) {
        aiBox.classList.add('show'); // Apply 'show' class if active
        // Initial greeting is handled by renderChatHistory if history is empty
    } else {
        aiBox.classList.remove('show'); // Ensure it's hidden if not active
    }

    // Toggle AI box visibility on icon click
    aiIcon.addEventListener("click", toggleAiBox);

    // Close AI box on close button click
    closeBtn.addEventListener('click', () => {
        aiBox.classList.remove('show');
        localStorage.setItem("aiActive", "false"); // Deactivate when closed
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel(); // Stop any ongoing speech
        }
    });

    // Handle text input via Enter key
    aiInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent default Enter behavior (e.g., new line)
            submitBtn.click(); // Trigger submit button click
        }
    });

    // Handle text input via Submit button click
    submitBtn.addEventListener('click', () => {
        const input = aiInput.value.trim();
        if (input) {
            processUserInput(input);
        }
    });

    // Voice input button click
    if (voiceBtn && recognition) {
        voiceBtn.addEventListener("click", () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel(); // Stop current speech if any
            }
            voiceBtn.textContent = "Listening..."; // Provide immediate feedback
            voiceBtn.disabled = true; // Disable button while listening
            try {
                recognition.start();
            } catch (error) {
                console.error("Speech recognition start error:", error);
                voiceBtn.textContent = "Record";
                voiceBtn.disabled = false;
                addMessage("TechZonn", "Error starting voice recognition. Please try again.");
            }
        });

        // Voice recognition result
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            aiInput.value = transcript; // Populate input field
            processUserInput(transcript);
        };

        // Voice recognition error
        recognition.onerror = (event) => {
            voiceBtn.textContent = "Record"; // Reset button text
            voiceBtn.disabled = false;
            let errorMessage = "Voice input error. Please ensure your microphone is connected and accessible.";
            if (event.error === 'not-allowed') {
                errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
            } else if (event.error === 'no-speech') {
                errorMessage = "No speech detected. Please speak clearly.";
            } else if (event.error === 'network') {
                errorMessage = "Voice recognition requires an internet connection.";
            }
            addMessage("TechZonn", errorMessage);
            speak(errorMessage);
            console.error("Speech Recognition Error:", event.error);
        };

        // Voice recognition end
        recognition.onend = () => {
            voiceBtn.textContent = "Record"; // Reset button text
            voiceBtn.disabled = false;
        };
    }

    // --- Draggable AI Box Functionality ---

    // Mouse down event on AI box to start dragging
    // Only allow dragging from the header of the AI box for better UX
    const aiBoxHeader = document.querySelector('.ai-box-header');
    if (aiBox && aiBoxHeader) {
        aiBoxHeader.style.cursor = 'grab'; // Indicate it's draggable
        aiBoxHeader.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                isDragging = true;
                // Get the current position relative to the viewport
                const rect = aiBox.getBoundingClientRect();
                offset = [rect.left - e.clientX, rect.top - e.clientY];

                // Change position to absolute for direct pixel control
                aiBox.style.position = 'absolute';
                aiBox.style.cursor = 'grabbing'; // Change cursor to indicate dragging
                aiBox.style.zIndex = '10000'; // Bring to front while dragging
            }
        });
    }

    // Mouse up event to stop dragging (on the whole document)
    document.addEventListener('mouseup', () => {
        isDragging = false;
        if (aiBox) {
            // Revert to grab cursor on the header, not the whole box
            const currentHeader = document.querySelector('.ai-box-header');
            if (currentHeader) currentHeader.style.cursor = 'grab';
            aiBox.style.zIndex = '9999'; // Revert z-index after drag
        }
    });

    // Mouse move event to update AI box position while dragging (on the whole document)
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault(); // Prevent text selection while dragging
            // Update position based on mouse movement and initial offset
            aiBox.style.left = `${e.clientX + offset[0]}px`;
            aiBox.style.top = `${e.clientY + offset[1]}px`;
        }
    });


    // --- Responsive Navigation Toggle (if your site uses it) ---
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            const nav = document.getElementById("main-nav"); // Assuming your main nav has this ID
            if (nav) nav.classList.toggle("active");
        });
    }
});