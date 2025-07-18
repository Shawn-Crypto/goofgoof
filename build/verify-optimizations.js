/**
 * Optimization Verification Script
 * Validates that all performance optimizations are correctly implemented
 */

const fs = require('fs');
const path = require('path');

class OptimizationVerifier {
    constructor() {
        this.checks = [];
        this.passed = 0;
        this.failed = 0;
    }

    async runVerification() {
        console.log('🔍 Verifying Performance Optimizations...\n');
        
        this.checkImageOptimizations();
        this.checkFontOptimizations();
        this.checkHTMLImplementation();
        this.checkLazyLoading();
        
        this.displayResults();
    }

    check(name, condition, message, fix = null) {
        const status = condition ? '✅' : '❌';
        const result = {
            name,
            passed: condition,
            message,
            fix
        };
        
        this.checks.push(result);
        if (condition) {
            this.passed++;
        } else {
            this.failed++;
        }
        
        console.log(`${status} ${name}: ${message}`);
        if (!condition && fix) {
            console.log(`   💡 Fix: ${fix}`);
        }
    }

    checkImageOptimizations() {
        console.log('📱 Image Optimizations:');
        
        const optimizedDir = path.join(__dirname, '..', 'assets', 'optimized');
        const hasOptimizedDir = fs.existsSync(optimizedDir);
        this.check(
            'Optimized Images Directory',
            hasOptimizedDir,
            hasOptimizedDir ? 'Optimized images directory exists' : 'Missing optimized images directory',
            'Run: npm run optimize:images'
        );

        if (hasOptimizedDir) {
            const files = fs.readdirSync(optimizedDir);
            const expectedFiles = [
                'logo-80w.webp',
                'logo-120w.webp', 
                'logo-160w.webp',
                'logo-240w.webp',
                'logo-320w.webp',
                'logo-480w.webp',
                'logo-critical-80w.webp',
                'logo-80w.png'
            ];
            
            const allFilesExist = expectedFiles.every(file => files.includes(file));
            this.check(
                'Responsive Image Variants',
                allFilesExist,
                allFilesExist ? `All ${expectedFiles.length} image variants created` : 'Some image variants missing',
                'Run: npm run optimize:images'
            );

            // Check file sizes
            const criticalLogoPath = path.join(optimizedDir, 'logo-critical-80w.webp');
            if (fs.existsSync(criticalLogoPath)) {
                const size = fs.statSync(criticalLogoPath).size;
                const isOptimized = size < 3000; // Less than 3KB
                this.check(
                    'Critical Logo Size',
                    isOptimized,
                    `Critical logo is ${(size/1024).toFixed(1)}KB ${isOptimized ? '(optimized)' : '(too large)'}`,
                    'Increase compression in optimize-images.js'
                );
            }
        }
    }

    checkFontOptimizations() {
        console.log('\n🔤 Font Optimizations:');
        
        const fontsOptimizedPath = path.join(__dirname, '..', 'css', 'fonts-optimized.css');
        const hasFontsOptimized = fs.existsSync(fontsOptimizedPath);
        this.check(
            'Font Display CSS',
            hasFontsOptimized,
            hasFontsOptimized ? 'fonts-optimized.css exists' : 'Missing fonts-optimized.css',
            'Run: npm run optimize:fonts'
        );

        if (hasFontsOptimized) {
            const fontCSS = fs.readFileSync(fontsOptimizedPath, 'utf8');
            const hasFontDisplay = fontCSS.includes('font-display: swap');
            this.check(
                'Font Display Swap',
                hasFontDisplay,
                hasFontDisplay ? 'font-display: swap applied' : 'font-display: swap missing',
                'Check fonts-optimized.css content'
            );
        }

        const phosphorSubsetPath = path.join(__dirname, '..', 'css', 'phosphor-subset.css');
        const hasPhosphorSubset = fs.existsSync(phosphorSubsetPath);
        this.check(
            'Phosphor Icons Subset',
            hasPhosphorSubset,
            hasPhosphorSubset ? 'Phosphor subset created' : 'Missing Phosphor subset',
            'Run: npm run optimize:fonts'
        );

        if (hasPhosphorSubset) {
            const phosphorCSS = fs.readFileSync(phosphorSubsetPath, 'utf8');
            const iconCount = (phosphorCSS.match(/\.ph-light\.[^:]+::before/g) || []).length;
            const isSubset = iconCount <= 10; // Should be small subset
            this.check(
                'Icon Subset Size',
                isSubset,
                `${iconCount} icons in subset ${isSubset ? '(good)' : '(too many)'}`,
                'Review phosphor icons usage'
            );
        }
    }

    checkHTMLImplementation() {
        console.log('\n📄 HTML Implementation:');
        
        const htmlPath = path.join(__dirname, '..', 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Check for responsive images
        const hasResponsiveImages = htmlContent.includes('srcset=') && htmlContent.includes('sizes=');
        this.check(
            'Responsive Images',
            hasResponsiveImages,
            hasResponsiveImages ? 'Responsive images implemented' : 'Missing srcset/sizes attributes',
            'Add srcset and sizes to img elements'
        );

        // Check for WebP support
        const hasWebPSupport = htmlContent.includes('<picture>') && htmlContent.includes('type="image/webp"');
        this.check(
            'WebP Support',
            hasWebPSupport,
            hasWebPSupport ? 'WebP with fallback implemented' : 'Missing WebP implementation',
            'Wrap img in picture element with WebP source'
        );

        // Check for preload
        const hasImagePreload = htmlContent.includes('rel="preload"') && htmlContent.includes('as="image"');
        this.check(
            'Image Preloading',
            hasImagePreload,
            hasImagePreload ? 'Critical images preloaded' : 'Missing image preloading',
            'Add preload links for critical images'
        );

        // Check for font preload
        const hasFontPreload = htmlContent.includes('rel="preload"') && htmlContent.includes('as="font"');
        this.check(
            'Font Preloading',
            hasFontPreload,
            hasFontPreload ? 'Critical fonts preloaded' : 'Missing font preloading',
            'Add preload links for critical fonts'
        );

        // Check for optimized CSS links
        const hasOptimizedCSS = htmlContent.includes('fonts-optimized.css') && htmlContent.includes('phosphor-subset.css');
        this.check(
            'Optimized CSS Loading',
            hasOptimizedCSS,
            hasOptimizedCSS ? 'Optimized CSS files linked' : 'Missing optimized CSS links',
            'Link to fonts-optimized.css and phosphor-subset.css'
        );
    }

    checkLazyLoading() {
        console.log('\n⚡ Lazy Loading:');
        
        const lazyLoadingPath = path.join(__dirname, '..', 'js', 'lazy-loading.js');
        const hasLazyLoading = fs.existsSync(lazyLoadingPath);
        this.check(
            'Lazy Loading Script',
            hasLazyLoading,
            hasLazyLoading ? 'Lazy loading script exists' : 'Missing lazy loading script',
            'Create js/lazy-loading.js'
        );

        if (hasLazyLoading) {
            const lazyScript = fs.readFileSync(lazyLoadingPath, 'utf8');
            const hasIntersectionObserver = lazyScript.includes('IntersectionObserver');
            this.check(
                'Intersection Observer',
                hasIntersectionObserver,
                hasIntersectionObserver ? 'Uses Intersection Observer API' : 'Missing Intersection Observer',
                'Implement Intersection Observer for better performance'
            );
        }

        const htmlPath = path.join(__dirname, '..', 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        const hasLazyScript = htmlContent.includes('lazy-loading.js');
        this.check(
            'Lazy Loading Integration',
            hasLazyScript,
            hasLazyScript ? 'Lazy loading script included' : 'Lazy loading script not included',
            'Add script tag for lazy-loading.js'
        );
    }

    displayResults() {
        console.log('\n📊 Verification Summary:');
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📋 Total Checks: ${this.checks.length}`);
        
        const successRate = ((this.passed / this.checks.length) * 100).toFixed(1);
        console.log(`🎯 Success Rate: ${successRate}%`);

        if (this.failed > 0) {
            console.log('\n🔧 Issues to Fix:');
            this.checks
                .filter(check => !check.passed)
                .forEach(check => {
                    console.log(`❌ ${check.name}: ${check.message}`);
                    if (check.fix) {
                        console.log(`   💡 ${check.fix}`);
                    }
                });
        } else {
            console.log('\n🎉 All optimizations verified successfully!');
        }

        // Generate verification report
        this.generateReport();
    }

    generateReport() {
        const report = `# Optimization Verification Report

Generated: ${new Date().toISOString()}

## Summary
- **Passed**: ${this.passed}/${this.checks.length} checks
- **Success Rate**: ${((this.passed / this.checks.length) * 100).toFixed(1)}%

## Detailed Results

${this.checks.map(check => {
    const status = check.passed ? '✅ PASS' : '❌ FAIL';
    return `### ${check.name} - ${status}
${check.message}
${check.fix && !check.passed ? `**Fix**: ${check.fix}` : ''}`;
}).join('\n\n')}

## Recommendations

${this.failed === 0 ? 
    '🎉 All optimizations are properly implemented!' : 
    `${this.failed} optimization(s) need attention. See failed checks above for specific fixes.`}

---
*Generated by OptimizationVerifier*
`;

        const reportPath = path.join(__dirname, 'verification-report.md');
        fs.writeFileSync(reportPath, report);
        console.log(`\n📄 Verification report saved to: ${reportPath}`);
    }
}

// Run verification
if (require.main === module) {
    const verifier = new OptimizationVerifier();
    verifier.runVerification().catch(error => {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    });
}

module.exports = OptimizationVerifier;
