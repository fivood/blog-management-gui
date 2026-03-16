/**
 * Test extraction of sidebar config from NeoPost theme
 */

const path = require('path');
const fs = require('fs').promises;

function parseYamlSectionWithIndex(lines, startLine, baseIndent) {
  const result = {};
  const childIndent = baseIndent + 2;
  
  console.log(`[parseYamlSection] Starting at line ${startLine}, baseIndent=${baseIndent}, childIndent=${childIndent}`);
  
  let i = startLine;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineIndent = line.length - line.trimStart().length;
    
    // Stop if we hit a line with less or equal indentation than base (back to parent level or higher)
    if (trimmed && lineIndent <= baseIndent && /^[a-zA-Z]/.test(trimmed)) {
      console.log(`[parseYamlSection] Stopping at line ${i}: "${trimmed}" (indent ${lineIndent} <= base ${baseIndent})`);
      break;
    }
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      i++;
      continue;
    }
    
    // Only process lines with exact child indentation (direct children)
    if (lineIndent !== childIndent) {
      console.log(`[parseYamlSection] Skipping line ${i}: "${trimmed}" (indent ${lineIndent} != child ${childIndent})`);
      i++;
      continue;
    }
    
    // Match key: value or key:
    const match = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2].trim();
      
      console.log(`[parseYamlSection] Processing line ${i}: key="${key}", value="${value}"`);
      
      // Check if this is a nested object (value is empty, next line is indented more)
      if (!value || value === '') {
        // Look ahead to see if next non-empty line is more indented
        let nextLine = i + 1;
        let hasNestedContent = false;
        
        while (nextLine < lines.length) {
          const nextTrimmed = lines[nextLine].trim();
          if (nextTrimmed && !nextTrimmed.startsWith('#')) {
            const nextIndent = lines[nextLine].length - lines[nextLine].trimStart().length;
            console.log(`[parseYamlSection] Next non-empty line ${nextLine}: indent=${nextIndent}, childIndent=${childIndent}`);
            if (nextIndent > childIndent) {
              // This is a nested object - recursively parse it
              hasNestedContent = true;
              console.log(`[parseYamlSection] Recursing for nested object "${key}"`);
              const [nestedObj, nextIndex] = parseYamlSectionWithIndex(lines, i + 1, childIndent);
              result[key] = nestedObj;
              console.log(`[parseYamlSection] Returned from recursion, nextIndex=${nextIndex}`);
              
              // Continue from where the recursive call left off (don't increment, nextIndex is already correct)
              i = nextIndex - 1; // Subtract 1 because we'll increment at the end of the loop
              console.log(`[parseYamlSection] Set i=${i} (will be ${i+1} after increment)`);
            }
            break;
          }
          nextLine++;
        }
        
        if (!hasNestedContent) {
          result[key] = null;
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
    
    i++;
  }
  
  console.log(`[parseYamlSection] Returning at line ${i}, keys: ${Object.keys(result).join(', ')}`);
  return [result, i];
}

function parseYamlSection(lines, startLine, baseIndent) {
  const [result] = parseYamlSectionWithIndex(lines, startLine, baseIndent);
  return result;
}

async function testSidebarExtraction() {
  const configPath = path.join(__dirname, 'blog', 'themes', 'neopost', 'example', 'hugo.yaml');
  
  console.log('=== Testing Sidebar Config Extraction ===\n');
  
  const content = await fs.readFile(configPath, 'utf-8');
  const lines = content.split('\n');
  
  const allParams = {};
  
  // 1. Parse top-level params
  let paramsStartLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^params:\s*$/.test(line.trim()) && !line.startsWith(' ')) {
      paramsStartLine = i;
      break;
    }
  }
  
  if (paramsStartLine >= 0) {
    const topLevelParams = parseYamlSection(lines, paramsStartLine + 1, 0);
    Object.assign(allParams, topLevelParams);
    console.log('Top-level params:', Object.keys(topLevelParams));
  }
  
  // 2. Parse languages.*.params
  let languagesStartLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^languages:\s*$/.test(line.trim()) && !line.startsWith(' ')) {
      languagesStartLine = i;
      break;
    }
  }
  
  if (languagesStartLine >= 0) {
    console.log('\nFound languages section at line', languagesStartLine + 1);
    
    for (let i = languagesStartLine + 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (trimmed === 'params:' && line.startsWith('    ') && !line.startsWith('      ')) {
        console.log('Found language params at line', i + 1);
        const languageParams = parseYamlSection(lines, i + 1, 4);
        Object.assign(allParams, languageParams);
        console.log('Language params:', Object.keys(languageParams));
        break;
      }
    }
  }
  
  console.log('\n--- All Params ---');
  console.log(JSON.stringify(allParams, null, 2));
  
  console.log('\n--- Param Count ---');
  console.log('Total:', Object.keys(allParams).length);
  
  if (allParams.sidebar) {
    console.log('\n--- Sidebar Config ---');
    console.log(JSON.stringify(allParams.sidebar, null, 2));
  }
  
  if (allParams['read-more']) {
    console.log('\n--- Read-More Config ---');
    console.log(JSON.stringify(allParams['read-more'], null, 2));
  }
}

testSidebarExtraction().catch(console.error);
