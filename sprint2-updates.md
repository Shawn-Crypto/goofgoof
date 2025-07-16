# Sprint 2: "Who This Is For" and "What You'll Learn" Sections

## Meta Ads Compliance Note:
- NO social proof/testimonials (we don't have any)
- NO financial outcome claims
- NO competitor comparisons
- FOCUS on educational value and curriculum

## Section 1: "Who This Is For" (After Hero)

### CSS to Add:
```css
/* Who This Is For Section */
.audience-section {
    padding: 80px 40px;
    background-color: rgba(26, 35, 50, 0.3);
}

.audience-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
    max-width: 1000px;
    margin: 0 auto;
}

.audience-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    backdrop-filter: blur(8px);
    padding: 32px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all 0.3s;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.audience-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    border-color: rgba(44, 165, 141, 0.3);
}

.audience-card h3 {
    color: #2CA58D;
    font-size: 24px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.audience-icon {
    font-size: 32px;
}

.audience-card ul {
    list-style: none;
    padding: 0;
}

.audience-card li {
    padding: 8px 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
}

@media (max-width: 768px) {
    .audience-grid {
        grid-template-columns: 1fr;
    }
}
```

### HTML Structure:
```html
<section class="audience-section" id="who-this-is-for">
    <div class="container animate-in">
        <h2 class="section-title">Who This Course Is Perfect For</h2>
        <p class="section-subtitle">
            This educational course is designed for professionals who want to understand institutional investment frameworks
        </p>
        
        <div class="audience-grid">
            <div class="audience-card">
                <h3><span class="audience-icon">💼</span> Working Professionals</h3>
                <ul>
                    <li>• Want to understand financial markets better</li>
                    <li>• Seeking structured learning approach</li>
                    <li>• Limited time for extensive research</li>
                </ul>
            </div>
            
            <div class="audience-card">
                <h3><span class="audience-icon">📊</span> Finance Enthusiasts</h3>
                <ul>
                    <li>• Interested in fundamental analysis</li>
                    <li>• Want to read financial statements</li>
                    <li>• Seeking systematic frameworks</li>
                </ul>
            </div>
            
            <div class="audience-card">
                <h3><span class="audience-icon">🎯</span> Serious Learners</h3>
                <ul>
                    <li>• Committed to long-term learning</li>
                    <li>• Want institutional-grade knowledge</li>
                    <li>• Prefer depth over quick tips</li>
                </ul>
            </div>
            
            <div class="audience-card">
                <h3><span class="audience-icon">🔍</span> Research-Oriented Minds</h3>
                <ul>
                    <li>• Enjoy analyzing companies</li>
                    <li>• Want to understand valuation</li>
                    <li>• Seek data-driven approaches</li>
                </ul>
            </div>
        </div>
    </div>
</section>
```

## Section 2: Transform Problems → "What You'll Master"

### Update Problems Section:
Instead of "Hidden Costs", let's make it positive and education-focused:

```html
<section class="problems" id="problems">
    <div class="container animate-in">
        <h2 class="section-title">What You'll Master</h2>
        <p class="section-subtitle">
            Four core competencies that form the foundation of professional investment analysis
        </p>
        
        <div class="problem-grid">
            <div class="problem-card">
                <h3>📈 Financial Statement Analysis</h3>
                <p>Learn to read and interpret balance sheets, income statements, and cash flow statements like institutional analysts do.</p>
            </div>
            
            <div class="problem-card">
                <h3>🎯 Valuation Frameworks</h3>
                <p>Master multiple valuation methodologies including DCF, relative valuation, and asset-based approaches.</p>
            </div>
            
            <div class="problem-card">
                <h3>🔄 Sector Analysis</h3>
                <p>Understand how to analyze different sectors, their key metrics, and what drives performance in each industry.</p>
            </div>
            
            <div class="problem-card">
                <h3>📊 Risk Assessment</h3>
                <p>Develop frameworks for evaluating business risk, financial risk, and portfolio risk management strategies.</p>
            </div>
        </div>
    </div>
</section>
```

## Navigation Updates:
```html
<!-- Update navigation links -->
<nav id="nav-panel">
    <a href="#hero" class="nav-link">Home</a>
    <a href="#who-this-is-for" class="nav-link">Who This Is For</a>
    <a href="#problems" class="nav-link">What You'll Master</a>
    <a href="#solution" class="nav-link">The Framework</a>
    <a href="#modules" class="nav-link">Course Modules</a>
    <a href="#instructor" class="nav-link">Your Instructor</a>
    <a href="#enroll" class="nav-link">Enroll Now</a>
</nav>

<!-- Update progress dots -->
<div class="progress-indicator">
    <div class="progress-dot" data-title="Home" data-section="hero"></div>
    <div class="progress-dot" data-title="For You" data-section="who-this-is-for"></div>
    <div class="progress-dot" data-title="Master" data-section="problems"></div>
    <div class="progress-dot" data-title="Framework" data-section="solution"></div>
    <div class="progress-dot" data-title="Modules" data-section="modules"></div>
    <div class="progress-dot" data-title="Instructor" data-section="instructor"></div>
    <div class="progress-dot" data-title="Enroll" data-section="final-cta"></div>
</div>
```

## Summary:
Sprint 2 focuses on Meta-compliant content:
- ✅ Educational focus (who can benefit from learning)
- ✅ Curriculum-based value props (what you'll learn)
- ✅ No income claims or financial outcomes
- ✅ No fake social proof
- ✅ No competitor bashing

Next Sprint 3 will focus on:
- Curriculum details (expanding modules section)
- Simple FAQ section (education-focused)
- NO comparison tables or social proof
