// Main Scripts for LFG Ventures Course Platform
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in copyright
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }

    // IntersectionObserver for loading animations
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show'); // Add 'show' class to reveal and animate
                animationObserver.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0, // Element triggers as soon as any part enters the viewport
        rootMargin: '0px' // Ensure no negative root margin, effectively no margin
    });

    // Observe all elements that should animate into view
    document.querySelectorAll('.animate-hidden').forEach(el => {
        animationObserver.observe(el);
    });

    // IntersectionObserver for active nav states
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');

                // Update nav links
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });

                // Update progress dots
                document.querySelectorAll('.progress-dot').forEach(dot => {
                    dot.classList.remove('active');
                    if (dot.getAttribute('data-section') === sectionId) {
                        dot.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-30% 0px -70% 0px'
    });

    // Observe all sections for active state
    document.querySelectorAll('section[id]').forEach(section => {
        sectionObserver.observe(section);
    });

    // Smooth scrolling for navigation links and progress dots
    document.querySelectorAll('.nav-link, .progress-dot').forEach(element => {
        element.addEventListener('click', function (e) {
            e.preventDefault();

            let targetId;
            if (this.classList.contains('nav-link')) {
                targetId = this.getAttribute('href').substring(1);
            } else {
                targetId = this.getAttribute('data-section');
            }

            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navigation panel functionality (toggleNav)
    window.toggleNav = function() {
        const navPanel = document.getElementById('nav-panel');
        const navTrigger = document.querySelector('.nav-trigger');
        if (navPanel) { navPanel.classList.toggle('active'); }
        if (navTrigger) { navTrigger.classList.toggle('active'); }
    };

    // Close nav when clicking outside
    document.addEventListener('click', function(event) {
        const navPanel = document.getElementById('nav-panel');
        const navTrigger = document.querySelector('.nav-trigger');

        if (navPanel && navPanel.classList.contains('active') && 
            !navPanel.contains(event.target) && 
            navTrigger && !navTrigger.contains(event.target)) {
            navPanel.classList.remove('active');
            navTrigger.classList.remove('active');
        }
    });

    // Close nav when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navPanel = document.getElementById('nav-panel');
            const navTrigger = document.querySelector('.nav-trigger');
            if (navPanel) { navPanel.classList.remove('active'); }
            if (navTrigger) { navTrigger.classList.remove('active'); }
        });
    });

    // Track scroll depth for analytics
    let scrollPoints = [25, 50, 75, 100];
    let scrolled = [];

    window.addEventListener('scroll', function() {
        let scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;

        scrollPoints.forEach(point => {
            if (scrollPercent >= point && !scrolled.includes(point)) {
                scrolled.push(point);
                if (window.dataLayer) {
                    window.dataLayer.push({
                        'event': 'scroll_depth',
                        'scroll_percent': point
                    });
                }
            }
        });
    });

    // CTA button tracking - REMOVED to prevent conflicts with enhanced handlers in index.html

    // Make credential cards clickable - scroll to instructor section
    document.querySelectorAll('.credential-highlight').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            // Smooth scroll to instructor section
            const instructorSection = document.getElementById('instructor');
            if (instructorSection) {
                instructorSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Banner functionality
    window.closeBanner = function() {
        const banner = document.getElementById('urgent-banner');
        if (banner) {
            banner.style.transform = 'translateY(-100%)';
        }
    };

    // Show banner on load after 2 seconds
    window.addEventListener('load', function() {
        const banner = document.getElementById('urgent-banner');
        if (banner) {
            setTimeout(() => {
                banner.classList.add('show');
            }, 2000);
        }
    });

    // Generic Accordion Functionality (for FAQ and Modules)
    window.toggleAccordion = function(buttonElement) {
        const accordionItem = buttonElement.parentElement;
        const accordionContent = accordionItem.querySelector('.accordion-content');
        const isActive = accordionItem.classList.contains('active');

        // Close all other accordion items (optional, but good for single-open accordions)
        document.querySelectorAll('.accordion-item').forEach(item => {
            if (item !== accordionItem && item.classList.contains('active')) {
                item.classList.remove('active');
                const content = item.querySelector('.accordion-content');
                if (content) {
                    content.style.maxHeight = null;
                }
            }
        });

        // Toggle the clicked accordion item
        if (!isActive) {
            accordionItem.classList.add('active');
            if (accordionContent) {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
            }
        } else {
            accordionItem.classList.remove('active');
            if (accordionContent) {
                accordionContent.style.maxHeight = null;
            }
        }
    };

    // Ensure current year in copyright is set (from footer)
    const copyrightYearSpan = document.getElementById('copyright-year');
    if (copyrightYearSpan) {
        copyrightYearSpan.textContent = new Date().getFullYear();
    }

}); // End of DOMContentLoaded