const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "YOUR API KEY";

const loadDataFromLocalstorage = () => {
    // Load saved chats and theme from local storage and apply/add on the page
    const themeColor = localStorage.getItem("themeColor");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    const defaultText = `<div class="default-text hidden">
                            <h1>CryptoBot Assistant</h1>
                            <p>CryptoBot Assistant is your personalized guide to the world of cryptocurrencies and blockchain technology. Whether you're a seasoned investor or a curious beginner, CryptoBot is here to provide you with timely insights, market analysis, and expert advice to make informed decisions in the fast-paced world of digital assets.<br> Your chat history will be displayed here.</p>
                        </div>`
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container

    //pls animate
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            console.log(entry)
            if (entry.isIntersecting)
            {
                entry.target.classList.add('show');
                
            } else {
                entry.target.classList.remove('show');
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));
}

const createElement = (html, className, timestamp) => {
    // Create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    
    // Add timestamp if provided
    if (timestamp) {
        const timestampElement = document.createElement("div");
        timestampElement.classList.add("timestamp");
        timestampElement.textContent = timestamp;
        chatDiv.appendChild(timestampElement);
    }
    
    return chatDiv; // Return the created chat div
}

const getChatResponse = async(incomingChatDiv) => {
    console.log("Inside getChatResponse"); // Debugging
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const pElement = document.createElement("p");

    const requestOptions = {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            prompt: userText,
            max_token: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        })
    }

    try {
        console.log("Before API call"); // Debugging
        const response = await (await fetch(API_URL, requestOptions)).json();
        console.log("After API call:", response); // Debugging
        pElement.textContent = response.choices[0].text.trim();
    } catch(error) {
        console.error("Error in API call:", error); // Debugging
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    const reponseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(reponseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    // Display the typing animation and call the getChatResponse function
    const html = `
         <div class="chat-content">
                <div class="chat-details">
                    <img src="chatbot.png" alt="chatbot-img">
                    <div class="typing-animation">
                        <div class="typing-dot" style="--delay: 0.2s"></div>
                        <div class="typing-dot" style="--delay: 0.3s"></div>
                        <div class="typing-dot" style="--delay: 0.4s"></div>
                    </div>
                </div>
                <span class="material-symbols-rounded">content_copy</span>
            </div>`;

    // Create an outgoing chat div with user's message and append it to chat container            
    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    console.log("Inside handleOutgoingChat"); // Debugging
    userText = chatInput.value.trim(); // Get chatInput value and extra spaces
    if(!userText) return; // If chatInput is empty return from here

    // Clear the input field and reset its height
    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;
    const html = `
        <div class="chat-content">
            <div class="chat-details">
                <img src="user.png" alt="user-img">
                <p>${userText}</p>
            </div>
        </div>`;

    // Create an outgoing chat div with user's message and append it to chat container            
    const outgoingChatDiv = createElement(html, "outgoing", getTimeStamp());
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
} 

deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalstorage function
    if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    // Toggle body's class for the theme mode and save the updated theme to the local storage 
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;
chatInput.addEventListener("input", () => {   
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height =  `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If the Enter key is pressed without Shift and the window width is larger 
    // than 800 pixels, handle the outgoing chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

loadDataFromLocalstorage();

sendButton.addEventListener("click", handleOutgoingChat);

const getTimeStamp = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}


// Function to generate random number between min and max
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  // Function to create a meteor element and append it to the background
  function createMeteor() {
    const meteor = document.createElement('div');
    meteor.classList.add('meteor');
    meteor.style.left = randomBetween(-100, window.innerWidth) + 'px';
    document.querySelector('.background-animation').appendChild(meteor);
  }
  
  // Create multiple meteors
  for (let i = 0; i < 10; i++) {
    createMeteor();
  }
  // dropdown
// Wait for the DOM content to be loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get the dropdown description element
    var dropdownDescription = document.getElementById("dropdown-description");

    // Add event listener to hide dropdown description when clicking on the home link
    var homeLink = document.getElementById("home-link");
    homeLink.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default action of the link
        dropdownDescription.classList.toggle("hide"); // Toggle the visibility of the dropdown description
    });

    // Function to hide dropdown description when chat is started
    function hideDropdownDescription() {
        dropdownDescription.classList.add("hide");
    }

    // Example function to simulate starting the chat
    function startChat() {
        // Your chat initiation logic here
        // For example:
        hideDropdownDescription();
    }

    // Call startChat() function when the chat starts
    startChat();
});
