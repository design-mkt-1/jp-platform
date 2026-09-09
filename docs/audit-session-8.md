# Session 8 — pressing every button on the deployed build

Walked on 2026-09-09 against https://design-mkt-1.github.io/jp-platform/ (commit `dd2886e`), at 390,
768, 1024, 1279 and 1440, in all three auth states. The report was written before anything was
fixed, and it is left as written — the measurements below are the *before*.

## Status, 2026-09-09 — what the owner picked, and what it now measures

| # | finding | state | measured after |
| - | ------- | ----- | -------------- |
| 1.1 | the four category tabs do nothing | **fixed** | Popular 90 cards → Slots 40 → Live Casino 6 → Popular 90, `aria-pressed` following. Real mouse click |
| 1.2 | search: Enter, ArrowDown, picking a suggestion | **fixed** | ArrowDown moves focus to the first row; Enter commits; picking a game puts its matches on the page |
| 1.4 | five inert rows in the account menu | **fixed** | see §2.3 below |
| 1.5 | game cards ignore the pointer | **fixed** | hover lift + ring + press, `motion-reduce` keeps the ring and drops the movement |
| 2.1–2.4 | both header popovers pinned to a viewport corner | **fixed** | at 1440 and 1024, both panels: left edge delta **0px**, top-to-trigger-bottom **8px** — the exact relationship Figma draws |
| 2.8 | `<time dateTime>` publishes a past date | **fixed** | the attribute now carries the rolled-forward instant and is constant across a period |
| 3.1–3.2 | tab-bar marks small, three of them the wrong drawing | **fixed** | Casino / Sport / Promos now **22×22 = 100%** of the box; Live Casino 17.77×22, which is what node `1:8249` actually is. Path data byte-identical to the Figma exports |
| 3.3 | 768–1279 nav is a sliver | **fixed** | the six links collapse into a burger below 1280. All six reachable at 768, 1024 and 1279; header stays 81px |
| — | countdown period | **changed to 24h** | owner's decision. The editorial cost stands: the copy still reads "Weekly tournament active" |

**Still open, not picked:** 1.3 (thirteen inert `See All (206)` pills), 2.5 ("More" opens a corner
popover on a phone), 2.6 (Sport / Casino / Payments draw a chevron and navigate), 2.7 (the provider
filter's results ride a 40s marquee), 2.9 (the no-results copy points at categories that are not in
the panel), 3.4 (four labels for two auth buttons), 3.5 (six SVGs still carry the Figma artboard).

**How it was driven.** `resize_window` was confirmed lying again: it reported success on a maximised
Chrome while `innerWidth` stayed 2552. So the rig is a same-origin host page holding one `<iframe>`
sized to the viewport under test, scrollbars hidden inside the frame. Frame DOM is readable and
drivable directly; screenshots come from the frame, and anything about a small glyph was confirmed
at 8x from a clean PNG rather than from the downscaled JPEG a screenshot returns.

**What is not in here.** `docs/next-session.md` §5 (thirteen deliberate differences) and §6 (five
things verified against Figma and closed) were checked before anything was written down. Several
items a fresh pass would "discover" are on those lists and are deliberately absent below.

---

## The one number

On the desktop homepage there are **49 visible controls**. Classified by what they actually do:

| | count | what happens |
| - | - | - |
| work | **8** | does what the label says |
| navigate to a route that does not exist | **19** | lands on our `not-found` page |
| do nothing at all | **15** | no handler, no href |
| point at `example.com` | **7** | the partner logos |

Judged as an online casino, that is the finding the rest of this document breaks down.

---

## Rank 1 — dead controls

### 1.1 The four category tabs do nothing

`POPULAR` / `SLOTS` / `LIVE CASINO` / `JACKPOTS` — the primary content filter of the homepage.

Pressed with a **real mouse click** at 1440 (not a scripted one). Before and after: `aria-pressed`
stays `Popular=true, Slots=false, Live Casino=false, Jackpots=false`; the URL does not change; the
article count stays 90. Only focus moved.

They are `<button aria-pressed="…">` — so they announce themselves to a screen reader as a toggle
group, the selected one carries the design's only cyan ring, and pressing any of them changes
nothing. `CategoryPill` renders an `<a>` when given an `href` and a `<button>` otherwise; the
docblock says "whether a tab navigates or only changes in-page state is the caller's decision", and
`CategoryNavBar` passes neither an `href` nor an `onClick`.

This is the single most visible dead control in the app.

### 1.2 The search funnel ends in nothing

Three separate failures in the control the owner singled out.

- **Clicking a suggestion does nothing.** Type `swe`, four results appear, click *Sweet Bonanza* —
  the panel closes and that is all. `SearchOverlay.tsx:190` `selectGame` is
  `pushRecent(game.title)` then `closeSearch()`. No navigation, no filter, no state.
- **Enter does nothing.** With four results on screen, Enter leaves the panel open and selects
  nothing. `SearchSuggestions.tsx`'s own docblock says the lit first row "marks the best match —
  the row Enter would take you to". Enter is not wired anywhere.
- **ArrowDown does nothing.** Focus stays in the field. The suggestions are reachable only by Tab.
  The field has no combobox semantics at all — no `role="combobox"`, no `aria-expanded`, no
  `aria-controls`, no `aria-activedescendant`; the rows are plain `<button>`s in a `<ul>` with no
  `role="option"`.

The rest of the search is sound: popular-search chips fill the field and re-query, the recent-search
remove buttons work and are properly labelled, `Clear search` works, the no-results state appears.

### 1.3 Thirteen "See All (206)" pills do nothing

Every row header carries one. None has an `href` or an `onClick`. The `206` is
`SEE_ALL_TOTAL` in `src/lib/sections.ts:43` — a constant, because "every games header in the desktop
design reads See All (206)". The catalogue in `games.json` holds **60** games, so every row offers
to show 206 of something it does not have. The count is Figma's own placeholder; the pill being
dead is ours.

### 1.4 Five of the six account-menu rows do nothing

`Wallet`, `History`, `Invite Friends`, `Bonuses`, `Profile` are `<button>`s with no `onClick`
(`PersonalInfoPanel.tsx`), each carrying a full hover, active and focus-visible treatment. Only
`Sign out` is wired, and it works — it flips the header to pre-login.

The code comment says they "lead nowhere in the demo … so they stay inert". That is a defensible
decision; the outcome on screen is five rows that light up under the cursor and swallow the press.

### 1.5 The game cards do not respond to a pointer at all

90 `<article>` cards on the homepage. The card class is
`relative block aspect-[203/264] w-full overflow-hidden rounded-2xl border … shadow-…` — no
`hover:`, no `group`, no `transition`, no cursor change, nothing on press.

That the cards are `<article>` and not links is a recorded decision (§5, no game pages exist) and is
not re-opened here. A hover lift or a scrim is independent of whether there is an `href`, and its
absence is why the grid reads as a picture of a casino rather than a casino.

---

## Rank 2 — controls that work but behave wrongly

### 2.1 The balance popover is not attached to the balance pill

The clearest "the dropdown is horror" case, and it is measurable against the design.

| | trigger | popover |
| - | - | - |
| Figma `1:4118` | x 911, w 145 | x **911** (= trigger's left edge), y +48 |
| ours | x 937 → 1059 | x **1104** → 1424, y 88 |

Our popover starts **45px to the right of where the trigger ends**. It opens under the `DEPOSIT`
button and the username pill — two controls it has nothing to do with. Figma hangs it straight down
from the pill, left edges flush, 8px below. The vertical gap is 28px against Figma's 8.

### 2.2 The account dropdown drifts the same way

Figma `1:4155`: trigger at x 1192 w 171, popover at x **1192**, top **70**.
Ours: trigger [1192, 22]–[1360, 58], popover [1253, **88**]–[1424, 421] — **61px right and 18px
low**.

### 2.3 …and it is one cause, not two

`Panel.tsx:143`:

```
const ALIGN_CLASSES = { right: 'items-start justify-end p-4 pt-[88px]', … }
```

on a `fixed inset-0 flex` container. **Every header popover is pinned to the viewport's top-right
corner and never reads its trigger's position.** At 1440 that is `right: 1440−16 = 1424` and
`top: 88` — exactly the two numbers both panels measure at.

The account menu looks *nearly* right only because its trigger happens to be the right-most thing in
the header, so the fixed corner almost coincides with it. The balance pill is 167px further left,
and the same code puts its panel in the same corner. `pt-[88px]` is also a magic number for "below
the header", which measures 81px tall.

### 2.4 Neither header dropdown has an open state

With the panel open, both chevrons compute `transform: none` — they do not rotate. Neither trigger
carries `aria-expanded`, `aria-haspopup` or `aria-controls`, so a screen-reader user gets no signal
that anything opened.

The codebase disagrees with itself here: `CategoryNavBar`'s search trigger sets
`aria-haspopup="dialog"` and a live `aria-expanded`, and the provider-search button flips
`aria-expanded` false→true correctly. Only the two `Panel` triggers are silent.

### 2.5 "More" in the mobile menu swaps a full-screen sheet for a desktop popover

At 390, in the Jackpot menu, `More` carries a chevron-down — the universal "this expands here"
affordance. Pressing it **closes the whole menu** and opens `PersonalInfoPanel`: a 171px-wide box
pinned to the top-right corner of the phone (same `Panel` corner as above), floating over the page,
containing the same five inert rows and `Sign out`.

`JackpotMenu.tsx:236` is explicit — "the design's disclosure has no second level in the data, so it
opens the personal-information panel". The decision is reasonable; the result on a phone is not.
That panel has no mobile treatment at all.

### 2.6 Sport, Casino and Payments promise a submenu and navigate instead

Three of the ten mobile-menu rows render a second glyph — a chevron — after their label: `SPORT`,
`CASINO`, `PAYMENTS`. All three are `<a>`. `Sport` and `Payments` go to routes that do not exist;
`Casino` goes to `/`, which is the page you are already on, so tapping it just closes the menu.
The other seven rows have no chevron and behave identically.

### 2.7 The provider filter's results ride a 40-second marquee

Type `net` in the Leading Providers filter: one match, NetEnt. The match is rendered inside
`.animate-marquee` (`marquee-left`, 40s), so it keeps sliding. Band x sampled over 5s: −49, −57,
76, 69, 62. The matched badge measured at x=55 while its clipping container starts at x=80 — **25px
of the only search result is cut off by the edge**, and it is off-screen for part of every cycle.
The popover itself sits over the top-right of the row where results appear.

Under `prefers-reduced-motion` the marquee stops, so this is the default-motion case only.
The filtering itself is correct — `net` → NetEnt, `xyzgame` → the no-results state.

### 2.8 All four countdowns publish a date in the past

Measured live at 12:29 UTC on 2026-09-09: four `<time>` elements, every one of them
`dateTime="2026-09-08T18:12:36Z"` — yesterday — while the visible text reads `149h : 43m : 12s`
counting *forward*. `PromoBanner.tsx:212` and `PromoBannerMobile.tsx:196` emit the raw `endsAt`
rather than the rolled-forward instant. A screen reader or a scraper reads a deadline that has
already passed. Independent of which countdown period is chosen.

### 2.9 The search no-results copy points at nothing

"No games found / **Try a different search term or browse our categories below**". The panel below
that line contains one button, `Clear search`, and no categories. The category pills are in the same
bar as the field — to the left and above the panel, never below it.

---

## Rank 3 — drift against the design

### 3.1 The mobile tab-bar icons really are smaller — the owner is right

Measured with `svg.getBBox()` plus stroke, converted to CSS px. All four outer marks sit in a 22px
box; the Menu hamburger sits in a 20px box:

| tab | painted | fills its box |
| - | - | - |
| Casino | 18.0 × 13.9 | 82% × **63%** |
| Live Casino | 14.8 × 13.7 | 67% × 62% |
| Sport | 16.5 × 16.5 | 75% × 75% |
| Promos | 16.5 × 16.5 | 75% × 75% |
| Menu | 18.8 × 17.2 | 94% × 86% |

Figma's Casino mark, rasterised from the 390-wide render of node `1:8235` and bbox-scanned, paints
**22 × 22 — 100% of the box**. Ink coverage: ours 28.5%, Figma 37.6%.

**Cause.** The hand-drawn paths in `MobileNavBar` use a `0 0 24 24` viewBox but the geometry only
spans ~18 × 13.6 of those units, so at a 22px box the mark lands at 18 × 14. The box matches the
design; the drawing inside it does not fill the box. The Menu hamburger, which was not redrawn the
same way, is the one that looks right — at 94% × 86%.

This corrects the premise the session started from, which was that the metrics were identical and
only the ink weight differed.

### 3.2 Three of the five marks are the wrong drawing, not just the wrong size

Rendered side by side at 8x from clean PNGs at the same 390 width:

- **Live Casino** — Figma draws one playing card **plus a stack of chips**. Ours draws two
  overlapping cards with a heart. The chips are absent.
- **Sport** — Figma draws a football with filled pentagon panels. Ours is a thin circle with a
  five-point star, which reads as a flower.
- **Promos** — Figma draws a scalloped seal/badge outline around the `%`. Ours is a plain circle.
- **Casino** — same subject, but ours adds a lever knob on the right that Figma does not draw.

`scripts/clean-svg.mjs` learned to strip the Figma artboard in `dd2886e`, so two of the three
reasons `MobileNavBar` gave for redrawing these by hand no longer apply.

### 3.3 768–1279 is worse than the docs record, and nobody had measured 768

| width | header nav window | nav content | game card |
| - | - | - | - |
| 768 | **33px** | 569px | 91px |
| 1024 | 289px | 569px | 134px |
| 1279 | 544px | 569px | 177px |
| 1440 | 569px | 569px | 203px |

Nothing overflows at any width — `scrollWidth` equals the viewport throughout, which is session 5's
fix holding. But at 768 the six primary nav links live behind a **33px** slot: the header renders
`CAS`, clipped mid-word, between the logo and the balance pill. The docs record the 1024 case
(§8, "a 272px window"); the 768 case had never been measured and is where the layout stops being
tight and starts being broken.

The gutter is `80px` on each side at every width — 160px, 21% of a 768 viewport — and the grid stays
at 6 columns throughout, which is what takes the 203px card down to 91px.

### 3.4 The pre-login auth pair carries four different labels

`HeaderPrelogin.tsx`: desktop renders `Login` / `Register`, mobile renders `Log In` / `Sign In`.
The same two controls, four labels. On mobile the **register** button is labelled `Sign In`, which
reads as log-in. Both call `setAuthMode('postlogin')`, which is a recorded demo decision.

The copy is Figma's own — nodes `1:4309` (desktop) and `1:6994` (mobile) — so this is a question for
whoever owns the design, not a coding defect.

### 3.5 Six SVGs still carry the Figma footer artboard

`scripts/clean-svg.mjs --dry` reports 0 files would change, but six still hold a 1440×729
`#070F1D` rect — the footer panel of node `1:3666`:

```
flags/bg.svg  flags/de.svg  flags/gb.svg  flags/ru.svg
payments/cascading-gbp-a.svg  payments/gateway-crypto.svg
```

**Why the cleaner misses them.** The furniture is a `<path>`, not a `<rect>`:
`d="M-803.453 -464.576H636.547V264.424H-803.453V-464.576Z"`. Rule 3 (the geometric one) only
inspects `<rect>` and `<foreignObject>`. Rule 2 catches paths whose first coordinate lies further
than `OUTSIDE = 1000` from the viewBox — and the six survivors start at −803, −961, −908, −856,
−149 and −331. Every one of them sits *inside* that window. Whether a file was cleaned therefore
depends on where its artboard happened to be positioned, which is not a property of the artwork.

**It is not visible today.** A/B: the four flags render 100% opaque with opaque corners both with
and without the stray path, because the flag artwork covers the box anyway, and the six unaffected
flags (`it`, `nl`, `no`, `se`, `dk`, `tr`) score the same. So this is dead bytes and a latent
repeat of the `slots.svg` failure, not a live defect — but §11 records this class of bug as closed
across all 27 files, and for these six it is not.

---

## Checked and deliberately not reported

Each of these looked like a finding and was killed by a control run. They are listed so nobody
spends the time again.

- **A blue focus ring on the balance panel's `DEPOSIT` the moment it opens.** An artefact of driving
  the trigger with `element.click()`, which sets `:focus-visible`. A real mouse press via the
  browser shows no ring.
- **Backdrop dismissal leaves focus on `<body>`.** Reproduced twice with scripted events, then
  falsified: `element.click()` does not move focus, so the overlay captured `body` as its opener and
  restoring to `body` was correct. With real mouse presses — magnifier, then backdrop — focus
  returns to the `Search games` trigger. Session 7's fix holds.
- **The provider search field's magnifier renders as a grey dot.** Downscaled-JPEG artefact. At 8x
  it is the blue magnifier and an `×` button, as designed.
- **The GB flag in the mobile menu is an empty circle**, and **the menu's close button is an empty
  circle**. Both artefacts of the same downscaling; `naturalWidth` is 39 and 16 respectively, and
  at 8x both draw correctly.
- **The mobile tab bar has square top corners.** False — the inner element is `rounded-t-3xl` and
  computes `24px 24px 0px 0px`. Misread from an ambiguous crop.
- **The search panel is 17px wider on the right than the field it drops from.** Deliberate:
  `CategoryNavBar.tsx:241` hangs the panel off the category capsule, not the field, per node
  `1:4710`.
- **The footer is missing a newsletter field.** There is no newsletter field in Figma's footer
  (node `1:3666`) either. Our footer matches that node closely.

## Open question for the owner

`docs/next-session.md` §4 records that game cards are `<article>` because the demo has no game
pages. The consequence measured here: of 90 cards on the homepage, **zero are reachable by keyboard**
and the page exposes 49 tab stops in total, none of them a game. That decision stands as recorded —
the question is only whether it should be revisited now that the search suggestions, the See All
pills and the category tabs are all also inert, so there is no path to a game by any route.
