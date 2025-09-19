// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    initializeNavigation();
    initializeFileUpload();
    initializeDashboard();
    initializeAuth();
});

// Navigation functionality
function initializeNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const menuIcon = document.getElementById('menuIcon');
    const closeIcon = document.getElementById('closeIcon');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            const isOpen = !mobileNav.classList.contains('hidden');
            
            if (isOpen) {
                mobileNav.classList.add('hidden');
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            } else {
                mobileNav.classList.remove('hidden');
                menuIcon.classList.add('hidden');
                closeIcon.classList.remove('hidden');
            }
        });
        
        // Close mobile menu when clicking on links
        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.add('hidden');
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            });
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// File upload functionality
function initializeFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const pasteTextBtn = document.getElementById('pasteTextBtn');
    const urlBtn = document.getElementById('urlBtn');
    
    if (uploadZone && fileInput) {
        // Drag and drop functionality
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });
        
        // Click to upload
        uploadZone.addEventListener('click', function() {
            fileInput.click();
        });
        
        // File input change
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }
    
    // Paste text functionality
    if (pasteTextBtn) {
        pasteTextBtn.addEventListener('click', function() {
            showTextPasteModal();
        });
    }
    
    // URL functionality
    if (urlBtn) {
        urlBtn.addEventListener('click', function() {
            showUrlModal();
        });
    }
}

function handleFileUpload(file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    
    if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, Word document, or text file.');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        return;
    }
    
    // Show loading state
    showUploadProgress();
    
    // Simulate file processing
    setTimeout(() => {
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 2000);
}

function showUploadProgress() {
    const uploadZone = document.getElementById('uploadZone');
    if (uploadZone) {
        uploadZone.innerHTML = `
            <div class="upload-icon">
                <div style="width: 3rem; height: 3rem; margin: 0 auto; border: 3px solid hsl(var(--primary) / 0.3); border-top: 3px solid hsl(var(--primary)); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
            <h3 class="upload-title">Processing Document...</h3>
            <p class="upload-description">Our AI is analyzing your document</p>
        `;
    }
    
    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

function showTextPasteModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Paste Document Text</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <textarea class="text-area" placeholder="Paste your document text here..." rows="10"></textarea>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal(this)">Cancel</button>
                <button class="btn btn-primary" onclick="processText(this)">Analyze Text</button>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
        }
        .modal-content {
            background: hsl(var(--card));
            border-radius: var(--radius-lg);
            width: 100%;
            max-width: 32rem;
            box-shadow: var(--shadow-large);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-lg);
            border-bottom: 1px solid hsl(var(--border));
        }
        .modal-header h3 {
            font-weight: 600;
            color: hsl(var(--foreground));
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: hsl(var(--muted-foreground));
        }
        .modal-body {
            padding: var(--spacing-lg);
        }
        .text-area {
            width: 100%;
            padding: var(--spacing-md);
            border: 1px solid hsl(var(--border));
            border-radius: var(--radius-md);
            background: hsl(var(--background));
            color: hsl(var(--foreground));
            font-family: inherit;
            resize: vertical;
        }
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: var(--spacing-sm);
            padding: var(--spacing-lg);
            border-top: 1px solid hsl(var(--border));
        }
    `;
    
    if (!document.querySelector('#modal-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'modal-styles';
        styleElement.textContent = modalStyles;
        document.head.appendChild(styleElement);
    }
    
    document.body.appendChild(modal);
}

function showUrlModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Analyze from URL</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <input type="url" class="form-input" placeholder="Enter document URL..." id="urlInput">
                <p style="margin-top: var(--spacing-sm); font-size: 0.875rem; color: hsl(var(--muted-foreground));">
                    Supported: Google Docs, Dropbox, OneDrive public links
                </p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal(this)">Cancel</button>
                <button class="btn btn-primary" onclick="processUrl(this)">Analyze URL</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeModal(element) {
    const modal = element.closest('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function processText(element) {
    const textarea = element.closest('.modal-overlay').querySelector('.text-area');
    const text = textarea.value.trim();
    
    if (text.length < 100) {
        alert('Please paste at least 100 characters of text.');
        return;
    }
    
    closeModal(element);
    showUploadProgress();
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

function processUrl(element) {
    const urlInput = element.closest('.modal-overlay').querySelector('#urlInput');
    const url = urlInput.value.trim();
    
    if (!url || !isValidUrl(url)) {
        alert('Please enter a valid URL.');
        return;
    }
    
    closeModal(element);
    showUploadProgress();
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Dashboard functionality
function initializeDashboard() {
    // Section navigation
    const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Update active nav item
            sidebarNavItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Accordion functionality
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Close all other accordions
            accordionTriggers.forEach(otherTrigger => {
                if (otherTrigger !== this) {
                    otherTrigger.setAttribute('aria-expanded', 'false');
                    const otherContent = document.getElementById(otherTrigger.getAttribute('data-target'));
                    if (otherContent) {
                        otherContent.classList.remove('expanded');
                    }
                }
            });
            
            // Toggle current accordion
            if (isExpanded) {
                this.setAttribute('aria-expanded', 'false');
                content.classList.remove('expanded');
            } else {
                this.setAttribute('aria-expanded', 'true');
                content.classList.add('expanded');
            }
        });
    });
    
    // Chat functionality
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    
    if (sendBtn && chatInput && chatMessages) {
        sendBtn.addEventListener('click', function() {
            sendMessage();
        });
        
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                chatInput.value = this.textContent;
                sendMessage();
            });
        });
    }
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message chat-user';
    userMessage.innerHTML = `
        <div class="message-avatar">
            <i data-lucide="user" class="icon"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    chatMessages.appendChild(userMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const aiMessage = document.createElement('div');
        aiMessage.className = 'chat-message chat-ai';
        aiMessage.innerHTML = `
            <div class="message-avatar">
                <i data-lucide="bot" class="icon"></i>
            </div>
            <div class="message-content">
                <p>${generateAIResponse(message)}</p>
            </div>
        `;
        chatMessages.appendChild(aiMessage);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 1000);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Reinitialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function generateAIResponse(userMessage) {
    const responses = {
        'pets': 'According to your rental agreement, pets are not allowed without written consent from the landlord. There\'s also a non-refundable pet fee of $500. I recommend discussing this with your landlord if you have or plan to get pets.',
        'rent': 'Your rent is $1,500 per month, due on the 1st of each month. Late payments may incur additional fees as specified in the lease terms.',
        'move': 'To terminate your lease early, you need to provide 60 days written notice and pay a penalty of 2 months\' rent. The standard lease term is 12 months.',
        'deposit': 'Your security deposit is $3,000, which is 2x your monthly rent. This is higher than the typical state maximum of 1.5x monthly rent. You may want to negotiate this amount.',
        'default': 'I can help you understand any aspect of your rental agreement. Feel free to ask about specific clauses, terms, or conditions you\'d like me to explain in simple terms.'
    };
    
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('pet')) return responses.pets;
    if (lowerMessage.includes('rent') || lowerMessage.includes('payment')) return responses.rent;
    if (lowerMessage.includes('move') || lowerMessage.includes('terminate') || lowerMessage.includes('leave')) return responses.move;
    if (lowerMessage.includes('deposit')) return responses.deposit;
    
    return responses.default;
}

// Authentication functionality
function initializeAuth() {
    const switchToSignUp = document.getElementById('switchToSignUp');
    const switchToSignIn = document.getElementById('switchToSignIn');
    const signInCard = document.querySelector('.auth-card:not(.hidden)');
    const signUpCard = document.getElementById('signUpCard');
    
    if (switchToSignUp && switchToSignIn && signInCard && signUpCard) {
        switchToSignUp.addEventListener('click', function() {
            signInCard.classList.add('hidden');
            signUpCard.classList.remove('hidden');
        });
        
        switchToSignIn.addEventListener('click', function() {
            signUpCard.classList.add('hidden');
            signInCard.classList.remove('hidden');
        });
    }
    
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const eyeIcon = this.querySelector('[id$="EyeIcon"]');
            const eyeOffIcon = this.querySelector('[id$="EyeOffIcon"]');
            
            if (input.type === 'password') {
                input.type = 'text';
                eyeIcon.classList.add('hidden');
                eyeOffIcon.classList.remove('hidden');
            } else {
                input.type = 'password';
                eyeIcon.classList.remove('hidden');
                eyeOffIcon.classList.add('hidden');
            }
        });
    });
    
    // Password strength validation
    const signUpPassword = document.getElementById('signUpPassword');
    if (signUpPassword) {
        signUpPassword.addEventListener('input', function() {
            validatePassword(this.value);
        });
    }
    
    // Form submissions
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    
    if (signInForm) {
        signInForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Simulate sign in
            alert('Sign in functionality would be implemented here.');
        });
    }
    
    if (signUpForm) {
        signUpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Simulate sign up
            alert('Sign up functionality would be implemented here.');
        });
    }
}

function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password)
    };
    
    Object.keys(requirements).forEach(req => {
        const element = document.querySelector(`[data-req="${req}"]`);
        if (element) {
            if (requirements[req]) {
                element.classList.add('valid');
            } else {
                element.classList.remove('valid');
            }
        }
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && typeof lucide !== 'undefined') {
        // Re-initialize icons when page becomes visible
        lucide.createIcons();
    }
});

// Handle window resize
window.addEventListener('resize', debounce(function() {
    // Handle responsive behaviors if needed
}, 250));