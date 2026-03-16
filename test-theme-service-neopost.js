/**
 * Test ThemeService getThemeConfig for NeoPost theme
 */

const path = require('path');
const fs = require('fs').promises;

// Simulate ThemeService parseYamlSection
function parseYamlSection(lines, startLine, baseIndent) {
  const result = {};
  const childIndent = baseIndent + 2;
  
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Stop if we hit a line with less indentation
    if (line.length > 0 && !line.startsWith(' '.repeat(childIndent)) && /^[a-zA-Z]/.test(line)) {
      break;
    }
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Check if this line has the correct indentation
    const lineIndent = line.length - line.trimStart().length;
    if (lineIndent !== childIndent) {
      continue;
    }
    
    // Match key: value or key:
    const match = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2].trim();
      
      // Check if this is a nested object
      if (!value || value === '') {
        let nextLine = i + 1;
        while (nextLine < lines.length) {
          const nextTrimmed = lines[nextLine].trim();
          if (nextTrimmed && !nextTrimmed.startsWith('#')) {
            const nextIndent = lines[nextLine].length - lines[nextLine].trimStart().length;
            if (nextIndent > childIndent) {
              result[key] = parseYamlSection(lines, i + 1, childIndent);
            }
            break;
          }
          nextLine++;
        }
      } else {
        // Simple value
        value = value.replace(/#.*$/, '').trim();
        
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Parse boolean
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        
        // Parse number
        if (/^\d+$/.test(value)) value = parseInt(value, 10);
        if (/^\d+\.\d+$/.test(value)) value = parseFloat(value);
        
        result[key] = value;
      }
    }
  }
  
  return result;
}

async function testNeoPostConfig() {
  const configPath = path.join(__dirname, 'blog', 'themes', 'neopost', 'example', 'hugo.yaml');
  
  console.log('=== Testing NeoPost Theme Config Parsing ===\n');
  console.log('Config path:', configPath);
  
  const content = await fs.readFile(configPath, 'utf-8');
  const lines = content.split('\n');
  
  // Find top-level params: section
  let paramsStartLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^params:\s*$/.test(line.trim()) && !line.startsWith(' ')) {
      paramsStartLine = i;
      console.log(`Found top-level params: at line ${i + 1}`);
      break;
    }
  }
  
  if (paramsStartLine >= 0) {
    const recommendedParams = parseYamlSection(lines, paramsStartLine + 1, 0);
    
    console.log('\n--- Parsed recommendedParams ---');
    console.log(JSON.stringify(recommendedParams, null, 2));
    
    console.log('\n--- Parameter count ---');
    console.log('Total params:', Object.keys(recommendedParams).length);
    
    console.log('\n--- Parameter types ---');
    for (const [key, value] of Object.entries(recommendedParams)) {
      console.log(`${key}: ${typeof value} = ${JSON.stringify(value)}`);
    }
  } else {
    console.log('❌ No top-level params: section found');
  }
}

testNeoPostConfig().catch(console.error);
