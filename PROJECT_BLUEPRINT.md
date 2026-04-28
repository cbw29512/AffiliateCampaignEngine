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
