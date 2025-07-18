// Utility functions
export function initializeUtils() {
    // Set current year in copyright
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }

    // Generic Accordion Functionality (for Modules)
    document.addEventListener('toggle-accordion', function(event) {
        const buttonElement = event.detail.element;
        const accordionItem = buttonElement.parentElement;
        const accordionContent = accordionItem.querySelector('.accordion-content');
        const isActive = accordionItem.classList.contains('active');

        // Close all other accordion items
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
    });
}
