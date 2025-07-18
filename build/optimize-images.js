const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create optimized images directory
const assetsDir = path.join(__dirname, '..', 'assets');
const optimizedDir = path.join(assetsDir, 'optimized');

if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
}

console.log('🖼️  Starting advanced image optimization...');

// Original logo: 681x390px
const logoSizes = [
    { size: 80, suffix: '80w', quality: 85 },   // Mobile/current size
    { size: 120, suffix: '120w', quality: 85 }, // High DPI mobile
    { size: 160, suffix: '160w', quality: 85 }, // Tablet
    { size: 240, suffix: '240w', quality: 80 }, // High DPI tablet
    { size: 320, suffix: '320w', quality: 80 }, // Desktop
    { size: 480, suffix: '480w', quality: 75 }  // High DPI desktop
];

async function optimizeImages() {
    const originalLogo = path.join(assetsDir, 'logo.webp');

    if (fs.existsSync(originalLogo)) {
        console.log('📏 Creating responsive logo variants...');
        
        logoSizes.forEach(({ size, suffix, quality }) => {
            const outputPath = path.join(optimizedDir, `logo-${suffix}.webp`);
            
            try {
                // Create WebP with specific quality and size
                execSync(`convert "${originalLogo}" -resize ${size}x -quality ${quality} -strip "${outputPath}"`, 
                    { stdio: 'pipe' });
                
                // Get file size for reporting
                const stats = fs.statSync(outputPath);
                console.log(`  ✅ Created ${suffix}: ${(stats.size / 1024).toFixed(1)}KB`);
            } catch (error) {
                console.error(`  ❌ Failed to create ${suffix}:`, error.message);
            }
        });

        // Create ultra-compressed version for critical path
        const criticalLogoPath = path.join(optimizedDir, 'logo-critical-80w.webp');
        try {
            execSync(`convert "${originalLogo}" -resize 80x -quality 65 -strip "${criticalLogoPath}"`, 
                { stdio: 'pipe' });
            const stats = fs.statSync(criticalLogoPath);
            console.log(`  ✅ Created critical version: ${(stats.size / 1024).toFixed(1)}KB`);
        } catch (error) {
            console.error(`  ❌ Failed to create critical version:`, error.message);
        }

        // Create fallback PNG for older browsers
        const fallbackPath = path.join(optimizedDir, 'logo-80w.png');
        try {
            execSync(`convert "${originalLogo}" -resize 80x -quality 85 -strip "${fallbackPath}"`, 
                { stdio: 'pipe' });
            const stats = fs.statSync(fallbackPath);
            console.log(`  ✅ Created PNG fallback: ${(stats.size / 1024).toFixed(1)}KB`);
        } catch (error) {
            console.error(`  ❌ Failed to create PNG fallback:`, error.message);
        }

        console.log('🎯 Logo optimization complete!');
    } else {
        console.log('⚠️  Original logo not found');
    }

    // Generate sizes attribute for responsive images
    const sizesAttribute = '(max-width: 768px) 80px, (max-width: 1200px) 80px, 80px';
    const srcsetAttribute = logoSizes.map(({ suffix }) => 
        `assets/optimized/logo-${suffix}.webp ${suffix.replace('w', 'w')}`
    ).join(', ');

    console.log('\n📱 Responsive image attributes:');
    console.log(`sizes="${sizesAttribute}"`);
    console.log(`srcset="${srcsetAttribute}"`);

    // Generate report
    const reportPath = path.join(__dirname, 'image-optimization-report.md');
    const reportContent = `# Image Optimization Report

Generated: ${new Date().toISOString()}

## Logo Variants Created

| Size | Usage | Quality | File |
|------|-------|---------|------|
${logoSizes.map(({ size, suffix, quality }) => {
    const filePath = path.join(optimizedDir, `logo-${suffix}.webp`);
    const fileSize = fs.existsSync(filePath) ? 
        `${(fs.statSync(filePath).size / 1024).toFixed(1)}KB` : 'Not created';
    return `| ${size}px | ${getUsageDescription(size)} | ${quality}% | ${fileSize} |`;
}).join('\n')}

## Implementation

### HTML Usage
\`\`\`html
<img src="assets/optimized/logo-80w.webp" 
     srcset="${srcsetAttribute}"
     sizes="${sizesAttribute}"
     alt="Lotuslion Venture - Investment Education Platform"
     width="80" height="45" 
     loading="eager" 
     fetchpriority="high">
\`\`\`

### Performance Benefits
- Responsive images serve appropriate sizes based on device
- WebP format provides 25-35% better compression than PNG
- Quality optimized per size for best visual/performance balance
- Critical path version optimized for fastest LCP

### Browser Support
- WebP: Chrome 32+, Firefox 65+, Safari 14+, Edge 18+
- PNG fallback provided for older browsers
`;

    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n📊 Report saved to: ${reportPath}`);

    console.log('\n🚀 Image optimization complete!');
}

function getUsageDescription(size) {
    if (size <= 80) return 'Mobile, current display';
    if (size <= 120) return 'High DPI mobile';
    if (size <= 160) return 'Tablet';
    if (size <= 240) return 'High DPI tablet';
    if (size <= 320) return 'Desktop';
    return 'High DPI desktop';
}

if (require.main === module) {
    optimizeImages();
}

module.exports = optimizeImages;
