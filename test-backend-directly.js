// 直接测试后端的配置解析
const path = require('path');
const fs = require('fs').promises;

// 模拟 ThemeService 的 parseExampleYamlConfig 方法
function parseExampleYamlConfig(content, themeName) {
  const config = {
    name: themeName,
    exampleConfig: content
  };

  try {
    const lines = content.split('\n');
    let inParams = false;
    let paramsStartLine = -1;
    
    // Find the top-level params: section
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Check if this is a top-level params: (no indentation at start of original line)
      if (/^params:\s*$/.test(line.trim()) && !line.startsWith(' ')) {
        inParams = true;
        paramsStartLine = i;
        console.log(`Found top-level params: at line ${i}`);
        break;
      }
    }
    
    if (inParams && paramsStartLine >= 0) {
      const recommendedParams = {};
      
      // Parse lines after params:
      for (let i = paramsStartLine + 1; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        console.log(`Line ${i}: "${line}" (length: ${line.length})`);
        
        // Stop if we hit another top-level section (no indentation at start of line)
        if (line.length > 0 && /^[a-zA-Z]/.test(line) && !line.startsWith(' ')) {
          console.log(`  -> Stopped (top-level section)`);
          break;
        }
        
        // Skip empty lines and comment-only lines
        if (!trimmed || trimmed.startsWith('#')) {
          console.log(`  -> Skipped (empty or comment)`);
          continue;
        }
        
        // Match lines with 2-space indent (direct children of params)
        // Use trimmed line for matching but check original line for indentation
        if (line.startsWith('  ') && !line.startsWith('   ')) {
          const match = trimmed.match(/^([a-zA-Z0-9_-]+):\s*(.+)$/);
          if (match) {
            const key = match[1];
            let value = match[2].trim();
            
            console.log(`  -> Matched! key="${key}", value="${value}"`);
            
            // Remove comments
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
            
            recommendedParams[key] = value;
            console.log(`  -> Parsed: ${key} = ${JSON.stringify(value)}`);
          } else {
            console.log(`  -> No match (trimmed: "${trimmed}")`);
          }
        } else {
          console.log(`  -> Wrong indentation`);
        }
      }
      
      if (Object.keys(recommendedParams).length > 0) {
        config.recommendedParams = recommendedParams;
        console.log(`\n✅ Parsed ${Object.keys(recommendedParams).length} params from YAML config`);
      } else {
        console.log('\n❌ No params parsed');
      }
    } else {
      console.log('❌ params: section not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  return config;
}

async function test() {
  console.log('=== 直接测试后端 YAML 解析 ===\n');
  
  const configPath = path.join(__dirname, 'blog', 'themes', 'neopost', 'example', 'hugo.yaml');
  const content = await fs.readFile(configPath, 'utf-8');
  
  console.log(`Reading: ${configPath}`);
  console.log(`File size: ${content.length} bytes\n`);
  
  const result = parseExampleYamlConfig(content, 'neopost');
  
  console.log('\n=== 结果 ===');
  console.log('recommendedParams:', result.recommendedParams);
  console.log('\n如果看到 4 个参数，说明解析正确！');
}

test().catch(console.error);
