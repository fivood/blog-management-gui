# Cloudflare DNS Records Setup Guide

## Task 18: Set up Cloudflare DNS Records

This guide provides step-by-step instructions for creating DNS records in Cloudflare to route fivood.com to your Cloudflare Pages deployment. This is the critical step that connects your domain to your deployed blog.

---

## Overview

**Objective**: Create DNS records in Cloudflare to route fivood.com to Cloudflare Pages deployment

**Requirements**: 
- Requirement 5.1: Domain fivood.com accessible via https://fivood.com
- Requirement 5.3: DNS records correctly configured

**Prerequisites**:
- Task 17 completed: Domain nameservers updated to Cloudflare
- DNS propagation complete (Cloudflare dashboard shows "Active" status)
- Cloudflare Pages project deployed (Task 16 completed)
- Access to Cloudflare dashboard

**Timeline**: 
- Configuration: 5-10 minutes
- DNS propagation: 5-30 minutes (usually faster than nameserver changes)

---

## Understanding DNS Records

### What are DNS Records?

DNS records are instructions that tell the internet how to route traffic to your domain. They specify:
- Where your website is hosted
- How to handle email
- Security settings
- Other domain configurations

### Types of DNS Records

**Common DNS record types**:

| Record Type | Purpose | Example |
|-------------|---------|---------|
| **A** | Points domain to IPv4 address | `fivood.com → 192.0.2.1` |
| **AAAA** | Points domain to IPv6 address | `fivood.com → 2001:db8::1` |
| **CNAME** | Points domain to another domain | `fivood.com → pages.cloudflare.com` |
| **MX** | Specifies mail server | `fivood.com → mail.example.com` |
| **TXT** | Text records for verification | `fivood.com → v=spf1 ...` |
| **NS** | Nameserver records | `fivood.com → ns1.cloudflare.com` |

### CNAME Records for Cloudflare Pages

For Cloudflare Pages, you typically use a **CNAME record** to point your domain to the Cloudflare Pages deployment.

**What is a CNAME record?**
- CNAME = "Canonical Name"
- It's an alias that points one domain to another domain
- When someone visits fivood.com, the CNAME record tells them to go to your Cloudflare Pages URL instead

**Example**:
```
Domain: fivood.com
CNAME Record: fivood.com → [your-project].pages.dev
```

---

## Part 1: Find Your Cloudflare Pages Deployment URL

Before creating DNS records, you need to know your Cloudflare Pages deployment URL.

### Step 1: Log in to Cloudflare Dashboard

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Enter your Cloudflare email and password
3. Click "Log In"
4. Complete any two-factor authentication if enabled

### Step 2: Navigate to Pages Project

1. In the Cloudflare dashboard, look for the left sidebar menu
2. Click on "Pages" or "Workers & Pages"
3. You should see your "blog" project listed
4. Click on the "blog" project to open it

### Step 3: Find Your Deployment URL

1. In the project overview, look for the deployment URL
2. You should see something like:
   ```
   https://[project-name].[account-name].pages.dev
   ```

**Example**:
```
https://blog.fivood.pages.dev
```

**Important**: Write down this URL exactly. You'll need it to create the CNAME record.

### Step 4: Verify Deployment is Active

1. Look for a green checkmark or "Active" status next to your deployment
2. If the deployment shows "Failed" or "Error", go back to Task 16 and fix the build
3. Once deployment is active, proceed to the next section

---

## Part 2: Create DNS Records in Cloudflare

### Step 1: Navigate to DNS Settings

1. In the Cloudflare dashboard, click on your domain (fivood.com)
2. In the left sidebar, click "DNS" or "DNS Records"
3. You should see a list of existing DNS records (if any)

### Step 2: Add CNAME Record for Root Domain

**Important**: Cloudflare has special handling for root domain CNAME records. Follow these steps carefully.

#### Option A: Using CNAME Record (Recommended for most cases)

1. Click the "+ Add record" button
2. In the "Type" dropdown, select "CNAME"
3. In the "Name" field, enter `@` (this represents the root domain fivood.com)
4. In the "Target" field, enter your Cloudflare Pages deployment URL:
   ```
   [your-project].pages.dev
   ```
   
   **Example**:
   ```
   blog.pages.dev
   ```

5. Leave "TTL" as "Auto" (default)
6. Leave "Proxy status" as "Proxied" (orange cloud icon)
7. Click "Save"

**Result**: You should see a new CNAME record:
```
Name: @ (fivood.com)
Type: CNAME
Target: blog.pages.dev
Status: Proxied (orange cloud)
```

#### Option B: Using ALIAS Record (Alternative)

Some DNS providers use ALIAS records for root domain routing. Cloudflare supports this:

1. Click the "+ Add record" button
2. In the "Type" dropdown, select "ALIAS" (if available)
3. In the "Name" field, enter `@`
4. In the "Target" field, enter your Cloudflare Pages deployment URL
5. Click "Save"

**Note**: CNAME (Option A) is more commonly used and recommended.

### Step 3: Add CNAME Record for www Subdomain (Optional but Recommended)

To support both `fivood.com` and `www.fivood.com`, add a second CNAME record:

1. Click the "+ Add record" button
2. In the "Type" dropdown, select "CNAME"
3. In the "Name" field, enter `www`
4. In the "Target" field, enter your Cloudflare Pages deployment URL:
   ```
   [your-project].pages.dev
   ```

5. Leave "TTL" as "Auto"
6. Leave "Proxy status" as "Proxied"
7. Click "Save"

**Result**: You should see a second CNAME record:
```
Name: www
Type: CNAME
Target: blog.pages.dev
Status: Proxied (orange cloud)
```

### Step 4: Verify DNS Records

After creating the records, you should see them in your DNS records list:

```
Name          Type    Target              Status
@             CNAME   blog.pages.dev      Proxied
www           CNAME   blog.pages.dev      Proxied
```

**Important**: 
- Both records should show "Proxied" status (orange cloud icon)
- If they show "DNS only" (gray cloud), click on them and change to "Proxied"
- Proxied status means Cloudflare will route traffic through its network

---

## Part 3: Understanding DNS Record Options

### Proxy Status

**Proxied (Orange Cloud)**:
- Traffic goes through Cloudflare's network
- Cloudflare provides security, caching, and optimization
- Your server IP is hidden
- Recommended for most websites

**DNS Only (Gray Cloud)**:
- Traffic goes directly to your server
- Cloudflare only provides DNS resolution
- Your server IP is visible
- Use only if you need direct access

**For Cloudflare Pages**: Always use "Proxied" status.

### TTL (Time To Live)

**What is TTL?**
- TTL specifies how long DNS records are cached
- Measured in seconds
- Higher TTL = less frequent DNS lookups (faster)
- Lower TTL = more frequent DNS lookups (slower but more flexible)

**Options**:
- "Auto" (recommended): Cloudflare automatically optimizes TTL
- Custom values: 30 seconds to 1 day

**For Cloudflare Pages**: Use "Auto" TTL.

### Record Priority

Some record types (like MX) have priority values. CNAME records don't use priority.

---

## Part 4: Verify DNS Configuration

### Verification Method 1: Cloudflare Dashboard

1. Go to your domain's DNS settings in Cloudflare
2. Verify that you see the CNAME records you created
3. Check that both records show "Proxied" status (orange cloud)
4. No error messages should appear

### Verification Method 2: Command Line Tools

You can verify DNS records using command-line tools:

#### Using `nslookup` (Windows/Mac/Linux)

```bash
nslookup fivood.com
```

**Expected output** (after DNS propagation):
```
Server: 1.1.1.1
Address: 1.1.1.1#53

Non-authoritative answer:
Name: fivood.com
Address: [Cloudflare IP address]
```

#### Using `dig` (Mac/Linux)

```bash
dig fivood.com
```

**Expected output**:
```
; <<>> DiG 9.10.6 <<>> fivood.com
;; QUESTION SECTION:
;fivood.com.                    IN      A

;; ANSWER SECTION:
fivood.com.             300     IN      A       [Cloudflare IP address]
```

#### Check CNAME Record Specifically

```bash
dig fivood.com CNAME
```

**Expected output**:
```
;; ANSWER SECTION:
fivood.com.             300     IN      CNAME   blog.pages.dev.
```

### Verification Method 3: Online DNS Lookup Tools

If you don't have command-line access:

1. Go to [https://mxtoolbox.com/nslookup.aspx](https://mxtoolbox.com/nslookup.aspx)
2. Enter `fivood.com` in the domain field
3. Click "MX Lookup" or "A Lookup"
4. Look for the DNS records in the results
5. Verify they point to Cloudflare Pages

### Verification Method 4: Test Domain Access

The ultimate verification is testing if your domain works:

1. Open a web browser
2. Go to `https://fivood.com`
3. You should see your blog content
4. If you see an error, wait a few minutes for DNS propagation and try again

---

## Part 5: DNS Propagation Timeline

### What Happens After Creating DNS Records

When you create DNS records, they need to propagate across the internet:

| Time | Status |
|------|--------|
| 0-5 minutes | Records created in Cloudflare |
| 5-15 minutes | Records visible to most DNS servers |
| 15-30 minutes | Records visible to all DNS servers (typical) |
| 30-60 minutes | Complete propagation (worst case) |

**Important**: DNS propagation is usually faster than nameserver changes (which can take 24-48 hours).

### Monitoring Propagation

#### Method 1: Cloudflare Dashboard

1. Go to your domain's DNS settings
2. Look for the DNS records you created
3. They should show "Proxied" status immediately
4. If they show "Pending" or "Error", wait a few minutes and refresh

#### Method 2: Online Propagation Checker

Use online tools to check propagation:

1. Go to [https://www.whatsmydns.net](https://www.whatsmydns.net)
2. Enter `fivood.com` in the domain field
3. Select "A" or "CNAME" from the record type dropdown
4. Click "Search"
5. The tool will check DNS records from multiple locations worldwide
6. Green checkmarks indicate successful propagation
7. Red X marks indicate propagation not yet complete

#### Method 3: Manual Verification

Periodically run the command-line verification commands to check if DNS records have updated.

---

## Part 6: Troubleshooting DNS Issues

### Issue: Domain Shows "DNS Resolution Failed"

**Symptoms**:
- Browser shows "DNS resolution failed" or "Cannot find server"
- Error message when trying to access fivood.com

**Solutions**:

1. **Wait for DNS propagation**
   - DNS changes can take up to 60 minutes
   - Wait at least 15-30 minutes before troubleshooting
   - Use online propagation checker to monitor progress

2. **Clear DNS cache**
   - Your computer may be caching old DNS results
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
   - Linux: `sudo systemctl restart systemd-resolved`

3. **Try different DNS servers**
   - Use Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)
   - This can help verify if propagation is complete

4. **Verify DNS records in Cloudflare**
   - Go to Cloudflare dashboard
   - Check that CNAME records are created
   - Verify they point to correct Cloudflare Pages URL
   - Check that records show "Proxied" status

5. **Verify Cloudflare Pages deployment**
   - Check that Cloudflare Pages project is deployed
   - Verify build was successful
   - Check that project is accessible via Cloudflare Pages URL

### Issue: Domain Points to Wrong Location

**Symptoms**:
- fivood.com loads but shows wrong content
- Shows someone else's website or error page

**Solutions**:

1. **Verify CNAME target**
   - Go to Cloudflare DNS settings
   - Check that CNAME record points to correct Cloudflare Pages URL
   - Correct format: `[project-name].pages.dev`
   - If wrong, edit the record and fix the target

2. **Verify Cloudflare Pages project**
   - Go to Cloudflare Pages
   - Verify you're looking at the correct project
   - Check that project is deployed and active
   - Verify project contains your blog content

3. **Check for conflicting DNS records**
   - Go to Cloudflare DNS settings
   - Look for multiple A records or CNAME records for fivood.com
   - Delete any conflicting records
   - Keep only the CNAME record pointing to Cloudflare Pages

### Issue: HTTPS Certificate Error

**Symptoms**:
- Browser shows "Certificate error" or "Not secure"
- SSL/TLS warning when accessing fivood.com

**Solutions**:

1. **Wait for certificate provisioning**
   - Cloudflare automatically provisions SSL/TLS certificates
   - This can take 5-30 minutes after DNS records are created
   - Wait and try again

2. **Verify SSL/TLS settings in Cloudflare**
   - Go to your domain in Cloudflare
   - Click "SSL/TLS" in the left menu
   - Check that SSL/TLS is enabled
   - Verify encryption mode is set to "Full" or "Full (strict)"

3. **Clear browser cache**
   - Clear browser cache and cookies
   - Try accessing in incognito/private mode
   - Try different browser

4. **Check certificate status**
   - Go to Cloudflare SSL/TLS settings
   - Look for certificate status
   - If certificate shows "Error", contact Cloudflare support

### Issue: www Subdomain Doesn't Work

**Symptoms**:
- fivood.com works but www.fivood.com doesn't
- Or vice versa

**Solutions**:

1. **Verify www CNAME record**
   - Go to Cloudflare DNS settings
   - Check that you have a CNAME record for "www"
   - If missing, create one (see Part 2, Step 3)
   - Verify it points to correct Cloudflare Pages URL

2. **Wait for DNS propagation**
   - DNS changes can take up to 60 minutes
   - Wait and try again

3. **Check for conflicting records**
   - Look for multiple A records or CNAME records for www
   - Delete any conflicting records
   - Keep only the CNAME record pointing to Cloudflare Pages

### Issue: Cloudflare Pages URL Works but Domain Doesn't

**Symptoms**:
- `https://blog.pages.dev` works fine
- But `https://fivood.com` doesn't work

**Solutions**:

1. **Verify DNS records are created**
   - Go to Cloudflare DNS settings
   - Check that CNAME records exist for fivood.com
   - If missing, create them (see Part 2)

2. **Verify DNS records point to correct URL**
   - Check that CNAME target matches your Cloudflare Pages URL
   - Correct format: `[project-name].pages.dev`
   - If wrong, edit and fix

3. **Verify Cloudflare Pages project settings**
   - Go to Cloudflare Pages project
   - Check "Custom domains" or "Domain settings"
   - Verify fivood.com is added as a custom domain
   - If not, add it

4. **Wait for DNS propagation**
   - DNS changes can take up to 60 minutes
   - Use online propagation checker to monitor progress

---

## Part 7: Advanced DNS Configuration

### Adding Additional Subdomains

If you want to create additional subdomains (e.g., blog.fivood.com, api.fivood.com):

1. Go to Cloudflare DNS settings
2. Click "+ Add record"
3. Select "CNAME" type
4. In "Name" field, enter the subdomain (e.g., "blog")
5. In "Target" field, enter your Cloudflare Pages URL
6. Click "Save"

**Example**:
```
Name: blog
Type: CNAME
Target: blog.pages.dev
Status: Proxied
```

### Email Configuration (Optional)

If you want to use email with your domain (e.g., contact@fivood.com):

1. You'll need to add MX records
2. This requires an email service provider (Gmail, Mailgun, etc.)
3. Add MX records according to your email provider's instructions
4. This is beyond the scope of Task 18

### Security Records (Optional)

For advanced security, you can add:

- **SPF records**: Prevent email spoofing
- **DKIM records**: Authenticate email
- **DMARC records**: Email authentication policy

These are optional for a blog and can be added later if needed.

---

## Part 8: Verification Checklist

Use this checklist to verify that Task 18 is complete:

- [ ] Cloudflare Pages deployment URL identified
- [ ] Cloudflare Pages project is active and deployed
- [ ] CNAME record created for root domain (@)
- [ ] CNAME record points to correct Cloudflare Pages URL
- [ ] CNAME record shows "Proxied" status (orange cloud)
- [ ] CNAME record created for www subdomain (optional but recommended)
- [ ] www CNAME record points to correct Cloudflare Pages URL
- [ ] www CNAME record shows "Proxied" status
- [ ] DNS records visible in Cloudflare dashboard
- [ ] No error messages in Cloudflare dashboard
- [ ] Command-line verification shows CNAME records
- [ ] Online propagation checker shows green checkmarks
- [ ] https://fivood.com is accessible in browser
- [ ] Blog content displays correctly
- [ ] SSL/TLS certificate is valid (no browser warnings)
- [ ] www.fivood.com also works (if www record was created)

---

## Next Steps

Once Task 18 is complete:

1. **Task 19: Enable HTTPS and SSL/TLS**
   - Verify Cloudflare automatically provisions SSL/TLS certificate
   - Set SSL/TLS encryption mode to "Full" or "Full (strict)"
   - Enable automatic HTTPS redirect

2. **Task 20: Verify domain accessibility**
   - Test accessing https://fivood.com in browser
   - Verify blog content displays correctly
   - Check SSL certificate is valid
   - Confirm no mixed content warnings

3. **Task 21-26: Documentation and verification**
   - Create deployment documentation
   - Create Cloudflare deployment guide
   - Create domain configuration guide
   - Create troubleshooting guide
   - Verify complete deployment workflow
   - Final verification and documentation

---

## Summary

Task 18 involves creating DNS records in Cloudflare to route your domain to your Cloudflare Pages deployment:

1. **Find your Cloudflare Pages URL**: Identify the deployment URL (e.g., blog.pages.dev)
2. **Create CNAME records**: Add CNAME records for @ (root) and www (optional)
3. **Verify configuration**: Check that records are created and point to correct URL
4. **Wait for propagation**: Allow 5-30 minutes for DNS changes to propagate
5. **Test domain access**: Verify https://fivood.com works in browser

This is a manual process that requires access to Cloudflare dashboard. Once complete, your domain will be connected to your Cloudflare Pages deployment and accessible via https://fivood.com.

**Estimated time**: 5-10 minutes for configuration + 5-30 minutes for DNS propagation

---

## Quick Reference

### DNS Records to Create

```
Record Type: CNAME
Name: @
Target: [your-project].pages.dev
Proxy Status: Proxied
TTL: Auto

Record Type: CNAME
Name: www
Target: [your-project].pages.dev
Proxy Status: Proxied
TTL: Auto
```

### Verification Commands

```bash
# Check CNAME record
nslookup fivood.com
dig fivood.com CNAME

# Check A record (after CNAME resolution)
dig fivood.com A

# Check from specific DNS server
nslookup fivood.com 1.1.1.1
```

### Important URLs

- Cloudflare Dashboard: https://dash.cloudflare.com
- DNS Lookup Tool: https://mxtoolbox.com/nslookup.aspx
- Propagation Checker: https://www.whatsmydns.net
- Your Blog: https://fivood.com

