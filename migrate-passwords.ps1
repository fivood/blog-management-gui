# Password Migration Script
# Convert password field to encrypted format

param(
    [string]$BlogPath = "blog-fukki\content\blog"
)

Write-Host "Starting password migration..." -ForegroundColor Green
Write-Host "Blog path: $BlogPath" -ForegroundColor Cyan

if (-not (Test-Path $BlogPath)) {
    Write-Host "Error: Blog path not found: $BlogPath" -ForegroundColor Red
    exit 1
}

Add-Type -AssemblyName System.Security

function Get-PasswordHash {
    param([string]$Password)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Password)
    $hash = $sha256.ComputeHash($bytes)
    return [System.BitConverter]::ToString($hash).Replace("-", "").ToLower()
}

function Encrypt-Content {
    param([string]$Content, [string]$Password)
    $key = Get-PasswordHash -Password $Password
    $keyBytes = [System.Text.Encoding]::UTF8.GetBytes($key.Substring(0, 32))
    $contentBytes = [System.Text.Encoding]::UTF8.GetBytes($Content)
    $encrypted = New-Object byte[] $contentBytes.Length
    for ($i = 0; $i -lt $contentBytes.Length; $i++) {
        $encrypted[$i] = $contentBytes[$i] -bxor $keyBytes[$i % $keyBytes.Length]
    }
    return [System.Convert]::ToBase64String($encrypted)
}

$totalFiles = 0
$migratedFiles = 0
$skippedFiles = 0
$errorFiles = 0

$articleDirs = Get-ChildItem -Path $BlogPath -Directory

foreach ($dir in $articleDirs) {
    $indexFile = Join-Path $dir.FullName "index.md"
    if (-not (Test-Path $indexFile)) { continue }
    $totalFiles++
    
    try {
        $content = Get-Content $indexFile -Raw -Encoding UTF8
        if ($content -match '(?m)^password:\s*"(.+?)"\s*$') {
            $password = $matches[1]
            Write-Host "`nProcessing: $($dir.Name)" -ForegroundColor Yellow
            Write-Host "  Password: $password"
            
            if ($content -match '(?s)^---\n(.*?)\n---\n(.*)$') {
                $frontmatter = $matches[1]
                $articleContent = $matches[2].Trim()
                $passwordHash = Get-PasswordHash -Password $password
                Write-Host "  Hash: $($passwordHash.Substring(0, 16))..."
                $encryptedContent = Encrypt-Content -Content $articleContent -Password $password
                Write-Host "  Encrypted (length: $($encryptedContent.Length))"
                $newFrontmatter = $frontmatter -replace '(?m)^password:.*$', ''
                $newFrontmatter += "`nprotected: true"
                $newFrontmatter += "`npasswordHash: `"$passwordHash`""
                $newFrontmatter += "`nencryptedContent: `"$encryptedContent`""
                $newContent = "---`n$newFrontmatter`n---`n`n<!-- Content is encrypted -->`n"
                $backupFile = "$indexFile.backup"
                Copy-Item $indexFile $backupFile -Force
                Write-Host "  Backed up to: $backupFile" -ForegroundColor Gray
                $newContent | Out-File -FilePath $indexFile -Encoding UTF8 -NoNewline
                $migratedFiles++
                Write-Host "  Success!" -ForegroundColor Green
            } else {
                Write-Host "  Error: Cannot parse frontmatter" -ForegroundColor Red
                $errorFiles++
            }
        } else {
            $skippedFiles++
        }
    } catch {
        Write-Host "`nError processing: $($dir.Name)" -ForegroundColor Red
        Write-Host "  $_" -ForegroundColor Red
        $errorFiles++
    }
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Migration Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Total: $totalFiles"
Write-Host "Migrated: $migratedFiles" -ForegroundColor Green
Write-Host "Skipped: $skippedFiles" -ForegroundColor Yellow
Write-Host "Errors: $errorFiles" -ForegroundColor Red

if ($migratedFiles -gt 0) {
    Write-Host "`nBackup files created with .backup extension" -ForegroundColor Cyan
}
