// 测试BlogManager的验证逻辑
const fs = require('fs').promises;
const path = require('path');

async function validateHugoProject(projectPath) {
  const errors = [];

  try {
    // Check if path exists
    try {
      await fs.access(projectPath);
      console.log('✓ 路径存在:', projectPath);
    } catch {
      errors.push({
        field: 'hugoProjectPath',
        message: `Hugo project path does not exist: ${projectPath}`,
        code: 'PATH_NOT_FOUND'
      });
      return { valid: false, errors };
    }

    // Check for required directories
    const requiredDirs = ['content', 'static'];
    for (const dir of requiredDirs) {
      const dirPath = path.join(projectPath, dir);
      try {
        await fs.access(dirPath);
        console.log(`✓ 必需目录存在: ${dir}/`);
      } catch {
        console.log(`✗ 缺少目录: ${dir}/`);
        errors.push({
          field: 'hugoProjectPath',
          message: `Hugo project is missing required directory: ${dir}`,
          code: 'MISSING_DIRECTORY'
        });
      }
    }

    // Check for Hugo config file (support both root and config directory)
    const configFiles = [
      'hugo.toml', 
      'hugo.yaml', 
      'config.toml', 
      'config.yaml',
      'config/_default/hugo.toml',
      'config/_default/hugo.yaml',
      'config/_default/config.toml',
      'config/_default/config.yaml'
    ];
    
    let configFound = false;
    console.log('\n检查配置文件:');
    for (const configFile of configFiles) {
      const configPath = path.join(projectPath, configFile);
      try {
        await fs.access(configPath);
        console.log(`✓ 找到配置文件: ${configFile}`);
        configFound = true;
        break;
      } catch {
        // Continue checking other config files
      }
    }

    if (!configFound) {
      console.log('✗ 未找到任何配置文件');
      errors.push({
        field: 'hugoProjectPath',
        message: 'Hugo project is missing configuration file (hugo.toml, hugo.yaml, config.toml, config.yaml, or config/_default/hugo.toml)',
        code: 'MISSING_CONFIG'
      });
    }

  } catch (error) {
    errors.push({
      field: 'hugoProjectPath',
      message: `Failed to validate Hugo project: ${error.message}`,
      code: 'VALIDATION_ERROR'
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 测试
const testPath = path.join(__dirname, 'blog-fukki');
console.log('========================================');
console.log('测试Hugo项目验证');
console.log('========================================');
console.log('测试路径:', testPath);
console.log('');

validateHugoProject(testPath).then(result => {
  console.log('\n========================================');
  console.log('验证结果:');
  console.log('========================================');
  console.log('有效:', result.valid);
  if (result.errors.length > 0) {
    console.log('\n错误:');
    result.errors.forEach(err => {
      console.log(`  - ${err.message} (${err.code})`);
    });
  } else {
    console.log('✓ 验证通过！');
  }
}).catch(err => {
  console.error('测试失败:', err);
});
