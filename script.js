// ============================================
// TATRA FLORA QUIZ - Pure JavaScript Version
// ============================================

// State
let plants = [];
let currentPlant = null;
let score = 0;
let attempts = 0;
let selectedOption = null;
let isChecking = false;

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
const closeModalBtn = document.querySelector("#plant-modal .close-modal");

// Image modal elements
const imageModal = document.getElementById("image-modal");
const fullsizeImage = document.getElementById("fullsize-image");
const closeImageModalBtn = document.querySelector("#image-modal .close-modal");

// Related plants map for better options
const relatedPlantsMap = {
  "Arcydziegiel litwor": ["Aster alpejski", "Sasanka alpejska", "Obuwik pospolity"],
  "Aster alpejski": ["Arcydziegiel litwor", "Sasanka alpejska", "Szarotka alpejska"],
  "Szafran spiski": ["Aster alpejski", "Sasanka alpejska", "Pierwiosnek łyszczak"],
  "Obuwik pospolity": ["Arcydziegiel litwor", "Aster alpejski", "Sasanka alpejska"],
  "Sasanka alpejska": ["Aster alpejski", "Dzwonek alpejski", "Szafran spiski"],
  "Dziewięćsił bezłodygowy": ["Aster alpejski", "Szarotka alpejska", "Lilia złotogłów"],
  "Lilia złotogłów": ["Dziewięćsił bezłodygowy", "Aster alpejski", "Sasanka alpejska"],
  "Mak tatrzański": ["Sasanka alpejska", "Dzwonek alpejski", "Goryczka kropkowana"],
  "Warzucha tatrzańska": ["Pierwiosnek łyszczak", "Goryczka kropkowana", "Dzwonek alpejski"],
  "Goryczka kropkowana": ["Pierwiosnek łyszczak", "Mak tatrzański", "Warzucha tatrzańska"],
  "Szarotka alpejska": ["Dziewięćsił bezłodygowy", "Aster alpejski", "Dzwonek alpejski"],
  "Pierwiosnek łyszczak": ["Goryczka kropkowana", "Szafran spiski", "Warzucha tatrzańska"],
  "Dzwonek alpejski": ["Sasanka alpejska", "Mak tatrzański", "Szarotka alpejska"]
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showLoading() {
    loadingEl.classList.add("active");
}

function hideLoading() {
    loadingEl.classList.remove("active");
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/** Normalize a plant name for comparison (case-insensitive, ignore diacritics/whitespace) */
function normalizeName(str) {
    if (!str) return "";
    return str
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/** All accepted names for a plant (primary name + aliases) */
function getAcceptedNames(plant) {
    const names = [plant.name];
    if (Array.isArray(plant.aliases)) {
        names.push(...plant.aliases);
    }
    return names;
}

/** Check whether an answer string matches a plant's name or any of its aliases */
function isAcceptedName(plant, answer) {
    const normalizedAnswer = normalizeName(answer);
    return getAcceptedNames(plant).some(name => normalizeName(name) === normalizedAnswer);
}

/** Check whether two plant objects refer to the same plant (by id, or by name/alias) */
function isSamePlant(a, b) {
    if (!a || !b) return false;
    if (a.id != null && b.id != null && a.id === b.id) return true;
    return getAcceptedNames(a).some(name => isAcceptedName(b, name));
}

// ============================================
// LOAD DATA
// ============================================

async function loadPlants() {
    showLoading();
    try {
        const response = await fetch("plants.json");
        if (!response.ok) throw new Error("Failed to load plants data");
        plants = await response.json();
        hideLoading();
        return plants;
    } catch (error) {
        console.error("Error loading plants:", error);
        hideLoading();
        alert("Błąd ładowania danych roślin. Spróbuj odświeżyć stronę.");
        return [];
    }
}

// ============================================
// QUIZ FUNCTIONS
// ============================================

function getRandomPlant() {
    return plants[Math.floor(Math.random() * plants.length)];
}

function getQuizOptions(correctPlant) {
    const allPlants = plants.filter(p => !isSamePlant(p, correctPlant));
    
    // Get related plants first
    const relatedPlants = relatedPlantsMap[correctPlant.name] || [];
    const wrongOptions = [];
    
    // Try to get related plants
    for (const relatedName of relatedPlants) {
        const relatedPlant = allPlants.find(p => isAcceptedName(p, relatedName));
        if (relatedPlant && wrongOptions.length < 3) {
            wrongOptions.push(relatedPlant);
        }
    }
    
    // Fill remaining with random plants
    while (wrongOptions.length < 3 && allPlants.length > 0) {
        const randomPlant = allPlants[Math.floor(Math.random() * allPlants.length)];
        if (!wrongOptions.includes(randomPlant)) {
            wrongOptions.push(randomPlant);
        }
    }
    
    // Create options array and shuffle
    const options = [correctPlant, ...wrongOptions];
    return shuffleArray(options);
}

function renderQuizQuestion() {
    if (plants.length === 0) return;
    
    currentPlant = getRandomPlant();
    selectedOption = null;
    isChecking = false;
    
    // Select random image
    const randomImageIndex = Math.floor(Math.random() * currentPlant.images.length);
    const imagePath = currentPlant.images[randomImageIndex];
    plantImage.src = imagePath;
    plantImage.alt = currentPlant.name;
    
    // Set question
    questionEl.textContent = "Jaka to roślina?";
    
    // Clear feedback
    feedbackEl.classList.remove("correct", "wrong");
    feedbackEl.style.display = "none";
    
    // Get options
    const options = getQuizOptions(currentPlant);
    renderOptions(options);
    
    // Enable buttons
    checkBtn.style.display = "inline-block";
    nextBtn.style.display = "none";
    
    // Enable all options
    document.querySelectorAll(".option").forEach(opt => {
        opt.classList.remove("disabled", "correct", "wrong", "selected");
        opt.style.cursor = "pointer";
    });
}

function renderOptions(options) {
    optionsContainer.innerHTML = "";
    
    options.forEach((plant, index) => {
        const optionEl = document.createElement("div");
        optionEl.className = "option";
        optionEl.textContent = plant.name;
        optionEl.dataset.id = plant.id;
        optionEl.dataset.name = plant.name;
        optionEl.dataset.isCorrect = isSamePlant(plant, currentPlant).toString();
        
        optionEl.addEventListener("click", () => {
            if (isChecking) return;
            
            // Remove selected from all
            document.querySelectorAll(".option").forEach(opt => {
                opt.classList.remove("selected");
            });
            
            // Add selected to clicked
            optionEl.classList.add("selected");
            selectedOption = plant.id;
        });
        
        optionsContainer.appendChild(optionEl);
    });
}

function checkAnswer() {
    if (!selectedOption || isChecking) return;
    
    isChecking = true;
    attempts++;
    
    const selectedPlant = plants.find(p => p.id == selectedOption);
    const isCorrect = selectedPlant && isSamePlant(selectedPlant, currentPlant);
    
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
        
        if (opt.dataset.isCorrect === "true") {
            opt.classList.add("correct");
        } else if (opt.dataset.id == selectedOption) {
            opt.classList.add("wrong");
        }
    });
    
    // Show next button
    checkBtn.style.display = "none";
    nextBtn.style.display = "inline-block";
}

// ============================================
// STUDY MODE FUNCTIONS
// ============================================

function renderPlantsGrid() {
    if (plants.length === 0) return;
    
    plantsGrid.innerHTML = "";
    
    plants.forEach(plant => {
        const firstImage = plant.images[0];
        const aliasesText = Array.isArray(plant.aliases) && plant.aliases.length
            ? ` <span style="color:#64748b;font-weight:normal;">(${plant.aliases.join(", ")})</span>`
            : "";
        
        const tile = document.createElement("div");
        tile.className = "plant-tile";
        
        tile.innerHTML = `
            <img src="${firstImage}" alt="${plant.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2212%22%3ENo img%3C/text%3E%3C/svg%3E'">
            <div class="plant-tile-info">
                <h3>${plant.name}${aliasesText}</h3>
                <p class="latin-name">${plant.latin}</p>
                <p style="color: #2563eb; font-size: 0.875rem; margin-top: 0.5rem;">Kliknij, aby zobaczyć więcej</p>
            </div>
        `;
        
        tile.addEventListener("click", () => showPlantDetails(plant));
        plantsGrid.appendChild(tile);
    });
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function showPlantDetails(plant) {
    modalTitle.textContent = plant.name;
    const aliasesNote = Array.isArray(plant.aliases) && plant.aliases.length
        ? ` (także: ${plant.aliases.join(", ")})`
        : "";
    modalLatin.textContent = plant.latin + aliasesNote;
    modalDescription.textContent = plant.description;
    modalHabitat.textContent = plant.habitat;
    modalBloom.textContent = plant.bloom;
    modalAltitude.textContent = plant.altitude;
    modalZones.textContent = plant.zones.join(", ");
    modalLimestone.textContent = plant.prefers_limestone ? "Woli podłoże wapienne" : "Spotykana głównie na granicie i wapieniu";
    
    // Render gallery
    modalGallery.innerHTML = "";
    plant.images.forEach(imgPath => {
        const imgEl = document.createElement("img");
        imgEl.src = imgPath;
        imgEl.alt = plant.name;
        imgEl.onerror = () => {
            imgEl.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3ENo img%3C/text%3E%3C/svg%3E";
        };
        imgEl.addEventListener("click", () => openFullsizeImage(imgPath, plant.name));
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

function closeModal() {
    modal.classList.remove("active");
}

// ============================================
// IMAGE MODAL FUNCTIONS
// ============================================

function openFullsizeImage(src, alt) {
    fullsizeImage.src = src;
    fullsizeImage.alt = alt;
    imageModal.classList.add("active");
}

function closeImageModal() {
    imageModal.classList.remove("active");
}

// ============================================
// MODE SWITCHING
// ============================================

function showQuizMode() {
    quizMode.classList.add("active");
    studyMode.classList.remove("active");
    renderQuizQuestion();
}

function showStudyMode() {
    quizMode.classList.remove("active");
    studyMode.classList.add("active");
    renderPlantsGrid();
}

// ============================================
// EVENT LISTENERS
// ============================================

checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", renderQuizQuestion);
studyBtn.addEventListener("click", showStudyMode);
backToQuizBtn.addEventListener("click", showQuizMode);
closeModalBtn.addEventListener("click", closeModal);
closeImageModalBtn.addEventListener("click", closeImageModal);

// Close modal on background click
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close image modal on background click
imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
        closeImageModal();
    }
});

// Close modals on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeModal();
        closeImageModal();
    }
});

// ============================================
// INITIALIZE
// ============================================

async function init() {
    await loadPlants();
    showQuizMode();
}

// Start the app
init();
