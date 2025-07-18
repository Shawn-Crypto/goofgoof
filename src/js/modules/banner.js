// Banner module
export function initializeBanner() {
    // Banner functionality
    document.addEventListener('close-banner', function() {
        const banner = document.getElementById('urgent-banner');
        if (banner) {
            banner.style.transform = 'translateY(-100%)';
        }
    });

    // Show banner on load after 2 seconds
    window.addEventListener('load', function() {
        const banner = document.getElementById('urgent-banner');
        if (banner) {
            setTimeout(() => {
                banner.classList.add('show');
            }, 2000);
        }
    });
}
