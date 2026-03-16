/**
 * Test script to verify NeoPost theme configuration extraction
 */

const path = require('path');
const fs = require('fs');

// Simulate ThemeService getThemeConfig for NeoPost
async function testNeoPostConfig() {
  const themeName = 'neopost';
  const themePath = path.join(__dirname, 'blog', 'themes', themeName);
  
  console.log('=== Testing NeoPost Theme Configuration ===\n');
  console.log('Theme path:', themePath);
  
  // Check if theme exists
  if (!fs.existsSync(themePath)) {
    console.error('❌ Theme directory not found');
    return;
  }
  
  // Check for config files
  const exampleConfigPath = path.join(themePath, 'example', 'hugo.yaml');
  const themeTomlPath = path.join(themePath, 'theme.toml');
  const configTomlPath = path.join(themePath, 'config.toml');
  
  console.log('\n--- Checking config files ---');
  console.log('example/hugo.yaml exists:', fs.existsSync(exampleConfigPath));
  console.log('theme.toml exists:', fs.existsSync(themeTomlPath));
  console.log('config.toml exists:', fs.existsSync(configTomlPath));
  
  // Read example config
  if (fs.existsSync(exampleConfigPath)) {
    console.log('\n--- Example hugo.yaml content ---');
    const content = fs.readFileSync(exampleConfigPath, 'utf-8');
    console.log(content);
    
    // Parse YAML manually to extract params
    console.log('\n--- Extracting params ---');
    const lines = content.split('\n');
    let inParams = false;
    let indent = 0;
    const params = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (trimmed.startsWith('params:')) {
        inParams = true;
        indent = line.indexOf('params:');
        console.log('Found params section at line', i + 1);
        continue;
      }
      
      if (inParams && line.length > 0 && !line.startsWith(' '.repeat(indent + 2))) {
        // End of params section
        if (trimmed && !trimmed.startsWith('#')) {
          break;
        }
      }
      
      if (inParams && trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.+)?$/);
        if (match) {
          const key = match[1];
          const value = match[2] || '';
          params[key] = value;
          console.log(`  - ${key}: ${value}`);
        }
      }
    }
    
    console.log('\n--- Extracted params object ---');
    console.log(JSON.stringify(params, null, 2));
  }
  
  // Read theme.toml
  if (fs.existsSync(themeTomlPath)) {
    console.log('\n--- theme.toml content ---');
    const content = fs.readFileSync(themeTomlPath, 'utf-8');
    console.log(content);
  }
}

testNeoPostConfig().catch(console.error);
