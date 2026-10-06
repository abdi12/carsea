# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Everyday private buyers in Indonesia researching a new passenger car. Many are unsure which body style, powertrain, or price range fits their household and daily use. They research on mobile and desktop, in Bahasa Indonesia or English, before visiting a dealer.

Their jobs:

- Narrow down cars that fit how they live and what they can afford.
- See what they get for the money without being pushed toward a brand.
- Compare the few cars they are seriously considering.
- Understand what ongoing ownership may cost, and how uncertain that estimate is.
- Verify warranty and authorized service support near them.

## Product Purpose

Carsea helps people research new passenger cars and decide which one fits their needs before buying. It combines a guided finder, direct browsing, explainable recommendations, a comparison of up to three cars, and evidence-backed vehicle research.

Success is an uncertain buyer reaching a useful shortlist with little effort, a confident buyer browsing and filtering without a questionnaire, and both understanding the trade-offs between cars. Product health is measured with aggregate, cookieless analytics only (finder completions, detail views from recommendations, comparisons, guide and locator use).

## Positioning

An independent research service, not a marketplace, dealer-lead funnel, or checkout. Rankings carry no payment, sponsorship, affiliate, or manufacturer influence. Recommendations come from transparent, deterministic rules that explain in words why a car fits and what it does not satisfy, rather than a conversational AI or an opaque score. Material facts are traceable to a source, market, variant, and verification date.

## Operating Context

- Market: Indonesia. Launch price and service coverage: Jakarta / Greater Jakarta.
- Prices are on-the-road (OTR) prices in IDR for a specific variant.
- Ownership cost is shown as four separate monthly estimates: fuel or electricity, scheduled servicing, annual tax as a monthly equivalent, and insurance. The buyer supplies monthly distance.
- Two entry paths: a guided finder and direct browse/filter.
- Shortlists and finder answers are saved in the buyer's own browser. There are no accounts.

## Capabilities and Constraints

- MVP pages: home, find a car, browse cars, recommendations, compare, vehicle research, buying guides, how Carsea compares, service centres, privacy and terms.
- New cars only. Petrol, diesel, hybrid, and electric where source data supports them.
- Recommendations show 3-5 matches; comparison holds at most three cars.
- Value for money is a transparent equipment-to-price breakdown, never a universal score.
- Deferred: used cars, purchase or financing flows, loan estimates, dealer leads, sponsored placement, user reviews, AI assistant, 3D configurator, accounts.
- Missing, stale, estimated, and non-comparable data must be stated explicitly, never implied complete.
- Stack: Next.js, TypeScript, Tailwind CSS, PostgreSQL, self-hosted with Docker.
- Bahasa Indonesia is the default locale; every public page has a reviewed English equivalent. Languages are never mixed within one locale.

Undecided: data providers and their terms, update cadence, catalog size, licensed image source, hosting provider and domain, analytics implementation, legal entity and reviewed legal copy (SPEC.md §15).

## Brand Commitments

- Name: Carsea. No existing assets were supplied; the wordmark and identity are original.
- Green is the brand color.
- Modern, credible, consumer-focused automotive research.
- No literal ocean motif as a defining device.
- Selective glassmorphism only (navigation, filters, image overlays). Prices, comparison figures, form fields, and long-form text sit on opaque, high-contrast surfaces.
- Light theme first, with a complete dark theme and a visible theme control.
- Motion is restrained and purposeful, and respects reduced-motion preferences. No scroll hijacking, auto-rotating carousels, perpetual loops, or cursor effects.
- Never visually privilege a manufacturer or create sponsor-style placements. No fabricated social proof or sponsor logos.
- Do not copy another product's interface.

## Evidence on Hand

- SPEC.md: the confirmed product specification and interview decisions.
- No vehicle catalog, prices, specifications, service-centre listings, or licensed vehicle photography exist yet. Future work must not fabricate them or present illustrative material as verified launch-market fact.
- No testimonials, user counts, press, partners, or awards exist.

## Product Principles

1. Independence is visible: nothing on a page may look like paid promotion.
2. Explain, don't score: reasons and trade-offs in plain language over single numbers.
3. Every fact shows its provenance, and uncertainty is stated rather than hidden.
4. Price is not cost: keep the one-time purchase price separate from recurring ownership estimates.
5. Research needs no account and collects no personal profile.

## Accessibility & Inclusion

WCAG 2.2 AA. Mobile-first, verified at 375px, tablet, desktop, and narrow landscape. All core tasks work by keyboard with visible focus. Meaning is never conveyed by color alone. Both themes meet contrast requirements.
