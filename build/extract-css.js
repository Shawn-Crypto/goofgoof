const fs = require('fs');
const path = require('path');

// Create dist directories
const distDir = path.join(__dirname, '..', 'dist');
const cssDir = path.join(distDir, 'css');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
}

// Extract CSS from HTML and combine with external CSS files
function extractAndCombineCSS() {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const sprintCssPath = path.join(__dirname, '..', 'css', 'sprint3-styles.css');
    const outputPath = path.join(cssDir, 'styles.extracted.css');
    
    let combinedCSS = '';
    
    // Read HTML file and extract inline CSS
    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    const styleMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    
    if (styleMatches) {
        styleMatches.forEach(match => {
            const cssContent = match.replace(/<\/?style[^>]*>/gi, '');
            combinedCSS += cssContent + '\n\n';
        });
    }
    
    // Read external CSS file if it exists
    if (fs.existsSync(sprintCssPath)) {
        const externalCSS = fs.readFileSync(sprintCssPath, 'utf8');
        combinedCSS += externalCSS + '\n\n';
    }
    
    // Add critical CSS optimizations
    const criticalCSS = `
/* Critical CSS Optimizations */
/* Preload critical fonts */
@font-display: swap;

/* Critical layout styles to prevent CLS */
.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
}

/* Critical animation styles */
.animate-hidden {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate-hidden.show {
    opacity: 1;
    transform: translateY(0);
}

/* Critical navigation styles */
.nav-trigger {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1001;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
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

/* Critical progress indicator styles */
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
`;
    
    combinedCSS = criticalCSS + combinedCSS;
    
    // Write combined CSS to output file
    fs.writeFileSync(outputPath, combinedCSS);
    console.log(`✅ CSS extracted and combined: ${outputPath}`);
    console.log(`📊 Total CSS size: ${(combinedCSS.length / 1024).toFixed(2)}KB`);
}

try {
    extractAndCombineCSS();
} catch (error) {
    console.error('❌ Error extracting CSS:', error);
    process.exit(1);
}
