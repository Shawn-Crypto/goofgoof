const fs = require('fs');
const path = require('path');

// Critical CSS extraction and inlining
function extractCriticalCSS() {
    const criticalCSS = `
/* Critical Above-the-Fold Styles */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #ffffff;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
    overflow-x: hidden;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
}

/* Critical Hero Styles */
.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 120px 0 80px;
    background: linear-gradient(135deg, rgba(44, 165, 141, 0.1) 0%, rgba(244, 162, 97, 0.1) 100%);
    position: relative;
}

.hero h1 {
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 900;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #F4A261 0%, #2CA58D 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.1;
}

.hero .subtitle {
    font-size: clamp(18px, 2.5vw, 24px);
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 32px;
    font-weight: 300;
}

/* Critical Animation Styles */
.animate-hidden {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-hidden.show {
    opacity: 1;
    transform: translateY(0);
}

/* Critical Navigation Styles */
.nav-trigger {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1001;
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    transition: all 0.3s ease;
}

.nav-trigger span {
    width: 20px;
    height: 2px;
    background: #ffffff;
    border-radius: 1px;
    transition: all 0.3s ease;
}

/* Critical Progress Indicator */
.progress-indicator {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.progress-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.progress-dot.active {
    background: #F4A261;
    transform: scale(1.2);
}

/* Critical CTA Styles */
.cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #F4A261 0%, #2CA58D 100%);
    color: #ffffff;
    padding: 18px 36px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 700;
    font-size: 18px;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    margin: 24px 0;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(244, 162, 97, 0.3);
}

/* Critical Banner Styles */
.urgent-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #F4A261 0%, #2CA58D 100%);
    color: #ffffff;
    padding: 12px 20px;
    text-align: center;
    font-weight: 600;
    z-index: 1002;
    transform: translateY(-100%);
    transition: transform 0.5s ease;
}

.urgent-banner.show {
    transform: translateY(0);
}

/* Mobile Critical Styles */
@media (max-width: 768px) {
    .container {
        padding: 0 20px;
    }
    
    .hero {
        padding: 100px 0 60px;
    }
    
    .progress-indicator {
        display: none;
    }
}
`;

    return criticalCSS;
}

// Inline critical CSS into HTML
function inlineCriticalCSS(htmlPath, outputPath) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const criticalCSS = extractCriticalCSS();
    
    const updatedHTML = htmlContent.replace(
        '<style id="critical-css">',
        `<style id="critical-css">${criticalCSS}`
    );
    
    fs.writeFileSync(outputPath, updatedHTML);
    console.log('✅ Critical CSS inlined into HTML');
}

module.exports = {
    extractCriticalCSS,
    inlineCriticalCSS
};

// CLI usage
if (require.main === module) {
    const inputHTML = process.argv[2] || 'index.optimized.html';
    const outputHTML = process.argv[3] || 'dist/index.html';
    
    inlineCriticalCSS(inputHTML, outputHTML);
}
