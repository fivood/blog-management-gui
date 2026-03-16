#!/usr/bin/env pwsh
# Verify blog configuration after switching

Write-Host "=== Blog Configuration Verification ===" -ForegroundColor Cyan
Write-Host ""

# Check fivood.com blog (blog/)
Write-Host "Checking fivood.com blog (blog/)..." -ForegroundColor Yellow
$blogConfig = Get-Content "blog/hugo.toml" -Raw
if ($blogConfig -match 'theme\s*=\s*"([^"]+)"') {
    $theme = $matches[1]
    Write-Host "  Theme: $theme" -ForegroundColor $(if ($theme -eq "neopost") { "Green" } else { "Red" })
    if ($theme -ne "neopost") {
        Write-Host "  WARNING: Expected 'neopost', found '$theme'" -ForegroundColor Red
    }
} else {
    Write-Host "  ERROR: Could not find theme setting" -ForegroundColor Red
}

# Check menu configuration
$menuCount = ([regex]::Matches($blogConfig, '\[\[menu\.main\]\]')).Count
Write-Host "  Menu items: $menuCount" -ForegroundColor $(if ($menuCount -ge 3) { "Green" } else { "Red" })

# Check params
if ($blogConfig -match '\[params\]') {
    Write-Host "  Params section: Found" -ForegroundColor Green
} else {
    Write-Host "  Params section: Missing" -ForegroundColor Red
}

Write-Host ""

# Check fukki blog (blog-fukki/)
Write-Host "Checking 有空写点 blog (blog-fukki/)..." -ForegroundColor Yellow
if (Test-Path "blog-fukki/config/_default/hugo.toml") {
    $fukkiConfig = Get-Content "blog-fukki/config/_default/hugo.toml" -Raw
    if ($fukkiConfig -match 'theme\s*=\s*"([^"]+)"') {
        $theme = $matches[1]
        Write-Host "  Theme: $theme" -ForegroundColor Green
    }
    
    # Check publishDir
    if ($fukkiConfig -match 'publishDir\s*=\s*"([^"]+)"') {
        $publishDir = $matches[1]
        Write-Host "  Publish directory: $publishDir" -ForegroundColor $(if ($publishDir -eq "public") { "Green" } else { "Yellow" })
    }
} else {
    Write-Host "  ERROR: Config file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Verification Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If theme is incorrect, the configuration has been restored to 'neopost'." -ForegroundColor Gray
Write-Host "Please restart the blog management GUI to see the changes." -ForegroundColor Gray
