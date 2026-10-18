# 📦 Client Handover Dossier — Digital World
**Project:** Digital World E-Commerce & B2B Wholesale Portal  
**Client / Store Owner:** Vishal Soni  
**Store Name:** Digital World (डिजिटल वर्ल्ड), Sri Ganganagar, Rajasthan  
**GitHub Repository:** `https://github.com/DIFFERENTSHRAVAN/digitalworld`  
**Date:** October 2026  

---

## 📑 Quick Navigation
1. [Live Deployment Steps](#1-live-deployment-steps)
2. [Client Portals & Access Credentials](#2-client-portals--access-credentials)
3. [Admin Features Walkthrough (Client Training)](#3-admin-features-walkthrough-client-training)
4. [Backend & Cloud Database (Supabase)](#4-backend--cloud-database-supabase)
5. [Custom Domain Setup](#5-custom-domain-setup)
6. [Ready-to-Send Client Message (WhatsApp / Email)](#6-ready-to-send-client-message)

---

## 1. Live Deployment Steps

Aapka poora source code GitHub repo (`DIFFERENTSHRAVAN/digitalworld`) par push ho chuka hai aur production-ready build pass hai.

### Vercel Par 2-Minute Deploy (Recommended)
1. **[Vercel.com](https://vercel.com)** par jakar apne GitHub account se Login kijiye.
2. **"Add New..."** ➔ **"Project"** par click kijiye.
3. Import repository: **`DIFFERENTSHRAVAN/digitalworld`**.
4. Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Environment Variables**:
   - `VITE_SITE_URL` = `https://your-domain.vercel.app` (ya custom domain)
6. **"Deploy"** par click karein. 1 minute me website live ho jayegi.

---

## 2. Client Portals & Access Credentials

Client ko ye 3 links aur login details provide kijiye:

| Portal | URL / Link | Login ID | Default Password |
|---|---|---|---|
| **Customer Storefront** | `https://your-domain/` | Any Indian 10-digit mobile number | Direct OTP Login |
| **B2B Dealer Portal** | `https://your-domain/dealer/login` | Registered Phone / Email | Dealer Password |
| **Store Admin Panel** | `https://your-domain/admin/login` | `digitalworld0813@gmail.com`<br>ya `8384957548` ya `admin` | `admin123` |

> [!NOTE]
> Admin login ke baad Vishal Soni **Admin Panel ➔ Settings** me jakar apna password badal sakte hain.

---

## 3. Admin Features Walkthrough (Client Training)

Client (Vishal Soni) ko ye 6 cheezein batani hain jo wo khud bina developer ke manage kar sakte hain:

1. **Products Management:**
   - Naye laptops/accessories add karna, photos upload karna, stock quantity aur B2B Dealer wholesale rate set karna.
2. **Categories & Sub-categories:**
   - Header ribbon aur mega dropdown ki categories aur sub-categories add, rename ya delete karna.
3. **Festival Offers & Banners:**
   - Navratri, Diwali ya seasonal offers/discount banner image upload karna.
4. **B2B Dealer Verification:**
   - Naye dukaandaar ke registration ko approve/reject karna aur 1-click me WhatsApp welcome send karna.
5. **Orders & WhatsApp Status:**
   - Naye orders dekhna aur customer/dealer ko 1-click me WhatsApp status dispatch send karna.
6. **Dukaan Settings & Bank Details:**
   - Dukaab ka address, phone number, Indian Bank account details aur UPI ID (`vishalsoni.0813@axl`) update karna.

---

## 4. Backend & Cloud Database (Supabase)

Agar client chahta hai ki multiple computers/mobile phones se ek sath real-time data sync ho:
1. [Supabase.com](https://supabase.com) par free project banayein.
2. `schema.sql` aur `seed.sql` ko Supabase ke SQL Editor me paste karke **RUN** karein.
3. Project Settings ➔ API se `URL` aur `Anon Key` copy karke Vercel environment variables me paste kar dein.

---

## 5. Ready-to-Send Client Message (WhatsApp / Email)

```text
Namaste Vishal Soni ji,

Aapki website "Digital World" ka development aur testing successfully complete ho chuka hai! 🎉

Yahan aapke website aur admin panel ke login details hain:

🌐 Website Live Link: https://[APKA-VERCEL-LINK]
💼 B2B Dealer Portal: https://[APKA-VERCEL-LINK]/dealer/login
🔐 Admin Dashboard: https://[APKA-VERCEL-LINK]/admin/login

---
📌 ADMIN LOGIN DETAILS:
• Login ID / Email: digitalworld0813@gmail.com (ya apna phone number 8384957548 daal sakte hain)
• Default Password: admin123
(Login karne ke baad Settings tab me jaakar aap password change kar sakte hain)

---
✨ AAP KYA-KYA MANAGE KAR SAKTE HAIN:
1. Products: Naye laptops ya accessories add/edit karna aur wholesale price set karna.
2. Categories: Header ribbon ki categories aur sub-categories customize karna.
3. Offers: Festival banners aur Navratri/Diwali offers badalna.
4. Dealers: Naye B2B dukaandaron ko approve karna aur wholesale access dena.
5. Orders: Customer aur Dealer orders dekhna aur WhatsApp pe status bhejna.
6. Bank/UPI Details: Bank account aur UPI ID manage karna.

Kisi bhi madad ya sawal ke liye aap humse kabhi bhi sampark kar sakte hain.

Dhanyawaad,
Digital World Tech Support Team
```
