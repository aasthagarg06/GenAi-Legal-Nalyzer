// script.js (FINAL CORRECTED VERSION)

document.addEventListener('DOMContentLoaded', function() {
    // This runs on every page
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    initializeNavigation();

    // Run page-specific code
    if (document.querySelector('.hero-section')) { // This is unique to index.html
        initializeFileUpload();
    }
    if (document.querySelector('.dashboard')) { // This is unique to dashboard.html
        populateDashboardData();
    }
    if (document.querySelector('.about-page')) { // This is unique to about.html
        initializeScrollAnimations();
    }
});

// --- GLOBAL FUNCTIONS (Used on multiple pages) ---
function initializeNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const menuIcon = document.getElementById('menuIcon');
    const closeIcon = document.getElementById('closeIcon');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('hidden');
            menuIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });
    }
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
    // You can add back the drag-and-drop and modal logic here if you need it.
}

function triggerAnalysis(file) {
    sessionStorage.setItem('documentName', file.name);

    const formData = new FormData();
    formData.append('document', file);

    document.body.innerHTML = `<div style="text-align:center; padding-top:100px;"><h1>Analyzing your document...</h1></div>`;

    const backendApiUrl = 'http://localhost:5000/analyzeDocument';
    fetch(backendApiUrl, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
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

// --- DASHBOARD PAGE FUNCTIONS ---
function populateDashboardData() {
    const resultsJSON = sessionStorage.getItem('analysisResult');
    const documentName = sessionStorage.getItem('documentName');

    if (!resultsJSON || !documentName) {
        document.body.innerHTML = "<h1>Error: No analysis data found.</h1><p><a href='index.html'>Please go back and try again.</a></p>";
        return;
    }

    const results = JSON.parse(resultsJSON);

    // Populate Sidebar
    const docNameElement = document.querySelector('.document-name');
    if (docNameElement) {
        docNameElement.textContent = documentName;
    }

    // Populate Summary
    const summaryElement = document.querySelector('.summary-text');
    if (summaryElement) {
        summaryElement.textContent = results.summary;
    }

    // Populate Risk Flags
    const riskContainer = document.querySelector('.risk-list');
    if (riskContainer) {
        riskContainer.innerHTML = '';
        results.riskFlags.forEach(flag => {
            const riskLevelClass = `risk-${flag.level.toLowerCase()}`;
            const icon = flag.level.toLowerCase() === 'red' ? 'alert-triangle' : 'alert-circle';
            const flagHTML = `
                <div class="risk-item ${riskLevelClass}">
                    <div class="risk-indicator"><i data-lucide="${icon}" class="icon"></i></div>
                    <div class="risk-content">
                        <h4 class="risk-title">${flag.title}</h4>
                        <p class="risk-description">${flag.explanation}</p>
                    </div>
                </div>`;
            riskContainer.innerHTML += flagHTML;
        });
    }

    // Populate Key Clauses
    const clausesContainer = document.querySelector('.clauses-accordion');
    if (clausesContainer) {
        clausesContainer.innerHTML = '';
        results.keyClauses.forEach((clause, index) => {
            const clauseHTML = `
                <div class="accordion-item">
                    <button class="accordion-trigger">
                        <span class="accordion-title">${clause.title}</span>
                        <i data-lucide="chevron-down" class="icon accordion-icon"></i>
                    </button>
                    <div class="accordion-content">
                        <div class="clause-comparison">
                            <div class="clause-original">
                                <h5>Original Legal Text:</h5><p>"${clause.originalText}"</p>
                            </div>
                            <div class="clause-explanation">
                                <h5>Plain English:</h5><p>${clause.simplifiedText}</p>
                            </div>
                        </div>
                    </div>
                </div>`;
            clausesContainer.innerHTML += clauseHTML;
        });
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    initializeDashboardUI();
}

function initializeDashboardUI() {
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isExpanded = content.classList.contains('expanded');
            
            // Close all others
            document.querySelectorAll('.accordion-content.expanded').forEach(c => c.classList.remove('expanded'));

            // Toggle current
            if (!isExpanded) {
                content.classList.add('expanded');
            }
        });
    });
}


// --- ABOUT PAGE FUNCTIONS (This is the animation code) ---
function initializeScrollAnimations() {
  const sectionsToAnimate = document.querySelectorAll('.fade-in-section');

  if (sectionsToAnimate.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  sectionsToAnimate.forEach(section => {
    observer.observe(section);
  });
}

