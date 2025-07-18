// FAQ module - lazy loaded
export function initializeFAQ() {
    // FAQ Accordion functionality
    document.addEventListener('toggle-faq', function(event) {
        const element = event.detail.element;
        const faqItem = element.parentElement;
        const answer = faqItem.querySelector('.faq-answer');
        const isOpen = faqItem.classList.contains('active');

        // Close all other FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
            const itemAnswer = item.querySelector('.faq-answer');
            if (itemAnswer) {
                itemAnswer.style.maxHeight = null;
            }
        });

        // Toggle current item
        if (!isOpen) {
            faqItem.classList.add('active');
            if (answer) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        }
    });
}

// For standalone loading
if (typeof window !== 'undefined' && !window.FAQ_LOADED) {
    window.FAQ_LOADED = true;
    initializeFAQ();
}
