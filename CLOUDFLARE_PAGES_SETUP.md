# Cloudflare Pages Setup Guide

## Task 14: Create Cloudflare Pages Project

This guide provides step-by-step instructions to create a Cloudflare Pages project and connect it to your GitHub repository.

### Prerequisites

Before starting, ensure you have:
- A Cloudflare account (free tier is sufficient)
- GitHub account with access to https://github.com/fivood/blog.git
- Code already pushed to the GitHub repository (Task 13 completed)

### Step-by-Step Instructions

#### Step 1: Log in to Cloudflare

1. Open your browser and navigate to https://dash.cloudflare.com
2. Log in with your Cloudflare account credentials
3. If you don't have an account, create one at https://dash.cloudflare.com/sign-up

#### Step 2: Navigate to Pages

1. In the Cloudflare dashboard, look for the left sidebar menu
2. Find and click on **"Pages"** (usually under the "Build" section)
3. You should see a "Pages" section with an option to create a new project

#### Step 3: Create a New Pages Project

1. Click the **"Create a project"** button
2. You'll see two options:
   - "Connect to Git"
   - "Upload assets"
3. Select **"Connect to Git"** (this is what we need for GitHub integration)

#### Step 4: Authorize Cloudflare to Access GitHub

1. You'll be prompted to authorize Cloudflare to access your GitHub account
2. Click **"Authorize Cloudflare"** or **"Connect GitHub"**
3. You'll be redirected to GitHub's authorization page
4. Review the permissions requested by Cloudflare:
   - Read access to repositories
   - Ability to receive push events
5. Click **"Authorize cloudflare"** to grant permissions
6. You'll be redirected back to Cloudflare

#### Step 5: Select Your Repository

1. After authorization, you'll see a list of your GitHub repositories
2. Search for or find **"blog"** repository (https://github.com/fivood/blog.git)
3. Click on the **"blog"** repository to select it
4. If you don't see it, you may need to:
   - Scroll down to find it
   - Use the search box to filter repositories
   - Check that you have access to the repository

#### Step 6: Select the Branch

1. After selecting the repository, you'll be asked to choose a branch
2. Select **"main"** (or **"master"** if that's your default branch)
3. This is the branch that will trigger deployments when you push code

#### Step 7: Configure Build Settings

1. You'll see a form with build configuration options
2. Fill in the following settings:

   **Project name:**
   - Enter: `blog` (or any name you prefer)

   **Production branch:**
   - Select: `main` (or your default branch)

   **Build command:**
   - Enter: `hugo --minify`

   **Build output directory:**
   - Enter: `public`

   **Environment variables (optional but recommended):**
   - Add a new variable:
     - Name: `HUGO_VERSION`
     - Value: `0.120.0` (or the latest stable Hugo version)

3. Leave other settings at their defaults unless you have specific requirements

#### Step 8: Review and Create

1. Review all the settings you've configured
2. Verify:
   - Repository: `fivood/blog`
   - Branch: `main`
   - Build command: `hugo --minify`
   - Output directory: `public`
3. Click **"Save and Deploy"** or **"Create project"**

#### Step 9: Monitor Initial Build

1. Cloudflare will automatically trigger the first build
2. You'll see a build log showing the deployment progress
3. The build should complete within a few minutes
4. You'll see a message indicating success or any errors

### What Happens Next

After successfully creating the Cloudflare Pages project:

1. **Automatic Deployments**: Every time you push code to the `main` branch on GitHub, Cloudflare will automatically:
   - Detect the push
   - Run the build command: `hugo --minify`
   - Deploy the generated `public` directory to Cloudflare's CDN

2. **Project URL**: Cloudflare will assign a temporary URL to your project (e.g., `blog.pages.dev`)
   - You can use this to test the deployment immediately
   - Later, you'll connect your custom domain (fivood.com)

3. **Build Logs**: You can view build logs anytime by:
   - Going to your Pages project in Cloudflare
   - Clicking on "Deployments"
   - Selecting a deployment to view its logs

### Troubleshooting

#### Issue: Repository not appearing in the list

**Solution:**
- Ensure you've authorized Cloudflare to access your GitHub account
- Check that you have access to the repository
- Try disconnecting and reconnecting your GitHub account in Cloudflare settings

#### Issue: Build fails with "hugo: command not found"

**Solution:**
- Ensure the `HUGO_VERSION` environment variable is set
- Cloudflare needs to know which Hugo version to use
- Set `HUGO_VERSION` to a specific version (e.g., `0.120.0`)

#### Issue: Build succeeds but site looks broken

**Solution:**
- Check that the `baseURL` in `hugo.toml` is set correctly
- Verify the build output directory is set to `public`
- Check the build logs for any warnings or errors

#### Issue: Authorization fails

**Solution:**
- Ensure you're logged into GitHub in your browser
- Try clearing browser cookies and logging in again
- Check that your GitHub account has access to the repository

### Next Steps

After successfully creating the Cloudflare Pages project:

1. **Task 15**: Configure Cloudflare build settings (if not already done)
2. **Task 16**: Trigger initial Cloudflare build and verify it succeeds
3. **Task 17-20**: Configure your custom domain (fivood.com)
4. **Task 21-24**: Create comprehensive documentation

### Verification Checklist

After completing this task, verify:

- [ ] Cloudflare Pages project created successfully
- [ ] GitHub repository connected to Cloudflare
- [ ] Build command set to `hugo --minify`
- [ ] Output directory set to `public`
- [ ] Initial build completed (check Deployments tab)
- [ ] Project has a temporary URL (e.g., blog.pages.dev)
- [ ] You can see build logs in Cloudflare dashboard

### Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages GitHub Integration](https://developers.cloudflare.com/pages/platform/git-integration/)
- [Hugo on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site/)

---

**Note:** This is a manual process that requires interaction with Cloudflare's web interface. Once completed, all future deployments will be automatic whenever you push code to GitHub.
