# Task 18: DNS Verification and Monitoring Guide

Comprehensive guide for verifying DNS records and monitoring propagation.

---

## Overview

This guide provides detailed instructions for verifying that your DNS records are correctly configured and monitoring their propagation across the internet.

---

## Part 1: Cloudflare Dashboard Verification

### Step 1: Log in to Cloudflare

1. Go to https://dash.cloudflare.com
2. Enter your email and password
3. Complete two-factor authentication if enabled

### Step 2: Navigate to DNS Settings

1. Click on your domain (fivood.com)
2. In the left sidebar, click "DNS"
3. You should see your DNS records list

### Step 3: Verify CNAME Records

Look for the following records:

```
Name: @
Type: CNAME
Target: [your-project].pages.dev
Status: Proxied (orange cloud icon)
TTL: Auto
```

```
Name: www
Type: CNAME
Target: [your-project].pages.dev
Status: Proxied (orange cloud icon)
TTL: Auto
```

### Step 4: Check for Errors

- Look for any error messages or warnings
- Verify no conflicting records exist
- Check that both records show "Proxied" status (not "DNS only")

### Step 5: Verify Status

- Look for a status indicator showing "Active" or "Nameservers configured"
- If status shows "Pending", wait 15-30 minutes and refresh
- If status shows "Error", check the error message and troubleshoot

---

## Part 2: Command-Line Verification

### Prerequisites

- Terminal or Command Prompt access
- One of these tools installed:
  - `nslookup` (Windows, Mac, Linux)
  - `dig` (Mac, Linux)
  - `host` (Mac, Linux)

### Method 1: Using nslookup

#### Check CNAME Record

```bash
nslookup -type=CNAME fivood.com
```

**Expected output**:
```
Server: 1.1.1.1
Address: 1.1.1.1#53

Non-authoritative answer:
fivood.com      canonical name = blog.pages.dev.
blog.pages.dev  canonical name = [cloudflare-ip].pages.dev.
```

#### Check A Record (IP Address)

```bash
nslookup fivood.com
```

**Expected output**:
```
Server: 1.1.1.1
Address: 1.1.1.1#53

Non-authoritative answer:
Name: fivood.com
Address: [Cloudflare IP address]
```

#### Check from Specific DNS Server

```bash
nslookup fivood.com 8.8.8.8
nslookup fivood.com 1.1.1.1
nslookup fivood.com 208.67.222.222
```

### Method 2: Using dig

#### Check CNAME Record

```bash
dig fivood.com CNAME
```

**Expected output**:
```
; <<>> DiG 9.10.6 <<>> fivood.com CNAME
;; QUESTION SECTION:
;fivood.com.                    IN      CNAME

;; ANSWER SECTION:
fivood.com.             300     IN      CNAME   blog.pages.dev.
```

#### Check A Record

```bash
dig fivood.com A
```

**Expected output**:
```
; <<>> DiG 9.10.6 <<>> fivood.com A
;; QUESTION SECTION:
;fivood.com.                    IN      A

;; ANSWER SECTION:
fivood.com.             300     IN      A       [Cloudflare IP]
```

#### Check All Records

```bash
dig fivood.com ANY
```

#### Check from Specific DNS Server

```bash
dig @8.8.8.8 fivood.com
dig @1.1.1.1 fivood.com
dig @208.67.222.222 fivood.com
```

### Method 3: Using host

```bash
host fivood.com
host -t CNAME fivood.com
host -t A fivood.com
```

**Expected output**:
```
fivood.com is an alias for blog.pages.dev.
blog.pages.dev is an alias for [cloudflare-ip].pages.dev.
[cloudflare-ip].pages.dev has address [Cloudflare IP]
```

---

## Part 3: Online Verification Tools

### Tool 1: MXToolbox DNS Lookup

**URL**: https://mxtoolbox.com/nslookup.aspx

**Steps**:
1. Go to the website
2. Enter `fivood.com` in the domain field
3. Click "MX Lookup" or "NS Lookup"
4. Look for DNS records in the results

**What to look for**:
- CNAME record pointing to blog.pages.dev
- A record pointing to Cloudflare IP address
- No error messages

### Tool 2: whatsmydns.net

**URL**: https://www.whatsmydns.net

**Steps**:
1. Go to the website
2. Enter `fivood.com` in the domain field
3. Select "A" or "CNAME" from the record type dropdown
4. Click "Search"

**What to look for**:
- Green checkmarks indicate propagation complete
- Red X marks indicate propagation not yet complete
- All locations should eventually show green

**Interpretation**:
```
✅ Green checkmark = DNS record propagated to this location
❌ Red X = DNS record not yet propagated to this location
⏳ Hourglass = Checking...
```

### Tool 3: DNS Checker

**URL**: https://dnschecker.org

**Steps**:
1. Go to the website
2. Enter `fivood.com` in the domain field
3. Select record type (A, CNAME, etc.)
4. Click "Check"

**What to look for**:
- Results from multiple DNS servers worldwide
- All should show same result (Cloudflare IP or CNAME)
- Green indicators show successful propagation

### Tool 4: Google DNS Lookup

**URL**: https://dns.google

**Steps**:
1. Go to the website
2. Enter `fivood.com` in the search field
3. Select record type (A, CNAME, etc.)
4. View results

**What to look for**:
- CNAME record pointing to blog.pages.dev
- A record pointing to Cloudflare IP
- TTL value (should be 300 or similar)

---

## Part 4: Browser Verification

### Step 1: Test Domain Access

1. Open a web browser
2. Go to `https://fivood.com`
3. Wait for page to load

### Step 2: Check for Errors

**Success indicators**:
- Page loads without errors
- Blog content displays correctly
- Green lock icon in address bar
- URL shows `https://fivood.com`

**Error indicators**:
- "DNS resolution failed" error
- "Cannot find server" error
- "Connection refused" error
- "Certificate error" warning

### Step 3: Verify SSL Certificate

1. Click the lock icon in the address bar
2. Click "Certificate" or "Connection is secure"
3. Verify certificate details:
   - Issued to: fivood.com
   - Issued by: Let's Encrypt or Cloudflare
   - Valid date: Should be current
   - No warnings or errors

### Step 4: Test www Subdomain

1. Go to `https://www.fivood.com`
2. Verify it also loads correctly
3. Check that content is the same

### Step 5: Test HTTP Redirect

1. Go to `http://fivood.com` (without https)
2. Verify it redirects to `https://fivood.com`
3. Check that page loads securely

---

## Part 5: DNS Propagation Monitoring

### Real-Time Monitoring

#### Using whatsmydns.net

1. Go to https://www.whatsmydns.net
2. Enter `fivood.com`
3. Select "A" record type
4. Click "Search"
5. Bookmark this page
6. Refresh every 5-10 minutes to monitor progress

**Progress indicators**:
- 0-25% green: Early propagation
- 25-50% green: Moderate propagation
- 50-75% green: Good propagation
- 75-100% green: Complete propagation

#### Using Command Line

Create a monitoring script:

**Windows (PowerShell)**:
```powershell
while ($true) {
    Clear-Host
    Write-Host "DNS Propagation Check - $(Get-Date)"
    Write-Host "================================"
    nslookup fivood.com
    Write-Host ""
    Write-Host "Checking again in 60 seconds..."
    Start-Sleep -Seconds 60
}
```

**Mac/Linux (Bash)**:
```bash
#!/bin/bash
while true; do
    clear
    echo "DNS Propagation Check - $(date)"
    echo "================================"
    dig fivood.com A +short
    echo ""
    echo "Checking again in 60 seconds..."
    sleep 60
done
```

### Monitoring Timeline

| Time | Expected Status | Action |
|------|-----------------|--------|
| 0-5 min | Created in Cloudflare | Verify in dashboard |
| 5-15 min | ~30% propagated | Check online tools |
| 15-30 min | ~70% propagated | Continue monitoring |
| 30-60 min | ~95% propagated | Almost complete |
| 60+ min | 100% propagated | Complete |

---

## Part 6: Verification Checklist

### Pre-Verification

- [ ] DNS records created in Cloudflare
- [ ] Both @ and www records exist
- [ ] Records show "Proxied" status
- [ ] No error messages in dashboard
- [ ] Cloudflare Pages project is deployed

### Cloudflare Dashboard Verification

- [ ] CNAME record for @ exists
- [ ] CNAME record for www exists
- [ ] Both records point to correct Cloudflare Pages URL
- [ ] Both records show "Proxied" status (orange cloud)
- [ ] TTL is set to "Auto"
- [ ] No conflicting records exist
- [ ] Dashboard shows "Active" status

### Command-Line Verification

- [ ] `nslookup fivood.com` returns Cloudflare IP
- [ ] `dig fivood.com CNAME` shows blog.pages.dev
- [ ] `nslookup fivood.com 8.8.8.8` works
- [ ] `nslookup fivood.com 1.1.1.1` works
- [ ] Results consistent across multiple DNS servers

### Online Tool Verification

- [ ] MXToolbox shows correct CNAME record
- [ ] whatsmydns.net shows green checkmarks
- [ ] DNS Checker shows consistent results
- [ ] Google DNS Lookup shows correct records

### Browser Verification

- [ ] `https://fivood.com` loads successfully
- [ ] Blog content displays correctly
- [ ] Green lock icon shows in address bar
- [ ] SSL certificate is valid
- [ ] `https://www.fivood.com` also works
- [ ] `http://fivood.com` redirects to https

### Propagation Verification

- [ ] whatsmydns.net shows 100% green
- [ ] All DNS servers return same result
- [ ] No more red X marks
- [ ] Propagation complete (5-60 minutes)

---

## Part 7: Troubleshooting Verification Issues

### Issue: Cloudflare Dashboard Shows Error

**Symptoms**: Dashboard shows error status or warning

**Verification steps**:
1. Check error message for details
2. Verify CNAME target is correct
3. Check for typos in domain name
4. Verify Cloudflare Pages project exists
5. Check that project is deployed

**Solutions**:
- Fix CNAME target if incorrect
- Delete and recreate record if corrupted
- Wait 15-30 minutes and refresh
- Contact Cloudflare support if error persists

### Issue: Command-Line Shows Old DNS Records

**Symptoms**: `nslookup` or `dig` shows old nameservers or no records

**Verification steps**:
1. Check if DNS propagation is complete
2. Try different DNS servers
3. Clear local DNS cache
4. Wait longer for propagation

**Solutions**:
- Windows: `ipconfig /flushdns`
- Mac: `sudo dscacheutil -flushcache`
- Linux: `sudo systemctl restart systemd-resolved`
- Try: `nslookup fivood.com 8.8.8.8` (Google DNS)
- Try: `nslookup fivood.com 1.1.1.1` (Cloudflare DNS)

### Issue: Online Tools Show Inconsistent Results

**Symptoms**: Different DNS servers return different results

**Verification steps**:
1. Check if propagation is still in progress
2. Verify records in Cloudflare dashboard
3. Check for conflicting records
4. Wait for full propagation

**Solutions**:
- Wait 15-30 minutes for full propagation
- Delete conflicting records
- Verify CNAME target is correct
- Use whatsmydns.net to monitor progress

### Issue: Browser Shows DNS Resolution Failed

**Symptoms**: Browser error "DNS resolution failed" or "Cannot find server"

**Verification steps**:
1. Check if DNS propagation is complete
2. Verify records in Cloudflare dashboard
3. Test with command-line tools
4. Try different browser or device

**Solutions**:
- Wait for DNS propagation (5-30 minutes)
- Clear browser cache
- Try incognito/private mode
- Try different browser
- Try different device or network
- Verify Cloudflare Pages project is deployed

### Issue: Browser Shows Certificate Error

**Symptoms**: Browser warning "Certificate error" or "Not secure"

**Verification steps**:
1. Check if SSL certificate is provisioned
2. Verify HTTPS is enabled in Cloudflare
3. Check certificate status in Cloudflare
4. Try different browser

**Solutions**:
- Wait 5-30 minutes for certificate provisioning
- Verify SSL/TLS is enabled in Cloudflare
- Check SSL/TLS encryption mode
- Clear browser cache
- Try different browser
- Contact Cloudflare support if issue persists

---

## Part 8: Advanced Verification

### Check DNS Propagation by Region

Use whatsmydns.net to see propagation by geographic region:

1. Go to https://www.whatsmydns.net
2. Enter `fivood.com`
3. Select "A" record type
4. Scroll down to see results by region
5. Look for green checkmarks in each region

**Regions typically checked**:
- North America
- South America
- Europe
- Africa
- Asia
- Oceania

### Check DNS Propagation by ISP

Different ISPs may have different DNS servers:

```bash
# Check from Google DNS
nslookup fivood.com 8.8.8.8

# Check from Cloudflare DNS
nslookup fivood.com 1.1.1.1

# Check from OpenDNS
nslookup fivood.com 208.67.222.222

# Check from Quad9
nslookup fivood.com 9.9.9.9
```

### Check DNS TTL

TTL (Time To Live) indicates how long DNS records are cached:

```bash
dig fivood.com A +noall +answer
```

**Expected output**:
```
fivood.com.             300     IN      A       [Cloudflare IP]
```

The "300" is the TTL in seconds (5 minutes).

### Check DNS Authority

Verify that Cloudflare nameservers are authoritative:

```bash
dig fivood.com NS
```

**Expected output**:
```
fivood.com.             3600    IN      NS      ns1.cloudflare.com.
fivood.com.             3600    IN      NS      ns2.cloudflare.com.
```

---

## Part 9: Verification Report Template

Use this template to document your verification:

```
DNS Verification Report
=======================

Date: [Date]
Domain: fivood.com
Cloudflare Pages URL: [URL]

Cloudflare Dashboard
- [ ] CNAME record for @ exists
- [ ] CNAME record for www exists
- [ ] Both records point to correct URL
- [ ] Both records show "Proxied" status
- [ ] No error messages
- [ ] Status shows "Active"

Command-Line Verification
- [ ] nslookup fivood.com: [Result]
- [ ] dig fivood.com CNAME: [Result]
- [ ] nslookup fivood.com 8.8.8.8: [Result]
- [ ] nslookup fivood.com 1.1.1.1: [Result]

Online Tools
- [ ] MXToolbox: [Result]
- [ ] whatsmydns.net: [% Propagated]
- [ ] DNS Checker: [Result]
- [ ] Google DNS Lookup: [Result]

Browser Verification
- [ ] https://fivood.com: [Status]
- [ ] https://www.fivood.com: [Status]
- [ ] SSL Certificate: [Valid/Invalid]
- [ ] Content Displays: [Yes/No]

Propagation Status
- [ ] Propagation Complete: [Yes/No]
- [ ] Time to Propagate: [Minutes]
- [ ] All DNS Servers Updated: [Yes/No]

Overall Status: [PASS/FAIL]
Notes: [Any issues or observations]
```

---

## Summary

Verification involves checking DNS records through multiple methods:

1. **Cloudflare Dashboard**: Verify records are created and show correct status
2. **Command-Line Tools**: Verify records are propagated to DNS servers
3. **Online Tools**: Check propagation status across regions
4. **Browser**: Test actual domain access and SSL certificate
5. **Monitoring**: Track propagation progress over time

Once all verification steps pass, your DNS records are correctly configured and your domain is ready for the next tasks.

