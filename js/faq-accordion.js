// FAQ Accordion functionality
function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const isOpening = !faqItem.classList.contains('active');

    // Track engagement when expanding FAQ
    if (isOpening && window.dataLayer) {
        window.dataLayer.push({
            'event': 'faq_engagement',
            'faq_question': element.textContent.trim(),
            'engagement_type': 'expand'
        });
    }

    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        const itemAnswer = item.querySelector('.faq-answer');
        if (itemAnswer) {
            itemAnswer.style.maxHeight = null;
        }
    });

    // Toggle current item
    if (isOpening) {
        faqItem.classList.add('active');
        if (answer) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    }
}