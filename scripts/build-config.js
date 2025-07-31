const fs = require('fs');
const path = require('path');

console.log('Building configuration files...');

// ALWAYS USE PRODUCTION - No sandbox mode allowed
const cashfreeEnvironment = 'PRODUCTION';
console.log(`Using validated CASHFREE_ENVIRONMENT: ${cashfreeEnvironment}`);

// Read the template config file
const configTemplatePath = path.join(__dirname, '../js/config.template.js');
const configOutputPath = path.join(__dirname, '../js/config.js');

// Check if template exists, if not create it
if (!fs.existsSync(configTemplatePath)) {
    console.log('Config template not found, creating from existing config.js...');
    // Copy existing config.js to template
    const existingConfig = fs.readFileSync(configOutputPath, 'utf8');
    fs.writeFileSync(configTemplatePath, existingConfig);
}

// Read template
const configTemplate = fs.readFileSync(configTemplatePath, 'utf8');

// Replace placeholder with properly escaped environment value to prevent injection
const configContent = configTemplate.replace('$CASHFREE_ENVIRONMENT', JSON.stringify(cashfreeEnvironment).slice(1, -1));

// Write the final config file
fs.writeFileSync(configOutputPath, configContent);
console.log(`Configuration file generated successfully with environment: ${cashfreeEnvironment}`);