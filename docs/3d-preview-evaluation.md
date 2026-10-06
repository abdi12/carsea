# Evaluation: 3D colour and accessory preview

SPEC §14 phase 6 asks whether an interactive 3D preview of a car's colours
and accessories would help buyers research, and under what conditions it
could ship without being decorative or misleading. This is that evaluation.
No 3D code or library has been added to the product.

## Recommendation

**Do not build it now.** Three things it depends on do not exist: a real
catalog, licensed imagery, and any rights to 3D models of real cars.

**Do the cheap part first.** Colour and accessory information can be
delivered as sourced facts, in text with swatches, using the catalog
Carsea already has. That delivers most of the research value, costs no
performance, and tells us whether buyers want more.

**Build 3D only if the gates below are passed**, in order. The most likely
place it stops is licensing.

## What the feature would have to do

A buyer choosing between cars rarely needs to rotate one. What colour and
accessory information can actually change:

- **Price.** Some colours carry a surcharge; accessories add cost. This
  belongs next to the OTR price.
- **Availability.** A colour or accessory may exist only on some variants.
- **Expectation.** Seeing roughly what a colour looks like on the body.

Only the third needs a picture, and a photograph does it more truthfully
than a render. So 3D earns its place only if it shows something photos
cannot: every colour on every variant, where photographing each
combination is impractical.

## Why it could mislead

| Risk | Why it matters here |
|---|---|
| Colour is wrong | A screen cannot reproduce metallic or pearl paint, and every phone displays colour differently. A render looks authoritative and is not |
| Shape is wrong for the variant | Wheels, bumpers, lamps, and trim differ between variants and model years. A model of the top trim shown on the base trim's page is a false statement about the car |
| Accessory shown is not offered | Fitted in the preview, unavailable on that variant or in Jakarta |
| It becomes decoration | A spinning car on the page is the advertising look Carsea's design system rules out |

Carsea's rule is that every fact carries a source and that nothing implies
more certainty than exists. A 3D preview is a bundle of visual claims, and
each one needs the same treatment.

## Conditions for an accurate preview

1. The model represents the **specific variant and model year** on the page,
   or the page says plainly which variant it shows and how they differ.
2. Each colour is a catalog fact: official name, manufacturer code, finish
   type, availability per variant, any surcharge, source, checking date.
3. Each accessory is a catalog fact with the same provenance and its price.
4. The preview states that on-screen colour is approximate.
5. Everything the preview shows is also available as text, so nothing
   depends on the 3D view.
6. Rights to the model and to showing the car's design are confirmed in
   writing.

## Assets and rights

This is the hardest part and needs legal advice, not an engineering
opinion. The routes, and what would have to be confirmed for each:

| Route | Accuracy | What must be confirmed |
|---|---|---|
| Supplied by the manufacturer | Highest | That they will license it at all, and that the terms put no condition on ranking, placement, or coverage. Any such condition conflicts with Carsea's independence and should end the conversation |
| Commissioned from a 3D artist | Depends on references and review | Whether reproducing and displaying a real car's design and badges this way is permitted for Carsea's use |
| Bought from a model marketplace | Unverified; often not variant-specific | The licence. Models of branded products are frequently restricted to editorial use, and that needs checking per model |
| Scanned from a real car | High for that one car | Same design-rights question as commissioning, plus access to every variant |

A model shown for one make and not others is also a fairness problem: it
would visually privilege that make, which the product forbids. Coverage
would need to be even across the makes on a comparison, or the feature
should stay off comparison pages.

## Technical approach, if it goes ahead

**Format.** glTF 2.0 binary. Colours as the Khronos `KHR_materials_variants`
extension: one model, switchable materials, so twelve colours cost little
more than one. Geometry compressed with Draco or Meshopt, textures as KTX2.

**Viewer.** Two candidates, measured from their published builds:

| Option | Download (gzip) | Notes |
|---|---|---|
| `@google/model-viewer` 4.3 (Apache-2.0), bundled with three.js | 285 KB | A web component with material variants, keyboard orbit, and poster image built in |
| three.js 0.183 (MIT) with a custom viewer | 84 KB core, plus loaders and our own controls | Smaller, but we build and maintain the interaction and accessibility ourselves |

For scale: all of Carsea's JavaScript today is about 190 KB gzipped, and a
whole page transfers about 250 to 265 KB. The ready-made viewer alone is
larger than the entire current site, before any model is downloaded.

**Loading.** Nothing 3D in any page's initial download. The viewer and the
model load only after the buyer presses a button that says what it will do
and how large it is. Until then the page shows a still image.

**Things to verify in a prototype, not assumed here:**

- The viewer's decoders are fetched from a Google CDN by default. They would
  have to be self-hosted, and the Content-Security-Policy extended to allow
  WebAssembly and workers. Confirm the exact directives needed.
- Model files are megabytes each. They need object storage or a CDN, which
  is not chosen (SPEC §15).

**Budgets to hold it to.** Proposed, to be confirmed on real devices:

| Measure | Budget |
|---|---|
| Added to initial page load | 0 bytes |
| One compressed model with all colours | 3 MB or less |
| Press to interactive, mid-range Android on 4G | 5 seconds or less |
| Frame rate while rotating | 30 fps or more |
| Layout shift when the viewer opens | None; the still image reserves the space |

## Accessibility and motion

- Colour names, codes, surcharges, and availability are text, always.
- The viewer is operable by keyboard and has a text description.
- No auto-rotation. Rotation happens only when the buyer asks, which also
  satisfies the reduced-motion rule and the design system's ban on loops.
- If WebGL is unavailable or the model fails to load, the still image and
  the text remain, with a plain message.

## What it would add to the catalog

All three follow the existing pattern: one fact per row, each with
`source_id` and `verified_on`, loaded by CSV.

| Table | Holds |
|---|---|
| `variant_colors` | Name, manufacturer code, finish type, availability, surcharge, a display swatch |
| `variant_accessories` | Name, category, price, availability, whether dealer- or factory-fitted |
| `variant_models` | Asset path, which variant and year it represents, licence, attribution, known differences from the variant |

The existing `variant_images` table already carries licence and attribution
for photographs.

## Staged path

Each stage ends in a decision. Stop at the first one that fails.

| Stage | Work | Go on only if |
|---|---|---|
| 0. Prerequisites | Real catalog and licensed photography live | Carsea has launched with real data |
| 1. Facts without 3D | Add colours and accessories as sourced text with swatches and surcharges. Count how often the section is opened | Buyers use it, and sources for colour and accessory data prove reliable |
| 2. Rights | Secure models for three to five cars across at least two makes | Written rights exist, with no condition touching ranking or coverage |
| 3. Prototype | Viewer behind a noindex page. Measure the budgets on real phones | Every budget is met |
| 4. Usefulness | Put it in front of buyers next to the photo-and-text version | It measurably helps them decide, rather than merely being liked |
| 5. Ship | Roll out only where a verified model exists | Coverage is even enough not to favour a make |

**Stop if** rights cannot be had on independent terms, if models cannot be
kept accurate per variant and model year, if the budgets cannot be met on
mid-range phones, or if stage 4 shows no research benefit.

## Decisions needed from the owner

1. Is stage 1 (colours and accessories as sourced facts, no 3D) wanted for
   the next release? It is useful on its own and commits to nothing further.
2. Is approaching manufacturers for assets acceptable at all, given the
   independence commitments?
3. Is there budget for legal advice on showing models of real cars?
4. Would uneven coverage (some makes with a preview, others without) be
   acceptable on single-car pages, if never on comparisons?
