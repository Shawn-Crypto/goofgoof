/**
 * Advanced Lazy Loading with Intersection Observer
 * Optimized for performance and LCP considerations
 */

class LazyImageLoader {
    constructor() {
        this.images = [];
        this.observer = null;
        this.init();
    }

    init() {
        // Check for Intersection Observer support
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }

        this.findLazyImages();
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px', // Start loading 50px before image enters viewport
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }

    findLazyImages() {
        // Find images with data-src (lazy loading candidates)
        const lazyImages = document.querySelectorAll('img[data-src], picture source[data-srcset]');
        
        lazyImages.forEach(img => {
            // Skip images that are above the fold or marked as eager
            if (this.isAboveFold(img) || img.loading === 'eager') {
                this.loadImage(img);
                return;
            }

            this.images.push(img);
            if (this.observer) {
                this.observer.observe(img);
            }
        });
    }

    isAboveFold(element) {
        const rect = element.getBoundingClientRect();
        const foldLine = window.innerHeight || document.documentElement.clientHeight;
        
        // Consider element above fold if it's within 100px of viewport
        return rect.top < foldLine + 100;
    }

    loadImage(img) {
        // Handle both img elements and source elements
        if (img.tagName === 'SOURCE') {
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                delete img.dataset.srcset;
            }
        } else {
            // Handle img elements
            if (img.dataset.src) {
                img.src = img.dataset.src;
                delete img.dataset.src;
            }
            
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                delete img.dataset.srcset;
            }
        }

        // Add loaded class for CSS transitions
        img.classList.add('lazy-loaded');
        
        // Trigger fade-in animation
        img.style.opacity = '1';
    }

    loadAllImages() {
        // Fallback: load all images immediately
        this.images.forEach(img => this.loadImage(img));
    }

    // Public method to add new images dynamically
    addImage(img) {
        if (this.isAboveFold(img) || img.loading === 'eager') {
            this.loadImage(img);
        } else {
            this.images.push(img);
            if (this.observer) {
                this.observer.observe(img);
            }
        }
    }

    // Cleanup method
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.images = [];
    }
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyImageLoader();
});

// Add CSS for smooth loading transitions
const style = document.createElement('style');
style.textContent = `
    img[data-src] {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    }
    
    img.lazy-loaded {
        opacity: 1;
    }
    
    /* Placeholder background for loading images */
    img[data-src]::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
`;
document.head.appendChild(style);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyImageLoader;
}
