// Navigation module - critical functionality
export function initializeNavigation() {
    // Navigation panel functionality
    document.addEventListener('toggle-nav', function() {
        const navPanel = document.getElementById('nav-panel');
        const navTrigger = document.querySelector('.nav-trigger');
        if (navPanel) { navPanel.classList.toggle('active'); }
        if (navTrigger) { navTrigger.classList.toggle('active'); }
    });

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
}
