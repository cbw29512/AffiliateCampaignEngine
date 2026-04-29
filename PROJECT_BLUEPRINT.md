# Affiliate Campaign Engine

## Objective

Build a repeatable system that creates affiliate campaign pages, short-video prompts, tracking links, and a master performance dashboard for affiliate products.

The system should let us add a new affiliate product once, then generate:

1. A single SEO landing page
2. Short-form video campaign ideas
3. Disclosure-safe affiliate links
4. Tracking IDs
5. Dashboard-ready performance data

---

## Definition of Done

The MVP is done when:

* We can add one affiliate offer to a JSON file
* The system generates a landing page for that offer
* The page includes clear affiliate disclosure
* The page explains the product in plain language
* The page has trackable CTA buttons
* The dashboard shows every campaign
* The dashboard shows clicks per campaign
* The same structure can be reused for Kikoff, Amazon, Home Depot, software tools, or other affiliate offers

---

## Rules

* No fake income claims
* No fake reviews
* No unsupported “best” claims
* Every affiliate page must disclose affiliate relationship clearly
* Every offer must have a source URL and affiliate URL
* Every page must be useful even if the visitor does not click
* Each file should stay under 150 lines when possible
* Every script must fail clearly instead of silently

---

## Data Schema

Each affiliate campaign has:

```json
{
  "id": "kikoff-credit-builder",
  "status": "draft",
  "category": "money",
  "productName": "Kikoff",
  "affiliateUrl": "https://kikoff.com/refer/FQY767IS",
  "sourceUrl": "https://kikoff.com",
  "slug": "kikoff-credit-builder-review",
  "headline": "How Kikoff Can Help Build Credit Without a Credit Check",
  "personalProofAllowed": true,
  "personalProofNotes": "",
  "riskLevel": "medium",
  "disclosureRequired": true,
  "primaryCta": "Check out Kikoff",
  "createdAt": "2026-04-28",
  "updatedAt": "2026-04-28"
}
```

---

## State Logic

Campaigns move through these states:

* **draft**
  Offer added but not ready to publish

* **review_needed**
  Needs human review for claims, proof, and disclosure

* **approved**
  Safe to generate page and content prompts

* **published**
  Page is live

* **testing**
  Videos/posts are sending traffic to the page

* **winner**
  Campaign has enough positive signal to scale

* **paused**
  Campaign is stopped because of bad fit, low clicks, compliance risk, or outdated offer

---

## MVP Campaigns

Start with:

1. Kikoff credit-builder referral
2. Amazon home product affiliate link
3. Home Depot product recommendation page
4. PushButtonTools software/tool affiliate-style page
5. ComplianceShieldAI lead-gen audit page

---

## Next Build Order

1. Create project structure
2. Add campaign JSON
3. Add schema validator
4. Generate static landing page
5. Add click tracking
6. Add dashboard
7. Add video prompt generator
8. Make repeatable campaign template

---

## Public-Ready Publishing Rule

A campaign may generate draft traffic assets before it is public-ready.

Public-ready campaigns must generate and pass QA for:
* HTML landing page
* Disclosure text
* Trackable redirect CTA
* Product/headline content

Not-public-ready campaigns must not generate public HTML landing pages.

Draft social posts and short-video prompts may exist for not-public-ready campaigns, but they must not be publicly promoted until the matching landing page passes QA.


---

## Professional Page Quality Rule

Every public affiliate page must look clean, trustworthy, and professional before traffic is sent to it.

A page is not public-ready unless it has:

* Clean centered layout
* Readable typography
* Clear CTA button
* Visible affiliate/referral disclosure
* Mobile-friendly spacing
* No raw/default HTML look
* No fake income claims
* No unsupported "best" claims
* No fake reviews

Technical QA and design QA are both required before public promotion.


---

## Traffic Promotion Guard Rule

Draft social posts and short-video prompts may be generated before a campaign is public-ready.

However, non-public-ready campaign traffic assets must be clearly marked:

**DO NOT PUBLISH YET**

A campaign cannot be promoted publicly until:

* Public landing page exists
* Technical QA passes
* Design QA passes
* Affiliate/referral disclosure is verified
* Outbound redirect is verified

Public-ready campaigns should have promotion guards cleared automatically during build.


---

## Image Size Quality Rule

Affiliate landing page images must not overpower the page.

Public campaign pages should use constrained, responsive images:

* Product/hero images stay inside the content card
* Images scale down on mobile
* Images use professional spacing and rounded corners
* Huge raw images are not allowed to dominate the layout
* Visual QA must check image size before promotion


---

## Public Campaign URL Rule

Every public-ready campaign must have a valid affiliateUrl.

A campaign cannot be public-ready unless:

* affiliateUrl exists
* affiliateUrl starts with http:// or https://
* redirect.html includes the campaign id
* the CTA link routes through redirect.html?cid=campaign-id
* draft campaigns are excluded from the public redirect map

Broken or missing outbound links must fail the build.


---

## Amazon Product-Specific Link Rule

Amazon affiliate campaigns must link to the exact intended product.

A public Amazon campaign must have:

* expectedAsin
* exact sourceUrl for the intended Amazon product page
* affiliateUrl generated from Amazon Associates SiteStripe or Mobile GetLink
* amazonLinkVerified set to true only after the CTA opens the expected ASIN product page

Generic Amazon homepage, search, category, or unrelated product links are not allowed for public-ready campaigns.

If an Amazon short link hides the ASIN, manual verification is required before promotion.


---

## Review Evidence Card Rule

Public affiliate pages must include no-nonsense review evidence when review data is available.

Review cards must:

* Use public, source-backed review data only
* Include at least 3 review highlights for public campaigns
* Use reviews rated 4.5 or higher
* Explain how the product helped in plain language
* Include the source name and source URL
* Avoid fake people, fake testimonials, fake results, or unsupported guarantees
* Clearly state that individual results can vary

