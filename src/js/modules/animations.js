// Animation module - critical for LCP
export function initializeAnimations() {
    // IntersectionObserver for loading animations
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0,
        rootMargin: '0px'
    });

    // Observe all elements that should animate into view
    document.querySelectorAll('.animate-hidden').forEach(el => {
        animationObserver.observe(el);
    });

    // Immediately trigger animation for hero section to help with LCP
    const heroElement = document.querySelector('.hero .animate-hidden');
    if (heroElement) {
        // Add show class immediately for above-the-fold content
        setTimeout(() => heroElement.classList.add('show'), 16);
    }
}
