# Sprint 4: Pricing & Course Details (Placeholder Content)

## Note: All content is Lorem Ipsum placeholder text

## Section 1: What's Included Section

### CSS to Add:
```css
/* What's Included Section */
.included-section {
    padding: 80px 40px;
    background-color: rgba(26, 35, 50, 0.3);
}

.included-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    max-width: 1000px;
    margin: 48px auto 0;
}

.included-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 32px;
    border-radius: 16px;
    text-align: center;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.included-card:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(44, 165, 141, 0.3);
}

.included-icon {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
    color: #2CA58D;
}

.included-card h3 {
    color: #ffffff;
    font-size: 20px;
    margin-bottom: 12px;
    font-weight: 700;
}

.included-card p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .included-grid {
        grid-template-columns: 1fr;
    }
}
```

### HTML Structure:
```html
<section class="included-section" id="whats-included">
    <div class="container animate-in">
        <h2 class="section-title">Lorem Ipsum Included</h2>
        <p class="section-subtitle">
            Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
        </p>
        
        <div class="included-grid">
            <div class="included-card">
                <span class="included-icon">🎥</span>
                <h3>Lorem Video Content</h3>
                <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.</p>
            </div>
            
            <div class="included-card">
                <span class="included-icon">📱</span>
                <h3>Ipsum Mobile Access</h3>
                <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.</p>
            </div>
            
            <div class="included-card">
                <span class="included-icon">♾️</span>
                <h3>Dolor Lifetime Access</h3>
                <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.</p>
            </div>
            
            <div class="included-card">
                <span class="included-icon">📄</span>
                <h3>Sit Amet Resources</h3>
                <p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe.</p>
            </div>
            
            <div class="included-card">
                <span class="included-icon">🔄</span>
                <h3>Consectetur Updates</h3>
                <p>Et harum quidem rerum facilis est et expedita distinctio nam libero tempore.</p>
            </div>
            
            <div class="included-card">
                <span class="included-icon">💬</span>
                <h3>Adipiscing Community</h3>
                <p>Cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime.</p>
            </div>
        </div>
    </div>
</section>
```

## Section 2: Simple Pricing Section

### CSS to Add:
```css
/* Pricing Section */
.pricing-section {
    padding: 80px 40px;
    text-align: center;
}

.pricing-container {
    max-width: 500px;
    margin: 0 auto;
}

.pricing-card {
    background: linear-gradient(135deg, rgba(244, 162, 97, 0.1), rgba(255, 255, 255, 0.05));
    border: 2px solid #F4A261;
    border-radius: 24px;
    padding: 48px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.pricing-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(244, 162, 97, 0.2);
}

.pricing-label {
    background: #F4A261;
    color: #0A2342;
    padding: 8px 24px;
    border-radius: 20px;
    display: inline-block;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.5px;
    margin-bottom: 24px;
    text-transform: uppercase;
}

.pricing-amount {
    font-size: 64px;
    font-weight: 900;
    color: #F4A261;
    line-height: 1;
    margin-bottom: 16px;
}

.pricing-currency {
    font-size: 32px;
    vertical-align: top;
}

.pricing-original {
    text-decoration: line-through;
    color: rgba(255, 255, 255, 0.5);
    font-size: 24px;
    margin-bottom: 32px;
    display: block;
}

.pricing-features {
    list-style: none;
    padding: 0;
    margin: 32px 0;
    text-align: left;
}

.pricing-features li {
    padding: 12px 0;
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    gap: 12px;
}

.pricing-features .feature-icon {
    color: #2CA58D;
    font-size: 20px;
}

.pricing-cta {
    width: 100%;
    padding: 20px;
    background: linear-gradient(135deg, #F4A261, #E09C4A);
    color: #0A2342;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 24px;
}

.pricing-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(244, 162, 97, 0.4);
}

.pricing-guarantee {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.guarantee-badge-small {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #2CA58D;
    font-weight: 600;
}

@media (max-width: 768px) {
    .pricing-card {
        padding: 32px 24px;
    }
    
    .pricing-amount {
        font-size: 48px;
    }
}
```

### HTML Structure:
```html
<section class="pricing-section" id="pricing">
    <div class="container animate-in">
        <h2 class="section-title">Lorem Ipsum Pricing</h2>
        <p class="section-subtitle">
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur
        </p>
        
        <div class="pricing-container">
            <div class="pricing-card">
                <span class="pricing-label">Lorem Special Offer</span>
                
                <div class="pricing-amount">
                    <span class="pricing-currency">₹</span>9,999
                </div>
                
                <span class="pricing-original">₹24,999</span>
                
                <ul class="pricing-features">
                    <li>
                        <span class="feature-icon">✓</span>
                        Lorem ipsum dolor sit amet consectetur
                    </li>
                    <li>
                        <span class="feature-icon">✓</span>
                        Sed do eiusmod tempor incididunt ut labore
                    </li>
                    <li>
                        <span class="feature-icon">✓</span>
                        Ut enim ad minima veniam quis nostrum
                    </li>
                    <li>
                        <span class="feature-icon">✓</span>
                        Duis aute irure dolor in reprehenderit
                    </li>
                    <li>
                        <span class="feature-icon">✓</span>
                        Excepteur sint occaecat cupidatat non
                    </li>
                </ul>
                
                <button class="pricing-cta">
                    Lorem Ipsum Enroll
                </button>
                
                <div class="pricing-guarantee">
                    <span class="guarantee-badge-small">
                        🛡️ 48-Hour Lorem Ipsum Guarantee
                    </span>
                </div>
            </div>
        </div>
    </div>
</section>
```

## Section 3: Course Access Details

### CSS to Add:
```css
/* Access Details Section */
.access-section {
    padding: 80px 40px;
    background-color: rgba(0, 0, 0, 0.2);
}

.access-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    max-width: 900px;
    margin: 0 auto;
    align-items: center;
}

.access-content h3 {
    color: #F4A261;
    font-size: 32px;
    margin-bottom: 24px;
    font-weight: 700;
}

.access-list {
    list-style: none;
    padding: 0;
}

.access-list li {
    padding: 16px 0;
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: flex-start;
    gap: 16px;
    font-size: 16px;
}

.access-icon {
    color: #2CA58D;
    font-size: 24px;
    flex-shrink: 0;
}

.access-visual {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 48px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
}

.access-visual-icon {
    font-size: 120px;
    color: #2CA58D;
    opacity: 0.5;
}

@media (max-width: 768px) {
    .access-grid {
        grid-template-columns: 1fr;
        gap: 32px;
    }
    
    .access-visual {
        min-height: 200px;
    }
}
```

### HTML Structure:
```html
<section class="access-section" id="course-access">
    <div class="container animate-in">
        <h2 class="section-title">Lorem Ipsum Access</h2>
        
        <div class="access-grid">
            <div class="access-content">
                <h3>Consectetur Adipiscing</h3>
                <ul class="access-list">
                    <li>
                        <span class="access-icon">⚡</span>
                        <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit</span>
                    </li>
                    <li>
                        <span class="access-icon">🌐</span>
                        <span>Sed do eiusmod tempor incididunt ut labore et dolore</span>
                    </li>
                    <li>
                        <span class="access-icon">📧</span>
                        <span>Ut enim ad minima veniam, quis nostrum exercitationem</span>
                    </li>
                    <li>
                        <span class="access-icon">🔐</span>
                        <span>Duis aute irure dolor in reprehenderit in voluptate</span>
                    </li>
                </ul>
            </div>
            
            <div class="access-visual">
                <span class="access-visual-icon">🎓</span>
            </div>
        </div>
    </div>
</section>
```

### Navigation Updates:
```html
<!-- Update navigation with new sections -->
<nav id="nav-panel">
    <a href="#hero" class="nav-link">Home</a>
    <a href="#who-this-is-for" class="nav-link">Who This Is For</a>
    <a href="#problems" class="nav-link">What You'll Master</a>
    <a href="#solution" class="nav-link">Teaching Method</a>
    <a href="#modules" class="nav-link">Course Modules</a>
    <a href="#whats-included" class="nav-link">What's Included</a>
    <a href="#pricing" class="nav-link">Pricing</a>
    <a href="#instructor" class="nav-link">Your Instructor</a>
    <a href="#faq" class="nav-link">FAQ</a>
    <a href="#enroll" class="nav-link">Enroll Now</a>
</nav>
```

## Summary:
Sprint 4 adds clear, compliant pricing and details:
- ✅ What's Included section (6 feature cards)
- ✅ Simple pricing card (no urgency tactics)
- ✅ Course access details
- ✅ All Lorem Ipsum placeholder text
- ✅ Meta compliant - educational focus only

Next Sprint 5 will:
- Polish final CTA
- Add any remaining visual elements
- Final compliance review
