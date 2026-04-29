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


---

## Page Section Order Rule

Public affiliate pages must use this section order:

1. Hero / headline
2. No-nonsense review evidence near the top
3. Product explanation
4. CTA
5. Full disclosure at the bottom

Review cards must be source-backed and rated 4.5 or higher.

The bottom disclosure must be visible, readable, and not hidden in tiny footer text.


---

## Publish-Ready Traffic Pack Rule

Only public-ready campaigns may generate files inside:

content/publish-ready/

Draft, review_needed, paused, or blocked campaigns must not appear in publish-ready traffic packs.

Publish-ready packs must include:

* Live landing page URL
* Tracked redirect URL
* Social disclosure wording
* Review evidence summary when available
* Explicit "results vary" caution
* Do-not-say guardrails for unsupported claims


---

## Launch Batch Rule

Only public-ready campaigns may generate files inside:

content/launch-batches/

Each launch batch must include:

* One short-video title
* One short-video script
* One TikTok/Reel caption
* One pinned comment
* Posting checklist
* Required referral/compensation disclosure
* Results-vary caution
* Do-not-say guardrails

Draft, review_needed, paused, or blocked campaigns must not appear in launch batches.


---

## Performance Ledger Rule

Campaign performance must be tracked with real recorded data only.

The performance ledger must not invent:

* views
* clicks
* signups
* revenue
* conversion rates

Unknown metrics stay null until recorded.

Performance reports must separate recorded metrics from decisions and notes.


---

## Post Recording Rule

After a launch batch is posted publicly, the post must be recorded in:

data/performance-ledger.json

The post recorder may update:

* platform
* postUrl
* postedAt
* decision
* notes

The post recorder must not invent or estimate:

* views
* clicks
* signups
* revenue
* conversion rates

Those metrics remain null until real values are manually recorded from the platform or affiliate dashboard.


---

## Metric Recording Rule

Metrics may only be recorded from real platform or affiliate dashboard data.

The metrics recorder may update:

* views
* clicks
* signups
* revenue
* decision
* notes

The metrics recorder must reject:

* missing values
* negative values
* non-numeric values

Conversion rates and scaling decisions must not be invented.


---

## Public Homepage Rule

The public homepage must list only public-ready campaigns.

The homepage must not include:

* draft campaigns
* review_needed campaigns
* paused campaigns
* blocked campaigns

The homepage must include a clear disclosure section and link only to generated public landing pages.


---

## Link Intake Rule

Product links may be submitted into:

data/intake/incoming-links.json

Intake links must start blocked.

Allowed initial state:

* status: research_needed
* publishDecision: blocked_until_verified

The intake engine must not:

* create a public page automatically
* invent affiliate programs
* invent reviews
* invent prices
* mark anything public-ready
* bypass review/disclosure/link QA

A submitted link may only become a campaign after affiliate possibility, exact product URL, source-backed reviews, disclosure, and manual approval are verified.


---

## Research Packet Rule

Each intake link must generate a research packet in:

content/research-packets/

Research packets are internal preparation documents only.

They must not:

* mark a product public-ready
* invent affiliate proof
* invent price data
* invent review evidence
* generate a public landing page
* bypass manual approval

Research packets must show missing proof clearly and keep the item blocked until verified.

