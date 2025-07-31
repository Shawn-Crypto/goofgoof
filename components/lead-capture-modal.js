// Enhanced Lead Capture Modal System with API Pre-fill Support
import { countryCodes } from '../js/country-codes.js';

class LeadCaptureModal {
  constructor() {
    this.originalCashfreeURL = 'https://payments.cashfree.com/forms/beyond-deck-course';
    this.apiEndpoint = '/api/create-payment'; // For Phase 2
    this.webhookURL = 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/'; // Configure this
    this.useAPI = true; // Toggle this when API is ready
    this.cashfreeSDK = null; // To hold the Cashfree SDK instance
    this.formLoadedTime = Date.now(); // For submission timer
    this.init();
  }

  init() {
    // Check if API endpoint is available
    this.checkAPIAvailability();
    
    // Intercept all CTA button clicks
    this.interceptCTAButtons();
    
    // Add modal HTML to page
    this.injectModalHTML();
    
    // Add event listeners for global events like 'Escape' key
    this.addEventListeners();
  }

  async checkAPIAvailability() {
    try {
      const response = await fetch('/api/health-check', { method: 'HEAD' });
      this.useAPI = response.ok;
      console.log(`Payment API ${this.useAPI ? 'available' : 'not available'} - using ${this.useAPI ? 'API flow' : 'direct redirect'}`);
      
      setTimeout(() => {
        const helpText = document.getElementById('helpText');
        if (helpText && !this.useAPI) {
          helpText.textContent = '💡 Why? If payment fails, we\'ll help you complete your purchase';
        }
      }, 1000);
    } catch (error) {
      this.useAPI = false;
      console.log('Payment API not available - using direct redirect flow');
    }
  }

  interceptCTAButtons() {
    const ctaButtons = document.querySelectorAll('a[href*="cashfree"], button[onclick*="cashfree"], .cta-button');
    
    ctaButtons.forEach(button => {
      button.removeAttribute('href');
      button.removeAttribute('onclick');
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.showModal();
        this.formLoadedTime = Date.now();
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'lead_capture_modal_shown', {
            'event_category': 'engagement',
            'event_label': 'pre_payment_capture'
          });
        }
      });
    });
  }

  async injectModalHTML() {
    try {
      const response = await fetch('components/lead-capture-modal.html');
      const modalHTML = await response.text();
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      // Modal HTML injected into DOM - debug log removed for security

      await this.loadCashfreeJSSDK();
      this.populateCountryCodes();

      // Ensure button listeners are attached only after the modal is fully in DOM
      // Use a slight delay or DOMContentLoaded equivalent if needed for elements rendered later
      setTimeout(() => { // Using setTimeout to ensure elements are fully rendered/parsed by browser
        this.attachModalButtonListeners();
      }, 0); // Execute as soon as possible after current task queue clears

    } catch (error) {
      console.error('Failed to load modal HTML or Cashfree SDK:', error);
    }
  }
  
  // ***FIX***: Correctly initialize the Cashfree SDK as per their documentation.
  async loadCashfreeJSSDK() {
    return new Promise((resolve, reject) => {
        // Get environment with secure fallback to SANDBOX
        let frontendEnv = window.GLOBAL_CASHFREE_ENVIRONMENT || 'SANDBOX';
        
        // Validate environment value - security hardening
        const validEnvironments = ['PRODUCTION', 'SANDBOX', 'TEST'];
        if (!validEnvironments.includes(frontendEnv)) {
            console.warn(`Invalid environment value: ${frontendEnv}, defaulting to SANDBOX for security`);
            frontendEnv = 'SANDBOX';
        }
        
        // Check if environment variable injection failed
        let sdkMode;
        if (frontendEnv.includes('$CASHFREE_ENVIRONMENT') || !frontendEnv) {
            console.error('Environment variable not properly configured - failing safe to SANDBOX');
            frontendEnv = 'SANDBOX';
            sdkMode = 'sandbox';
            
            // Show configuration error to user if needed
            if (this.showConfigurationError) {
                this.showConfigurationError();
            }
        } else {
            sdkMode = frontendEnv === 'PRODUCTION' ? 'production' : 'sandbox';
        }
        
        // Conditional logging - only log in development environments
        const isDevelopment = frontendEnv === 'SANDBOX' || window.location.hostname.includes('localhost');
        if (isDevelopment) {
            console.log(`Initializing Cashfree SDK with environment: ${frontendEnv}, mode: ${sdkMode}`);
        }

        if (window.Cashfree) {
            this.cashfreeSDK = new Cashfree({
                mode: sdkMode === 'production' ? 'production' : 'sandbox'
            });
            if (isDevelopment) {
                console.log('Cashfree JS SDK already loaded, initialized with mode:', sdkMode);
            }
            return resolve(this.cashfreeSDK);
        }

        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v4/cashfree.js';
        script.onload = () => {
            try {
                this.cashfreeSDK = new Cashfree({
                    mode: sdkMode === 'production' ? 'production' : 'sandbox'
                });
                if (isDevelopment) {
                    console.log('Cashfree JS SDK loaded dynamically, initialized with mode:', sdkMode);
                }
                
                // Validate SDK initialization
                if (!this.cashfreeSDK) {
                    throw new Error('Failed to initialize Cashfree SDK');
                }
                
                // Test SDK methods are available
                if (typeof this.cashfreeSDK.checkout !== 'function') {
                    throw new Error('Cashfree SDK checkout method not available');
                }
                
                resolve(this.cashfreeSDK);
            } catch (error) {
                console.error('Error initializing Cashfree SDK:', error);
                reject(error);
            }
        };
        script.onerror = (e) => {
            console.error('Failed to load Cashfree JS SDK:', e);
            reject(e);
        };
        document.head.appendChild(script);
    });
  }


  showModal() {
    const modal = document.getElementById('leadCaptureModal');
    modal.style.display = 'flex';
    this.setupButtonLoading();
    setTimeout(() => {
      document.getElementById('email').focus();
    }, 100);
    document.body.style.overflow = 'hidden';
  }

  setupButtonLoading() {
    const button = document.getElementById('continueToPayment');
    if (button) {
      button.originalText = button.textContent;
      button.setLoading = (loading) => {
        if (loading) {
          button.textContent = 'Processing...';
          button.disabled = true;
          button.classList.add('loading');
        } else {
          button.textContent = button.originalText;
          button.disabled = false;
          button.classList.remove('loading');
        }
      };
    }
  }

  closeModal() {
    const modal = document.getElementById('leadCaptureModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  addEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });

    setTimeout(() => {
      const modal = document.getElementById('leadCaptureModal');
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target.id === 'leadCaptureModal') {
            this.closeModal();
          }
        });
      }
    }, 1000);
  }

  async populateCountryCodes() {
    const selectElement = document.getElementById('countryCode');
    if (!selectElement) return;
    const sortedCountryCodes = [...countryCodes].sort((a, b) => a.name.localeCompare(b.name));
    sortedCountryCodes.forEach(country => {
        const option = document.createElement('option');
        option.value = country.dial_code;
        option.textContent = `${country.name} (${country.dial_code})`;
        selectElement.appendChild(option);
    });
    selectElement.value = '+91';
  }

  // --- VALIDATION METHODS --- //
  validateName(name) {
    if (typeof name !== 'string' || name.length < 2) return false;
    const regex = /^[a-zA-Z\s'-]+$/;
    return regex.test(name);
  }

  validateEmail(email) {
    if (typeof email !== 'string' || email.trim() === '') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && !email.includes(' ');
  }

  validatePhoneNumber(numberPart, countryCode) {
    if (typeof numberPart !== 'string' || numberPart.trim() === '') return false;
    const cleanNumber = numberPart.replace(/\D/g, '');
    if (countryCode === '+91') {
      const indianRegex = /^[6-9]\d{9}$/;
      return cleanNumber.length === 10 && indianRegex.test(cleanNumber);
    }
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
  }

  // NEW METHOD: Attach listeners to modal's internal buttons
  attachModalButtonListeners() {
      console.log('🔗 Attempting to attach modal button listeners...');
      try {
          const continueButton = document.getElementById('continueToPayment');
          console.log('Continue button found:', continueButton);
          
          if (continueButton) {
              // Remove any existing listeners to prevent duplicates
              const newButton = continueButton.cloneNode(true);
              continueButton.parentNode.replaceChild(newButton, continueButton);
              
              // Use bind to ensure proper context
              newButton.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔥 Continue button clicked! Context:', this);
                  console.log('🔥 Function exists:', typeof this.submitLeadAndProceed);
                  debugger; // CRITICAL: Execution will pause here.
                  
                  try {
                    this.submitLeadAndProceed();
                  } catch (error) {
                    console.error('❌ Error calling submitLeadAndProceed:', error);
                  }
              });
              console.log('✅ Successfully attached click listener to #continueToPayment');
          } else {
              console.error('❌ CRITICAL: #continueToPayment button not found in DOM!');
              // Try to find it by class or other selector
              const alternateButton = document.querySelector('.primary-button');
              console.log('Alternate button found:', alternateButton);
          }

          const closeButton = document.getElementById('closeLCModalButton');
          if (closeButton) {
              closeButton.addEventListener('click', () => this.closeModal());
              console.log('✅ Successfully attached close listener');
          } else {
              console.warn('⚠️ WARNING: #closeLCModalButton button not found in DOM.');
          }
      } catch (e) {
          console.error('❌ CRITICAL ERROR: Failed to attach modal button listeners:', e);
          console.error('Error stack:', e.stack);
      }
  }

  async submitLeadAndProceed() {
    console.log('🚀 submitLeadAndProceed function ENTERED');
    debugger;
    
    try {
      const form = document.getElementById('leadCaptureForm');
      console.log('Form element found:', form);
      
      if (!form) {
        console.error('❌ CRITICAL: Form element #leadCaptureForm not found!');
        alert('Form not found - please refresh the page');
        return;
      }
      
      const formData = new FormData(form);
      console.log('FormData created successfully:', formData);
    
    const email = formData.get('email');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const countryCode = formData.get('countryCode');
    const phoneNumberPart = formData.get('phoneNumber');
    const phone = countryCode + phoneNumberPart;

    // --- VALIDATION CHECKS --- //
    if (!this.validateName(firstName)) {
        alert('Please enter a valid First Name.');
        return;
    }
    if (!this.validateName(lastName)) {
        alert('Please enter a valid Last Name.');
        return;
    }
    if (!this.validateEmail(email)) {
        alert('Please enter a valid Email Address.');
        return;
    }
    if (!this.validatePhoneNumber(phoneNumberPart, countryCode)) {
        alert('Please enter a valid Mobile Number.');
        return;
    }
    
    const timeElapsed = Date.now() - this.formLoadedTime;
    if (timeElapsed < 2000) {
        alert('Please review the details before submitting.');
        return;
    }

    const submitButton = document.getElementById('continueToPayment');
    submitButton.setLoading(true);

    try {
      const leadData = { email, firstName, lastName, phone, timestamp: new Date().toISOString(), source: 'pre_payment_capture', intent: 'high', amount: '1499', currency: 'INR' };
      await this.sendLeadData(leadData);
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'lead_captured', { 'event_category': 'conversion', 'event_label': 'pre_payment', 'value': 1499 });
      }

      localStorage.setItem('leadCaptureData', JSON.stringify(leadData));
      this.closeModal();

      if (this.useAPI) {
        await this.processAPIPayment(leadData);
      } else {
        this.redirectToPayment();
      }

    } catch (error) {
      console.error('❌ CRITICAL ERROR in submitLeadAndProceed:', error);
      console.error('Error stack:', error.stack);
      
      const submitButton = document.getElementById('continueToPayment');
      if (submitButton && submitButton.setLoading) {
        submitButton.setLoading(false);
      }
      
      alert('We\'ll proceed to payment. Your information is saved!');
      this.closeModal();
      
      try {
        if (this.useAPI) {
          await this.processAPIPayment({ email: 'error@domain.com', firstName: 'Error', lastName: 'User', phone: '+911234567890' });
        } else {
          this.redirectToPayment();
        }
      } catch (fallbackError) {
        console.error('❌ Fallback payment also failed:', fallbackError);
        this.redirectToPayment();
      }
    }
  }

  async processAPIPayment(customerData) {
    try {
        document.body.style.cursor = 'wait';
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer_email: customerData.email,
                customer_name: `${customerData.firstName} ${customerData.lastName || ''}`.trim(),
                customer_phone: customerData.phone,
                order_amount: 1499.00,
                order_currency: 'INR'
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const paymentData = await response.json();

        console.log('Payment session created:', paymentData);

        if (this.cashfreeSDK && paymentData.payment_session_id) {
            // FIXED: Use correct SDK v4 checkout method
            const checkoutOptions = {
                paymentSessionId: paymentData.payment_session_id,
                returnUrl: `https://lfgventures.in/success.html?order_id=${paymentData.order_id}&email=${encodeURIComponent(customerData.email)}`
            };
            
            console.log('Initiating checkout with options:', checkoutOptions);
            await this.cashfreeSDK.checkout(checkoutOptions);
        } else {
            console.error('Cashfree SDK not ready or payment_session_id missing:', {
                sdkReady: !!this.cashfreeSDK,
                sessionId: paymentData.payment_session_id
            });
            this.redirectToPayment();
        }
    } catch (error) {
        console.error('API payment failed:', error);
        this.redirectToPayment();
    } finally {
        document.body.style.cursor = 'default';
    }
  }

  async sendLeadData(leadData) {
    if (this.webhookURL.includes('YOUR_WEBHOOK_ID')) {
      console.warn('Webhook URL not configured. Skipping lead submission.');
      return;
    }
    const response = await fetch(this.webhookURL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(leadData) });
    if (!response.ok) throw new Error('Webhook submission failed');
    return response;
  }

  redirectToPayment() {
    setTimeout(() => {
      window.location.href = this.originalCashfreeURL;
    }, 500);
  }
}

// Global functions for modal interactions
function closeLCModal() {
  window.leadCaptureModal.closeModal();
}

function submitLeadAndProceed() {
  window.leadCaptureModal.submitLeadAndProceed(); // FIXED TYPO
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing LeadCaptureModal...');
  try {
    window.leadCaptureModal = new LeadCaptureModal();
    console.log('✅ LeadCaptureModal initialized successfully:', window.leadCaptureModal);
    console.log('✅ submitLeadAndProceed method exists:', typeof window.leadCaptureModal.submitLeadAndProceed);
  } catch (error) {
    console.error('❌ Failed to initialize LeadCaptureModal:', error);
  }
});