# Cloudflare Build Troubleshooting Guide

## Overview

This guide helps you diagnose and fix build failures in Cloudflare Pages. When a build fails, the error message in the build log usually tells you exactly what's wrong.

## Step 1: Read the Error Message

When a build fails:

1. Go to your Cloudflare Pages project
2. Click "Deployments" tab
3. Click on the failed deployment
4. Scroll through the build log to find the error
5. The error message usually appears near the end of the log

**Example error:**
```
Error: config error: failed to parse config: toml: line 5: expected '=' but got 'EOF'
```

## Common Build Errors and Solutions

### Error 1: "hugo: command not found"

**Full Error Message:**
```
Error: hugo: command not found
```

**What it means:**
Cloudflare doesn't know which version of Hugo to use.

**Solution:**
1. Go to your Pages project Settings
2. Find "Environment variables" section
3. Add or verify this variable:
   - Name: `HUGO_VERSION`
   - Value: `0.120.0` (or latest stable version)
   - Environment: Production
4. Save the variable
5. Trigger a new build

**Why this works:**
Cloudflare needs to know which Hugo version to install before running the build command.

---

### Error 2: "public directory not found"

**Full Error Message:**
```
Error: public directory not found
```

**What it means:**
The build output directory is set incorrectly, or Hugo didn't generate the public directory.

**Solution:**

**Option A: Check build output directory setting**
1. Go to your Pages project Settings
2. Find "Build settings" section
3. Verify "Build output directory" is set to: `public`
4. If incorrect, change it to `public`
5. Save settings
6. Trigger a new build

**Option B: Check Hugo configuration**
1. Open `blog/hugo.toml`
2. Look for a line like: `publishDir = "something"`
3. If it exists and is not `public`, change it to: `publishDir = "public"`
4. Or remove the line to use the default `public`
5. Commit and push to GitHub
6. Trigger a new build

**Option C: Check if Hugo is running correctly**
1. In your local blog directory, run: `hugo --minify`
2. Check if `public/` directory is created
3. If not, there's an error in your Hugo configuration
4. Fix the error locally first
5. Commit and push to GitHub
6. Trigger a new build

---

### Error 3: "config error" or "TOML parsing error"

**Full Error Messages:**
```
Error: config error: failed to parse config: toml: line 5: expected '=' but got 'EOF'
Error: failed to parse config: toml: syntax error
```

**What it means:**
Your `hugo.toml` file has a syntax error. TOML is a strict format and even small mistakes prevent parsing.

**Solution:**

**Step 1: Identify the error line**
- The error message usually tells you the line number
- Example: `line 5` means the error is on line 5

**Step 2: Check your hugo.toml file**
1. Open `blog/hugo.toml`
2. Go to the line mentioned in the error
3. Look for common TOML syntax errors:

   **Missing quotes:**
   ```toml
   # Wrong
   title = My Blog
   
   # Correct
   title = "My Blog"
   ```

   **Missing equals sign:**
   ```toml
   # Wrong
   title "My Blog"
   
   # Correct
   title = "My Blog"
   ```

   **Unclosed brackets:**
   ```toml
   # Wrong
   [params
   
   # Correct
   [params]
   ```

   **Incorrect array syntax:**
   ```toml
   # Wrong
   tags = tag1, tag2
   
   # Correct
   tags = ["tag1", "tag2"]
   ```

**Step 3: Test locally**
1. In your blog directory, run: `hugo config`
2. If there's an error, Hugo will tell you exactly what's wrong
3. Fix the error in `hugo.toml`
4. Run `hugo config` again to verify it's fixed

**Step 4: Commit and deploy**
1. Commit the fixed `hugo.toml`
2. Push to GitHub
3. Trigger a new build

---

### Error 4: "theme not found"

**Full Error Messages:**
```
Error: theme not found: PaperMod
Error: failed to load theme: themes/PaperMod not found
```

**What it means:**
The PaperMod theme directory is missing or not in the right location.

**Solution:**

**Step 1: Verify theme directory exists**
1. Check that `blog/themes/PaperMod/` directory exists
2. The directory should contain theme files like:
   - `layouts/`
   - `static/`
   - `theme.toml`
   - etc.

**Step 2: Verify theme is committed to Git**
1. Run: `git status`
2. Check if `themes/PaperMod/` appears in the output
3. If it shows as untracked or modified, add it:
   ```bash
   git add themes/PaperMod/
   git commit -m "Add PaperMod theme"
   git push origin main
   ```

**Step 3: Verify theme name in configuration**
1. Open `blog/hugo.toml`
2. Check the line: `theme = "PaperMod"`
3. Verify the spelling matches exactly (case-sensitive)
4. If incorrect, fix it and commit

**Step 4: Trigger a new build**
1. After verifying and committing changes
2. Trigger a new build in Cloudflare

---

### Error 5: "permission denied"

**Full Error Messages:**
```
Error: permission denied: /tmp/build/blog/content/posts
Error: permission denied when reading file
```

**What it means:**
File permission issues in your repository.

**Solution:**
1. This is usually a Git issue
2. Try re-cloning your repository locally:
   ```bash
   rm -rf blog
   git clone https://github.com/fivood/blog.git blog
   ```
3. Verify all files are readable:
   ```bash
   ls -la blog/
   ```
4. Commit any changes:
   ```bash
   git add .
   git commit -m "Fix file permissions"
   git push origin main
   ```
5. Trigger a new build

---

### Error 6: "failed to load config"

**Full Error Messages:**
```
Error: failed to load config: config file not found
Error: failed to load config: invalid config format
```

**What it means:**
Hugo can't find or read your configuration file.

**Solution:**

**Step 1: Verify configuration file exists**
1. Check that `blog/hugo.toml` exists
2. Or check that `blog/config.yaml` exists
3. Hugo looks for one of these files in the blog directory

**Step 2: Verify configuration file format**
1. If using `hugo.toml`, ensure it's valid TOML format
2. If using `config.yaml`, ensure it's valid YAML format
3. Don't mix formats - use either TOML or YAML, not both

**Step 3: Check file encoding**
1. Ensure the file is saved as UTF-8 (not UTF-16 or other encoding)
2. In most editors, you can check/change encoding in the status bar

**Step 4: Commit and push**
1. Commit any changes
2. Push to GitHub
3. Trigger a new build

---

### Error 7: "build command failed"

**Full Error Messages:**
```
Error: build command failed with exit code 1
Error: build command exited with status 1
```

**What it means:**
The build command (`hugo --minify`) ran but encountered an error.

**Solution:**

**Step 1: Check the full error message**
1. Look at the build log above the error
2. There should be more details about what failed
3. Common causes:
   - Invalid Markdown in content files
   - Missing required front matter
   - Invalid shortcodes
   - Theme errors

**Step 2: Test locally**
1. In your blog directory, run: `hugo --minify`
2. Hugo will show you the exact error
3. Fix the error locally
4. Verify with: `hugo --minify` again

**Step 3: Commit and push**
1. Commit the fixed files
2. Push to GitHub
3. Trigger a new build

---

### Error 8: "timeout"

**Full Error Messages:**
```
Error: build timed out
Error: deployment timed out after 30 minutes
```

**What it means:**
The build took too long and was cancelled.

**Solution:**

**Step 1: Check for large files**
1. Look for large image files in `blog/static/`
2. Large files slow down the build
3. Consider optimizing or removing them

**Step 2: Check for problematic content**
1. Look for complex Markdown files
2. Look for many shortcodes or templates
3. Simplify if possible

**Step 3: Check build logs**
1. Look for warnings or slow operations
2. Optimize your Hugo configuration if needed

**Step 4: Try again**
1. Trigger a new build
2. If it times out again, contact Cloudflare support

---

## General Troubleshooting Steps

### Step 1: Check the Build Log

1. Go to your Cloudflare Pages project
2. Click "Deployments"
3. Click on the failed deployment
4. Read the entire build log carefully
5. Look for error messages (usually in red)
6. Note the line number if provided

### Step 2: Test Locally

1. In your blog directory, run the same build command:
   ```bash
   hugo --minify
   ```
2. If it fails locally, you'll see the same error
3. Fix the error locally first
4. Verify with: `hugo --minify` again

### Step 3: Check Configuration

1. Verify `blog/hugo.toml` is valid:
   ```bash
   hugo config
   ```
2. If there's an error, Hugo will tell you
3. Fix the error and try again

### Step 4: Verify Git Status

1. Check that all changes are committed:
   ```bash
   git status
   ```
2. If there are uncommitted changes, commit them:
   ```bash
   git add .
   git commit -m "Fix build error"
   git push origin main
   ```

### Step 5: Trigger a New Build

1. After fixing the issue, trigger a new build in Cloudflare
2. Monitor the build log
3. Verify it succeeds

## Debugging Tips

### Enable Verbose Output

Some errors are easier to debug with more information:

1. In your blog directory, run:
   ```bash
   hugo --minify --verbose
   ```
2. This shows more detailed output
3. Look for warnings or errors

### Check File Encoding

Some editors save files in the wrong encoding:

1. Ensure all files are UTF-8 encoded
2. Check your editor's encoding setting
3. Re-save files if needed

### Validate TOML/YAML

Use online validators to check your configuration:

1. For TOML: https://www.toml-lint.com/
2. For YAML: https://www.yamllint.com/
3. Copy your configuration and validate

### Check Git History

If a build suddenly fails after working:

1. Check recent commits:
   ```bash
   git log --oneline -10
   ```
2. See what changed:
   ```bash
   git diff HEAD~1
   ```
3. Revert if needed:
   ```bash
   git revert HEAD
   git push origin main
   ```

## When to Contact Support

If you've tried all troubleshooting steps and the build still fails:

1. **Cloudflare Support**: https://support.cloudflare.com/
2. **Hugo Support**: https://discourse.gohugo.io/
3. **GitHub Support**: https://support.github.com/

When contacting support, provide:
- Full build log output
- Your `hugo.toml` configuration
- Recent commits that might have caused the issue
- Steps you've already tried

## Prevention Tips

To avoid build failures:

1. **Test locally before pushing**
   ```bash
   hugo --minify
   ```

2. **Validate configuration**
   ```bash
   hugo config
   ```

3. **Use a linter for TOML**
   - Check syntax before committing

4. **Keep Hugo version consistent**
   - Set `HUGO_VERSION` in Cloudflare environment variables
   - Use the same version locally

5. **Commit incrementally**
   - Don't make large changes all at once
   - Easier to debug if something breaks

6. **Review changes before pushing**
   ```bash
   git diff
   ```

## Summary

Most build failures are caused by:
1. Missing or incorrect environment variables
2. Configuration file syntax errors
3. Missing theme or content files
4. Incorrect build settings

**Quick fix process:**
1. Read the error message
2. Test locally with `hugo --minify`
3. Fix the issue
4. Commit and push
5. Trigger a new build

---

**Need more help?** See CLOUDFLARE_INITIAL_BUILD_TRIGGER.md for detailed build instructions.

</content>
