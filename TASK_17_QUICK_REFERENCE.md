# Task 17: Configure Cloudflare Domain - Quick Reference

## Quick Summary

Add fivood.com to Cloudflare and update nameservers at your domain registrar.

---

## 3-Step Process

### Step 1: Add Domain to Cloudflare (5 minutes)

```
1. Go to https://dash.cloudflare.com
2. Log in to your Cloudflare account
3. Click "Add a site" or "Add domain"
4. Enter: fivood.com
5. Select Free Plan
6. Note the nameservers shown:
   - ns1.cloudflare.com
   - ns2.cloudflare.com
```

### Step 2: Update Nameservers at Registrar (5 minutes)

```
1. Log in to your domain registrar
2. Find nameserver settings for fivood.com
3. Replace current nameservers with:
   - ns1.cloudflare.com
   - ns2.cloudflare.com
4. Save changes
5. Confirm changes were saved
```

### Step 3: Wait for DNS Propagation (24-48 hours)

```
1. Check Cloudflare dashboard for status
2. Use online tools to verify propagation
3. Wait for "Active" status in Cloudflare
4. Proceed to Task 18 once complete
```

---

## Cloudflare Nameservers

**Always use these exact nameservers:**

```
ns1.cloudflare.com
ns2.cloudflare.com
```

(Cloudflare may also provide ns3 and ns4, but ns1 and ns2 are sufficient)

---

## Registrar Quick Links

| Registrar | Nameserver Settings |
|-----------|-------------------|
| GoDaddy | My Products → Manage → DNS → Change Nameservers |
| Namecheap | Domain List → Manage → Nameservers → Custom DNS |
| Google Domains | Domain → DNS → Custom nameservers |
| Bluehost | Domains → Manage → Nameservers |
| HostGator | Domains → Manage → Nameservers |
| 1&1 IONOS | Domains → Manage → Nameservers |
| Alibaba Cloud | Domain Management → DNS Settings |
| Tencent Cloud | Domain Management → Nameservers |

---

## Verification Commands

### Check Nameservers (Command Line)

**Windows/Mac/Linux:**
```bash
nslookup -type=NS fivood.com
```

**Mac/Linux:**
```bash
dig fivood.com NS
```

**Expected output:**
```
fivood.com      nameserver = ns1.cloudflare.com.
fivood.com      nameserver = ns2.cloudflare.com.
```

### Online Verification

1. Go to https://www.whatsmydns.net
2. Enter: fivood.com
3. Select: NS
4. Click: Search
5. Look for green checkmarks (propagation complete)

---

## DNS Propagation Timeline

| Time | Status |
|------|--------|
| 0-15 min | Change applied at registrar |
| 15 min - 2 hrs | Visible to most DNS servers |
| 2-24 hrs | Visible to all DNS servers (typical) |
| 24-48 hrs | Complete propagation (worst case) |

---

## Troubleshooting

### Nameservers Not Updating

1. Verify changes were saved at registrar
2. Check for typos in nameserver entries
3. Wait 2-4 hours and try again
4. Clear DNS cache:
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
   - Linux: `sudo systemctl restart systemd-resolved`

### Cloudflare Shows Error

1. Check nameserver format (no trailing dots)
2. Verify domain ownership if required
3. Check for domain lock at registrar
4. Contact registrar support if needed

### Website Still Not Accessible After 48 Hours

1. Verify Cloudflare Pages deployment is active
2. Check DNS records are configured (Task 18)
3. Clear browser cache
4. Try different browser or incognito mode
5. Contact Cloudflare support

---

## Checklist

- [ ] Domain added to Cloudflare
- [ ] Cloudflare nameservers obtained
- [ ] Nameservers updated at registrar
- [ ] Registrar confirms changes saved
- [ ] Cloudflare shows status (Pending or Active)
- [ ] Waited for DNS propagation
- [ ] Cloudflare shows "Active" status
- [ ] Nameservers verified via command line or online tool

---

## Next Task

Once DNS propagation is complete:
→ **Task 18: Set up Cloudflare DNS records**

