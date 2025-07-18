// Main entry point - only critical above-the-fold functionality
import { initializeNavigation } from './modules/navigation.js';
import { initializeAnimations } from './modules/animations.js';
import { initializeBanner } from './modules/banner.js';
import { initializeUtils } from './modules/utils.js';

// Critical functionality that must load immediately
document.addEventListener('DOMContentLoaded', function() {
    // Initialize core functionality
    initializeUtils();
    initializeNavigation();
    initializeAnimations();
    initializeBanner();
    
    // Lazy load non-critical modules
    lazyLoadModules();
});

// Lazy load non-critical functionality
function lazyLoadModules() {
    // Load FAQ module when user scrolls near FAQ section
    const faqSection = document.getElementById('faq');
    if (faqSection) {
        const faqObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    import('./modules/faq.js').then(module => {
                        module.initializeFAQ();
                    });
                    faqObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '200px' });
        
        faqObserver.observe(faqSection);
    }
    
    // Load analytics after initial page interaction
    let interactionTimer;
    const loadAnalytics = () => {
        if (!interactionTimer) {
            interactionTimer = setTimeout(() => {
                import('./modules/analytics.js').then(module => {
                    module.initializeAnalytics();
                });
            }, 2000);
        }
    };
    
    // Trigger analytics loading on first user interaction
    ['click', 'scroll', 'keydown'].forEach(event => {
        document.addEventListener(event, loadAnalytics, { once: true, passive: true });
    });
}

// Export global functions that HTML expects
window.toggleNav = function() {
    const event = new CustomEvent('toggle-nav');
    document.dispatchEvent(event);
};

window.closeBanner = function() {
    const event = new CustomEvent('close-banner');
    document.dispatchEvent(event);
};

window.toggleAccordion = function(buttonElement) {
    const event = new CustomEvent('toggle-accordion', { detail: { element: buttonElement } });
    document.dispatchEvent(event);
};

window.toggleFAQ = function(element) {
    const event = new CustomEvent('toggle-faq', { detail: { element } });
    document.dispatchEvent(event);
};
