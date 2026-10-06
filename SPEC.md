# Carsea Product Specification

**Status:** Product direction confirmed; data-provider and infrastructure details require validation before launch.
**Product:** Carsea
**Market:** Indonesia, initial price and service coverage in Jakarta / Greater Jakarta
**Audience:** Everyday private car buyers
**Release target:** Production-ready MVP
**Last updated:** 2026-10-06

## 1. Product summary

Carsea helps people in Indonesia research new passenger cars and decide which one best fits their needs before buying. It combines a guided finder, direct browsing, explainable recommendations, an at-a-glance comparison, and evidence-backed vehicle research.

Choosing a car is a high-cost decision involving more than the listed price. Carsea must help buyers understand fit for purpose, equipment for the purchase price, expected running costs, and after-sales support. It must be useful without favoring a manufacturer, dealer, advertiser, or sponsor.

The first release is an independent research service, not a marketplace, dealer-lead funnel, or checkout. Recommendations use transparent rules, not a conversational AI or opaque score.

## 2. Goals and measures of success

### Goals

- Help an uncertain buyer move from needs to a useful shortlist with minimal effort.
- Help a confident buyer browse and filter without completing a questionnaire.
- Make trade-offs between vehicles clear, including equipment, upfront price, estimated running costs, and after-sales support.
- Explain why a vehicle appears in a recommendation and what it does not satisfy.
- Make important facts traceable to a source, market, variant, and verification date.
- Work well in Bahasa Indonesia and English, on mobile and desktop.
- Build trust through visibly independent rankings and plain-language methodology.

### Success measures

Use privacy-preserving aggregate analytics to measure:

- Finder starts and completions.
- Recommendation results that lead to a car detail view.
- Cars added to and removed from comparison.
- Completed comparisons.
- Guide and methodology engagement.
- Service-center locator use.

These are product-health measures, not claims or proof to place on the website. Do not collect names, contact details, exact location, or personal preference profiles for analytics.

## 3. Audience and jobs to be done

### Primary audience

Everyday private buyers researching a new passenger car. Buyers may be unsure which body style, powertrain, or price range makes sense for their household and daily use.

### Core jobs

- “Help me narrow down cars that fit how I live and what I can afford.”
- “Show me what I get for the money, without pushing a particular brand.”
- “Compare the few cars I am seriously considering.”
- “Tell me what ongoing ownership may cost and how uncertain that estimate is.”
- “Help me verify warranty and authorized service support near me.”

## 4. Product boundaries

### Included in the MVP

- New passenger cars available in the validated launch catalog.
- Petrol, diesel, hybrid, and electric powertrains where suitable source data exists.
- Jakarta / Greater Jakarta regional on-the-road price context.
- A guided car finder and direct browse/filter experience.
- A shortlist of 3-5 strongest explainable matches.
- Comparison of up to three selected vehicles at once.
- Vehicle research pages.
- A small set of sourced buying guides focused on budget, OTR price, ownership cost, equipment, and value for money.
- Public methodology and data-sourcing explanation.
- Warranty and service-network details, plus a Greater Jakarta authorized service-center locator.
- Local, account-free saving of a shortlist.
- Bahasa Indonesia and English. Bahasa Indonesia is the default, with a visible language switch.
- Light and dark themes, with the light theme as the initial default.
- Privacy-preserving aggregate usage analytics.

### Explicitly deferred

- Used-car catalog and used-car condition grading.
- Online purchase, financing applications, loan/installment estimates, dealer enquiries, and sales leads.
- Sponsored placements, paid ranking, affiliate-driven ranking, and manufacturer-preferred recommendations.
- Open user reviews or unmoderated community content.
- Conversational AI shopping assistant or AI-generated vehicle facts.
- Interactive 3D car color/accessory configurator. Consider in a later phase when accurate, licensed 3D assets are available and the feature has a clear research benefit. Real photography is the MVP fallback and primary visual asset.
- Account registration, cloud-saved buyer profiles, and social sharing of personal preference histories.
- Nationwide or real-time coverage claims unless the underlying sources and operations prove them.

## 5. Information architecture and pages

All public informational routes should be indexable where useful, with canonical URLs and localized metadata. User-specific finder state must not create thin or duplicate indexable pages.

| Page | Purpose and required content |
|---|---|
| Home (`/`) | Explain Carsea plainly, offer two clear entry paths (guided finder and browse cars), establish independence, and surface a small number of useful research topics. No fabricated social proof or sponsor logos. |
| Find a car (`/find`) | Progressive guided flow that collects budget, use, passenger/space needs, location, powertrain preferences, and a few buyer-selected priorities. Allow skipping uncertain answers and revising choices. |
| Browse cars (`/cars`) | Searchable, filterable new-car catalog with clear market coverage, applicable variant, Jakarta price context, and source freshness. Filters must be usable without hover or horizontal gestures. |
| Recommendations (`/recommendations`) | Show 3-5 leading matches, why each fits, unmet preferences, meaningful trade-offs, source freshness, and actions to inspect, save, or compare. Provide a path to revise finder answers. |
| Compare (`/compare`) | Compare two or three vehicles in a readable, responsive layout. Include variant and price comparability, key equipment, use-case fit, ownership costs, warranty, and after-sales facts. Identify missing or non-comparable data. |
| Vehicle research (`/cars/{slug}`) | Present sourced vehicle/variant overview, real licensed imagery, regional price, equipment and key specifications, costs and assumptions, warranty/service support, and add/save/compare actions. |
| Buying guides (`/guides`, `/guides/{slug}`) | Publish concise, maintained guidance on budgeting, Indonesian OTR price, ownership costs, equipment, and evaluating value for money. Distinguish general advice from vehicle-specific facts. |
| How Carsea compares (`/how-we-compare`) | Explain matching and ranking, value-for-money breakdowns, cost methods and exclusions, data sources, update cadence, missing-data treatment, and editorial independence. |
| Service centers (`/service-centres`) | Let users search or browse authorized centers in Greater Jakarta. Provide name, address, supported brand, published contact/opening details when verified, source, and verification date. A result list must remain usable if map tiles or geolocation are unavailable. |
| Privacy and terms (`/privacy`, `/terms`) | Explain local shortlist storage, anonymous analytics, data and image sources, limitations, and applicable terms. Legal copy must be reviewed for the actual operating entity and applicable Indonesian requirements before launch. |

Navigation should prioritize Find a car, Browse cars, Compare, Buying guides, and the language/theme controls. The current comparison count may be announced accessibly. On small screens, preserve the primary research actions without crowding the header.

## 6. Buyer journeys

### 6.1 Guided finder

1. Buyer chooses the guided finder from the home page or navigation.
2. Ask only high-value questions in a logical sequence. Group related questions and explain unfamiliar terms.
3. Capture region, budget, typical use, passenger/space requirements, powertrain preference, and selected priorities. Buyers can skip unknown details.
4. Show a review of answers before matching and let the buyer edit any answer.
5. Produce a small ranked shortlist with plain-language reasons and trade-offs.
6. Let the buyer inspect a research page, save locally, or add vehicles to a comparison of up to three.
7. Preserve finder answers in the current browser to support back navigation and revision. Do not require an account.

### 6.2 Direct browse

1. Buyer opens the car catalog.
2. Search and filter by relevant vehicle attributes, such as price range, body style, powertrain, passenger/space needs, and equipment.
3. Explain result counts and active filters; support clearing one or all filters.
4. Open a vehicle research page or add a vehicle to comparison.

### 6.3 Compare

1. Add up to three comparable vehicles/variants.
2. Confirm that each row refers to the same or a clearly identified model year, trim, and powertrain.
3. Show the most decision-relevant differences first. Keep details grouped, with a compact summary and access to the full sourced detail.
4. Make unknown, not applicable, estimated, or out-of-date values explicit in text; never rely on color alone.
5. Provide remove/replace actions and a clear way back to results.

### 6.4 Local saving

- Save shortlist identifiers and the minimum data required to restore the selection in local browser storage.
- Do not require sign-in or transmit a buyer's finder answers for saving.
- Explain when saved research exists and provide a clear delete/clear action.
- Handle storage disabled, unavailable, or cleared by the browser without blocking research.

## 7. Matching and value-for-money behavior

### Explainable matching

- Use deterministic, rules-based matching from buyer answers and verified catalog attributes.
- The buyer selects a few priorities; those preferences affect match ordering.
- Do not expose an unsupported single “best car” claim or a black-box numeric fit score.
- Explain positive matches, compromises, and missing evidence in words tied to the buyer's answers.
- Do not rank based on payment, sponsorship, affiliate revenue, dealer participation, or manufacturer relationships.
- If relevant catalog data is missing, show that matching is limited rather than silently treating missing as a negative or positive.

### Value for money

- Compare verified standard equipment/features against the price of the exact applicable variant.
- Present the feature-to-price breakdown transparently, grouped into meaningful categories, rather than claiming a universal value score.
- Show the equipment source and applicable variant for each item.
- Do not treat an unverified feature as included. Distinguish standard equipment, optional equipment, unavailable information, and non-applicable features.
- Explain that value depends on which features the buyer cares about; allow buyer-selected priorities to surface those features.

## 8. Content and data requirements

### Required vehicle data

Each catalog item must represent a specific, identifiable vehicle/variant, not an ambiguous model name. Store as applicable:

- Make, model, model year, variant/trim, body style, and powertrain.
- Jakarta / Greater Jakarta OTR price or a clearly explained price range, its currency, validity period, included/excluded charges, and source.
- Key dimensions, passenger/cargo information, performance and powertrain specifications, and efficiency/consumption inputs used by cost estimates.
- Standard equipment and safety features by variant.
- Warranty terms, conditions, and source.
- Official service network and service-center details for the launch area.
- Real vehicle imagery with usage rights, attribution requirements, and suitable alt text.
- Publication status, last verified date, and a per-field source record.

### Source and provenance rules

- Material facts need a source, retrieval or verification date, applicable market/region, model-year/variant scope, and status.
- Track provenance at the field or field-group level so one verified price does not imply that every specification is verified.
- Distinguish official/manufacturer information, other authoritative data, computed estimates, and unavailable information.
- Use official manufacturer or other independently verifiable sources where available. Confirm usage rights before storing or publishing specifications, logos, service listings, and images.
- Make no “complete,” “current,” “real-time,” or nationwide-coverage claims unless data coverage and update operations substantiate them.
- An expired or unverified fact must be marked stale or withheld from current recommendations according to its data type; do not continue presenting it as current.
- Verify source availability, reliability, update cadence, and licensing for Greater Jakarta before committing to a catalog size or launch date.

### Ownership-cost estimate

Show separate, clearly labeled estimates for:

1. Fuel or electricity.
2. Scheduled servicing.
3. Annual vehicle tax, expressed as a monthly equivalent where appropriate.
4. Insurance.

Rules:

- The buyer supplies monthly distance, with a disclosed, editable starter assumption. State the assumed energy price, consumption input, and applicable calculation period.
- Keep one-time OTR purchase price separate from recurring monthly ownership cost.
- Do not include loan interest, installments, depreciation, resale value, or unlisted costs in the monthly total.
- Keep the calculation and inputs understandable, with a link to the methodology page.
- Label estimates and uncertainty. A calculated estimate is not a guaranteed bill or quote.
- Show each component and its source/assumption. Do not create a misleading total if a required component is unavailable; show the missing component and say whether the displayed subtotal excludes it.
- Validate vehicle tax, energy prices, service schedule/cost data, and insurance assumptions for the actual launch region and vehicle variant. If an insurance figure cannot be supported, show it as unavailable rather than inventing a precise value.

### Guides

Launch with a small, editorially maintained set of guides covering:

- Building a realistic car budget and interpreting Jakarta OTR prices.
- Comparing standard equipment and features against purchase price.
- Understanding the ownership-cost estimates and their assumptions.
- How to verify warranty and after-sales support.

Use Bahasa Indonesia as the default. Provide a reviewed English equivalent for every public-facing page; do not mix languages in a single locale version. Localize currency, units, dates, and common automotive terms appropriately.

## 9. Interaction states and error handling

Every data-driven surface must handle:

- **Loading:** preserve final content geometry and show a meaningful skeleton, not a blank panel.
- **Empty:** explain why no cars match and offer a clear filter/answer reset or adjustment.
- **Error:** state what failed and provide a retry or a usable alternative.
- **Partial data:** show known facts alongside explicitly missing/stale information; do not hide uncertainty or imply completeness.
- **Unavailable service map:** keep searchable service-center results available in a list.
- **Unavailable browser storage:** explain that local saving is unavailable and keep the rest of the journey operable.
- **No comparison selections:** explain how to add a car and provide a return-to-results action.
- **Comparison limit reached:** explain the three-car limit and offer a replace/remove action.
- **Locale/theme persistence:** keep a deliberate user choice where storage permits, with a safe default when it does not.

Errors should identify the affected item, explain the cause when known, and offer an action to recover. Do not replace failed results with success-shaped empty data.

## 10. Visual and interaction direction

### Brand

- Product name: Carsea.
- Create an original, simple wordmark and a distinct Carsea visual identity; no existing Carsea assets were supplied.
- Identity: modern, credible, consumer-focused automotive research. Green is the requested brand color.
- Do not use literal ocean motifs as a defining visual device.
- Do not copy another product’s interface or treat the withdrawn DistroSea comparison as a design or interaction requirement.
- Never visually privilege one car manufacturer or create sponsor-style placements.

### Interface

- Use a deliberate green semantic palette, with accessible green accents in both light and dark themes. Select exact token values during design implementation and check contrast for each use.
- Use glassmorphism selectively for navigation, filters, or image overlays. Core prices, comparison figures, form fields, and long-form text must sit on sufficiently opaque, high-contrast surfaces.
- Keep vehicle imagery authentic, high quality, correctly licensed, and tied to the represented model/variant where possible. Do not use generic imagery as evidence of a specific trim.
- Keep browsing and comparison calm, legible, and scan-friendly. Avoid glass behind dense data, decorative gradients, fake data, unsupported precision, generic equal-card grids, and visual treatments that resemble paid promotion.
- Define consistent semantic tokens for color, typography, spacing, radii, borders, and focus states. Do not implement page-by-page raw color values.
- Light theme is the initial default. Provide a complete dark theme and a visible theme control; verify contrast and component states in both.

### Motion

- Motion intensity: restrained and purposeful.
- Animate meaningful state changes such as finder progression, filter application, compare add/remove, and disclosure. Keep frequent input and keyboard-initiated interactions immediate.
- No scroll hijacking, auto-rotating carousels, perpetual loops, decorative pulsing, or cursor effects.
- Respect `prefers-reduced-motion`; the final state and all tasks must remain available without animation.
- Prefer compositing-friendly opacity/transform changes and avoid animation-induced layout shifts.

### Responsive behavior and accessibility

- Design mobile-first and verify at 375px, tablet, desktop, and narrow landscape widths.
- No unintended horizontal page overflow. Comparison must adapt to a narrow viewport with meaningful grouping or a usable alternate layout, not hide important data in an unlabeled swipe region.
- Use semantic headings, landmarks, links, tables or equivalent comparison semantics, labels, instructions, and status announcements.
- Complete all core tasks with keyboard alone. Maintain visible focus and logical focus order; focus must not be hidden under sticky UI.
- Meet WCAG 2.2 AA for text contrast and interaction. Do not convey meaning by color alone.
- Ensure controls have an accessible name, state, and practical touch target. Support zoom and text enlargement without clipping.
- Provide meaningful alt text for informative imagery; mark decorative imagery appropriately.

## 11. Technical architecture

### Selected stack

- Next.js with TypeScript.
- Tailwind CSS using a project-owned design token layer.
- PostgreSQL for the production catalog and associated provenance records.
- Docker / Docker Compose for a portable self-hosted deployment.

The current repository does not contain a visible application package manifest or application implementation. Before implementation, verify the actual repository state and initialize the app only after confirming there is no existing stack to preserve.

### Application boundaries

- Keep public catalog, guide, methodology, and vehicle detail content server-rendered and indexable where appropriate.
- Isolate interactive finder, filtering, comparison, local saving, theme switching, and map interactions to small client-side components.
- Keep recommendation and ownership-cost rules in typed, testable domain modules separate from presentation code.
- Use a normalized source-aware catalog. At minimum, model vehicle, variant, price, feature/specification, warranty, service center, and source/verification records.
- Keep buyer shortlist data in browser storage; do not create buyer accounts for the MVP.
- Use PostgreSQL migrations and repeatable development seed data. Seed examples must be clearly non-production and must never be presented as verified launch-market facts.

### Data maintenance

- Start with a validated, curated CSV import workflow carrying source and verified-date fields.
- Validate required identifiers, variant matching, units, currency, dates, source references, duplicate records, and stale/invalid prices before publishing.
- Produce a reviewable import report with rejected rows and reasons. Do not silently drop bad or incomplete records.
- Do not build a public editor or complex internal CMS into the MVP unless CSV operations prove insufficient.
- Keep import tooling and update procedure documented for the people responsible for maintaining catalog data.

### Search, localization, and SEO

- Support localized Indonesian and English routes or an equivalent stable locale strategy.
- Bahasa Indonesia is the default locale, with a visible switch and preference persistence.
- Provide localized metadata, canonical URLs, sitemap, robots rules, and structured data only where the represented facts are complete and verified.
- Do not index transient query combinations or generated pages with duplicate or thin content.
- Format IDR, dates, units, and translated vehicle terminology consistently by locale.

## 12. Hosting, operations, and privacy

### Hosting

- Self-host on a Linux VPS. Provider remains open.
- Run the Next.js application and PostgreSQL in a Docker-based deployment. Keep secrets outside source control and inject them through deployment environment configuration.
- Use a reverse proxy with HTTPS/TLS renewal, health checks, restart policy, and documented deploy/rollback steps.
- Use persistent database storage. Maintain encrypted off-server backups and periodically test restoration.
- Separate development, staging/preview, and production configuration. Never load real secrets or production data into a public test environment.
- Monitor application and database health, resource use, scheduled data imports, and backup completion. Alert on failed deploys/imports/backups without exposing sensitive information.
- Choose a provider, domain, DNS, reverse proxy, and object/image-storage strategy during deployment design. Keep the app portable across providers.

### Privacy and security

- No registration or collection of personal contact details in the MVP.
- Request no precise geolocation by default. Let the buyer choose a supported region or enter a nearby area for the locator.
- Keep saved cars and finder inputs local to the buyer's browser unless a later, separately approved account feature is designed.
- Analytics are cookieless, aggregate, and privacy-preserving. Do not send personal identifiers, exact locations, detailed preference profiles, or free-text answers to analytics.
- Minimize retained server logs and redact secrets and sensitive request data.
- Apply standard web security protections, dependency updates, input validation, secure headers, rate limits where needed, and least-privilege database access.
- Publish a clear privacy notice and have terms/privacy language reviewed for the operating organization and applicable Indonesian obligations before launch.

## 13. Quality and acceptance criteria

The MVP is ready for release only when all of the following are true:

### Product behavior

- A new buyer can complete the guided finder, skip unknown answers, review/edit choices, and receive 3-5 relevant matches.
- Every recommendation explains its fit and trade-offs using the selected priorities and available evidence.
- A confident buyer can browse and filter without using the finder.
- A buyer can compare two or three identified vehicles/variants and can see unavailable, stale, and non-comparable information explicitly.
- A buyer can save and clear a shortlist locally without an account.
- Vehicle research includes price, feature/value breakdown, costs and assumptions, warranty, service support, and provenance where available.
- A Greater Jakarta service-center list remains useful even when map services are unavailable.

### Data trust

- Every material public fact has valid provenance, applicable scope, and a verification date.
- All prices are clearly identified by market, region, currency, variant, and validity context.
- Estimates are not represented as quotes or guaranteed bills.
- The monthly cost display separates the four requested components and does not conceal missing inputs inside a misleading total.
- Rankings have no paid influence and no manufacturer is promoted through sponsored placement.
- Unsupported or stale data cannot silently appear as verified current data.
- Catalog completeness and launch coverage are described accurately.

### Design, accessibility, and performance

- All public pages are bilingual with Bahasa Indonesia default and a visible English switch.
- Core tasks work at mobile, tablet, and desktop widths, including 375px, without unintended horizontal overflow.
- Keyboard-only operation, visible focus, accessible labels/states, screen-reader announcements, and reduced-motion behavior are verified.
- Both light and dark themes pass contrast and usability review.
- Motion does not block input or cause layout shift.
- Vehicle imagery has rights and alt text; content and controls remain usable if images fail.
- Measure Core Web Vitals on representative pages and set budgets appropriate to the deployed environment. Optimize responsive images, lazy-load below-the-fold media, and avoid shipping 3D libraries in the MVP.

### Operations

- A clean environment can build and start from documented instructions.
- Database migrations, CSV validation/import, application health checks, backups, restore, and rollback are documented and tested.
- No credentials, production private data, or analytics identifiers are committed.

## 14. Delivery phases

1. **Foundation and evidence:** inspect the actual repository and initialize the chosen stack only if needed. Confirm source availability, data rights, launch-region boundaries, cost-model inputs, and image rights.
2. **Product/design system:** create Carsea product context, wordmark, accessible green tokens, typography, light/dark themes, responsive primitives, and content voice. Keep the unrelated existing Claude-themed `DESIGN.md` out of Carsea's brand authority.
3. **Data and domain rules:** implement the normalized catalog, provenance model, CSV validation/import, explainable rules-based matching, and tested ownership-cost calculations.
4. **Core research MVP:** deliver home, guided finder, browse, recommendations, vehicle details, three-car comparison, local saving, guides, methodology, and service-center locator in both locales.
5. **Production hardening:** complete responsive/accessibility testing, data review, privacy and legal review, Docker VPS deployment, TLS, monitoring, backups/restore, rollback, analytics review, and operational handoff.
6. **Later exploration:** evaluate licensed, accurate 3D car color/accessory previews as a Phase 2 research aid. Do not ship a decorative or misleading 3D experience.

## 15. Open decisions and validation gates

These are not reasons to invent data or delay structural implementation; resolve them before public launch claims:

- Which manufacturers or authoritative providers permit reliable, current Greater Jakarta price and specification use, and under what terms?
- What is the actual source and update cadence for OTR prices, service schedules, tax inputs, insurance assumptions, warranty terms, and authorized service centers?
- Can data for all requested passenger-car powertrains support comparable recommendations and cost estimates? Limit displayed catalog coverage to evidence that passes validation.
- Which licensed image source can represent each exact vehicle/variant, and what attribution or usage rules apply?
- Which Linux VPS, domain, DNS, TLS reverse proxy, and production image-storage arrangement will be selected?
- Which analytics implementation meets the cookieless aggregate requirement without exporting personal buyer preferences?
- Confirm final legal entity, terms, privacy notice, and Indonesian compliance obligations with appropriate review.

## 16. Decisions recorded from the product interview

- Market: Indonesia.
- Initial buyers: everyday private buyers.
- Initial inventory: new cars only.
- Comparison limit: three cars.
- Price and service launch coverage: Jakarta / Greater Jakarta.
- Languages: Bahasa Indonesia and English, with Bahasa Indonesia default.
- Entry experience: guided finder and direct browse/filter.
- Recommendation output: 3-5 strongest matches, transparent rules-based ranking and reasons.
- Value for money: transparent equipment/features relative to purchase price; no opaque universal score.
- Affordability: OTR price plus separate monthly estimates for fuel/electricity, scheduled servicing, annual tax, and insurance. No loan estimates in MVP.
- Monthly fuel assumptions: ask for monthly distance and disclose an editable starter assumption.
- After-sales: verified warranty/network details and a Greater Jakarta service-center locator.
- Guides: budget/OTR/ownership costs plus equipment and value-for-money.
- Independence: no sponsorship, paid placements, dealer leads, or paid ranking in MVP.
- Content: sourced facts and calculations only; no open user reviews at launch.
- Saving: local and account-free.
- Visual direction: original Carsea wordmark and identity; green automotive brand; selective glassmorphism; no literal ocean motif and no manufacturer promotion.
- Themes: light-first with a complete dark theme.
- Motion: restrained, purposeful, reduced-motion aware.
- 3D: defer color/accessory configurator to Phase 2; use appropriate real photography in MVP.
- Stack: Next.js, TypeScript, Tailwind CSS, PostgreSQL.
- Hosting: self-hosted Linux VPS with Docker; provider open.
- Data upkeep: validated, source-aware CSV imports.
- Analytics: aggregate, cookieless, no PII or detailed preference profiles.
- Delivery target: production-ready MVP.
