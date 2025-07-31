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
      console.log('Modal HTML injected into DOM.'); // ADDED LOG

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
        const frontendEnv = window.GLOBAL_CASHFREE_ENVIRONMENT || 'PRODUCTION'; // Default to PRODUCTION
        const sdkMode = frontendEnv === 'PRODUCTION' ? 'production' : 'sandbox';

        if (window.Cashfree) {
            this.cashfreeSDK = Cashfree({ mode: sdkMode });
            console.log('Cashfree JS SDK already loaded, initialized with mode:', sdkMode);
            return resolve(this.cashfreeSDK);
        }

        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => {
            this.cashfreeSDK = Cashfree({ mode: sdkMode });
            console.log('Cashfree JS SDK loaded dynamically, initialized with mode:', sdkMode);
            resolve(this.cashfreeSDK);
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
      console.log('Attempting to attach modal button listeners...'); // ADDED LOG
      try {
          const continueButton = document.getElementById('continueToPayment');
          if (continueButton) {
              console.log('Found #continueToPayment button.'); // ADDED LOG
              continueButton.addEventListener('click', () => {
                  console.log('Continue button click listener triggered.');
                  debugger; // CRITICAL: Execution will pause here.
                  this.submitLeadAndProceed();
                  console.log('submitLeadAndProceed call initiated (from listener).'); 
              });
              console.log('Attached click listener to #continueToPayment.'); // ADDED LOG
          } else {
              console.warn('WARNING: #continueToPayment button not found in DOM.'); // ADDED LOG
          }

          const closeButton = document.getElementById('closeLCModalButton');
          if (closeButton) {
              console.log('Found #closeLCModalButton button.'); // ADDED LOG
              closeButton.addEventListener('click', () => this.closeModal());
              console.log('Attached click listener to #closeLCModalButton.'); // ADDED LOG
          } else {
              console.warn('WARNING: #closeLCModalButton button not found in DOM.'); // ADDED LOG
          }
      } catch (e) {
          console.error('ERROR: Failed to attach modal button listeners:', e); // ADDED ERROR CATCH
      }
  }

  async submitLeadAndProceed() {
    console.log('submitLeadAndProceed function entered.'); // ADDED LOG
    const form = document.getElementById('leadCaptureForm');
    const formData = new FormData(form);
    
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
      console.error('Lead capture failed:', error);
      submitButton.setLoading(false);
      alert('We\'ll proceed to payment. Your information is saved!');
      this.closeModal();
      
      if (this.useAPI) {
        await this.processAPIPayment({ email, firstName, lastName, phone });
      } else {
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

        if (this.cashfreeSDK && paymentData.payment_session_id) {
            this.cashfreeSDK.checkout({
                paymentSessionId: paymentData.payment_session_id,
                redirectTarget: "_self"
            });
        } else {
            console.error('Cashfree SDK not ready or payment_session_id missing.');
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
  window.leadCaptureModal = new LeadCaptureModal();
});