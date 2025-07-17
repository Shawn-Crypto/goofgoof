// Main Scripts for Lotuslion Course Platform
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in copyright
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }

    // IntersectionObserver for animations
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    // Observe all animate-in elements
    document.querySelectorAll('.animate-in').forEach(el => {
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

    // Navigation panel functionality
    window.toggleNav = function() {
        const navPanel = document.getElementById('nav-panel');
        navPanel.classList.toggle('active');
    };

    // Close nav when clicking outside
    document.addEventListener('click', function(event) {
        const navPanel = document.getElementById('nav-panel');
        const navTrigger = document.querySelector('.nav-trigger');

        if (navPanel && navPanel.classList.contains('active') && 
            !navPanel.contains(event.target) && 
            navTrigger && !navTrigger.contains(event.target)) {
            navPanel.classList.remove('active');
        }
    });

    // Close nav when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navPanel = document.getElementById('nav-panel');
            if (navPanel) {
                navPanel.classList.remove('active');
            }
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

    // CTA button tracking
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function() {
            if (window.dataLayer) {
                window.dataLayer.push({
                    'event': 'cta_click',
                    'button_text': this.textContent.trim(),
                    'button_location': this.closest('section').id || 'unknown'
                });
            }
        });
    });
});