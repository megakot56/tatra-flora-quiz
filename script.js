// Configuration - Change this to your PythonAnywhere URL
const API_BASE = http://localhost:5000; // For local testing
// const API_BASE = https://megakot56.pythonanywhere.com; // For production

// State
let currentQuestion = null;
let score = 0;
let attempts = 0;
let selectedOption = null;

// DOM Elements
const quizMode = document.getElementById("quiz-mode");
const studyMode = document.getElementById("study-mode");
const plantImage = document.getElementById("plant-image");
const questionEl = document.getElementById("question");
const optionsContainer = document.getElementById("options-container");
const feedbackEl = document.getElementById("feedback");
const checkBtn = document.getElementById("check-btn");
const nextBtn = document.getElementById("next-btn");
const studyBtn = document.getElementById("study-btn");
const backToQuizBtn = document.getElementById("back-to-quiz");
const plantsGrid = document.getElementById("plants-grid");
const scoreEl = document.getElementById("score");
const loadingEl = document.getElementById("loading");

// Modal elements
const modal = document.getElementById("plant-modal");
const modalTitle = document.getElementById("modal-title");
const modalLatin = document.getElementById("modal-latin");
const modalGallery = document.getElementById("modal-gallery");
const modalDescription = document.getElementById("modal-description");
const modalHabitat = document.getElementById("modal-habitat");
const modalBloom = document.getElementById("modal-bloom");
const modalAltitude = document.getElementById("modal-altitude");
const modalZones = document.getElementById("modal-zones");
const modalLimestone = document.getElementById("modal-limestone");
const modalCharacteristicsList = document.getElementById("modal-characteristics-list");

// Close modal button
const closeModalBtn = document.querySelector(".close-modal");

// Show loading
function showLoading() {
    loadingEl.classList.add("active");
}

// Hide loading
function hideLoading() {
    loadingEl.classList.remove("active");
}

// Fetch from API
async function fetchAPI(endpoint) {
    showLoading();
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error("API error");
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        hideLoading();
        alert("Błąd połączenia z serwerem. Spróbuj później.");
        return null;
    }
}

// Load quiz question
async function loadQuizQuestion() {
    showLoading();
    const data = await fetchAPI("/api/quiz");
    hideLoading();
    
    if (!data) return;
    
    currentQuestion = data;
    selectedOption = null;
    
    // Set plant image
    const imageUrl = `${API_BASE}/static/images/${data.correct_plant.current_image}`;
    plantImage.src = imageUrl;
    plantImage.alt = data.correct_plant.name;
    
    // Set question
    questionEl.textContent = "Jaka to roślina?";
    
    // Clear feedback
    feedbackEl.classList.remove("correct", "wrong");
    feedbackEl.style.display = "none";
    
    // Render options
    renderOptions(data.options);
    
    // Enable buttons
    checkBtn.style.display = "inline-block";
    nextBtn.style.display = "none";
    
    // Enable all options
    document.querySelectorAll(".option").forEach(opt => {
        opt.classList.remove("disabled", "correct", "wrong", "selected");
        opt.style.cursor = "pointer";
    });
}

// Render options
function renderOptions(options) {
    optionsContainer.innerHTML = "";
    
    options.forEach((option, index) => {
        const optionEl = document.createElement("div");
        optionEl.className = "option";
        optionEl.textContent = option.name;
        optionEl.dataset.id = option.id;
        optionEl.dataset.correct = option.is_correct;
        
        optionEl.addEventListener("click", () => {
            // Remove selected from all
            document.querySelectorAll(".option").forEach(opt => {
                opt.classList.remove("selected");
            });
            // Add selected to clicked
            optionEl.classList.add("selected");
            selectedOption = option.id;
        });
        
        optionsContainer.appendChild(optionEl);
    });
}

// Check answer
async function checkAnswer() {
    if (!selectedOption) {
        alert("Wybierz odpowiedź!");
        return;
    }
    
    const isCorrect = selectedOption == currentQuestion.correct_answer_id;
    
    // Update score
    attempts++;
    if (isCorrect) {
        score++;
    }
    scoreEl.textContent = `${score}/${attempts}`;
    
    // Show feedback
    feedbackEl.textContent = isCorrect ? "✓ Poprawna odpowiedź!" : "✗ Spróbuj ponownie";
    feedbackEl.className = isCorrect ? "feedback correct" : "feedback wrong";
    feedbackEl.style.display = "block";
    
    // Highlight options
    document.querySelectorAll(".option").forEach(opt => {
        opt.classList.add("disabled");
        opt.style.cursor = "not-allowed";
        
        if (opt.dataset.correct === "true") {
            opt.classList.add("correct");
        } else if (opt.dataset.id == selectedOption) {
            opt.classList.add("wrong");
        }
    });
    
    // Show next button
    checkBtn.style.display = "none";
    nextBtn.style.display = "inline-block";
    
    // Show plant details in modal after a delay
    setTimeout(() => {
        showPlantDetails(currentQuestion.correct_plant);
    }, 500);
}

// Show plant details in modal
function showPlantDetails(plant) {
    modalTitle.textContent = plant.name;
    modalLatin.textContent = plant.latin;
    modalDescription.textContent = plant.description;
    modalHabitat.textContent = plant.habitat;
    modalBloom.textContent = plant.bloom;
    modalAltitude.textContent = plant.altitude;
    modalZones.textContent = plant.zones.join(", ");
    modalLimestone.textContent = plant.prefers_limestone ? "Woli podłoże wapienne" : "Spotykana głównie na granicie i wapieniu";
    
    // Render gallery
    modalGallery.innerHTML = "";
    plant.images.forEach(img => {
        const imgEl = document.createElement("img");
        imgEl.src = `${API_BASE}/static/images/${img}`;
        imgEl.alt = plant.name;
        imgEl.onerror = () => {
            imgEl.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ENo img%3C/text%3E%3C/svg%3E";
        };
        modalGallery.appendChild(imgEl);
    });
    
    // Render characteristics
    modalCharacteristicsList.innerHTML = "";
    plant.characteristics.forEach(char => {
        const li = document.createElement("li");
        li.textContent = char;
        modalCharacteristicsList.appendChild(li);
    });
    
    modal.classList.add("active");
}

// Close modal
function closeModal() {
    modal.classList.remove("active");
}

// Load all plants for study mode
async function loadPlantsForStudy() {
    showLoading();
    const plants = await fetchAPI("/api/plants");
    hideLoading();
    
    if (!plants) return;
    
    plantsGrid.innerHTML = "";
    
    plants.forEach(plant => {
        const tile = document.createElement("div");
        tile.className = "plant-tile";
        
        const firstImage = plant.images[0];
        const imgUrl = `${API_BASE}/static/images/${firstImage}`;
        
        tile.innerHTML = `
            <img src="${imgUrl}" alt="${plant.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2212%22%3ENo img%3C/text%3E%3C/svg%3E'">
            <div class="plant-tile-info">
                <h3>${plant.name}</h3>
                <p class="latin-name">${plant.latin}</p>
                <p style="color: #2563eb; font-size: 0.875rem; margin-top: 0.5rem;">Kliknij, aby zobaczyć więcej</p>
            </div>
        `;
        
        tile.addEventListener("click", () => showPlantDetails(plant));
        plantsGrid.appendChild(tile);
    });
}

// Switch to quiz mode
function showQuizMode() {
    quizMode.classList.add("active");
    studyMode.classList.remove("active");
    loadQuizQuestion();
}

// Switch to study mode
function showStudyMode() {
    quizMode.classList.remove("active");
    studyMode.classList.add("active");
    loadPlantsForStudy();
}

// Event listeners
checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", loadQuizQuestion);
studyBtn.addEventListener("click", showStudyMode);
backToQuizBtn.addEventListener("click", showQuizMode);
closeModalBtn.addEventListener("click", closeModal);

// Close modal on background click
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Initialize
showQuizMode();
