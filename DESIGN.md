---
name: Carsea
description: Independent new-car research for Indonesia, recorded like a stamped service booklet.
colors:
  cover-green: "#0e5c3f"
  cover-green-deep: "#0a4a32"
  on-cover: "#f4f7f3"
  on-cover-muted: "#bfe0cd"
  page: "#f4f7f3"
  surface: "#ffffff"
  ink: "#12201a"
  ink-muted: "#46584e"
  rule: "#b9c8be"
  hatch: "#dbe4dd"
  accent-green: "#0b6b45"
  stamp-violet: "#5b3fd1"
  stamp-wash: "#f0edfb"
  dark-page: "#0c1612"
  dark-surface: "#13211b"
  dark-ink: "#e9f1ec"
  dark-ink-muted: "#a3b8ac"
  dark-rule: "#2f463b"
  dark-rule-strong: "#8fa79a"
  dark-accent-green: "#5fd39b"
  dark-stamp-violet: "#ab9bff"
  dark-stamp-wash: "#231f3d"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.125rem, 7.4vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.75rem, 4.4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 112"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  figure:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
    fontFeature: "'tnum', 'lnum'"
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.07em"
    fontVariation: "'wdth' 75"
rounded:
  none: "0"
  stamp: "9999px"
spacing:
  gutter: "20px"
  gutter-wide: "32px"
  cell: "20px"
  cell-wide: "24px"
  section: "96px"
  section-wide: "128px"
components:
  button-primary:
    backgroundColor: "{colors.cover-green}"
    textColor: "{colors.on-cover}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.cover-green-deep}"
  button-outline:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
  button-on-cover:
    backgroundColor: "{colors.on-cover}"
    textColor: "{colors.cover-green}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  stamp-verified:
    textColor: "{colors.stamp-violet}"
    typography: "{typography.label}"
    rounded: "{rounded.stamp}"
    padding: "4px 12px"
  cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.cell}"
  cell-selected:
    backgroundColor: "{colors.stamp-wash}"
  header:
    backgroundColor: "{colors.cover-green}"
    textColor: "{colors.on-cover}"
    height: "64px"
---

# Design System: Carsea

## Overview

**Creative North Star: "The Stamped Service Booklet"**

Carsea looks like the service booklet kept in an Indonesian glovebox: a green cover, ruled pages divided into cells, and a rubber stamp wherever something has been checked. The product's promise is that every fact carries its source and date, so the interface makes that literal. A fact lives in its own cell. A stamp says what state it is in. An empty cell is drawn as empty rather than filled with a guess.

The system is flat, square, and ruled. Green is used at the scale of whole regions, not as an accent. Violet appears only as stamp ink, for verification and for the buyer's own selections. Type is one variable family used at two extremes: wide and heavy for titles, narrow capitals for labels and stamps.

Nothing here may look like advertising. There are no promotional badges, no brand logos, and no decorative imagery.

**Key Characteristics:**
- Green cover regions alternate with ruled booklet pages.
- Content sits in square-cornered cells separated by hairline rules.
- Stamps are the only rounded shapes and the only tilted ones.
- State is carried by stamp shape and wording, never by color alone.
- Light theme by default, with a full dark theme.

## Colors

A deep booklet green, a cool green-white page, near-black green ink, and one violet stamp ink.

### Primary
- **Cover Green** (#0e5c3f): Whole regions: the header, the opening cover, the independence section, and the filled primary button. Text on it is On-Cover (#f4f7f3) or On-Cover Muted (#bfe0cd).
- **Cover Green Deep** (#0a4a32): Hover state of the primary button only.
- **Accent Green** (#0b6b45, dark theme #5fd39b): Small green marks on a page, such as the arrow in an index row.

### Secondary
- **Stamp Violet** (#5b3fd1, dark theme #ab9bff): Verified stamps, the selected-cell stamp, focus rings, text selection, and the caret.
- **Stamp Wash** (#f0edfb, dark theme #231f3d): Background of a selected cell.

### Neutral
- **Page** (#f4f7f3, dark #0c1612): The ground behind sheets.
- **Surface** (#ffffff, dark #13211b): Cells and sheets.
- **Ink** (#12201a, dark #e9f1ec): Text and the strong outer rule of a sheet (dark theme rule #8fa79a).
- **Ink Muted** (#46584e, dark #a3b8ac): Supporting text, cell labels, stale stamps.
- **Rule** (#b9c8be, dark #2f463b): Hairlines between cells.
- **Hatch** (#dbe4dd, dark #1c2e26): Diagonal hatching in a deliberately empty cell.

### Named Rules
**The Region Rule.** Green covers whole bands of the page edge to edge. It is never a scattering of small green accents on a neutral layout.

**The Stamp Ink Rule.** Violet means "checked" or "chosen by you". It is not used for decoration, links, or headings.

**The Opaque Data Rule.** Prices, figures, form fields, and long text sit on opaque Surface or Cover. Translucency is allowed only on the header.

## Typography

**Display, Body, and Label Font:** Archivo variable, using its width axis (with Helvetica Neue, Arial, sans-serif)

**Character:** One family at two extremes. Expanded heavy letters give titles the breadth of lettering on a car's tailgate; condensed bold capitals read as form labels and stamp text.

### Hierarchy
- **Display** (800, width 125, clamp(2.125rem, 7.4vw, 5.5rem), 1.04): The page's main heading on the cover. Maximum 16 characters per line.
- **Headline** (800, width 125, clamp(1.75rem, 4.4vw, 3rem), 1.04): Section headings. The independence heading runs larger, up to 4rem.
- **Title** (700, width 112, 1.125rem to 1.75rem, 1.2): Row titles, the finder question, sub-headings.
- **Body** (400, width 100, 1rem to 1.25rem, 1.55): Running text, 58 to 65 characters per line.
- **Figure** (700, tabular lining numerals, 1.125rem to 1.375rem): Prices and values inside cells.
- **Label** (700, width 75, 0.8125rem, 0.07em tracking, uppercase): Cell labels, stamps, buttons, and the language switch.

### Named Rules
**The Two Widths Rule.** Titles go wide and labels go narrow. Do not set headings in the regular width or labels in the expanded one.

**The Word Space Rule.** Archivo's word space is tight. Body text carries 0.08em extra word spacing, titles 0.14em, figures 0.16em, labels 0.2em.

## Layout

A single centered container, 72rem wide, with 20px side gutters that grow to 32px from 640px. Sections are separated by 96px, growing to 128px.

Content is organised as sheets: a bordered block whose interior is a grid of cells. Rules between cells are drawn by a 1px grid gap over a Rule-colored ground, so cells never carry their own inner borders. The finder question uses two columns on small screens and five from 1024px; fact cells use one, two, then four columns. The cover continues the same column rules up behind the heading as faint hairlines, so the cover and the sheet share one module.

Heading-and-text pairs use a 5:7 split on wide screens and stack on narrow ones. Lists of topics are ruled index rows, not cards. The first sheet overlaps the bottom of the cover by 112px.

## Elevation & Depth

Flat. Depth comes from rules, tonal change between Page and Surface, and overlap.

### Shadow Vocabulary
- **Sheet** (`box-shadow: 0 1.25rem 2.5rem -1.25rem rgb(6 32 22 / 0.55)`): Only on a sheet that overlaps the cover, to lift it off the green.

### Named Rules
**The One Lift Rule.** A shadow appears only where a page physically overlaps the cover. Cells, buttons, and the header carry none.

## Shapes

Everything is square-cornered: sheets, cells, buttons, the header, the mark. Stamps are the exception: fully rounded outlines, rotated five degrees anticlockwise. A verified stamp has a second, thinner ring outside the first. An estimate stamp has a dashed outline. A stale stamp is a square-cornered outline in muted ink. Sheets have a 1px Ink border; cells are divided by 1px Rule hairlines.

The mark is a square cell holding a "C" drawn as a stamp ring, tilted twelve degrees.

## Components

### Buttons
- **Shape:** Square corners, 48px tall, 20px horizontal padding, Label type, optional trailing arrow icon.
- **Primary:** Cover Green fill with On-Cover text. One per sheet.
- **Outline:** 2px Ink border, transparent ground; inverts to Ink fill on hover.
- **On cover:** On-Cover fill with Cover Green text, for use on green regions.
- **Hover / Active:** 150ms color change; 1px downward shift while pressed.

### Cells
- **Style:** Surface ground, 20px padding (24px from 640px), separated by hairlines.
- **Fact cell:** Label, then figure, then stamp, then a source note pinned to the bottom.
- **Empty cell:** Diagonal hatch ground, muted value text, and the word for "empty" in place of a stamp.
- **Selectable cell:** A whole-cell label around a hidden radio. Unselected shows an empty ring; selected takes the Stamp Wash ground and a stamp.

### Stamps
- **Verified:** Violet double ring.
- **Estimate:** Ink dashed outline.
- **Stale:** Muted square outline.
- **Press:** A selection stamp arrives in 180ms, from larger, blurred, and more tilted to its resting state. It is static under reduced motion. This is the system's only authored animation.

### Navigation
- **Header:** 64px sticky bar in Cover Green at 94% opacity with background blur. Wordmark at left; links, a two-letter language switch, and a theme toggle at right. Below 768px the links move into a disclosure menu that opens as a solid green panel.
- **Footer:** Wordmark with the violet stamp ring, a one-line description, and underlined secondary links.
- **Focus:** 3px outline offset 3px, violet on pages and On-Cover on green.

### Page cover
Every inner page opens with a Cover Green band holding the page title (Display, up to 3.75rem) and one supporting line. Content follows on the Page ground.

### Choice cells
Finder answers and the home budget question. A ruled grid of whole-cell labels around hidden radios or checkboxes. Unselected cells show an empty ring (single choice) or empty square (multiple choice); a selected cell takes the Stamp Wash ground and a pressed stamp.

### Lists and tables
- **Index rows:** cars, guides, and service centres are ruled rows inside one sheet, never separate cards.
- **Comparison:** a real table from 768px, cars as columns, with group header rows on the Page ground. Below 768px each attribute becomes a block that lists every car, so no value sits off-screen.
- **Toggle buttons:** Compare and Save are outline buttons that switch to a violet border, Stamp Wash ground, and a check when on.

### States
- **Empty sheet:** hatched ground, a plain statement of why it is empty, and the way forward.
- **Notice:** a dashed-outline strip for sample data, limited results, missing evidence, and unavailable storage.
- **Skeleton:** flat Hatch-colored bars in the shape of the rows to come. No shimmer.
- **Unknown and not applicable** are always written out in muted text.

### Icons
Authored SVG, 20px, 1.75 stroke, square caps and mitred joins.

## Do's and Don'ts

### Do:
- **Do** give each fact its own cell with a label, value, stamp, and source note.
- **Do** state missing, estimated, and stale data in words and stamp shape.
- **Do** keep green at region scale and violet for stamps only.
- **Do** keep every corner square except stamps.
- **Do** label illustrative data as illustrative in a visible caption.

### Don't:
- **Don't** use glass or blur anywhere except the header.
- **Don't** add shadows to cells, buttons, or cards.
- **Don't** use promotional badges, manufacturer logos, or sponsor-style placements.
- **Don't** use ocean imagery or wave motifs.
- **Don't** add looping, scroll-driven, or decorative motion.
- **Don't** build pages from grids of identical rounded cards.
