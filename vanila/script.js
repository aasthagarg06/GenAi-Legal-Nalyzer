document.addEventListener('DOMContentLoaded', function() {
    // This runs on every page
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    initializeNavigation();
    initializeSmoothScroll();

    // Run page-specific code
    if (document.querySelector('.hero-section')) {
        initializeFileUpload();
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
                const targetPosition = targetSection.offsetTop - navbarHeight - 60; // 60px padding
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
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
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Paste Document Text</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <textarea id="pasteTextArea" class="text-area" placeholder="Paste your document text here..." rows="10"></textarea>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button id="analyzeTextBtn" class="btn btn-primary">Analyze Text</button>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('analyzeTextBtn').addEventListener('click', () => {
        const text = document.getElementById('pasteTextArea').value;
        if (text.trim().length < 100) {
            alert('Please paste at least 100 characters.');
            return;
        }
        const file = new Blob([text], { type: 'text/plain' });
        triggerAnalysis(file);
    });
}

function showUrlModal() {
     const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Analyze from URL</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="url" class="form-input" placeholder="Enter document URL..." id="urlInput">
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button id="analyzeUrlBtn" class="btn btn-primary">Analyze URL</button>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('analyzeUrlBtn').addEventListener('click', () => {
        alert('URL analysis is a premium feature and not implemented in this demo.');
    });
}