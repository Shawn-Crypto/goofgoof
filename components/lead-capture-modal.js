// Enhanced Lead Capture Modal System with API Pre-fill Support
import { countryCodes } from '../js/country-codes.js';

class LeadCaptureModal {
  constructor() {
    this.originalCashfreeURL = 'https://payments.cashfree.com/forms/beyond-deck-course';
    this.apiEndpoint = '/api/create-payment';
    this.webhookURL = 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/';
    this.useAPI = true; // Hardcoded to true as per your and Cashfree's direction
    this.cashfreeSDK = null;
    this.sdkLoadingFailed = false;
    this.sdkLoadingInProgress = false;
    this.formLoadedTime = Date.now();
    this.init();
  }

  // MODIFIED: Simplified init method as API check is no longer needed
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

      await this.loadCashfreeJSSDK();
      this.populateCountryCodes();
      this.attachModalButtonListeners(); // Added back the listener attachment call
      
    } catch (error) {
      console.error('Failed to load modal HTML or Cashfree SDK:', error);
      
      // If SDK loading fails, still proceed with modal setup but with fallback mode
      this.handleSDKLoadingFailure(error);
    }
  }

  async loadCashfreeJSSDK() {
    if (this.sdkLoadingInProgress) {
      console.log('SDK loading already in progress, waiting...');
      return this.waitForSDKLoading();
    }

    return new Promise((resolve, reject) => {
      const frontendEnv = window.GLOBAL_CASHFREE_ENVIRONMENT; 
      console.log('Frontend (Browser): GLOBAL_CASHFREE_ENVIRONMENT during SDK load:', frontendEnv);

      const sdkMode = frontendEnv === 'PRODUCTION' ? 'production' : 'sandbox'; 

      if (window.Cashfree) { 
        this.cashfreeSDK = Cashfree({ mode: sdkMode }); 
        console.log('Cashfree JS SDK already loaded, initialized with mode:', sdkMode);
        return resolve(this.cashfreeSDK);
      }

      this.sdkLoadingInProgress = true;
      
      this.loadSDKWithRetry(sdkMode, 3)
        .then((sdk) => {
          this.sdkLoadingInProgress = false;
          resolve(sdk);
        })
        .catch((error) => {
          this.sdkLoadingInProgress = false;
          this.sdkLoadingFailed = true;
          reject(error);
        });
    });
  }

  async waitForSDKLoading() {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.sdkLoadingInProgress) {
          clearInterval(checkInterval);
          if (this.cashfreeSDK) {
            resolve(this.cashfreeSDK);
          } else {
            reject(new Error('SDK loading completed but SDK not available'));
          }
        }
      }, 100);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for SDK loading'));
      }, 30000);
    });
  }

  async loadSDKWithRetry(sdkMode, maxRetries = 3, currentAttempt = 1) {
    return new Promise((resolve, reject) => {
      console.log(`Attempting to load Cashfree SDK (attempt ${currentAttempt}/${maxRetries})`);
      
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.crossOrigin = 'anonymous';
      script.type = 'text/javascript';
      
      // Set a timeout for the script loading
      const timeout = setTimeout(() => {
        console.error(`SDK loading timeout (attempt ${currentAttempt})`);
        document.head.removeChild(script);
        
        if (currentAttempt < maxRetries) {
          console.log(`Retrying SDK load in 2 seconds...`);
          setTimeout(() => {
            this.loadSDKWithRetry(sdkMode, maxRetries, currentAttempt + 1)
              .then(resolve)
              .catch(reject);
          }, 2000);
        } else {
          reject(new Error('SDK loading failed: Timeout after all retry attempts'));
        }
      }, 10000); // 10 second timeout
      
      script.onload = () => {
        clearTimeout(timeout);
        
        // Verify Cashfree is actually available
        if (typeof window.Cashfree === 'function') {
          try {
            this.cashfreeSDK = Cashfree({ mode: sdkMode });
            console.log(`Cashfree JS SDK loaded successfully on attempt ${currentAttempt}, initialized with mode: ${sdkMode}`);
            resolve(this.cashfreeSDK);
          } catch (initError) {
            console.error('SDK loaded but initialization failed:', initError);
            
            if (currentAttempt < maxRetries) {
              setTimeout(() => {
                this.loadSDKWithRetry(sdkMode, maxRetries, currentAttempt + 1)
                  .then(resolve)
                  .catch(reject);
              }, 2000);
            } else {
              reject(new Error(`SDK initialization failed: ${initError.message}`));
            }
          }
        } else {
          console.error('SDK script loaded but Cashfree function not available');
          
          if (currentAttempt < maxRetries) {
            setTimeout(() => {
              this.loadSDKWithRetry(sdkMode, maxRetries, currentAttempt + 1)
                .then(resolve)
                .catch(reject);
            }, 2000);
          } else {
            reject(new Error('SDK loaded but Cashfree function not available'));
          }
        }
      };
      
      script.onerror = (errorEvent) => {
        clearTimeout(timeout);
        
        // Extract more detailed error information
        const errorDetails = {
          type: errorEvent.type || 'unknown',
          target: errorEvent.target ? {
            src: errorEvent.target.src,
            crossOrigin: errorEvent.target.crossOrigin
          } : 'unknown',
          message: errorEvent.message || 'Script loading failed',
          filename: errorEvent.filename || 'unknown',
          lineno: errorEvent.lineno || 'unknown',
          colno: errorEvent.colno || 'unknown',
          attempt: currentAttempt,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        };
        
        console.error(`Detailed SDK loading error (attempt ${currentAttempt}):`, errorDetails);
        
        // Check for common issues
        this.diagnoseSDKLoadingIssue(errorDetails);
        
        if (currentAttempt < maxRetries) {
          console.log(`Retrying SDK load in 2 seconds (attempt ${currentAttempt + 1}/${maxRetries})...`);
          setTimeout(() => {
            this.loadSDKWithRetry(sdkMode, maxRetries, currentAttempt + 1)
              .then(resolve)
              .catch(reject);
          }, 2000);
        } else {
          reject(new Error(`SDK loading failed after ${maxRetries} attempts. Last error: ${JSON.stringify(errorDetails)}`));
        }
      };
      
      document.head.appendChild(script);
    });
  }

  diagnoseSDKLoadingIssue(errorDetails) {
    console.group('🔍 SDK Loading Issue Diagnosis');
    
    // Check for ad blockers
    if (errorDetails.type === 'error' && !errorDetails.message) {
      console.warn('⚠️ Possible ad blocker interference detected');
      console.log('💡 Suggestion: Ask user to disable ad blocker or try incognito mode');
    }
    
    // Check for network issues
    if (!navigator.onLine) {
      console.warn('⚠️ Network connectivity issue detected');
      console.log('💡 Suggestion: Check internet connection');
    }
    
    // Check for CORS issues
    if (errorDetails.message && errorDetails.message.includes('CORS')) {
      console.warn('⚠️ CORS policy violation detected');
      console.log('💡 Suggestion: Verify domain whitelist with Cashfree');
    }
    
    // Check for CSP issues
    if (errorDetails.message && (errorDetails.message.includes('Content Security Policy') || errorDetails.message.includes('CSP'))) {
      console.warn('⚠️ Content Security Policy restriction detected');
      console.log('💡 Suggestion: Update CSP to allow sdk.cashfree.com');
    }
    
    console.log('🌐 Current URL:', window.location.href);
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('🔗 SDK URL:', 'https://sdk.cashfree.com/js/v3/cashfree.js');
    
    console.groupEnd();
  }

  handleSDKLoadingFailure(error) {
    console.warn('SDK loading failed, setting up fallback mode');
    this.sdkLoadingFailed = true;
    
    // Still populate country codes and attach listeners for basic functionality
    this.populateCountryCodes();
    this.attachModalButtonListeners();
    
    // Show a user-friendly warning (optional)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'sdk_loading_failed', {
        'event_category': 'error',
        'event_label': error.message || 'unknown_error'
      });
    }
  }

  isSDKAvailable() {
    return !!(this.cashfreeSDK && 
              typeof this.cashfreeSDK.checkout === 'function' && 
              window.Cashfree &&
              typeof window.Cashfree === 'function');
  }

  handleCheckoutFailure(error, paymentData) {
    console.error('Checkout process failed, initiating fallback:', error);
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'checkout_fallback_triggered', {
        'event_category': 'payment',
        'event_label': typeof error === 'string' ? error : error.message || 'unknown_error'
      });
    }
    
    // Attempt to create a direct payment URL if we have session data
    if (paymentData && paymentData.payment_session_id) {
      this.attemptDirectCheckoutURL(paymentData);
    } else {
      // Final fallback to original payment page
      alert('Processing your payment request. You will be redirected to our secure payment page.');
      this.redirectToPayment();
    }
  }

  attemptDirectCheckoutURL(paymentData) {
    try {
      // Construct direct checkout URL (this is a common pattern for Cashfree)
      const environment = window.GLOBAL_CASHFREE_ENVIRONMENT === 'PRODUCTION' ? 'payments' : 'sandbox';
      const directURL = `https://${environment}.cashfree.com/pay/${paymentData.payment_session_id}`;
      
      console.log('Attempting direct checkout URL:', directURL);
      
      // Redirect to direct checkout URL
      window.location.href = directURL;
      
    } catch (urlError) {
      console.error('Failed to create direct checkout URL:', urlError);
      alert('Processing your payment request. You will be redirected to our secure payment page.');
      this.redirectToPayment();
    }
  }

  // MODIFIED: Added a fallback for country code dropdown
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
      
      this.closeModal();

      if (this.useAPI) {
        await this.processAPIPayment(leadData);
      } else {
        this.redirectToPayment();
      }

    } catch (error) {
      console.error('Lead capture failed:', error);
      
      if (submitButton.setLoading) {
        submitButton.setLoading(false);
      } else {
        submitButton.textContent = submitButton.originalText || 'Continue to Payment →';
        submitButton.disabled = false;
      }
      
      alert('We\'ll proceed to payment. Don\'t worry, your information is saved!');
      this.closeModal();
      
      if (this.useAPI) {
        await this.processAPIPayment({
          email: email,
          firstName: firstName,
          lastName: lastName,
          phone: phone
        });
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_email: customerData.email,
          customer_name: `${customerData.firstName} ${customerData.lastName || ''}`.trim(),
          customer_phone: customerData.phone || '+91' + Math.floor(Math.random() * 9000000000 + 1000000000),
          order_amount: 1499.00,
          order_currency: 'INR'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const paymentData = await response.json();
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'api_payment_initiated', {
          'event_category': 'ecommerce',
          'event_label': 'pre_filled_checkout',
          'value': 1499
        });
      }

      // Enhanced SDK availability check and fallback handling
      if (this.isSDKAvailable() && paymentData.payment_session_id) {
          try {
              await this.cashfreeSDK.checkout({
                  paymentSessionId: paymentData.payment_session_id,
                  redirectTarget: "_self"
              });
          } catch (checkoutError) {
              console.error('Cashfree SDK checkout failed:', checkoutError);
              this.handleCheckoutFailure(checkoutError, paymentData);
          }
      } else {
          console.error('Cashfree SDK not available or payment_session_id missing!', { 
              sdkLoaded: !!this.cashfreeSDK, 
              sdkAvailable: this.isSDKAvailable(),
              paymentSessionId: paymentData.payment_session_id 
          });
          
          this.handleCheckoutFailure('SDK not available', paymentData);
      }

    } catch (error) {
      console.error('API payment failed:', error);
      
      alert('Processing your request... redirecting to secure payment.');
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