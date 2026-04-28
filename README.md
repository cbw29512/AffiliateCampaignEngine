# Affiliate Campaign Engine

A repeatable affiliate campaign system that generates disclosure-safe landing pages from structured campaign data.

---

## Current MVP

- Campaign data → `data/campaigns.json`
- Schema validation → `scripts/validate-schema.cjs`
- Page generation → `scripts/generate-page.cjs`
- Rendering → `scripts/page-renderer.cjs`
- Styling → `assets/style.css`

---

## Safety Rules

- No fake income claims
- No fake reviews
- No unsupported “best” claims
- Affiliate disclosure is required
- Pages must be reviewed before promotion
- Static pages do NOT track clicks directly

---

## Commands

Validate campaigns:

```powershell
node scripts\validate-schema.cjs