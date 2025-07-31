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
    
    // Add event listeners
    this.addEventListeners();
  }

  async checkAPIAvailability() {
    try {
      // NOTE: This checkAPIAvailability might not be necessary if this.useAPI is always true.
      // If this.useAPI is always true, you can remove this method and its call from init().
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
    // Find all CTA buttons that point to Cashfree
    const ctaButtons = document.querySelectorAll('a[href*="cashfree"], button[onclick*="cashfree"], .cta-button');
    
    ctaButtons.forEach(button => {
      // Remove original href/onclick
      button.removeAttribute('href');
      button.removeAttribute('onclick');
      
      // Add new click handler
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.showModal();
        // Reset form loaded time for submission timer
        this.formLoadedTime = Date.now();
        
        // Track modal show event
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
      // Fetch the modal HTML from the component file
      const response = await fetch('components/lead-capture-modal.html');
      const modalHTML = await response.text();
      
      // Insert modal HTML at end of body
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      await this.loadCashfreeJSSDK();
      this.populateCountryCodes();

      // ADDED: Attach event listeners to modal buttons after injection
      this.attachModalButtonListeners(); // NEW CALL

    } catch (error) {
      console.error('Failed to load modal HTML or Cashfree SDK:', error);
    }
  }

  async loadCashfreeJSSDK() {
    return new Promise((resolve, reject) => {
      const frontendEnv = window.GLOBAL_CASHFREE_ENVIRONMENT; 
      console.log('Frontend (Browser): GLOBAL_CASHFREE_ENVIRONMENT during SDK load:', frontendEnv);

      // MODIFIED: Use lowercase 'production'/'sandbox' for SDK mode as per Cashfree
      const sdkMode = frontendEnv === 'PRODUCTION' ? 'production' : 'sandbox'; 

      if (window.Cashfree) { 
        // MODIFIED: Correct initialization without 'new' as per Cashfree Tech Team
        this.cashfreeSDK = Cashfree({ mode: sdkMode }); 
        console.log('Cashfree JS SDK already loaded, initialized with mode:', sdkMode);
        return resolve(this.cashfreeSDK);
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'; 
      script.onload = () => {
        // MODIFIED: Correct initialization without 'new' as per Cashfree Tech Team
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
    
    // Add loading button class functionality
    this.setupButtonLoading();
    
    // Focus on first input
    setTimeout(() => {
      document.getElementById('email').focus();
    }, 100);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  setupButtonLoading() {
    // Add loading state functionality to button
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
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });

    // Close modal on overlay click
    setTimeout(() => {
      const modal = document.getElementById('leadCaptureModal');
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target.id === 'leadCaptureModal') {
            this.closeModal();
          }
        });
      }
      
      // Add ShadCN checkbox functionality
      this.initializeCheckboxes();
    }, 1000);
  }

  initializeCheckboxes() {
    // Handle custom checkbox interactions
    const checkboxes = document.querySelectorAll('.checkbox-custom');
    
    checkboxes.forEach(checkbox => {
      // Set initial state
      const isChecked = checkbox.dataset.checked === 'true';
      this.updateCheckboxState(checkbox, isChecked);
      
      // Add click handler
      checkbox.addEventListener('click', (e) => {
        e.preventDefault();
        const currentState = checkbox.getAttribute('data-state') === 'checked';
        const newState = !currentState;
        this.updateCheckboxState(checkbox, newState);
      });
      
      // Add label click handler
      const label = document.querySelector(`label[for="${checkbox.id}"]`);
      if (label) {
        label.addEventListener('click', (e) => {
          e.preventDefault();
          const currentState = checkbox.getAttribute('data-state') === 'checked';
          const newState = !currentState;
          this.updateCheckboxState(checkbox, newState);
        });
      }
    });
  }

  updateCheckboxState(checkbox, isChecked) {
    if (isChecked) {
      checkbox.setAttribute('data-state', 'checked');
      checkbox.setAttribute('aria-checked', 'true');
      checkbox.dataset.checked = 'true';
    } else {
      checkbox.setAttribute('data-state', 'unchecked');
      checkbox.setAttribute('aria-checked', 'false');
      checkbox.dataset.checked = 'false';
    }
  }

  async populateCountryCodes() {
    const selectElement = document.getElementById('countryCode');
    if (!selectElement) return;

    // Sort countries by name for better UX
    const sortedCountryCodes = [...countryCodes].sort((a, b) => a.name.localeCompare(b.name));

    sortedCountryCodes.forEach(country => {
        const option = document.createElement('option');
        option.value = country.dial_code;
        option.textContent = `${country.name} (${country.dial_code})`;
        selectElement.appendChild(option);
    });

    // Set default to India (+91)
    selectElement.value = '+91';
  }

  // --- NEW VALIDATION METHODS --- //

  validateName(name) {
    if (typeof name !== 'string' || name.length < 2) return false;
    // Only alphabets, spaces, hyphens, apostrophes
    const regex = /^[a-zA-Z\s'-]+$/;
    return regex.test(name);
  }

  validateEmail(email) {
    if (typeof email !== 'string' || email.trim() === '') return false;
    // Basic email regex: must contain @ and a domain (e.g., example.com)
    // Avoids obvious fakes and spaces
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && !email.includes(' ');
  }

  validatePhoneNumber(numberPart, countryCode) {
    if (typeof numberPart !== 'string' || numberPart.trim() === '') return false;
    const cleanNumber = numberPart.replace(/\D/g, ''); // Digits only

    // MODIFIED: Apply specific Indian validation only for +91
    if (countryCode === '+91') {
      const indianRegex = /^[6-9]\d{9}$/; // Starts with 6,7,8,9 and is 10 digits
      return cleanNumber.length === 10 && indianRegex.test(cleanNumber);
    } 
    // For all other countries, just check generic length (10-15 digits)
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
  }

  // --- END NEW VALIDATION METHODS --- //

  // NEW METHOD: Attach listeners to modal's internal buttons
  attachModalButtonListeners() {
      const continueButton = document.getElementById('continueToPayment');
      if (continueButton) {
          continueButton.addEventListener('click', () => this.submitLeadAndProceed());
      }

      const closeButton = document.getElementById('closeLCModalButton'); // Using the new ID
      if (closeButton) {
          closeButton.addEventListener('click', () => this.closeModal());
      }

      // Also ensure overlay click still closes (already handled by addEventListeners setTimeout block)
  }

  async submitLeadAndProceed() {
    const form = document.getElementById('leadCaptureForm');
    const formData = new FormData(form);
    
    const email = formData.get('email');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const countryCode = formData.get('countryCode'); 
    const phoneNumberPart = formData.get('phoneNumber');
    const phone = countryCode + phoneNumberPart; // Combined phone for submission

    // --- INTEGRATE VALIDATION --- //
    console.log('Validating First Name:', firstName, 'Result:', this.validateName(firstName)); // ADDED LOG
    if (!this.validateName(firstName)) {
        alert('Please enter a valid First Name (alphabets, spaces, hyphens, apostrophes only, min 2 characters).');
        return;
    }
    console.log('Validating Last Name:', lastName, 'Result:', this.validateName(lastName)); // ADDED LOG
    if (!this.validateName(lastName)) {
        alert('Please enter a valid Last Name (alphabets, spaces, hyphens, apostrophes only, min 2 characters).');
        return;
    }
    console.log('Validating Email:', email, 'Result:', this.validateEmail(email)); // ADDED LOG
    if (!this.validateEmail(email)) {
        alert('Please enter a valid Email Address.');
        return;
    }
    console.log('Validating Phone Number:', phoneNumberPart, 'Country Code:', countryCode, 'Result:', this.validatePhoneNumber(phoneNumberPart, countryCode)); // ADDED LOG
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
    console.log('Time Elapsed (ms):', timeElapsed); // ADDED LOG
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
      // Get checkbox states from ShadCN checkboxes
      const bonusContentCheckbox = document.getElementById('bonusContent');
      const updatesCheckbox = document.getElementById('updates');
      
      // Prepare enhanced lead data
      const leadData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone, // This 'phone' variable now contains the combined formatted number
        timestamp: new Date().toISOString(),
        source: 'pre_payment_capture',
        intent: 'high', 
        amount: '1499',
        currency: 'INR'
      };

      // Send to webhook for lead tracking
      await this.sendLeadData(leadData);
      
      // Track successful lead capture
      if (typeof gtag !== 'undefined') {
        gtag('event', 'lead_captured', {
          'event_category': 'conversion',
          'event_label': 'pre_payment',
          'value': 1499
        });
      }

      // Store in localStorage for payment failure recovery
      localStorage.setItem('leadCaptureData', JSON.stringify(leadData));
      
      // Close modal
      this.closeModal();

      // Choose payment flow based on API availability
      if (this.useAPI) {
        await this.processAPIPayment(leadData);
      } else {
        this.redirectToPayment();
      }

    } catch (error) {
      console.error('Lead capture failed:', error);
      
      // Reset button state
      if (submitButton.setLoading) {
        submitButton.setLoading(false);
      } else {
        submitButton.textContent = submitButton.originalText || 'Continue to Payment →';
        submitButton.disabled = false;
      }
      
      // Still proceed to payment even if lead capture fails
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
      // Show processing state
      document.body.style.cursor = 'wait';
      
      // Call backend API to create payment session
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_email: customerData.email,
          customer_name: `${customerData.firstName} ${customerData.lastName || ''}`.trim(),
          customer_phone: customerData.phone || '+91' + Math.floor(Math.random() * 9000000000 + 1000000000), // Fallback phone
          order_amount: 1499.00,
          order_currency: 'INR'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const paymentData = await response.json();
      
      // Track API payment initiation
      if (typeof gtag !== 'undefined') {
        gtag('event', 'api_payment_initiated', {
          'event_category': 'ecommerce',
          'event_label': 'pre_filled_checkout',
          'value': 1499
        });
      }

      console.log('Attempting Cashfree SDK checkout...'); 
      console.log('SDK instance:', this.cashfreeSDK);
      console.log('Payment Session ID:', paymentData.payment_session_id);



      if (this.cashfreeSDK && paymentData.payment_session_id) {
          this.cashfreeSDK.checkout({
              paymentSessionId: paymentData.payment_session_id,
              redirectTarget: "_self" 
          });
      } else {
          console.error('Cashfree SDK not loaded or payment_session_id missing!', { sdkLoaded: !!this.cashfreeSDK, paymentSessionId: paymentData.payment_session_id });
          alert('Failed to initiate secure payment. Redirecting to generic payment page.');
          this.redirectToPayment(); 
      }

    } catch (error) {
      console.error('API payment failed:', error);
      
      // Fallback to direct payment link for any API call failure
      alert('Processing your request... redirecting to secure payment.');
      this.redirectToPayment(); // This redirects to the original Cashfree form
      
    } finally {
      document.body.style.cursor = 'default';
    }
  }

  async sendLeadData(leadData) {
    // Skip if webhook URL is not configured
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
    // Add delay to ensure lead data is processed
    setTimeout(() => {
      window.location.href = this.originalCashfreeURL;
    }, 500);
  }
}

// REMOVED: Old global function definitions (submitLeadAndProceed, closeLCModal)
// These are now handled as methods of the LeadCaptureModal class and attached via event listeners.

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.leadCaptureModal = new LeadCaptureModal();
});