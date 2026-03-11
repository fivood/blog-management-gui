# Task 18: DNS Records Setup - Quick Reference

A condensed reference guide for setting up Cloudflare DNS records.

---

## 5-Minute Quick Start

### 1. Get Your Cloudflare Pages URL
- Log in to Cloudflare dashboard
- Click "Pages" → "blog"
- Copy the deployment URL (e.g., `blog.pages.dev`)

### 2. Create DNS Records
- Go to your domain → "DNS"
- Click "+ Add record"
- Create two CNAME records:

**Record 1 (Root Domain)**
```
Type: CNAME
Name: @
Target: [your-project].pages.dev
Proxy: Proxied
TTL: Auto
```

**Record 2 (www Subdomain)**
```
Type: CNAME
Name: www
Target: [your-project].pages.dev
Proxy: Proxied
TTL: Auto
```

### 3. Verify
- Check Cloudflare dashboard shows both records
- Wait 5-30 minutes for DNS propagation
- Visit https://fivood.com in browser

---

## DNS Records Checklist

```
☐ Cloudflare Pages URL identified
☐ CNAME record created for @ (root domain)
☐ CNAME record created for www (optional)
☐ Both records show "Proxied" status (orange cloud)
☐ Both records point to correct Cloudflare Pages URL
☐ No error messages in Cloudflare dashboard
☐ DNS propagation complete (5-30 minutes)
☐ https://fivood.com accessible in browser
☐ Blog content displays correctly
☐ SSL certificate valid (no browser warnings)
```

---

## Common DNS Record Formats

### Correct Format
```
Name: @
Type: CNAME
Target: blog.pages.dev
Proxy: Proxied
TTL: Auto
```

### Common Mistakes to Avoid
```
❌ Target: blog.pages.dev.        (extra dot at end)
❌ Target: https://blog.pages.dev (don't include https://)
❌ Target: blog.pages.dev/        (don't include trailing slash)
❌ Proxy: DNS only                 (use Proxied instead)
❌ Name: fivood.com               (use @ for root domain)
```

---

## Verification Commands

### Check CNAME Record
```bash
nslookup fivood.com
dig fivood.com CNAME
```

### Check A Record (after CNAME resolution)
```bash
dig fivood.com A
```

### Check from Specific DNS Server
```bash
nslookup fivood.com 1.1.1.1
nslookup fivood.com 8.8.8.8
```

### Expected Output
```
fivood.com.    300    IN    CNAME    blog.pages.dev.
```

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| DNS resolution failed | Wait 15-30 min, clear DNS cache |
| Wrong content displays | Verify CNAME target, check for conflicts |
| HTTPS certificate error | Wait 5-30 min for cert provisioning |
| www doesn't work | Create www CNAME record |
| Cloudflare Pages URL works but domain doesn't | Verify DNS records created, check target |

---

## DNS Propagation Status

### Check Online
- https://www.whatsmydns.net
- Enter domain: fivood.com
- Select record type: A or CNAME
- Green checkmarks = propagated

### Check in Cloudflare
- Go to domain DNS settings
- Look for status indicator
- "Active" = propagation complete

### Check via Command Line
```bash
nslookup fivood.com
# Should show Cloudflare IP address
```

---

## Important URLs

| Resource | URL |
|----------|-----|
| Cloudflare Dashboard | https://dash.cloudflare.com |
| DNS Lookup Tool | https://mxtoolbox.com/nslookup.aspx |
| Propagation Checker | https://www.whatsmydns.net |
| Your Blog | https://fivood.com |

---

## DNS Record Types Reference

| Type | Purpose | Example |
|------|---------|---------|
| **A** | IPv4 address | fivood.com → 192.0.2.1 |
| **AAAA** | IPv6 address | fivood.com → 2001:db8::1 |
| **CNAME** | Domain alias | fivood.com → blog.pages.dev |
| **MX** | Mail server | fivood.com → mail.example.com |
| **TXT** | Text record | fivood.com → v=spf1 ... |
| **NS** | Nameserver | fivood.com → ns1.cloudflare.com |

**For Cloudflare Pages: Use CNAME**

---

## Proxy Status Explained

| Status | Icon | Meaning | Use For |
|--------|------|---------|---------|
| **Proxied** | 🟠 | Through Cloudflare | Cloudflare Pages ✓ |
| **DNS Only** | ⚪ | Direct to server | Direct hosting only |

**For Cloudflare Pages: Always use Proxied (orange cloud)**

---

## TTL (Time To Live) Guide

| TTL | Meaning | Use Case |
|-----|---------|----------|
| **Auto** | Cloudflare optimizes | Recommended |
| **30 sec** | Very short cache | Frequent changes |
| **1 hour** | Short cache | Regular updates |
| **1 day** | Long cache | Stable records |

**For Cloudflare Pages: Use Auto**

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Create DNS records | 0 min | ✅ Immediate |
| Initial propagation | 5 min | ⏳ In progress |
| Widespread propagation | 15 min | ⏳ In progress |
| Near complete | 30 min | ⏳ Almost done |
| Complete propagation | 60 min | ✅ Complete |

**Typical: 5-30 minutes**

---

## Before You Start

- [ ] Cloudflare account active
- [ ] Domain added to Cloudflare (Task 17 complete)
- [ ] Nameservers updated at registrar
- [ ] DNS propagation complete (Cloudflare shows "Active")
- [ ] Cloudflare Pages project deployed (Task 16 complete)
- [ ] Cloudflare Pages URL identified

---

## After You Complete

- [ ] Both CNAME records created
- [ ] Records show "Proxied" status
- [ ] No error messages
- [ ] DNS propagation complete
- [ ] https://fivood.com accessible
- [ ] Blog content displays correctly
- [ ] SSL certificate valid

---

## Next Tasks

1. **Task 19**: Enable HTTPS and SSL/TLS
2. **Task 20**: Verify domain accessibility
3. **Task 21**: Create deployment documentation

---

## Support Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **DNS Basics**: https://www.cloudflare.com/learning/dns/what-is-dns/
- **CNAME Records**: https://www.cloudflare.com/learning/dns/dns-records/dns-cname-record/
- **Troubleshooting**: https://developers.cloudflare.com/pages/troubleshooting/

---

## Key Points to Remember

1. **Use CNAME records** for Cloudflare Pages (not A records)
2. **Always use Proxied status** (orange cloud icon)
3. **Create both @ and www records** for full coverage
4. **Wait 5-30 minutes** for DNS propagation
5. **Verify in Cloudflare dashboard** before testing
6. **Test with https://** (not http://)
7. **Check SSL certificate** is valid
8. **Clear browser cache** if issues persist

---

## Common Questions

**Q: Why use CNAME instead of A record?**
A: CNAME is more flexible and automatically updates if Cloudflare's IP changes.

**Q: What does @ mean?**
A: @ represents the root domain (fivood.com without any subdomain).

**Q: Why create www record?**
A: So both fivood.com and www.fivood.com work.

**Q: How long does DNS propagation take?**
A: Usually 5-30 minutes, maximum 60 minutes.

**Q: What if it doesn't work after 1 hour?**
A: Check Cloudflare dashboard for errors, verify CNAME target, clear DNS cache.

**Q: Do I need to do anything else?**
A: After DNS records are set up, proceed to Task 19 (HTTPS/SSL) and Task 20 (verification).

