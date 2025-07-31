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
      
      this.closeModal();
      
      // Redirect to payment form with pre-filled data
      this.redirectToPaymentWithData(leadData);

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
      
      // Redirect to payment form with pre-filled data even on error
      this.redirectToPaymentWithData({
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone
      });
    }
  }

  // Simplified method to redirect to payment form with pre-filled data
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
      
      // Small delay to ensure tracking events are sent
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