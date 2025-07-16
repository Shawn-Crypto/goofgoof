# Sprint 1 CSS Updates for index.html

## Add these CSS rules to the existing `<style>` tag in index.html:

```css
/* Missing Progress Indicator styles */
.progress-indicator {
    position: fixed;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1000;
}

.progress-dot {
    width: 12px;
    height: 12px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    margin: 20px 0;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
}

.progress-dot.active {
    background: #F4A261;
    transform: scale(1.5);
}

.progress-dot:hover::after {
    content: attr(data-title);
    position: absolute;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #ffffff;
    padding: 5px 10px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 12px;
}

/* Fix nav trigger span */
.nav-trigger span {
    display: block;
    width: 24px;
    height: 2px;
    background: #ffffff;
    margin: 5px 0;
    transition: 0.3s;
}

/* Add pulse animation */
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* Fix instructor grid */
.instructor-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    max-width: 600px;
    margin: 0 auto 40px auto;
    gap: 24px;
}

.instructor-stat {
    background: rgba(255, 255, 255, 0.05);
    padding: 24px;
    border-radius: 12px;
    text-align: center;
}

.instructor-stat h3 {
    color: #F4A261;
    font-size: 32px;
    margin-bottom: 8px;
}

.instructor-stat p {
    color: rgba(255, 255, 255, 0.9);
}

/* Add alternating section backgrounds */
section:nth-child(even) {
    background-color: rgba(26, 35, 50, 0.3);
}

/* Fix section padding */
section {
    padding: 80px 40px;
    min-height: 100vh;
    display: flex;
    align-items: center;
}

@media (max-width: 768px) {
    section {
        padding: 60px 20px;
        min-height: auto;
    }
    
    .instructor-grid {
        grid-template-columns: 1fr;
    }
    
    .progress-indicator {
        display: none;
    }
}
```

## HTML Structure Updates:

### 1. Replace the inline-styled instructor grid with:
```html
<div class="instructor-grid">
    <div class="instructor-stat">
        <h3>17+ Years</h3>
        <p>Institutional Equity Research</p>
    </div>
    <div class="instructor-stat">
        <h3>100+</h3>
        <p>Companies Analyzed</p>
    </div>
    <div class="instructor-stat">
        <h3>20+ Sectors</h3>
        <p>Deep Domain Expertise</p>
    </div>
    <div class="instructor-stat">
        <h3>₹10+ Trn</h3>
        <p>Institutional AUM Advised</p>
    </div>
</div>
```

### 2. Fix problems section - it should have 4 cards in a 2x2 grid (currently only has 2):
```html
<div class="problem-grid">
    <div class="problem-card">
        <h3>Lorem Ipsum Problem 1</h3>
        <p>Placeholder text...</p>
    </div>
    <div class="problem-card">
        <h3>Lorem Ipsum Problem 2</h3>
        <p>Placeholder text...</p>
    </div>
    <div class="problem-card">
        <h3>Lorem Ipsum Problem 3</h3>
        <p>Placeholder text...</p>
    </div>
    <div class="problem-card">
        <h3>Lorem Ipsum Problem 4</h3>
        <p>Placeholder text...</p>
    </div>
</div>
```

### 3. Fix checkmark list in solution section by adding the checkmark-list class:
```html
<ul class="checkmark-list">
    <li>Lorem ipsum dolor sit amet</li>
    <li>Consectetur adipiscing elit</li>
    <li>Sed do eiusmod tempor incididunt</li>
</ul>
```

## Summary:
Sprint 1 focused on fixing core CSS issues:
- ✅ Added missing progress indicator styles
- ✅ Fixed nav trigger span styles  
- ✅ Added pulse animation
- ✅ Fixed instructor grid to use CSS classes
- ✅ Added alternating section backgrounds
- ✅ Fixed section padding consistency
- ✅ Added proper responsive styles

Next Sprint (Sprint 2) will add:
- "Who This Is For" section
- "Hidden Costs" section transformation
