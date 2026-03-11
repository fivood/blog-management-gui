# Task 17: Configure Cloudflare Domain - Visual Guide

## Process Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TASK 17 WORKFLOW                             │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │  Start Task 17       │
                    │  Configure Domain    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  STEP 1: Cloudflare  │
                    │  Add Domain          │
                    │  (5 minutes)         │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Get Nameservers:     │
                    │ ns1.cloudflare.com   │
                    │ ns2.cloudflare.com   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  STEP 2: Registrar   │
                    │  Update Nameservers  │
                    │  (5 minutes)         │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Replace with:        │
                    │ ns1.cloudflare.com   │
                    │ ns2.cloudflare.com   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  STEP 3: Wait        │
                    │  DNS Propagation     │
                    │  (24-48 hours)       │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Monitor Status:      │
                    │ Pending → Active     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Task 17 Complete    │
                    │  Proceed to Task 18  │
                    └──────────────────────┘
```

---

## Step 1: Add Domain to Cloudflare

### Cloudflare Dashboard Navigation

```
https://dash.cloudflare.com
        │
        ▼
    ┌─────────────────────┐
    │  Log In             │
    │  Email & Password   │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │  Dashboard Home     │
    │  (Websites)         │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │  + Add a site       │
    │  or                 │
    │  + Add domain       │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │  Enter Domain:      │
    │  fivood.com         │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │  Select Plan:       │
    │  Free (recommended) │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │  Nameservers:       │
    │  ns1.cloudflare.com │
    │  ns2.cloudflare.com │
    │  (SAVE THESE!)      │
    └─────────────────────┘
```

---

## Step 2: Update Nameservers at Registrar

### General Registrar Flow

```
Domain Registrar Website
        │
        ▼
    ┌──────────────────────┐
    │  Log In              │
    │  Email & Password    │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  My Domains          │
    │  or                  │
    │  Domain Management   │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Find: fivood.com    │
    │  Click: Manage       │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  DNS Settings        │
    │  or                  │
    │  Nameservers         │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Current:            │
    │  ns1.old-reg.com     │
    │  ns2.old-reg.com     │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Replace With:       │
    │  ns1.cloudflare.com  │
    │  ns2.cloudflare.com  │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Click: Save         │
    │  or                  │
    │  Update Nameservers  │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Confirmation:       │
    │  ✓ Changes Saved     │
    └──────────────────────┘
```

---

## Step 3: DNS Propagation Timeline

### Visual Timeline

```
TIME ELAPSED          STATUS                    WHAT'S HAPPENING
─────────────────────────────────────────────────────────────────

0 minutes             ✓ Change Applied          Registrar updated
                      ⏳ Propagating             Change sent to DNS servers

15 minutes            ⏳ Propagating             Most DNS servers updated
                      ⚠️  Inconsistent Results   Some users see old, some see new

1 hour                ⏳ Propagating             More DNS servers updated
                      ⚠️  Inconsistent Results   Still some inconsistency

2 hours               ⏳ Propagating             Most DNS servers updated
                      ✓ Mostly Working          Most users can access

4 hours               ⏳ Propagating             Nearly all DNS servers updated
                      ✓ Mostly Working          Most users can access

12 hours              ⏳ Propagating             Almost all DNS servers updated
                      ✓ Mostly Working          Most users can access

24 hours              ✓ Propagation Complete    All DNS servers updated
                      ✓ Fully Working           All users can access

48 hours              ✓ Propagation Complete    All DNS servers updated
                      ✓ Fully Working           All users can access
```

---

## DNS Propagation Monitoring

### Check Status in Cloudflare

```
Cloudflare Dashboard
        │
        ▼
    ┌─────────────────────────┐
    │  Your Domain            │
    │  fivood.com             │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │  Status Indicator:      │
    │                         │
    │  ⏳ Pending             │
    │  (Waiting for update)   │
    │         OR              │
    │  ✓ Active              │
    │  (Nameservers OK)       │
    │         OR              │
    │  ❌ Error              │
    │  (Check configuration)  │
    └─────────────────────────┘
```

### Online Propagation Checker

```
https://www.whatsmydns.net
        │
        ▼
    ┌──────────────────────┐
    │  Domain: fivood.com  │
    │  Record: NS          │
    │  Search              │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────────────────┐
    │  Results from Multiple Locations │
    │                                  │
    │  🟢 Google DNS                   │
    │     ns1.cloudflare.com           │
    │     ns2.cloudflare.com           │
    │                                  │
    │  🟢 Cloudflare DNS               │
    │     ns1.cloudflare.com           │
    │     ns2.cloudflare.com           │
    │                                  │
    │  🟡 OpenDNS                      │
    │     ns1.old-reg.com (old)        │
    │     ns2.old-reg.com (old)        │
    │                                  │
    │  🟢 Level3 DNS                   │
    │     ns1.cloudflare.com           │
    │     ns2.cloudflare.com           │
    │                                  │
    │  Legend:                         │
    │  🟢 = Propagated                 │
    │  🟡 = In Progress                │
    │  🔴 = Not Yet                    │
    └──────────────────────────────────┘
```

---

## Nameserver Configuration Comparison

### Before Configuration

```
┌─────────────────────────────────────────────────────────┐
│  Domain Registrar (e.g., GoDaddy)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  fivood.com Nameservers:                                │
│  ├─ ns1.godaddy.com                                     │
│  ├─ ns2.godaddy.com                                     │
│  └─ ns3.godaddy.com                                     │
│                                                          │
│  DNS Records (managed by GoDaddy):                       │
│  ├─ A record → 192.0.2.1 (old server)                   │
│  ├─ MX record → mail.godaddy.com                        │
│  └─ TXT record → v=spf1 ...                             │
│                                                          │
└─────────────────────────────────────────────────────────┘

                    ❌ NOT pointing to Cloudflare
```

### After Configuration

```
┌─────────────────────────────────────────────────────────┐
│  Domain Registrar (e.g., GoDaddy)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  fivood.com Nameservers:                                │
│  ├─ ns1.cloudflare.com  ✓ UPDATED                       │
│  └─ ns2.cloudflare.com  ✓ UPDATED                       │
│                                                          │
│  (DNS Records now managed by Cloudflare)                │
│                                                          │
└─────────────────────────────────────────────────────────┘
                    │
                    │ Points to
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Cloudflare DNS Management                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  DNS Records (managed by Cloudflare):                   │
│  ├─ CNAME record → Cloudflare Pages deployment          │
│  ├─ MX record → (if email configured)                   │
│  ├─ TXT record → (if needed)                            │
│  └─ Other records → (as configured)                     │
│                                                          │
│  Features:                                              │
│  ├─ ✓ HTTPS/SSL automatic                              │
│  ├─ ✓ CDN enabled                                       │
│  ├─ ✓ DDoS protection                                   │
│  └─ ✓ Global DNS                                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
                    │
                    │ Routes to
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Cloudflare Pages Deployment                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Your Blog Website                                      │
│  https://fivood.com                                     │
│                                                          │
│  ✓ Deployed                                             │
│  ✓ HTTPS enabled                                        │
│  ✓ CDN cached                                           │
│  ✓ Globally accessible                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Common Registrar Interfaces

### GoDaddy Nameserver Update

```
GoDaddy Dashboard
    │
    ├─ My Products
    │   │
    │   └─ fivood.com
    │       │
    │       └─ Manage
    │           │
    │           └─ DNS
    │               │
    │               └─ Nameservers
    │                   │
    │                   └─ Change Nameservers
    │                       │
    │                       ├─ I'll use other nameservers
    │                       │
    │                       ├─ Nameserver 1: ns1.cloudflare.com
    │                       ├─ Nameserver 2: ns2.cloudflare.com
    │                       │
    │                       └─ Save
```

### Namecheap Nameserver Update

```
Namecheap Dashboard
    │
    ├─ Domain List
    │   │
    │   └─ fivood.com
    │       │
    │       └─ Manage
    │           │
    │           └─ Nameservers
    │               │
    │               ├─ Dropdown: Custom DNS
    │               │
    │               ├─ Nameserver 1: ns1.cloudflare.com
    │               ├─ Nameserver 2: ns2.cloudflare.com
    │               │
    │               └─ Save Changes
```

### Google Domains Nameserver Update

```
Google Domains
    │
    ├─ fivood.com
    │   │
    │   └─ DNS
    │       │
    │       └─ Custom nameservers
    │           │
    │           ├─ Use custom nameservers
    │           │
    │           ├─ Nameserver 1: ns1.cloudflare.com
    │           ├─ Nameserver 2: ns2.cloudflare.com
    │           │
    │           └─ Save
```

---

## Verification Methods

### Method 1: Cloudflare Dashboard

```
Cloudflare Dashboard
    │
    ├─ fivood.com
    │   │
    │   └─ Status
    │       │
    │       ├─ ⏳ Pending
    │       │   (Waiting for nameserver update)
    │       │
    │       ├─ ✓ Active
    │       │   (Nameservers configured correctly)
    │       │
    │       └─ ❌ Error
    │           (Check configuration)
```

### Method 2: Command Line

```
Terminal/Command Prompt
    │
    ├─ nslookup -type=NS fivood.com
    │   │
    │   └─ Output:
    │       fivood.com nameserver = ns1.cloudflare.com
    │       fivood.com nameserver = ns2.cloudflare.com
    │
    └─ dig fivood.com NS
        │
        └─ Output:
            fivood.com. 3600 IN NS ns1.cloudflare.com.
            fivood.com. 3600 IN NS ns2.cloudflare.com.
```

### Method 3: Online Tool

```
https://www.whatsmydns.net
    │
    ├─ Domain: fivood.com
    ├─ Record Type: NS
    │
    └─ Results:
        ├─ 🟢 Google DNS: ns1.cloudflare.com, ns2.cloudflare.com
        ├─ 🟢 Cloudflare DNS: ns1.cloudflare.com, ns2.cloudflare.com
        ├─ 🟡 OpenDNS: ns1.old-reg.com, ns2.old-reg.com (old)
        └─ 🟢 Level3 DNS: ns1.cloudflare.com, ns2.cloudflare.com
```

---

## Troubleshooting Decision Tree

```
                    ┌─ Nameservers Not Updating?
                    │
                    ├─ YES
                    │   │
                    │   ├─ Check registrar settings
                    │   │   │
                    │   │   ├─ Saved correctly?
                    │   │   │   ├─ NO → Re-enter and save
                    │   │   │   └─ YES → Continue
                    │   │   │
                    │   │   └─ Check for typos
                    │   │       ├─ Found typos?
                    │   │       │   ├─ YES → Correct and save
                    │   │       │   └─ NO → Continue
                    │   │       │
                    │   │       └─ Wait 2-4 hours
                    │   │           └─ Try again
                    │   │
                    │   └─ Still not working?
                    │       └─ Contact registrar support
                    │
                    └─ NO
                        │
                        ├─ Cloudflare shows "Active"?
                        │   │
                        │   ├─ YES → Task 17 Complete ✓
                        │   │
                        │   └─ NO
                        │       │
                        │       ├─ Shows "Pending"?
                        │       │   └─ Wait 24-48 hours
                        │       │
                        │       └─ Shows "Error"?
                        │           └─ Check configuration
```

---

## Summary Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    TASK 17 SUMMARY                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  BEFORE:                                                      │
│  fivood.com → Old Registrar DNS → Old Server                 │
│                                                               │
│  AFTER:                                                       │
│  fivood.com → Cloudflare DNS → Cloudflare Pages → Blog       │
│                                                               │
│  STEPS:                                                       │
│  1. Add fivood.com to Cloudflare (5 min)                     │
│  2. Update nameservers at registrar (5 min)                  │
│  3. Wait for DNS propagation (24-48 hours)                   │
│                                                               │
│  RESULT:                                                      │
│  ✓ fivood.com managed by Cloudflare                          │
│  ✓ Ready for DNS records configuration (Task 18)             │
│  ✓ Ready for HTTPS setup (Task 19)                           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

