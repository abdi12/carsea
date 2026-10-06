# Launch checklist

The acceptance criteria from SPEC §13, with what has been checked and what
still needs a person. "Checked" means checked against the fictional sample
data on a local stack, in a headless browser.

## Checked

| Area | What was done |
|---|---|
| Finder, recommendations, compare, save | Driven end to end in a browser, desktop in Indonesian and phone in English |
| Missing, stale, and non-applicable data | Shown in words in recommendations, car pages, and comparison |
| Cost estimate | Four separate components; a missing one is named and the total becomes a subtotal. Covered by unit tests |
| Ranking independence | Unit test: order is unaffected by make or input order |
| Bilingual pages | Every page exists in both locales; a test fails if the two dictionaries differ |
| Narrow screens | No horizontal overflow at 375, 390, and 1440 px on every page |
| Accessibility, automated | axe-core, WCAG 2.2 AA rules: no violations on 12 pages, both themes, desktop and phone, Indonesian locale |
| Layout stability | Layout shift under 0.1 on eight pages with a throttled connection |
| Clean build and start | Docker image builds and runs from the repository alone |
| Migrations and import | Run through the tools container |
| Backup and restore | Encrypted dump, deliberate damage, restore, contents identical |
| Rollback | Manual rollback, and automatic rollback of a release that fails its health check |
| No secrets committed | `.env` files, deploy state, and backups are gitignored |

## Needs a person

| Area | What is left |
|---|---|
| **Real data** | No real vehicle, price, or service-centre data exists. Sources, usage rights, and update cadence are undecided (SPEC §15) |
| **Photography** | No licensed imagery; car pages have none |
| **Legal** | Privacy and terms are drafts that describe the software. They need review for the operating entity and Indonesian requirements |
| **Editorial** | The guides and the English text were written in one pass and need review by a fluent editor |
| **Freshness windows and default distance** | Working assumptions in `src/domain/provenance.ts` and `ownership-cost.ts` |
| **Accessibility, manual** | A screen-reader pass (TalkBack, VoiceOver, NVDA), a full keyboard pass, 200% zoom, and the English locale under axe. Automated checks cannot cover these |
| **Real devices** | All testing was in headless Chromium. Check Safari, Firefox, and real Android phones |
| **Performance in production** | Load and layout-shift figures are from a local machine. Measure Core Web Vitals on the real server and set budgets |
| **Infrastructure** | Server, domain, DNS, off-server backup destination, and monitoring are not chosen. Nothing has run on a real host or with a public certificate |
| **Service-centre map** | The locator is a searchable list with no map |
| **Analytics decision** | A first-party daily counter was implemented to meet the cookieless, aggregate requirement. Confirm it is the approach wanted |
| **Dependency audit** | Review `npm audit` findings before launch |
