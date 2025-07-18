module.exports = {
  content: [
    './index.html',
    './dist/**/*.html',
    './src/**/*.js',
    './dist/**/*.js'
  ],
  css: ['./dist/css/styles.extracted.css'],
  output: './dist/css/styles.purged.css',
  safelist: [
    // Keep utility classes
    'show',
    'active',
    'animate-in',
    'animate-hidden',
    
    // Keep dynamic classes that might be added via JavaScript
    /^ph-/,      // Phosphor icons
    /^accordion-/, // Accordion states
    /^faq-/,     // FAQ states
    /^nav-/,     // Navigation states
    /^progress-/, // Progress indicator states
    
    // Keep hover states and pseudo-classes
    ':hover',
    ':focus',
    ':active',
    '::before',
    '::after',
    
    // Keep responsive classes
    /^(sm|md|lg|xl):/,
    
    // Keep animation classes
    'fadeIn',
    'slideIn',
    'rotate'
  ],
  defaultExtractor: content => {
    // Custom extractor to handle class names with special characters
    const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
    const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
    return broadMatches.concat(innerMatches);
  },
  fontFace: false,
  keyframes: true,
  variables: true
};
