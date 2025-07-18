// Analytics module - lazy loaded
export function initializeAnalytics() {
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
}

// For standalone loading
if (typeof window !== 'undefined' && !window.ANALYTICS_LOADED) {
    window.ANALYTICS_LOADED = true;
    initializeAnalytics();
}
