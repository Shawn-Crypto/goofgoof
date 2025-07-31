// Enhanced Lead Capture Modal System with API Pre-fill Support
import { countryCodes } from '../js/country-codes.js';

class LeadCaptureModal {
  constructor() {
    this.originalCashfreeURL = 'https://payments.cashfree.com/forms/beyond-deck-course';
    this.webhookURL = 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/';
    this.formLoadedTime = Date.now();
    this.init();
  }

  init() {
    this.interceptCTAButtons();
    this.injectModalHTML();
    this.addEventListeners();
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
      console.log('Modal HTML injected into DOM.');

      this.populateCountryCodes();
      this.attachModalButtonListeners();
      
    } catch (error) {
      console.error('Failed to load modal HTML:', error);
      alert('Unable to load the form. Please try refreshing the page.');
    }
  }


  populateCountryCodes() {
    const selectElement = document.getElementById('countryCode');
    if (!selectElement) {
        console.error('Country code select element not found.');
        return;
    }

    const sortedCountryCodes = [...countryCodes].sort((a, b) => a.name.localeCompare(b.name));

    sortedCountryCodes.forEach(country => {
        const option = document.createElement('option');
        option.value = country.dial_code;
        option.textContent = `${country.name} (${country.dial_code})`;
        selectElement.appendChild(option);
    });

    selectElement.value = '+91'; // Default to India
    console.log('Country codes populated, default set to +91.');
  }

  attachModalButtonListeners() {
    const continueButton = document.getElementById('continueToPayment');
    if (continueButton) {
        continueButton.addEventListener('click', () => {
            this.submitLeadAndProceed();
        });
    }

    const closeButton = document.getElementById('closeLCModalButton');
    if (closeButton) {
        closeButton.addEventListener('click', () => this.closeModal());
    }
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

  // MODIFIED: Corrected submitLeadAndProceed to fix the syntax error
  async submitLeadAndProceed() {
    const form = document.getElementById('leadCaptureForm');
    const formData = new FormData(form);
    
    const email = formData.get('email');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const countryCode = formData.get('countryCode'); 
    const phoneNumberPart = formData.get('phoneNumber');
    const phone = countryCode + phoneNumberPart; 

    // --- INTEGRATE VALIDATION --- //
    if (!this.validateName(firstName)) {
        alert('Please enter a valid First Name (alphabets, spaces, hyphens, apostrophes only, min 2 characters).');
        return;
    }
    if (!this.validateName(lastName)) {
        alert('Please enter a valid Last Name (alphabets, spaces, hyphens, apostrophes only, min 2 characters).');
        return;
    }
    if (!this.validateEmail(email)) {
        alert('Please enter a valid Email Address.');
        return;
    }
    if (!this.validatePhoneNumber(phoneNumberPart, countryCode)) {
        if (countryCode === '+91') {
            alert('Please enter a valid 10-digit Indian Mobile Number (starts with 6, 7, 8, or 9).');
        } else {
            alert('Please enter a valid Mobile Number (10-15 digits, digits only).');
        }
        return;
    }
    
    // Submission Timer (2 seconds delay)
    const timeElapsed = Date.now() - this.formLoadedTime;
    if (timeElapsed < 2000) {
        alert('Please wait a moment before submitting to ensure data integrity.');
        return;
    }

    // Show loading state
    const submitButton = document.getElementById('continueToPayment');
    if (submitButton.setLoading) {
      submitButton.setLoading(true);
    } else {
      submitButton.textContent = 'Processing...';
      submitButton.disabled = true;
    }

    try {
      const leadData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone, 
        timestamp: new Date().toISOString(),
        source: 'pre_payment_capture',
        intent: 'high', 
        amount: '1499',
        currency: 'INR'
      };

      await this.sendLeadData(leadData);
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'lead_captured', {
          'event_category': 'conversion',
          'event_label': 'pre_payment',
          'value': 1499
        });
      }

      localStorage.setItem('leadCaptureData', JSON.stringify(leadData));
      
      // Use API-based payment processing (modal will be closed before redirect)
      await this.processAPIPayment(leadData);

    } catch (error) {
      console.error('Lead capture failed:', error);
      
      if (submitButton.setLoading) {
        submitButton.setLoading(false);
      } else {
        submitButton.textContent = submitButton.originalText || 'Continue to Payment →';
        submitButton.disabled = false;
      }
      
      alert('We\'ll proceed to payment. Don\'t worry, your information is saved!');
      
      // Use API-based payment processing even on lead capture error (modal will be closed before redirect)
      await this.processAPIPayment({
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone
      });
    }
  }

  // Load Cashfree SDK dynamically
  loadCashfreeSDK() {
    return new Promise((resolve, reject) => {
      // Check if SDK is already loaded
      if (window.Cashfree && typeof window.Cashfree === 'function') {
        console.log('Cashfree SDK already loaded');
        resolve(window.Cashfree);
        return;
      }

      // Create script element for Cashfree SDK
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      
      script.onload = () => {
        // Wait a bit for the SDK to fully initialize
        setTimeout(() => {
          if (window.Cashfree && typeof window.Cashfree === 'function') {
            console.log('Cashfree SDK loaded successfully');
            console.log('Cashfree SDK type:', typeof window.Cashfree);
            console.log('Cashfree SDK properties:', Object.keys(window.Cashfree || {}));
            resolve(window.Cashfree);
          } else {
            console.error('Cashfree SDK failed to initialize properly');
            console.error('window.Cashfree:', window.Cashfree);
            reject(new Error('Cashfree SDK failed to initialize'));
          }
        }, 100);
      };
      
      script.onerror = () => {
        console.error('Failed to load Cashfree SDK from URL');
        reject(new Error('Failed to load Cashfree SDK'));
      };
      
      document.head.appendChild(script);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Cashfree SDK load timeout'));
      }, 10000);
    });
  }

  // Initialize Cashfree checkout using the official SDK
  async initiateCheckout(payment_session_id) {
    try {
      // Try to load and use the official Cashfree SDK
      const Cashfree = await this.loadCashfreeSDK();
      
      // Determine environment based on global config
      const environment = window.GLOBAL_CASHFREE_ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox';
      
      console.log('Initializing Cashfree checkout with SDK:', {
        payment_session_id,
        environment,
        global_env: window.GLOBAL_CASHFREE_ENVIRONMENT
      });

      // Check SDK version and capabilities
      console.log('Cashfree SDK info:', {
        version: window.Cashfree.version || 'unknown',
        methods: Object.keys(window.Cashfree || {}).filter(key => typeof window.Cashfree[key] === 'function'),
        environment: environment,
        cashfreeType: typeof window.Cashfree,
        cashfreeConstructor: window.Cashfree.toString ? window.Cashfree.toString().substring(0, 100) : 'N/A'
      });

      // Initialize Cashfree instance with proper configuration
      let cashfree;
      try {
        cashfree = Cashfree({ 
          mode: environment
        });
        console.log('Cashfree instance created:', {
          type: typeof cashfree,
          methods: Object.keys(cashfree || {}).filter(key => typeof cashfree[key] === 'function'),
          hasCheckout: typeof cashfree?.checkout
        });
      } catch (initError) {
        console.error('Cashfree initialization error:', initError);
        throw new Error(`Cashfree SDK initialization failed: ${initError.message}`);
      }

      // Verify the instance was created properly
      if (!cashfree || typeof cashfree.checkout !== 'function') {
        console.error('Cashfree checkout verification failed:', {
          cashfree: !!cashfree,
          checkoutType: typeof cashfree?.checkout,
          availableMethods: Object.keys(cashfree || {})
        });
        throw new Error('Cashfree SDK initialization failed - checkout method not available');
      }
      
      // Start checkout process - exact pattern from dev studio
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_self"
      };

      console.log('Starting Cashfree checkout with options:', checkoutOptions);

      // Ensure modal is closed before checkout
      this.closeModal();
      
      // Small delay to ensure modal is fully closed
      setTimeout(() => {
        try {
          cashfree.checkout(checkoutOptions);
          console.log('Cashfree checkout initiated successfully');
        } catch (checkoutError) {
          console.error('Cashfree checkout failed:', checkoutError);
          // Immediate fallback to direct URL
          window.location.href = `https://payments.cashfree.com/pay/${payment_session_id}`;
        }
      }, 100);
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'cashfree_sdk_checkout_success', {
          'event_category': 'ecommerce',
          'event_label': 'sdk_checkout',
          'value': 1499
        });
      }
      
    } catch (error) {
      console.error('SDK checkout failed with detailed error:', {
        error: error,
        message: error.message,
        stack: error.stack,
        payment_session_id: payment_session_id,
        environment: environment || 'unknown',
        sdk_loaded: !!window.Cashfree
      });
      
      // Check if it's a 400 error specifically
      if (error.message && error.message.includes('400')) {
        console.error('400 Error detected. Possible causes:');
        console.error('1. Environment mismatch (production SDK with sandbox session)');
        console.error('2. Invalid payment session ID format');
        console.error('3. Session expired or already used');
        console.error('4. Missing required parameters');
      }
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'cashfree_sdk_failed', {
          'event_category': 'error',
          'event_label': 'sdk_fallback',
          'value': 1499,
          'custom_parameters': {
            'error_message': error.message,
            'environment': environment
          }
        });
      }
      
      // Enhanced fallback strategy
      console.log('Falling back to direct URL redirect');
      console.log('Trying alternative URL formats...');
      
      // Try different URL patterns
      const alternativeURLs = [
        `https://payments.cashfree.com/pay/${payment_session_id}`,
        `https://payments${environment === 'sandbox' ? '-test' : ''}.cashfree.com/pay/${payment_session_id}`,
        `https://checkout.cashfree.com/pay/${payment_session_id}`
      ];
      
      console.log('Alternative URLs to try:', alternativeURLs);
      
      // Ensure modal is closed before redirect
      this.closeModal();
      
      // Use the first alternative URL for now
      setTimeout(() => {
        window.location.href = alternativeURLs[0];
      }, 100);
    }
  }

  // API-based payment processing method
  async processAPIPayment(leadData) {
    try {
      console.log('Calling /api/create-payment endpoint with lead data:', leadData);
      
      const apiPayload = {
        customer_email: leadData.email,
        customer_name: `${leadData.firstName} ${leadData.lastName || ''}`.trim(),
        customer_phone: leadData.phone,
        order_amount: 1499.00,
        order_currency: 'INR'
      };

      const response = await fetch('/api/create-payment.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      });

      const result = await response.json();
      
      if (result.success && result.payment_session_id) {
        console.log('Payment session created successfully:', {
          order_id: result.order_id,
          payment_session_id: result.payment_session_id,
          customer_email: result.customer_details.email
        });

        if (typeof gtag !== 'undefined') {
          gtag('event', 'api_payment_created', {
            'event_category': 'ecommerce',
            'event_label': 'session_created',
            'value': 1499,
            'custom_parameters': {
              'order_id': result.order_id,
              'payment_session_id': result.payment_session_id
            }
          });
        }
        
        // Use official Cashfree SDK checkout instead of direct URL
        await this.initiateCheckout(result.payment_session_id);
        
      } else {
        throw new Error(result.error || 'Failed to create payment session');
      }
      
    } catch (error) {
      console.error('API payment processing failed:', error);
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'api_payment_failed', {
          'event_category': 'error',
          'event_label': 'fallback_to_form',
          'value': 1499
        });
      }
      
      // Fallback to the original form-based approach
      console.log('Falling back to pre-filled form redirect');
      this.redirectToPaymentWithData(leadData);
    }
  }

  // Simplified method to redirect to payment form with pre-filled data (fallback)
  redirectToPaymentWithData(leadData) {
    try {
      const baseURL = this.originalCashfreeURL;
      const params = new URLSearchParams({
        'customer_name': `${leadData.firstName} ${leadData.lastName || ''}`.trim(),
        'customer_email': leadData.email,
        'customer_phone': leadData.phone
      });
      
      const paymentURL = `${baseURL}?${params.toString()}`;
      
      console.log('Redirecting to payment form with pre-filled data:', paymentURL);
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'payment_redirect_with_data', {
          'event_category': 'ecommerce',
          'event_label': 'form_prefilled',
          'value': 1499
        });
      }
      
      // Ensure modal is closed before redirect
      this.closeModal();
      
      // Small delay to ensure tracking events are sent and modal is closed
      setTimeout(() => {
        window.location.href = paymentURL;
      }, 300);
      
    } catch (error) {
      console.error('Failed to redirect with pre-filled data:', error);
      // Fallback to basic redirect
      this.redirectToPayment();
    }
  }

  async sendLeadData(leadData) {
    if (this.webhookURL.includes('YOUR_WEBHOOK_ID')) {
      console.warn('Webhook URL not configured. Skipping lead submission.');
      return;
    }

    const response = await fetch(this.webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData)
    });

    if (!response.ok) {
      throw new Error('Webhook submission failed');
    }

    return response;
  }

  redirectToPayment() {
    console.log('Redirecting to payment form without pre-filled data');
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
  window.leadCaptureModal.submitLeadAndProceed();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.leadCaptureModal = new LeadCaptureModal();
});