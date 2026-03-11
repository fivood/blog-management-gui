# Task 15: Configure Cloudflare Build Settings - Verification Guide

## Overview

This guide provides step-by-step instructions to verify and configure the Cloudflare Pages build settings for your Hugo blog. These settings control how Cloudflare builds and deploys your site.

**Requirements Addressed:**
- Requirement 4.2: Configure Cloudflare Pages to build the Hugo site using the correct build command
- Requirement 4.4: Deployment configuration SHALL specify the correct output directory (public)

## Prerequisites

Before starting, ensure you have:
- Completed Task 14 (Cloudflare Pages project created)
- Access to your Cloudflare account
- The Cloudflare Pages project "blog" already created and connected to GitHub

## Build Settings Configuration

### What Are Build Settings?

Build settings tell Cloudflare how to build your Hugo site:
- **Build Command**: The command Cloudflare runs to generate your static site
- **Build Output Directory**: Where Cloudflare finds the generated files to deploy
- **Environment Variables**: Additional configuration values needed during the build

### Required Build Settings

For this Hugo blog project, the build settings should be:

| Setting | Value | Purpose |
|---------|-------|---------|
| Build Command | `hugo --minify` | Generates optimized static site |
| Build Output Directory | `public` | Location of generated files |
| Environment Variable: HUGO_VERSION | `0.120.0` (or latest) | Specifies Hugo version to use |

## Step-by-Step Verification and Configuration

### Step 1: Access Your Cloudflare Pages Project

1. Open your browser and navigate to https://dash.cloudflare.com
2. Log in with your Cloudflare account credentials
3. In the left sidebar, click on **"Pages"** (under the "Build" section)
4. You should see your **"blog"** project in the list
5. Click on the **"blog"** project to open it

### Step 2: Navigate to Project Settings

1. Once inside your blog project, look for the navigation tabs at the top
2. You should see tabs like: "Deployments", "Settings", "Analytics", etc.
3. Click on the **"Settings"** tab
4. This will show you the project configuration options

### Step 3: Verify Build Command

1. In the Settings page, look for the **"Build settings"** section
2. Find the **"Build command"** field
3. Verify it contains: `hugo --minify`

**If the build command is incorrect:**
1. Click on the build command field to edit it
2. Clear the current value
3. Enter: `hugo --minify`
4. Click "Save" or "Update"

**Why this command?**
- `hugo`: Runs the Hugo static site generator
- `--minify`: Minifies HTML, CSS, and JavaScript for smaller file sizes and faster loading

### Step 4: Verify Build Output Directory

1. In the same **"Build settings"** section, find the **"Build output directory"** field
2. Verify it contains: `public`

**If the output directory is incorrect:**
1. Click on the output directory field to edit it
2. Clear the current value
3. Enter: `public`
4. Click "Save" or "Update"

**Why this directory?**
- Hugo generates static files to the `public/` directory by default
- Cloudflare needs to know where to find the generated files to deploy

### Step 5: Configure Environment Variables

Environment variables provide additional configuration to the build process.

#### Step 5a: Access Environment Variables

1. In the Settings page, look for the **"Environment variables"** section
2. You may see a button like **"Add environment variable"** or **"Edit variables"**
3. Click on it to access the environment variables configuration

#### Step 5b: Add HUGO_VERSION Variable

1. Click **"Add environment variable"** or the **"+"** button
2. A form will appear with fields for:
   - **Variable name**
   - **Value**
   - **Environment** (Production, Preview, or both)

3. Fill in the following:
   - **Variable name**: `HUGO_VERSION`
   - **Value**: `0.120.0` (or check https://github.com/gohugoio/hugo/releases for the latest stable version)
   - **Environment**: Select **"Production"** (or both if you want it in preview builds too)

4. Click **"Save"** or **"Add"**

**Why set HUGO_VERSION?**
- Cloudflare needs to know which version of Hugo to use
- Specifying a version ensures consistent builds across deployments
- Without this, Cloudflare may use an incompatible or outdated version

#### Step 5c: Verify Other Environment Variables

Check if there are any other environment variables already set:
- Look through the list of existing variables
- Remove any that are not needed for your Hugo build
- Common variables you might see:
  - `HUGO_VERSION` (should be set as above)
  - `HUGO_ENV` (optional, can be set to "production")

### Step 6: Review All Settings

Before saving, verify all settings are correct:

**Checklist:**
- [ ] Build command: `hugo --minify`
- [ ] Build output directory: `public`
- [ ] Environment variable `HUGO_VERSION`: Set to `0.120.0` or latest
- [ ] No conflicting or unnecessary environment variables

### Step 7: Save Settings

1. After making any changes, look for a **"Save"** or **"Update"** button
2. Click it to save your build settings
3. You should see a confirmation message like "Settings saved successfully"

### Step 8: Verify Settings Are Saved

1. Refresh the page (F5 or Cmd+R)
2. Navigate back to Settings > Build settings
3. Verify all your changes are still there:
   - Build command: `hugo --minify`
   - Build output directory: `public`
   - Environment variable `HUGO_VERSION`: Set correctly

## Testing Your Build Settings

### Trigger a Manual Build

To verify your build settings work correctly:

1. In your blog project, click on the **"Deployments"** tab
2. Look for a button like **"Trigger build"** or **"Redeploy"**
3. Click it to manually trigger a build with your new settings
4. Watch the build progress in the deployment log

### Monitor Build Progress

1. The deployment page will show a real-time log of the build process
2. You should see output like:
   ```
   Cloning repository...
   Installing dependencies...
   Running build command: hugo --minify
   Building site...
   Deployment complete!
   ```

3. If the build succeeds, you'll see a green checkmark and "Success" message
4. If the build fails, you'll see error messages in the log

### Verify Deployment

After a successful build:

1. Your project will have a temporary URL (e.g., `blog.pages.dev`)
2. Click on the deployment to view its details
3. Click on the temporary URL to visit your deployed site
4. Verify the site displays correctly

## Troubleshooting

### Issue: Build fails with "hugo: command not found"

**Cause:** Cloudflare doesn't know which Hugo version to use

**Solution:**
1. Go to Settings > Environment variables
2. Ensure `HUGO_VERSION` is set to a specific version (e.g., `0.120.0`)
3. Trigger a new build

### Issue: Build fails with "output directory not found"

**Cause:** The build output directory is set incorrectly

**Solution:**
1. Go to Settings > Build settings
2. Verify the build output directory is set to `public`
3. Verify your `hugo.toml` doesn't specify a different output directory
4. Trigger a new build

### Issue: Build succeeds but site looks broken

**Cause:** The `baseURL` in your Hugo configuration might be incorrect

**Solution:**
1. Check your `blog/hugo.toml` file
2. Verify `baseURL = "https://fivood.com"` is set correctly
3. If you're testing with the temporary URL, the baseURL might need adjustment
4. Commit and push changes to GitHub
5. Trigger a new build

### Issue: Build takes too long or times out

**Cause:** Hugo build is taking longer than expected

**Solution:**
1. Check the build logs for any warnings or errors
2. Verify your content doesn't have any problematic files
3. Consider optimizing your Hugo configuration
4. Contact Cloudflare support if builds consistently timeout

### Issue: Environment variable not being used

**Cause:** Variable might be set for the wrong environment

**Solution:**
1. Go to Settings > Environment variables
2. Check that `HUGO_VERSION` is set for "Production" environment
3. If you want it in preview builds too, select "All environments"
4. Trigger a new build

## Verification Checklist

After completing this task, verify:

- [ ] Build command is set to `hugo --minify`
- [ ] Build output directory is set to `public`
- [ ] Environment variable `HUGO_VERSION` is set to `0.120.0` or latest
- [ ] Settings have been saved successfully
- [ ] Manual build test completed successfully
- [ ] Deployed site is accessible via temporary URL
- [ ] Site displays correctly without errors

## Next Steps

After successfully configuring build settings:

1. **Task 16**: Trigger initial Cloudflare build and verify it succeeds
2. **Task 17-20**: Configure your custom domain (fivood.com)
3. **Task 21-24**: Create comprehensive documentation

## Additional Resources

- [Cloudflare Pages Build Configuration](https://developers.cloudflare.com/pages/platform/build-configuration/)
- [Hugo Environment Variables](https://gohugo.io/getting-started/configuration/#environment-variables)
- [Hugo on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/)
- [Hugo Releases](https://github.com/gohugoio/hugo/releases)

## Summary

Task 15 ensures that your Cloudflare Pages project is correctly configured to build and deploy your Hugo blog. The key settings are:

1. **Build Command**: `hugo --minify` - Tells Cloudflare how to build your site
2. **Output Directory**: `public` - Tells Cloudflare where to find the generated files
3. **Environment Variable**: `HUGO_VERSION=0.120.0` - Ensures consistent Hugo version

These settings enable automatic deployments: whenever you push code to GitHub, Cloudflare will automatically run these build settings to generate and deploy your site.

---

**Note:** This is a manual process that requires interaction with Cloudflare's web interface. The settings configured here will be used for all future automatic deployments triggered by GitHub pushes.

