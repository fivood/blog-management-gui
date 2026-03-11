# Cloudflare Domain Configuration Guide

## Task 17: Configure Cloudflare Domain

This guide provides step-by-step instructions for adding the fivood.com domain to Cloudflare and configuring nameservers. This is a critical step that connects your custom domain to your Cloudflare Pages deployment.

---

## Overview

**Objective**: Connect fivood.com domain to Cloudflare account and update nameservers at the domain registrar

**Requirements**: 
- Requirements 5.1: Domain fivood.com accessible via https://fivood.com
- Requirements 5.2: DNS records configured to point to Cloudflare nameservers

**Timeline**: 
- Configuration: 10-15 minutes
- DNS Propagation: 24-48 hours (typically 2-24 hours)

**Prerequisites**:
- Active Cloudflare account
- Cloudflare Pages project already created and deployed (Task 16 completed)
- Access to domain registrar account where fivood.com is registered
- Admin access to both Cloudflare and domain registrar

---

## Part 1: Add Domain to Cloudflare Account

### Step 1: Log in to Cloudflare Dashboard

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Enter your Cloudflare email and password
3. Click "Log In"
4. Complete any two-factor authentication if enabled

### Step 2: Navigate to Domain Setup

1. In the Cloudflare dashboard, look for the left sidebar menu
2. Click on "Websites" or the home icon
3. You should see your existing Cloudflare Pages project listed
4. Look for an option to "Add a domain" or "Add a site"

### Step 3: Add New Domain

1. Click the "+ Add a site" or "+ Add domain" button
2. Enter `fivood.com` in the domain input field
3. Click "Continue" or "Add site"

**Important**: Enter only the root domain `fivood.com`, not `www.fivood.com`

### Step 4: Select Cloudflare Plan

1. Cloudflare will display available plans:
   - Free Plan (recommended for this blog)
   - Pro Plan
   - Business Plan
   - Enterprise Plan

2. For a personal blog, the **Free Plan** is sufficient
3. Click "Continue with Free" or select your preferred plan
4. Click "Confirm plan"

### Step 5: Review Nameservers

Cloudflare will display two nameservers that you need to configure at your domain registrar:

**Example output:**
```
Nameserver 1: ns1.cloudflare.com
Nameserver 2: ns2.cloudflare.com
```

**Important**: Write down these nameservers exactly as shown. You'll need them in the next section.

**Note**: Cloudflare may also display additional nameservers (ns3, ns4, etc.). You only need to configure the primary two at most registrars, but check your registrar's requirements.

### Step 6: Verify Domain Ownership (if required)

Some registrars may require domain ownership verification:

1. Cloudflare may ask you to verify ownership
2. This typically involves:
   - Adding a TXT record to your domain
   - Waiting for verification (usually instant to a few minutes)
   - Or confirming via email

3. Follow Cloudflare's on-screen instructions for verification
4. Once verified, proceed to the next section

---

## Part 2: Update Nameservers at Domain Registrar

### Important: Identify Your Domain Registrar

Before proceeding, identify where you registered fivood.com. Common registrars include:
- GoDaddy
- Namecheap
- Google Domains
- Domain.com
- Bluehost
- HostGator
- 1&1 IONOS
- Alibaba Cloud (Aliyun)
- Tencent Cloud
- Other registrars

**Note**: The exact steps vary by registrar, but the general process is the same.

### General Steps for Most Registrars

#### Step 1: Log in to Domain Registrar

1. Go to your domain registrar's website
2. Log in with your account credentials
3. Navigate to "My Domains" or "Domain Management"
4. Find and select `fivood.com` from your domain list

#### Step 2: Access Nameserver Settings

Look for one of these options:
- "Nameservers"
- "DNS Settings"
- "Name Servers"
- "DNS Management"
- "Domain Settings"

Click on the appropriate option.

#### Step 3: Replace Current Nameservers

You should see a list of current nameservers (usually 2-4). You need to replace them with Cloudflare's nameservers.

**Current nameservers** (example - yours will be different):
```
ns1.example-registrar.com
ns2.example-registrar.com
```

**Replace with Cloudflare nameservers**:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**Steps**:
1. Delete or clear the existing nameserver entries
2. Enter the first Cloudflare nameserver: `ns1.cloudflare.com`
3. Enter the second Cloudflare nameserver: `ns2.cloudflare.com`
4. If there are additional nameserver fields, you can leave them empty or delete them
5. Click "Save" or "Update Nameservers"

#### Step 4: Confirm Changes

1. The registrar will display a confirmation message
2. You may see a message like: "Nameservers updated successfully"
3. Some registrars may require email confirmation - check your email and confirm if needed

**Important**: Do NOT close the browser or navigate away until you see a success confirmation.

### Registrar-Specific Instructions

#### GoDaddy

1. Log in to GoDaddy account
2. Click "My Products"
3. Find fivood.com and click "Manage"
4. Click "DNS" in the left menu
5. Scroll to "Nameservers" section
6. Click "Change Nameservers"
7. Select "I'll use other nameservers"
8. Enter Cloudflare nameservers
9. Click "Save"

#### Namecheap

1. Log in to Namecheap account
2. Click "Domain List"
3. Find fivood.com and click "Manage"
4. Click "Nameservers" tab
5. Select "Custom DNS" from dropdown
6. Enter Cloudflare nameservers
7. Click "Save Changes"

#### Google Domains

1. Log in to Google Domains
2. Find fivood.com in your domain list
3. Click on the domain
4. Click "DNS" in the left menu
5. Scroll to "Custom nameservers" section
6. Click "Use custom nameservers"
7. Enter Cloudflare nameservers
8. Click "Save"

#### Alibaba Cloud (Aliyun) / Tencent Cloud

1. Log in to your cloud provider account
2. Navigate to Domain Management
3. Find fivood.com
4. Click "DNS Settings" or "Nameservers"
5. Replace existing nameservers with Cloudflare's
6. Click "Save" or "Confirm"

**Note**: If your registrar is not listed, the process is similar. Look for "Nameservers", "DNS Settings", or "Domain Settings" in your registrar's control panel.

---

## Part 3: Verify Nameserver Configuration

### Verification Method 1: Check in Cloudflare Dashboard

1. Return to Cloudflare dashboard
2. Navigate to your domain (fivood.com)
3. Look for a status indicator showing nameserver status
4. You should see one of these statuses:
   - ✅ "Active" or "Nameservers configured correctly"
   - ⏳ "Pending" or "Waiting for nameserver update"
   - ❌ "Error" or "Nameservers not configured"

**If status is "Active"**: Congratulations! Nameservers are configured correctly.

**If status is "Pending"**: This is normal. DNS changes can take time to propagate. Wait 15-30 minutes and refresh the page.

**If status is "Error"**: Double-check that you entered the Cloudflare nameservers correctly at your registrar.

### Verification Method 2: Use Command Line Tools

You can verify nameserver configuration using command-line tools (requires terminal/command prompt access):

#### Using `nslookup` (Windows/Mac/Linux)

```bash
nslookup -type=NS fivood.com
```

**Expected output**:
```
Server: 8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
fivood.com      nameserver = ns1.cloudflare.com.
fivood.com      nameserver = ns2.cloudflare.com.
```

#### Using `dig` (Mac/Linux)

```bash
dig fivood.com NS
```

**Expected output**:
```
; <<>> DiG 9.10.6 <<>> fivood.com NS
;; QUESTION SECTION:
;fivood.com.                    IN      NS

;; ANSWER SECTION:
fivood.com.             3600    IN      NS      ns1.cloudflare.com.
fivood.com.             3600    IN      NS      ns2.cloudflare.com.
```

#### Using Online Tools

If you don't have command-line access, use online DNS lookup tools:

1. Go to [https://mxtoolbox.com/nslookup.aspx](https://mxtoolbox.com/nslookup.aspx)
2. Enter `fivood.com` in the domain field
3. Click "MX Lookup" or "NS Lookup"
4. Look for nameservers in the results
5. Verify they show `ns1.cloudflare.com` and `ns2.cloudflare.com`

### Verification Method 3: Check Domain Registrar

1. Log back into your domain registrar
2. Navigate to nameserver settings for fivood.com
3. Verify that the nameservers are set to:
   - `ns1.cloudflare.com`
   - `ns2.cloudflare.com`
4. If they still show the old nameservers, the change may not have been saved - repeat Part 2

---

## Part 4: Understanding DNS Propagation

### What is DNS Propagation?

DNS propagation is the process of DNS nameserver changes spreading across the internet. When you change nameservers, this change needs to be distributed to DNS servers worldwide.

### Timeline

**Typical DNS propagation timeline**:

| Time | Status |
|------|--------|
| 0-15 minutes | Change applied at registrar |
| 15 minutes - 2 hours | Change visible to most DNS servers |
| 2-24 hours | Change visible to all DNS servers (typical) |
| 24-48 hours | Complete propagation (worst case) |

**Important**: DNS propagation is not instantaneous. During this time:
- Some users may see the old website
- Some users may see the new website
- Some DNS queries may fail
- Email delivery may be affected

### Monitoring Propagation

#### Method 1: Cloudflare Dashboard

1. Go to Cloudflare dashboard
2. Navigate to your domain
3. Look for "Nameserver Status" or "Domain Status"
4. Status will change from "Pending" to "Active" once propagation is complete

#### Method 2: Online Propagation Checker

Use online tools to check propagation status:

1. Go to [https://www.whatsmydns.net](https://www.whatsmydns.net)
2. Enter `fivood.com` in the domain field
3. Select "NS" from the record type dropdown
4. Click "Search"
5. The tool will check nameservers from multiple locations worldwide
6. Green checkmarks indicate successful propagation
7. Red X marks indicate propagation not yet complete

#### Method 3: Manual Verification

Periodically run the command-line verification commands from Part 3 to check if nameservers have updated.

### What to Expect During Propagation

**During DNS propagation (0-48 hours)**:

1. **Website Access**
   - Some users can access https://fivood.com
   - Some users may see "DNS resolution failed" or "Cannot find server"
   - This is normal and temporary

2. **Cloudflare Dashboard**
   - Status may show "Pending" or "Waiting"
   - This is expected

3. **Email**
   - If you have email configured, delivery may be affected
   - This is temporary

4. **DNS Queries**
   - Different DNS servers may return different results
   - This is expected during propagation

### After Propagation is Complete

Once DNS propagation is complete (typically 24-48 hours):

1. **Cloudflare Dashboard Status**
   - Status will show "Active" or "Nameservers configured correctly"
   - Domain will be fully managed by Cloudflare

2. **Website Access**
   - https://fivood.com will be accessible from anywhere
   - All users will see the same website
   - No more DNS resolution errors

3. **Next Steps**
   - Proceed to Task 18: Set up Cloudflare DNS records
   - Configure CNAME record to point to Cloudflare Pages deployment

---

## Troubleshooting

### Issue: Nameservers Not Updating

**Symptoms**:
- Cloudflare dashboard still shows "Pending" after 1 hour
- Command-line verification still shows old nameservers
- Online propagation checker shows red X marks

**Solutions**:

1. **Verify registrar changes were saved**
   - Log back into domain registrar
   - Check that nameservers are actually set to Cloudflare's
   - If not, repeat Part 2

2. **Check for typos**
   - Verify you entered nameservers exactly as shown by Cloudflare
   - Common mistakes: `ns1.cloudflare.com` vs `ns.cloudflare.com`
   - Check for extra spaces or characters

3. **Wait longer**
   - DNS changes can take up to 48 hours
   - Wait at least 2-4 hours before troubleshooting
   - Use online propagation checker to monitor progress

4. **Clear DNS cache**
   - Your computer may be caching old DNS results
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
   - Linux: `sudo systemctl restart systemd-resolved`

5. **Try different DNS servers**
   - Use Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)
   - This can help verify if propagation is complete

### Issue: Cloudflare Shows Error Status

**Symptoms**:
- Cloudflare dashboard shows "Error" or "Failed"
- Error message about nameserver configuration

**Solutions**:

1. **Check nameserver format**
   - Ensure nameservers are entered without trailing dots
   - Correct: `ns1.cloudflare.com`
   - Incorrect: `ns1.cloudflare.com.`

2. **Verify domain ownership**
   - Some registrars require domain ownership verification
   - Check for verification emails from Cloudflare
   - Complete any required verification steps

3. **Contact registrar support**
   - If nameservers won't update, contact registrar support
   - Provide them with Cloudflare nameservers
   - Ask them to manually update nameservers

4. **Check for domain locks**
   - Some registrars lock domains by default
   - You may need to unlock the domain before changing nameservers
   - Look for "Domain Lock" or "Registry Lock" setting in registrar

### Issue: Website Still Not Accessible After 48 Hours

**Symptoms**:
- DNS propagation appears complete
- Cloudflare shows "Active" status
- But https://fivood.com still doesn't work

**Solutions**:

1. **Verify Cloudflare Pages deployment**
   - Check that Cloudflare Pages project is deployed
   - Verify build was successful
   - Check that project is accessible via Cloudflare Pages URL

2. **Check DNS records**
   - Verify that DNS records are configured in Cloudflare
   - You may need to add CNAME record (Task 18)
   - Check that records point to correct Cloudflare Pages deployment

3. **Clear browser cache**
   - Clear browser cache and cookies
   - Try accessing in incognito/private mode
   - Try different browser

4. **Check SSL/TLS settings**
   - Verify HTTPS is enabled in Cloudflare
   - Check SSL/TLS encryption mode
   - Verify certificate is valid

5. **Contact Cloudflare support**
   - If issue persists, contact Cloudflare support
   - Provide domain name and error details
   - Include screenshots of Cloudflare dashboard

---

## Verification Checklist

Use this checklist to verify that Task 17 is complete:

- [ ] Domain fivood.com added to Cloudflare account
- [ ] Cloudflare nameservers obtained (ns1.cloudflare.com, ns2.cloudflare.com)
- [ ] Nameservers updated at domain registrar
- [ ] Registrar confirms nameserver change was saved
- [ ] Cloudflare dashboard shows nameserver status (Pending or Active)
- [ ] Command-line verification shows Cloudflare nameservers
- [ ] Online propagation checker shows progress
- [ ] Waited for DNS propagation (24-48 hours)
- [ ] Cloudflare dashboard shows "Active" status
- [ ] All nameservers worldwide show Cloudflare nameservers
- [ ] No errors in Cloudflare dashboard

---

## Next Steps

Once Task 17 is complete and DNS propagation is finished:

1. **Task 18: Set up Cloudflare DNS records**
   - Create CNAME record pointing to Cloudflare Pages deployment
   - Configure DNS to route fivood.com to Cloudflare Pages

2. **Task 19: Enable HTTPS and SSL/TLS**
   - Verify Cloudflare automatically provisions SSL/TLS certificate
   - Set SSL/TLS encryption mode
   - Enable automatic HTTPS redirect

3. **Task 20: Verify domain accessibility**
   - Test accessing https://fivood.com
   - Verify blog content displays correctly
   - Check SSL certificate validity

---

## Summary

Task 17 involves three main steps:

1. **Add domain to Cloudflare**: Log in to Cloudflare, add fivood.com, and obtain nameservers
2. **Update nameservers at registrar**: Log in to domain registrar and replace nameservers with Cloudflare's
3. **Wait for DNS propagation**: Allow 24-48 hours for changes to propagate worldwide

This is a manual process that requires access to both Cloudflare and your domain registrar. Once complete, your domain will be managed by Cloudflare and ready for the next configuration steps.

**Estimated time**: 10-15 minutes for configuration + 24-48 hours for DNS propagation

