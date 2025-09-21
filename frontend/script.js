document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    initializeNavigation();
    initializeSmoothScroll();

    // Run page-specific code
    if (document.querySelector('.hero-section')) {
        initializeFileUpload();
    }
    if (document.querySelector('.dashboard')) {
        populateDashboardData();
    }
});

// --- GLOBAL FUNCTIONS ---
function initializeNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
            mobileMenuBtn.querySelector('#menuIcon').classList.toggle('hidden');
            mobileMenuBtn.querySelector('#closeIcon').classList.toggle('hidden');
        });
    }
}

function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            const navbar = document.querySelector('.navbar');
            if (targetSection && navbar) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight - 60;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}


// --- INDEX PAGE FUNCTIONS ---
function initializeFileUpload() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                triggerAnalysis(e.target.files[0]);
            }
        });
    }
}

function triggerAnalysis(file) {
    if (!file) return;
    file.text().then(text => sessionStorage.setItem('fullDocumentText', text));
    sessionStorage.setItem('documentName', file.name || 'Pasted Text');
    const formData = new FormData();
    formData.append('document', file);
    showLoadingState();
    sendToBackend(formData);
}

function showLoadingState() {
    document.body.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; text-align:center;"><h1>Analyzing your document...</h1><p>This might take a moment.</p></div>`;
}

function sendToBackend(formData) {
    const backendApiUrl = 'http://localhost:5000/analyzeDocument';
    fetch(backendApiUrl, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) { throw new Error('Network response was not ok'); }
        return response.json();
    })
    .then(data => {
        sessionStorage.setItem('analysisResult', JSON.stringify(data));
        window.location.href = 'dashboard.html';
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Sorry, something went wrong. Please try again.");
        window.location.reload();
    });
}

function showPasteTextModal() {
    const modalHTML = `<div class="modal-overlay"><div class="modal-content"><div class="modal-header"><h3>Paste Document Text</h3><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button></div><div class="modal-body"><textarea id="pasteTextArea" class="text-area" placeholder="Paste your document text here..." rows="10"></textarea></div><div class="modal-footer"><button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button id="analyzeTextBtn" class="btn btn-primary">Analyze Text</button></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('analyzeTextBtn').addEventListener('click', () => {
        const text = document.getElementById('pasteTextArea').value;
        if (text.trim().length < 100) { alert('Please paste at least 100 characters.'); return; }
        const file = new Blob([text], { type: 'text/plain' });
        triggerAnalysis(file);
    });
}

function showUrlModal() {
     const modalHTML = `<div class="modal-overlay"><div class="modal-content"><div class="modal-header"><h3>Analyze from URL</h3><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button></div><div class="modal-body"><input type="url" class="form-input" placeholder="Enter document URL..." id="urlInput"></div><div class="modal-footer"><button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button><button id="analyzeUrlBtn" class="btn btn-primary">Analyze URL</button></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('analyzeUrlBtn').addEventListener('click', () => {
        alert('URL analysis is a premium feature and not implemented in this demo.');
    });
}


// --- DASHBOARD PAGE FUNCTIONS ---
function populateDashboardData() {
    const resultsJSON = sessionStorage.getItem('analysisResult');
    const documentName = sessionStorage.getItem('documentName');
    
    if (!resultsJSON || !documentName) {
        document.body.innerHTML = "<h1>Error: No analysis data found.</h1><p><a href='index.html'>Please go back and try again.</a></p>";
        return;
    }

    const results = JSON.parse(resultsJSON);

    // Populate Sidebar filename
    document.querySelector('.document-name').textContent = documentName;

    // Populate Summary
    document.getElementById('summary-text').textContent = results.summary;

    // Populate Risk Flags
    const riskContainer = document.getElementById('risk-flags-container');
    riskContainer.innerHTML = ''; // Clear "Loading..." text
    if (results.riskFlags && results.riskFlags.length > 0) {
        results.riskFlags.forEach(flag => {
            const riskLevel = flag.level.toLowerCase(); // 'red' or 'yellow'
            // This is the only new part: we create the tooltip text here
            const tooltipText = riskLevel === 'red' ? 'High Risk' : 'Medium Risk';
            const icon = riskLevel === 'red' ? 'alert-triangle' : 'alert-circle';
            
            riskContainer.innerHTML += `
                <div class="risk-item risk-${riskLevel}">
                    <div class="risk-indicator" data-tooltip="${tooltipText}">
                        <i data-lucide="${icon}"></i>
                    </div>
                    <div class="risk-content">
                        <h4 class="risk-title">${flag.title}</h4>
                        <p class="risk-description">${flag.explanation}</p>
                    </div>
                </div>`;
        });
    } else {
        riskContainer.innerHTML = '<p>No significant risks were found in this document.</p>';
    }
    // Populate Key Clauses
    const clausesContainer = document.getElementById('key-clauses-container');
    clausesContainer.innerHTML = ''; // Clear "Loading..." text
    if (results.keyClauses && results.keyClauses.length > 0) {
        results.keyClauses.forEach(clause => {
            clausesContainer.innerHTML += `<div class="accordion-item"><button class="accordion-trigger"><span class="accordion-title">${clause.title}</span><i data-lucide="chevron-down" class="accordion-icon"></i></button><div class="accordion-content"><div class="clause-comparison"><div class="clause-original"><h5>Original Legal Text:</h5><p>"${clause.originalText}"</p></div><div class="clause-explanation"><h5>Plain English:</h5><p>${clause.simplifiedText}</p></div></div></div></div>`;
        });
    }

    lucide.createIcons();
    initializeDashboardUI();
}


function initializeDashboardUI() {
    // --- Accordion Functionality ---
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
        trigger.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // --- Sidebar Navigation ---
    document.querySelectorAll('.sidebar-nav-item').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav-item').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).classList.add('active');
        });
    });

    // ===================================
    // === NEW, REAL CHAT FUNCTIONALITY ===
    // ===================================
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    // Function to send a message
    const sendMessage = () => {
        const question = chatInput.value.trim();
        if (!question) return;

        // Add the user's message to the chat window
        chatMessages.innerHTML += `<div class="chat-message chat-user"><div class="message-content"><p>${question}</p></div></div>`;
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Get the original document text we saved earlier
        const documentText = sessionStorage.getItem('fullDocumentText');

        // Send the question and context to our new backend endpoint
        fetch('http://localhost:5000/askQuestion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: question,
                context: documentText 
            })
        })
        .then(response => response.json())
        .then(data => {
            // Add the AI's answer to the chat window
            chatMessages.innerHTML += `<div class="chat-message chat-ai"><div class="message-avatar"><i data-lucide="bot"></i></div><div class="message-content"><p>${data.answer}</p></div></div>`;
            lucide.createIcons(); // Redraw the new icon
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(error => console.error('Chat Error:', error));
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}