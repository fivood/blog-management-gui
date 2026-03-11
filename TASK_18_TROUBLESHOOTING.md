# Task 18: DNS Records Setup - Troubleshooting Guide

Quick troubleshooting guide for common DNS issues.

---

## Problem: DNS Resolution Failed

**Error**: "DNS resolution failed" or "Cannot find server"

**Causes**:
- DNS propagation not complete
- DNS records not created
- Incorrect CNAME target
- Local DNS cache outdated

**Solutions**:
1. Wait 15-30 minutes for DNS propagation
2. Clear DNS cache:
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
   - Linux: `sudo systemctl restart systemd-resolved`
3. Try different DNS server: `nslookup fivood.com 8.8.8.8`
4. Verify DNS records in Cloudflare dashboard
5. Check Cloudflare Pages project is deployed

---

## Problem: Domain Points to Wrong Content

**Symptoms**: fivood.com loads but shows wrong website

**Causes**:
- CNAME target incorrect
- Conflicting DNS records
- Cloudflare Pages project not deployed
- Wrong Cloudflare Pages URL

**Solutions**:
1. Verify CNAME target in Cloudflare:
   - Should be: `[project-name].pages.dev`
   - Example: `blog.pages.dev`
2. Check for conflicting records:
   - Delete any extra A records
   - Delete any extra CNAME records
   - Keep only the records pointing to Cloudflare Pages
3. Verify Cloudflare Pages project:
   - Go to Pages → blog
   - Check status is "Active"
   - Verify deployment was successful
4. Edit CNAME record if target is wrong:
   - Click on record
   - Update target to correct URL
   - Save changes

---

## Problem: HTTPS Certificate Error

**Error**: "Certificate error" or "Not secure" warning

**Causes**:
- SSL certificate not yet provisioned
- SSL/TLS not enabled in Cloudflare
- Certificate validation issue
- Browser cache issue

**Solutions**:
1. Wait 5-30 minutes for certificate provisioning
2. Verify SSL/TLS enabled in Cloudflare:
   - Go to domain → SSL/TLS
   - Check that SSL/TLS is enabled
   - Verify encryption mode is "Full" or "Full (strict)"
3. Clear browser cache:
   - Clear cookies and cached data
   - Try incognito/private mode
   - Try different browser
4. Check certificate status:
   - Go to SSL/TLS → Certificates
   - Look for certificate status
   - If error, contact Cloudflare support

---

## Problem: www Subdomain Doesn't Work

**Symptoms**: fivood.com works but www.fivood.com doesn't

**Causes**:
- www CNAME record not created
- www record has wrong target
- Conflicting records for www
- DNS propagation incomplete

**Solutions**:
1. Verify www CNAME record exists:
   - Go to DNS settings
   - Look for record with Name: "www"
   - If missing, create it (see main guide)
2. Check www record target:
   - Should point to same Cloudflare Pages URL
   - Example: `blog.pages.dev`
3. Check for conflicting records:
   - Delete any extra A records for www
   - Delete any extra CNAME records for www
4. Wait for DNS propagation:
   - www records may propagate slower
   - Wait 15-30 minutes
   - Check with: `nslookup www.fivood.com`

---

## Problem: Cloudflare Pages URL Works but Domain Doesn't

**Symptoms**: `https://blog.pages.dev` works but `https://fivood.com` doesn't

**Causes**:
- DNS records not created
- CNAME target incorrect
- Cloudflare Pages project settings
- DNS propagation incomplete

**Solutions**:
1. Verify DNS records created:
   - Go to DNS settings
   - Check that @ CNAME record exists
   - If missing, create it (see main guide)
2. Verify CNAME target:
   - Should be: `blog.pages.dev`
   - Not: `https://blog.pages.dev`
   - Not: `blog.pages.dev/`
3. Check Cloudflare Pages project settings:
   - Go to Pages → blog
   - Look for "Custom domains" section
   - Verify fivood.com is listed
   - If not, add it
4. Wait for DNS propagation:
   - DNS changes take 5-30 minutes
   - Use whatsmydns.net to monitor
   - Check with: `nslookup fivood.com`

---

## Problem: Cloudflare Dashboard Shows Error

**Symptoms**: Dashboard shows error status or warning message

**Causes**:
- CNAME target incorrect
- Typo in domain name
- Cloudflare Pages project doesn't exist
- Nameserver configuration issue

**Solutions**:
1. Read error message carefully
2. Verify CNAME target:
   - Check for typos
   - Verify format: `[project].pages.dev`
   - No https://, no trailing slash
3. Verify Cloudflare Pages project:
   - Go to Pages
   - Confirm "blog" project exists
   - Check project is deployed
4. Delete and recreate record:
   - Click delete on problematic record
   - Create new record with correct values
   - Verify no typos
5. Wait and refresh:
   - Wait 15-30 minutes
   - Refresh Cloudflare dashboard
   - Error may resolve automatically

---

## Problem: DNS Propagation Stuck

**Symptoms**: whatsmydns.net shows red X marks after 1 hour

**Causes**:
- DNS records not properly saved
- Cloudflare nameservers not active
- ISP DNS cache issue
- Registrar nameserver issue

**Solutions**:
1. Verify records saved in Cloudflare:
   - Go to DNS settings
   - Confirm records exist
   - Check values are correct
   - If not, recreate records
2. Verify Cloudflare nameservers:
   - Go to domain overview
   - Check nameserver status
   - Should show "Active"
   - If not, wait 24-48 hours
3. Clear ISP DNS cache:
   - Try different DNS server
   - Use Google DNS: 8.8.8.8
   - Use Cloudflare DNS: 1.1.1.1
4. Contact registrar:
   - Verify nameservers updated
   - Ask registrar to verify
   - May need to manually update

---

## Problem: Mixed Content Warning

**Symptoms**: Browser shows "Mixed content" or "Not secure" warning

**Causes**:
- Some resources loading over HTTP
- HTTPS redirect not enabled
- Cloudflare HTTPS not enforced

**Solutions**:
1. Enable HTTPS redirect in Cloudflare:
   - Go to domain → SSL/TLS
   - Look for "Always Use HTTPS"
   - Enable this setting
2. Set encryption mode to "Full (strict)":
   - Go to SSL/TLS → Overview
   - Change mode to "Full (strict)"
   - Save changes
3. Wait for changes to propagate:
   - Changes take 5-10 minutes
   - Refresh browser
   - Clear cache if needed

---

## Problem: Timeout or Connection Refused

**Symptoms**: Browser shows "Connection timeout" or "Connection refused"

**Causes**:
- Cloudflare Pages project not deployed
- Cloudflare Pages project crashed
- Network connectivity issue
- Firewall blocking connection

**Solutions**:
1. Verify Cloudflare Pages project:
   - Go to Pages → blog
   - Check deployment status
   - If failed, check build logs
   - Trigger new build if needed
2. Check network connectivity:
   - Try different network
   - Try mobile hotspot
   - Try different device
3. Check firewall:
   - Disable VPN if using
   - Check firewall settings
   - Try different network
4. Wait and retry:
   - Wait 5 minutes
   - Try again
   - Check Cloudflare status page

---

## Problem: Slow DNS Resolution

**Symptoms**: Domain takes long time to load

**Causes**:
- High TTL value
- DNS server overloaded
- Network latency
- Cloudflare caching issue

**Solutions**:
1. Check TTL value:
   - Go to DNS settings
   - Look at TTL for CNAME record
   - Should be "Auto" or 300 seconds
   - If higher, consider lowering
2. Try different DNS server:
   - Use Google DNS: 8.8.8.8
   - Use Cloudflare DNS: 1.1.1.1
   - Use OpenDNS: 208.67.222.222
3. Clear Cloudflare cache:
   - Go to domain → Caching
   - Click "Purge Everything"
   - Wait 5 minutes
4. Check network:
   - Test internet speed
   - Try different network
   - Check for network issues

---

## Verification Steps

Before troubleshooting, verify:

1. **Cloudflare Dashboard**
   - DNS records exist
   - Records show "Proxied" status
   - No error messages
   - Status shows "Active"

2. **Command Line**
   ```bash
   nslookup fivood.com
   dig fivood.com CNAME
   ```

3. **Online Tools**
   - whatsmydns.net
   - mxtoolbox.com
   - dnschecker.org

4. **Browser**
   - Try https://fivood.com
   - Try https://www.fivood.com
   - Try incognito mode
   - Try different browser

---

## When to Contact Support

Contact Cloudflare support if:

- Error persists after 1 hour
- Cloudflare dashboard shows persistent error
- SSL certificate not provisioning after 30 minutes
- DNS propagation stuck after 2 hours
- Multiple verification methods show failure
- Cloudflare status page shows issues

**Cloudflare Support**: https://support.cloudflare.com

---

## Quick Decision Tree

```
Domain not working?
│
├─ DNS resolution failed?
│  └─ Wait 15-30 min, clear cache, try different DNS
│
├─ Wrong content displays?
│  └─ Verify CNAME target, check for conflicts
│
├─ Certificate error?
│  └─ Wait 5-30 min, check SSL/TLS settings
│
├─ www doesn't work?
│  └─ Create www CNAME record if missing
│
├─ Cloudflare Pages URL works but domain doesn't?
│  └─ Verify DNS records created, check target
│
├─ Dashboard shows error?
│  └─ Check CNAME target, delete and recreate
│
├─ Propagation stuck?
│  └─ Verify records saved, check nameservers
│
└─ Still not working?
   └─ Contact Cloudflare support
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using A record instead of CNAME | Delete A record, create CNAME record |
| Using DNS only instead of Proxied | Click record, change to Proxied |
| Wrong CNAME target | Edit record, fix target URL |
| Typo in domain name | Delete record, recreate with correct name |
| Including https:// in target | Remove https://, use just domain |
| Trailing slash in target | Remove trailing slash |
| Conflicting records | Delete extra records, keep only CNAME |
| Not waiting for propagation | Wait 5-30 minutes before testing |

---

## Resources

- **Main Guide**: TASK_18_DNS_RECORDS_SETUP.md
- **Verification Guide**: TASK_18_DNS_VERIFICATION_GUIDE.md
- **Quick Reference**: TASK_18_QUICK_REFERENCE.md
- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **DNS Basics**: https://www.cloudflare.com/learning/dns/

