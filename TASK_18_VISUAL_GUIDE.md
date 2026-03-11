# Task 18: DNS Records Setup - Visual Guide

This visual guide provides step-by-step screenshots and diagrams for setting up Cloudflare DNS records.

---

## Visual Overview: DNS Record Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
│                                                               │
│  User types: https://fivood.com                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ DNS Query: "Where is fivood.com?"
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare DNS Servers                          │
│                                                               │
│  Query: fivood.com                                          │
│  Response: CNAME → blog.pages.dev                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Follow CNAME to blog.pages.dev
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Cloudflare Pages Deployment                        │
│                                                               │
│  URL: https://blog.pages.dev                                │
│  Content: Your Hugo Blog                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Serve blog content
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
│                                                               │
│  Displays: Your blog at https://fivood.com                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Find Your Cloudflare Pages URL

### Dashboard Navigation

```
Cloudflare Dashboard
│
├─ Left Sidebar
│  │
│  ├─ [Home]
│  ├─ [Websites]
│  ├─ [Pages] ← Click here
│  ├─ [Workers]
│  └─ [Analytics]
│
└─ Pages Section
   │
   ├─ [blog] ← Your project
   │  │
   │  ├─ Project Name: blog
   │  ├─ Status: ✅ Active
   │  ├─ URL: https://blog.pages.dev ← Copy this
   │  └─ Last Deployment: [timestamp]
   │
   └─ [+ Create project]
```

### Finding the Deployment URL

```
Cloudflare Pages Project View
┌─────────────────────────────────────────────────────────────┐
│ Pages > blog                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Project Name: blog                                          │
│ Status: ✅ Active                                           │
│                                                               │
│ Deployments                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Latest Deployment                                       │ │
│ │ Status: ✅ Success                                      │ │
│ │ URL: https://blog.pages.dev ← COPY THIS               │ │
│ │ Commit: abc1234                                         │ │
│ │ Date: 2024-01-15 10:30 UTC                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Custom Domains                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [+ Add custom domain]                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 2: Navigate to DNS Settings

### Cloudflare Domain Dashboard

```
Cloudflare Dashboard
│
├─ Left Sidebar
│  │
│  ├─ [Overview]
│  ├─ [Analytics]
│  ├─ [DNS] ← Click here
│  ├─ [SSL/TLS]
│  ├─ [Firewall]
│  ├─ [Performance]
│  └─ [Settings]
│
└─ DNS Section
   │
   ├─ DNS Records
   │  │
   │  ├─ [+ Add record]
   │  │
   │  └─ Existing Records (if any)
   │     ├─ [NS] ns1.cloudflare.com
   │     └─ [NS] ns2.cloudflare.com
   │
   └─ Nameservers
      ├─ ns1.cloudflare.com
      └─ ns2.cloudflare.com
```

---

## Step 3: Create CNAME Record for Root Domain

### Add Record Dialog

```
Cloudflare DNS Records
┌─────────────────────────────────────────────────────────────┐
│ DNS Records for fivood.com                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [+ Add record]                                              │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Add DNS Record                                          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Type: [CNAME ▼]                                        │ │
│ │                                                         │ │
│ │ Name: [@]                                              │ │
│ │ (@ represents root domain fivood.com)                 │ │
│ │                                                         │ │
│ │ Target: [blog.pages.dev]                              │ │
│ │ (Your Cloudflare Pages deployment URL)                │ │
│ │                                                         │ │
│ │ TTL: [Auto ▼]                                          │ │
│ │                                                         │ │
│ │ Proxy status: [Proxied ◉] [DNS only ○]               │ │
│ │ ✓ Proxied (orange cloud)                              │ │
│ │                                                         │ │
│ │ [Cancel] [Save]                                        │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Completed CNAME Record

```
DNS Records List
┌─────────────────────────────────────────────────────────────┐
│ DNS Records for fivood.com                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Name          Type    Target              Status             │
│ ─────────────────────────────────────────────────────────── │
│ @             CNAME   blog.pages.dev      🟠 Proxied        │
│                                                               │
│ [+ Add record]                                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 4: Create CNAME Record for www Subdomain

### Add www Record Dialog

```
Cloudflare DNS Records
┌─────────────────────────────────────────────────────────────┐
│ DNS Records for fivood.com                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ [+ Add record]                                              │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Add DNS Record                                          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Type: [CNAME ▼]                                        │ │
│ │                                                         │ │
│ │ Name: [www]                                            │ │
│ │ (Creates www.fivood.com)                              │ │
│ │                                                         │ │
│ │ Target: [blog.pages.dev]                              │ │
│ │ (Same as root domain)                                 │ │
│ │                                                         │ │
│ │ TTL: [Auto ▼]                                          │ │
│ │                                                         │ │
│ │ Proxy status: [Proxied ◉] [DNS only ○]               │ │
│ │ ✓ Proxied (orange cloud)                              │ │
│ │                                                         │ │
│ │ [Cancel] [Save]                                        │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Final DNS Records

```
DNS Records List
┌─────────────────────────────────────────────────────────────┐
│ DNS Records for fivood.com                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Name          Type    Target              Status             │
│ ─────────────────────────────────────────────────────────── │
│ @             CNAME   blog.pages.dev      🟠 Proxied        │
│ www           CNAME   blog.pages.dev      🟠 Proxied        │
│                                                               │
│ [+ Add record]                                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 5: Verify DNS Records

### Cloudflare Dashboard Verification

```
DNS Records Status
┌─────────────────────────────────────────────────────────────┐
│ ✅ DNS Records Created Successfully                         │
│                                                               │
│ Records:                                                    │
│ • @ (fivood.com) → blog.pages.dev [Proxied]               │
│ • www (www.fivood.com) → blog.pages.dev [Proxied]         │
│                                                               │
│ Status: ✅ Active                                           │
│ Propagation: In progress (5-30 minutes)                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Command Line Verification

```
Terminal Output
┌─────────────────────────────────────────────────────────────┐
│ $ dig fivood.com CNAME                                      │
│                                                               │
│ ; <<>> DiG 9.10.6 <<>> fivood.com CNAME                    │
│ ;; QUESTION SECTION:                                        │
│ ;fivood.com.                    IN      CNAME              │
│                                                               │
│ ;; ANSWER SECTION:                                          │
│ fivood.com.             300     IN      CNAME   blog.pages.dev.
│                                                               │
│ ;; Query time: 45 msec                                      │
│ ;; SERVER: 1.1.1.1#53(1.1.1.1)                             │
│ ;; WHEN: Mon Jan 15 10:30:00 UTC 2024                      │
│ ;; MSG SIZE  rcvd: 67                                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Online Propagation Checker

```
whatsmydns.net Results
┌─────────────────────────────────────────────────────────────┐
│ DNS Propagation Checker                                     │
│                                                               │
│ Domain: fivood.com                                          │
│ Record Type: A                                              │
│                                                               │
│ Location              IP Address           Status            │
│ ─────────────────────────────────────────────────────────── │
│ Google DNS            [Cloudflare IP]      ✅ Propagated   │
│ Cloudflare DNS        [Cloudflare IP]      ✅ Propagated   │
│ OpenDNS               [Cloudflare IP]      ✅ Propagated   │
│ Quad9 DNS             [Cloudflare IP]      ✅ Propagated   │
│ Level3 DNS            [Cloudflare IP]      ✅ Propagated   │
│ Verisign DNS          [Cloudflare IP]      ✅ Propagated   │
│ Comodo DNS            [Cloudflare IP]      ✅ Propagated   │
│ DNS.WATCH             [Cloudflare IP]      ✅ Propagated   │
│                                                               │
│ Overall: ✅ 100% Propagated                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 6: Test Domain Access

### Browser Test

```
Browser Address Bar
┌─────────────────────────────────────────────────────────────┐
│ https://fivood.com                                          │
└─────────────────────────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Fivood Blog                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 🔒 https://fivood.com                                       │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │ Welcome to Fivood Blog                                │ │
│ │ 分享技术和生活的思考                                    │ │
│ │                                                         │ │
│ │ [Home] [Posts] [About] [GitHub]                       │ │
│ │                                                         │ │
│ │ Recent Posts                                           │ │
│ │ • First Blog Post                                      │ │
│ │ • Second Blog Post                                     │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ✅ SSL Certificate Valid                                    │
│ ✅ Content Displays Correctly                               │
│ ✅ All Links Working                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## DNS Record Types Comparison

```
Record Type Comparison
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│ A Record                                                    │
│ ├─ Points to IPv4 address                                  │
│ ├─ Example: fivood.com → 192.0.2.1                        │
│ ├─ Use: Direct IP routing                                  │
│ └─ For Cloudflare Pages: Not recommended                   │
│                                                               │
│ AAAA Record                                                 │
│ ├─ Points to IPv6 address                                  │
│ ├─ Example: fivood.com → 2001:db8::1                      │
│ ├─ Use: IPv6 support                                       │
│ └─ For Cloudflare Pages: Not recommended                   │
│                                                               │
│ CNAME Record ✓ RECOMMENDED                                 │
│ ├─ Points to another domain                                │
│ ├─ Example: fivood.com → blog.pages.dev                   │
│ ├─ Use: Domain aliasing                                    │
│ └─ For Cloudflare Pages: Perfect choice                    │
│                                                               │
│ ALIAS Record (Alternative)                                 │
│ ├─ Similar to CNAME but for root domain                    │
│ ├─ Example: fivood.com → blog.pages.dev                   │
│ ├─ Use: Root domain aliasing                               │
│ └─ For Cloudflare Pages: Also works                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Proxy Status Explanation

```
Proxy Status Options
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│ 🟠 Proxied (Orange Cloud) - RECOMMENDED                    │
│ ├─ Traffic routes through Cloudflare                       │
│ ├─ Benefits:                                                │
│ │  • Security (DDoS protection)                            │
│ │  • Performance (caching, optimization)                   │
│ │  • Privacy (IP hidden)                                   │
│ │  • Analytics (traffic insights)                          │
│ ├─ For Cloudflare Pages: Always use this                   │
│ └─ Status: 🟠 Proxied                                      │
│                                                               │
│ ⚪ DNS Only (Gray Cloud)                                    │
│ ├─ Traffic routes directly to server                       │
│ ├─ Benefits:                                                │
│ │  • Direct access                                         │
│ │  • Lower latency (sometimes)                             │
│ ├─ Drawbacks:                                               │
│ │  • No Cloudflare security                                │
│ │  • IP address visible                                    │
│ │  • No caching benefits                                   │
│ ├─ For Cloudflare Pages: Don't use this                    │
│ └─ Status: ⚪ DNS Only                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## DNS Propagation Timeline

```
DNS Propagation Progress
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│ Time 0:00 - Records Created                                │
│ ├─ Status: ✅ Created in Cloudflare                        │
│ └─ Visible: Cloudflare dashboard only                      │
│                                                               │
│ Time 0:05 - Initial Propagation                            │
│ ├─ Status: ⏳ Propagating                                  │
│ └─ Visible: ~30% of DNS servers                            │
│                                                               │
│ Time 0:15 - Widespread Propagation                         │
│ ├─ Status: ⏳ Propagating                                  │
│ └─ Visible: ~70% of DNS servers                            │
│                                                               │
│ Time 0:30 - Near Complete                                  │
│ ├─ Status: ⏳ Almost complete                              │
│ └─ Visible: ~95% of DNS servers                            │
│                                                               │
│ Time 1:00 - Complete Propagation                           │
│ ├─ Status: ✅ Complete                                     │
│ └─ Visible: 100% of DNS servers                            │
│                                                               │
│ Typical: 5-30 minutes                                       │
│ Maximum: 60 minutes                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting Decision Tree

```
DNS Not Working?
│
├─ Domain shows "DNS resolution failed"
│  │
│  ├─ Wait 15-30 minutes for propagation
│  ├─ Clear DNS cache (ipconfig /flushdns)
│  ├─ Try different DNS server (8.8.8.8)
│  └─ Check Cloudflare dashboard for errors
│
├─ Domain points to wrong content
│  │
│  ├─ Verify CNAME target in Cloudflare
│  ├─ Check for conflicting DNS records
│  ├─ Verify Cloudflare Pages project is active
│  └─ Delete conflicting records
│
├─ HTTPS certificate error
│  │
│  ├─ Wait 5-30 minutes for certificate provisioning
│  ├─ Check SSL/TLS settings in Cloudflare
│  ├─ Clear browser cache
│  └─ Try different browser
│
├─ www subdomain doesn't work
│  │
│  ├─ Verify www CNAME record exists
│  ├─ Check for conflicting records
│  ├─ Wait for DNS propagation
│  └─ Create www record if missing
│
└─ Cloudflare Pages URL works but domain doesn't
   │
   ├─ Verify DNS records are created
   ├─ Check CNAME target is correct
   ├─ Verify Cloudflare Pages project settings
   └─ Wait for DNS propagation
```

---

## Quick Reference Diagram

```
Complete DNS Setup Flow
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│ 1. Find Cloudflare Pages URL                                │
│    └─ Example: blog.pages.dev                               │
│                                                               │
│ 2. Go to Cloudflare DNS Settings                            │
│    └─ Domain: fivood.com                                    │
│                                                               │
│ 3. Create CNAME Records                                     │
│    ├─ @ → blog.pages.dev (Proxied)                         │
│    └─ www → blog.pages.dev (Proxied)                       │
│                                                               │
│ 4. Verify Records Created                                   │
│    └─ Check Cloudflare dashboard                            │
│                                                               │
│ 5. Wait for Propagation                                     │
│    └─ 5-30 minutes typical                                  │
│                                                               │
│ 6. Test Domain Access                                       │
│    └─ Visit https://fivood.com                             │
│                                                               │
│ ✅ Complete!                                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

