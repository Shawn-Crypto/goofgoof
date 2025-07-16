# Sprint 3: Enhanced Curriculum & FAQ Section (Placeholder Content)

## Note: All content is Lorem Ipsum placeholder text

## Section 1: Transform Solution Section → "Our Teaching Method"

### CSS to Add:
```css
/* Teaching Method Section */
.teaching-method {
    padding: 80px 40px;
    background-color: rgba(0, 0, 0, 0.2);
}

.method-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    max-width: 1000px;
    margin: 48px auto 0;
}

.method-card {
    text-align: center;
    padding: 32px 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    transition: all 0.3s ease;
}

.method-card:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 0.08);
}

.method-icon {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
}

.method-card h3 {
    color: #2CA58D;
    font-size: 20px;
    margin-bottom: 12px;
}

.method-card p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
}

@media (max-width: 768px) {
    .method-grid {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}
```

### HTML Structure:
```html
<section class="teaching-method" id="solution">
    <div class="container animate-in">
        <h2 class="section-title">Lorem Ipsum Teaching Method</h2>
        <p class="section-subtitle">
            Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
        </p>
        
        <div class="method-grid">
            <div class="method-card">
                <span class="method-icon">📚</span>
                <h3>Lorem Structured</h3>
                <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.</p>
            </div>
            
            <div class="method-card">
                <span class="method-icon">🎯</span>
                <h3>Ipsum Practical</h3>
                <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
            </div>
            
            <div class="method-card">
                <span class="method-icon">🔄</span>
                <h3>Dolor Interactive</h3>
                <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.</p>
            </div>
        </div>
    </div>
</section>
```

## Section 2: Enhanced Module Cards with Tabs

### CSS to Add:
```css
/* Enhanced Modules with Tabs */
.modules-enhanced {
    padding: 80px 40px;
}

.module-tabs {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 48px;
    flex-wrap: wrap;
}

.module-tab {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 600;
}

.module-tab:hover {
    background: rgba(255, 255, 255, 0.15);
}

.module-tab.active {
    background: #2CA58D;
    border-color: #2CA58D;
    color: #ffffff;
}

.module-content {
    display: none;
    animation: fadeIn 0.5s ease;
}

.module-content.active {
    display: block;
}

.module-detail {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 48px;
    max-width: 800px;
    margin: 0 auto;
}

.module-detail h3 {
    color: #F4A261;
    font-size: 28px;
    margin-bottom: 24px;
}

.module-topics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-top: 32px;
}

.topic-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.topic-icon {
    color: #2CA58D;
    font-size: 20px;
    flex-shrink: 0;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@media (max-width: 768px) {
    .module-tabs {
        gap: 8px;
    }
    
    .module-tab {
        padding: 8px 16px;
        font-size: 14px;
    }
    
    .module-topics {
        grid-template-columns: 1fr;
    }
    
    .module-detail {
        padding: 32px 24px;
    }
}
```

## Section 3: FAQ Section (Education-Focused)

### CSS to Add:
```css
/* FAQ Section */
.faq-section {
    padding: 80px 40px;
    background-color: rgba(26, 35, 50, 0.3);
}

.faq-container {
    max-width: 800px;
    margin: 0 auto;
}

.faq-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    margin-bottom: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.faq-item:hover {
    background: rgba(255, 255, 255, 0.08);
}

.faq-question {
    padding: 24px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 18px;
}

.faq-toggle {
    font-size: 24px;
    transition: transform 0.3s ease;
}

.faq-item.active .faq-toggle {
    transform: rotate(45deg);
}

.faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.faq-item.active .faq-answer {
    max-height: 300px;
}

.faq-answer-content {
    padding: 0 24px 24px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.8;
}
```

### HTML Structure:
```html
<section class="faq-section" id="faq">
    <div class="container animate-in">
        <h2 class="section-title">Lorem Ipsum Questions</h2>
        <p class="section-subtitle">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        </p>
        
        <div class="faq-container">
            <div class="faq-item">
                <div class="faq-question">
                    Lorem ipsum dolor sit amet?
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </div>
                </div>
            </div>
            
            <div class="faq-item">
                <div class="faq-question">
                    Ut enim ad minima veniam quis?
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                        Excepteur sint occaecat cupidatat non proident.
                    </div>
                </div>
            </div>
            
            <div class="faq-item">
                <div class="faq-question">
                    Nemo enim ipsam voluptatem?
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum 
                        deleniti atque corrupti quos dolores et quas molestias.
                    </div>
                </div>
            </div>
            
            <div class="faq-item">
                <div class="faq-question">
                    Sed ut perspiciatis unde omnis?
                    <span class="faq-toggle">+</span>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod 
                        maxime placeat facere possimus, omnis voluptas assumenda est.
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
```

### JavaScript for FAQ Accordion:
```javascript
// Add to existing script section
// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const wasActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!wasActive) {
            faqItem.classList.add('active');
        }
    });
});

// Module Tabs (placeholder - will need actual implementation)
// This is just structure for now
```

### Navigation Updates:
```html
<!-- Add FAQ to navigation -->
<nav id="nav-panel">
    <a href="#hero" class="nav-link">Home</a>
    <a href="#who-this-is-for" class="nav-link">Who This Is For</a>
    <a href="#problems" class="nav-link">What You'll Master</a>
    <a href="#solution" class="nav-link">Teaching Method</a>
    <a href="#modules" class="nav-link">Course Modules</a>
    <a href="#instructor" class="nav-link">Your Instructor</a>
    <a href="#faq" class="nav-link">FAQ</a>
    <a href="#enroll" class="nav-link">Enroll Now</a>
</nav>
```

## Summary:
Sprint 3 adds educational structure with placeholder content:
- ✅ Teaching Method section (replaces solution)
- ✅ Enhanced module presentation (tab structure ready)
- ✅ FAQ section with accordion functionality
- ✅ All Lorem Ipsum placeholder text
- ✅ Meta compliant - no testimonials or comparisons

Next Sprint 4 will add:
- Simple pricing section
- What's included details
- Course access information
