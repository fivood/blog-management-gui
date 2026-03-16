// 详细测试配置迁移功能
const path = require('path');
const fs = require('fs').promises;

async function testConfigMigration() {
  console.log('=== 配置迁移功能测试 ===\n');
  
  const blogPath = path.join(__dirname, 'blog');
  const neopostThemePath = path.join(blogPath, 'themes', 'neopost');
  
  // 1. 检查 neopost 主题配置文件
  console.log('1. 检查 neopost 主题配置文件:');
  const configPath = path.join(neopostThemePath, 'example', 'hugo.yaml');
  
  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    console.log(`   ✅ 找到配置文件: ${configPath}`);
    console.log(`   文件大小: ${configContent.length} 字节\n`);
    
    // 2. 解析 params 部分
    console.log('2. 解析 params 部分:');
    const paramsMatch = configContent.match(/^params:\s*$/m);
    if (paramsMatch) {
      console.log('   ✅ 找到 params: 部分');
      
      const paramsStartIndex = paramsMatch.index + paramsMatch[0].length;
      const remainingContent = configContent.substring(paramsStartIndex);
      const paramsSectionMatch = remainingContent.match(/^((?:  .+\n)*)/);
      
      if (paramsSectionMatch) {
        const paramsSection = paramsSectionMatch[1];
        console.log(`   params 部分长度: ${paramsSection.length} 字节`);
        
        // 解析参数
        const params = {};
        const lines = paramsSection.split('\n');
        for (const line of lines) {
          const match = line.match(/^  (\w+):\s*(.+)$/);
          if (match) {
            const key = match[1];
            let value = match[2].trim();
            
            // 移除引号
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            
            // 解析布尔值
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            
            // 解析数字
            if (/^\d+$/.test(value)) value = parseInt(value, 10);
            
            params[key] = value;
          }
        }
        
        console.log(`   ✅ 解析到 ${Object.keys(params).length} 个参数:`);
        for (const [key, value] of Object.entries(params)) {
          console.log(`      - ${key}: ${JSON.stringify(value)}`);
        }
      }
    } else {
      console.log('   ❌ 未找到 params: 部分');
    }
    
    console.log('\n3. 读取当前 hugo.toml 配置:');
    const hugoConfigPath = path.join(blogPath, 'hugo.toml');
    const hugoConfig = await fs.readFile(hugoConfigPath, 'utf-8');
    
    // 提取当前 [params] 部分
    const currentParamsMatch = hugoConfig.match(/\[params\]([\s\S]*?)(?=\n\[|$)/);
    const currentParams = {};
    
    if (currentParamsMatch) {
      const lines = currentParamsMatch[1].split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        const match = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
        if (match) {
          currentParams[match[1]] = match[2].trim();
        }
      }
      
      console.log(`   ✅ 当前配置有 ${Object.keys(currentParams).length} 个参数:`);
      for (const [key, value] of Object.entries(currentParams)) {
        console.log(`      - ${key}: ${value}`);
      }
    }
    
    console.log('\n4. 分析配置差异:');
    const newParams = {};
    const obsoleteParams = [];
    
    // 从 neopost 配置中找新参数
    const neopostParams = {
      theme: 'meow',
      favicon: '/favicon.ico',
      'posts-per-page': 1,
      'toc-auto-numbering': false
    };
    
    for (const [key, value] of Object.entries(neopostParams)) {
      if (!(key in currentParams)) {
        newParams[key] = value;
      }
    }
    
    // 找可能过时的参数
    const commonParams = ['title', 'baseURL', 'languageCode', 'theme', 'paginate'];
    for (const key of Object.keys(currentParams)) {
      if (commonParams.includes(key)) continue;
      if (!(key in neopostParams)) {
        obsoleteParams.push(key);
      }
    }
    
    console.log(`   新增参数: ${Object.keys(newParams).length} 个`);
    for (const [key, value] of Object.entries(newParams)) {
      console.log(`      + ${key}: ${JSON.stringify(value)}`);
    }
    
    console.log(`   可能过时的参数: ${obsoleteParams.length} 个`);
    for (const param of obsoleteParams) {
      console.log(`      - ${param}`);
    }
    
    const hasChanges = Object.keys(newParams).length > 0 || obsoleteParams.length > 0;
    console.log(`\n   hasChanges: ${hasChanges}`);
    
    if (hasChanges) {
      console.log('\n   ✅ 应该弹出配置迁移对话框！');
    } else {
      console.log('\n   ℹ️ 没有配置差异，不会弹出对话框');
    }
    
  } catch (error) {
    console.error('   ❌ 错误:', error.message);
  }
  
  console.log('\n=== 测试完成 ===');
}

testConfigMigration().catch(console.error);
