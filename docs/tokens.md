# Design tokens — Jackpot

**This file is the only bridge between Figma and the code.** If it goes stale, components start
carrying hand-written colours and there is no longer one place to change anything.

Source: Figma file `2MyylxdZblfGnf05nQacUz`, frames `UI Kit — Desktop / Colors` (node `1:5199`)
and `UI Kit — Mobile / Colors` (node `1:4745`).

Figma **has no variables** in this file — `get_variable_defs` returns `{"BG/Quaternary":"#0D1420"}`
on `desktop-main` and `{}` on both UI Kits. Every value below is read off the swatch fills and the
text the designer wrote under each of them.

Fonts: **Inter**, **Roboto Flex**, **Bricolage Grotesque** — all Google Fonts, loaded with
`next/font/google`.

---

## 1. The decision on the conflicts

The two UI Kits use five identical names with different values. **Owner's decision: the Mobile
kit's values win**, applied at both viewports. One token, one value.

| Figma name      | Desktop         | Mobile          | Value adopted                              |
| --------------- | --------------- | --------------- | ------------------------------------------ |
| Page Background | `#11111A`       | `#0F121D`       | `#0F121D`                                  |
| Overlay         | `#000000 @ 20%` | `#161625 @ 80%` | **both, switched at 768px** — see below    |
| Secondary Text  | `#FFFFFF @ 70%` | `#FFFFFF @ 60%` | `#FFFFFF @ 60%`                            |
| Blue Tinted BG  | `#007AFF @ 13%` | `#007AFF @ 15%` | `#007AFF @ 10%` ² — the kits lose this one |
| Card Border     | `#FFFFFF @ 4%`  | `#262632`       | `#262632`                                  |

² **Neither kit wins here, the page does.** Owner's decision, 2026-09-10. The two kit captions are
transcribed correctly and both are still there — node `1:4800`, the caption under the Mobile kit's
`Blue Tinted BG` swatch (`1:4797`), was re-read on 2026-09-10 and **still reads `#007AFF @ 15%`**.
What disagrees with it is the page: the mobile hero's `WELCOME` badge, node `21:2932`, applies
`rgba(0,122,255,0.1)`. The mobile subtree was rebuilt on 2026-09-09 and the kit was not, so the
applied node is the newer of the two, and the decision is to follow it. The 13/15 conflict this row
was written to resolve is therefore moot — **the recorded 15% did not match node `21:2932` when it
was re-read on 2026-09-10**, and 10% is what ships.

This is a real conflict between two live nodes, not a stale citation, and it is worth keeping in
mind before the kit is used as an authority again.

### The one exception: `bg-overlay`

The rule stays one value per token. `bg-overlay` is the exception, by the owner's decision taken
after the visual check, because here the two kits differ for a reason rather than by inattention:

- on **desktop** the layer sits behind a small panel in the corner (node `1:4116`) — black at 20%,
  and the page behind it stays readable
- on **mobile** it sits behind a sheet that covers nearly the whole screen — `#161625` at 80%

Forcing a single value made the desktop panels far darker than the design. The switch is made in
`globals.css` through a `@media (max-width: 767px)`.
Any other token that wants a second value needs a justification of the same kind.

The decision applies **only** to these five. Tokens that exist in the Desktop kit alone
(`Tertiary Text`, `Nav Inactive`, `Footer Heading`, `Gold Nav Active`, `Subtle Surface`,
`Elevated Surface`, `Border Strong`, `Divider Light`) keep their desktop values — they have no
mobile counterpart.

Two different names for the same value, unified:

| Desktop       | Mobile        | Value          | Token adopted      |
| ------------- | ------------- | -------------- | ------------------ |
| Separator     | Divider       | `#282936`      | `border-separator` |
| Border Medium | Subtle Border | `#FFFFFF @ 8%` | `border-medium`    |

### Known consequences of the decision

Three deviations from the Desktop kit, accepted knowingly. Each comes back with a single line in
`globals.css` if it turns out to be a problem at the phase-6 visual check.

1. **`text-secondary` and `text-tertiary` become identical.** Desktop had 70% and 60%, two distinct
   steps. Mobile has a single level, 60%. Adopting mobile takes both tokens to `#FFFFFF @ 60%`, so
   the hierarchy the designer drew on desktop disappears. It shows most clearly in the footer, where
   the column headings and the secondary links used different steps.
2. **The desktop panels get much darker.** `bg-overlay` moves from `#000000 @ 20%` to
   `#161625 @ 80%`. That is the layer covering the page when the **Balance** panel opens from the
   header. At 20% the page behind stays readable; at 80% it nearly disappears. The `Balance Opened`
   frame (node `1:4116`) will look visibly darker than in Figma.
3. **The card outline becomes opaque.** `border-card` moves from `#FFFFFF @ 4%` — which lets the
   background show through — to `#262632`, a solid colour. Over `bg-page` the difference is small;
   over `bg-section` or over an image it shows.

---

## 2. The full table

`D` = appears in the Desktop UI Kit · `M` = appears in the Mobile UI Kit

### Backgrounds

| Figma name         | Value adopted    | Tailwind token | CSS variable    | Kit |
| ------------------ | ---------------- | -------------- | --------------- | --- |
| Page Background    | `#0F121D`        | `bg-page`      | `--bg-page`     | D M |
| Card Background    | `#151624`        | `bg-card`      | `--bg-card`     | D M |
| Section Background | `#12162B`        | `bg-section`   | `--bg-section`  | M   |
| Overlay            | `#161625 @ 80%`  | `bg-overlay`   | `--bg-overlay`  | D M |
| Subtle Surface     | `#FFFFFF @ 2%`   | `bg-subtle`    | `--bg-subtle`   | D   |
| Elevated Surface   | `#FFFFFF @ 6%`   | `bg-elevated`  | `--bg-elevated` | D   |

#### The icon button's states (node `1:5687`)

The `Icon Button (Search)` frame fixes a 40x40 circle (`Border Radius: 20px (circle)`,
`Padding: N/A — fixed 40x40`) and writes its three states under each instance in `States`
(`1:5697`). The resting state is `--bg-elevated` itself, so it gets no new token. Shadow: none, in
all three.

| State in Figma | Value adopted    | Tailwind token       | CSS variable           |
| -------------- | ---------------- | -------------------- | ---------------------- |
| `DEFAULT`      | `#FFFFFF @ 6%`   | `bg-elevated`        | `--bg-elevated`        |
| `HOVER`        | `#FFFFFF @ 12%`  | `bg-icon-btn-hover`  | `--bg-icon-btn-hover`  |
| `ACTIVE`       | `#FFFFFF @ 4%`   | `bg-icon-btn-active` | `--bg-icon-btn-active` |

Pressed is lighter than resting — that is what the node says, not an inversion introduced in code.

The circle used to be drawn into the asset: `public/images/icons/search-btn.svg` brought its own
`<rect width="40" height="40" rx="20" fill="white" fill-opacity="0.0588"/>`, so hover and pressed
had nothing to move. The file now holds only the glyph (20x20), and
`src/components/primitives/IconButton.tsx` supplies the circle.

### Text

| Figma name     | Value adopted    | Tailwind token        | CSS variable            | Kit |
| -------------- | ---------------- | --------------------- | ----------------------- | --- |
| Primary Text   | `#FFFFFF`        | `text-primary`        | `--text-primary`        | D M |
| Secondary Text | `#FFFFFF @ 60%`  | `text-secondary`      | `--text-secondary`      | D M |
| Tertiary Text  | `#FFFFFF @ 60%`  | `text-tertiary`       | `--text-tertiary`       | D   |
| Muted Text     | `#839CBF`        | `text-muted`          | `--text-muted`          | D M |
| Caption Text   | `#8E9BB0`        | `text-caption`        | `--text-caption`        | M   |
| Nav Inactive   | `#9E9FAB`        | `text-nav`            | `--text-nav`            | D   |
| Label Text     | `#B2B8C2`        | `text-label`          | `--text-label`          | D M |
| Footer Heading | `#DAD7E0`        | `text-footer-heading` | `--text-footer-heading` | D   |

### Accent and brand

| Figma name      | Value adopted    | Tailwind token | CSS variable  | Kit |
| --------------- | ---------------- | -------------- | ------------- | --- |
| Blue Primary    | `#006EE6` ¹      | `blue`         | `--blue`      | D M |
| Blue Tinted BG  | `#007AFF @ 10%` ² | `blue-tint`   | `--blue-tint` | D M |
| — (derived) ¹   | `#479FFF`        | `blue-text`    | `--blue-text` | —   |
| Amber / Warning | `#F59E0B`        | `amber`        | `--amber`     | D M |
| Gold Nav Active | `#D4A352`        | `gold`         | `--gold`      | D   |
| Success Green   | `#34C759`        | `green`        | `--green`     | D M |
| Emerald Green   | `#00F299`        | `emerald`      | `--emerald`   | M   |
| Cyan Accent     | `#00F0FF`        | `cyan`         | `--cyan`      | M   |

¹ Figma writes `#007AFF` in both kits. It passes AA neither as a background under white text nor as
text on the blue tints, so the blue is now two values — see "Contrast deviations" in §2b. The tints
(`--blue-tint`, `--see-all-bg`) keep the design's own `0 122 255` channels: they are backgrounds,
and darkening them would only have made the text they carry harder to read.

² The opacity, not the channels — see the footnote in §1. `--blue-tint` moved from 15% to 10% on
2026-09-10 to match node `21:2932`. Measured, not assumed: over a dark surface a *smaller* tint of
a bright blue composites *darker*, so every pair the token carries gained contrast. On the hero
artwork (a flat `#050C1C`, sampled with `sharp`) `--blue-text` on it goes **6.13:1 → 6.52:1**; over
`--bg-section` **5.53:1 → 5.89:1**; over `--bg-field` **5.16:1 → 5.50:1**. Four other surfaces use
the token and all moved the same way: the search-suggestion badges (`Badge` tone `blue`), the three
balance pills in `BalancePanel` (`text-amber` 7.10 → 7.55, `text-muted` 5.43 → 5.77 over
`--bg-card`), `::selection`, and the dev screens chip. The worst pair the token can produce
anywhere in the file is `text-muted` over `--bg-menu-row`, and that moves 4.65 → 4.91 — still AA.
Nothing regressed; the table in "Contrast deviations" below keeps the old 15% figures for the
`--see-all-bg` rows, which are a separate token and did not move.

### Gradients

| Figma name            | Value     | Tailwind token | CSS variable     | Kit |
| --------------------- | --------- | -------------- | ---------------- | --- |
| Gold Light            | `#F0C775` | `gold-light`   | `--gold-light`   | D M |
| Gold Dark             | `#C6903D` | `gold-dark`    | `--gold-dark`    | D M |
| Orange Gradient Start | `#F8B900` | `orange-start` | `--orange-start` | D M |
| Orange Gradient End   | `#E67508` | `orange-end`   | `--orange-end`   | D M |

Composed gradients used in the product:

| Utility              | Definition                                  |
| -------------------- | ------------------------------------------- |
| `bg-gradient-gold`   | `linear-gradient(160deg, #F0C775, #C6903D)` |
| `bg-gradient-orange` | `linear-gradient(160deg, #F8B900, #E67508)` |

These are also the placeholder backgrounds for game cards with no real artwork.

### Borders and separators

| Figma name                    | Value adopted    | Tailwind token     | CSS variable         | Kit |
| ----------------------------- | ---------------- | ------------------ | -------------------- | --- |
| Card Border                   | `#262632`        | `border-card`      | `--border-card`      | D M |
| Divider Light                 | `#FFFFFF @ 7%`   | `border-divider`   | `--border-divider`   | D   |
| Border Medium / Subtle Border | `#FFFFFF @ 8%`   | `border-medium`    | `--border-medium`    | D M |
| Border Strong                 | `#FFFFFF @ 10%`  | `border-strong`    | `--border-strong`    | D   |
| Separator / Divider           | `#282936`        | `border-separator` | `--border-separator` | D M |

### Exception

| Figma name    | Value     | Note                                                                                                                                        |
| ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| BG/Quaternary | `#0D1420` | The only Figma variable in the file. It appears in no swatch of either UI Kit. Used only where a node asks for it explicitly; it does not become a token. |

Three places ask for it: the bottom bar on mobile (node `1:8235`), the footer, and — since
2026-09-09 — the jackpot menu's panel. Sampled from the rebuilt frames, the panel, the strip beneath
it and the bar are all `#0D1420`; that is why the screen reads as one surface. Our panel was
`--bg-card` `#151624` and was the only piece outside the agreement. `Sheet` takes the colour through
a prop rather than globally: the mobile search sheet uses the same component and its rows are
`bg-card` — they would have turned into visibly lighter cards if the surface had moved under them.

---

## 2b. Values read off layers, absent from both UI Kits

The two UI Kits do not cover everything actually drawn in the pages. The agents who built the
header, the footer and the banners ran into the values below, correctly refused to write them as hex
in components, and asked for them in their reports. They are transcribed here from the nodes given.

**The rule:** any addition to this table must cite the node it comes from. Without a citation the
list becomes a dumping ground of ad-hoc colours and we are back to exactly the problem tokens solve.

| Value           | Tailwind token    | CSS variable        | Figma node                            | Where it appears                                                            |
| --------------- | ----------------- | ------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| `#080814`       | `bg-header`       | `--bg-header`       | `1:4245`                              | the header bar, darker than the page                                        |
| `#18273A`       | `border-header`   | `--border-header`   | `1:4245`                              | the rule under the header                                                   |
| `#070F1D`       | `bg-footer`       | `--bg-footer`       | `1:3666`                              | the footer surface                                                          |
| `#1A1D2E`       | `bg-field`        | `--bg-field`        | `1:4314`                              | the search field's fill                                                     |
| `#F2C146 @ 10%` | `bg-amber-tint`   | `--amber-tint`      | `1:3446`, `1:3538`, `1:3594`–`1:3600` | the warning pills on the promo banners                                      |
| `#19191D`       | `border-flag`     | `--border-flag`     | `1:4016`                              | the ring around the language flags                                          |
| `#7F7A85` ¹     | `text-legal`      | `--text-legal`      | `1:4115`                              | the footer's legal strip                                                    |
| `#FFFFFF @ 15%` | `border-emphasis` | `--border-emphasis` | `1:2448` ⁹                            | the separator in the wins ticker, **desktop only**                          |
| `#090E1A` ⁶     | `bg-tab-bar`      | `--bg-tab-bar`      | `32:1893`                             | the mobile category band behind the tabs                                    |
| `#1E293B` ⁶     | `border-tab-bar`  | `--border-tab-bar`  | `32:1893`                             | its dashed rule, above and below                                            |
| `#151F32` ⁶     | `bg-tab`          | `--bg-tab`          | `32:1900`                             | an unselected mobile category tab                                           |
| `#94A3B8` ⁶     | `tab-label`       | `--text-tab`        | `32:1934`                             | that tab's label and glyph                                                  |
| `#36BCFF` ⁶     | `tab-accent`      | `--tab-accent`      | `32:1898`, `32:1899`                  | the selected mobile tab's label, glyph and 4px dot                          |
| `#007AFF @ 20%` ⁶ | `tab-accent-tint` | `--tab-accent-tint` | `32:1895`                           | the selected mobile tab's fill                                              |
| `#A5A6B5`       | `text-subtitle`   | `--text-subtitle`   | `1:6254`                              | the mobile promo card's subtitle                                            |
| `#F2C146`       | `amber-soft`      | `--amber-soft`      | `1:6255`                              | the "join + timer" pill on the mobile promo card, solid                     |
| `#FF9500 @ 10%` ⁷ | `wager-tint`    | `--wager-tint`      | `32:1852`                             | the fill of the mobile hero's `20X WAGER` badge                             |
| `#FFAE00` ⁷     | `wager-amber`     | `--wager-amber`     | `32:1853`                             | the label written on it                                                     |
| `#3030D6` ⁸     | — (shadow only)   | `--violet-glow`     | `21:2939`                             | the glow under the mobile hero's `Get` pill                                 |
| `#0D213F` ¹⁰    | `balance-btn`     | `--bg-balance-btn`  | `32:1830`                             | the signed-in balance button in the phone header                            |
| `#09090D`       | `ink`             | `--ink`             | `1:6256`–`1:6260`                     | the text written **on** that pill: the button label, "Time left" and the clock |
| `#36BCFF` ²     | — (SVG only)      | —                   | `1:2239`, `1:4323`                    | the magnifier in the provider search field (`public/images/icons/search-blue.svg`) |
| `rgba(8,8,20,0.75)` ³ | — (inline)  | —                   | `1:6179`                              | the game card's shadow on mobile: `-2px 2px 12px`                           |
| `#00B579` ⁴     | `deposit-green`   | `--deposit-green`   | `32:4885`                             | the `Deposit` button's fill in the jackpot menu                             |
| `#FF787A`       | `signout`         | `--text-signout`    | `32:5036`                             | the "Sign out" label in the jackpot menu                                    |
| `#222431` ⁵     | `menu-row`        | `--bg-menu-row`     | `32:4907`, `32:4887`                  | the rows and the ID field in the jackpot menu                               |
| `rgba(0,92,64,0.04)` | `balance-chip` | `--bg-balance-chip` | `32:4870`                          | the balance pill in that menu's header                                      |

¹ Figma writes `#65616A`. Raised to `#7F7A85` for AA — see "Contrast deviations" below.

⁷ Added 2026-09-10, read off `get_design_context` on node `21:2931`, which returns
`bg-[rgba(255,149,0,0.1)]` on the badge and `text-[#ffae00]` on its label. **A third amber, and it
deliberately does not reuse `--amber-tint`.** That token is `#F2C146 @ 10%` and is bound to the
*desktop* promo pills (`1:3446`, `1:3538`, `1:3594`–`1:3600`); repointing it at `#FF9500` would
have retinted every one of them to fix a badge on the phone. `Badge` reaches it through a `wager`
tone rather than a `className` override on the call site, because an override would put two `bg-*`
and two `text-*` utilities on one element and the winner would be stylesheet order.
Contrast, over the hero artwork's flat `#050C1C`: `#FFAE00` on `#FF9500 @ 10%` composites to
`#1E1A19` and measures **9.29:1**, against **7.77:1** for the `#F59E0B`-on-`--amber-tint` pair it
replaces. Both pass; the design's own pair is the better of the two.

¹⁰ Added 2026-09-10 from `get_design_context` on node `32:1829`, which returns `bg-[#0d213f]` on
the box `32:1830` and no border, although the layer is named `Background+Border`. White on it
measures **16.07:1**; the add mark `32:1833` is `#007AFF` inside `balance-add.svg`, a graphical
object at **4.00:1** against 1.4.11's 3:1. It replaced the emerald pill and gradient plus of the
deleted `21:2913` / `21:2916`, and took their two tokens' reasons with it: `--action-blue`
(`#3B82F6`, which had no other consumer) is gone, and so is the recorded deviation about that pill's
darker greens `#00A372` / `#005C40`, since nothing draws the pill any more. `--emerald` stays; the
jackpot menu still uses it.

⁹ Corrected 2026-09-10. This row used to cite `1:2433`, which nobody had checked. `get_design_context`
on the desktop ticker `1:2438` returns white 15% on its four dividers — `1:2448`, `1:2457`, `1:2466`,
`1:2475` — so the **value** was right and only the citation was loose; `1:2448` is the first of them
and is the one now quoted. **Desktop only:** the phone's divider, node `21:3043`, is white **8%**,
which is `--border-medium` and already in §2 — no new colour, and none needed. The row said "the
separator in the wins ticker" without qualification, which is how a desktop value gets carried onto a
phone by somebody reading this table instead of the frame.

⁸ Added 2026-09-10, from `get_design_context` on node `21:2939`, which returns
`drop-shadow-[0px_0px_10px_#3030d6]`. The only violet in the file, and the only colour here that is
a shadow and nothing else. It gets **no Tailwind token**: its one consumer is a `shadow-[…]`
arbitrary value in `HeroBanner` that reads the variable directly, and a shadow colour listed under
`colors` would advertise a `bg-`/`text-` use that does not exist — the same reasoning that keeps
`#36BCFF` out of the theme. Written as a `box-shadow` rather than Figma's `drop-shadow` filter,
because that is how every other glow in this codebase is written and the two are indistinguishable
on a solid `rounded-full` pill. Figma writes the hex bare, so it is taken as fully opaque; the 60%
blue mix it replaces was not something any node justified.

⁶ Added 2026-09-10 from `get_design_context` on node `32:1893`, the mobile category bar the
designers rebuilt in place of the deleted `21:2977`. They replace `--border-chip` (`#222A4E`, sampled
off `21:2978`), which is gone: the new tabs have no border at all. **The new frame draws a selected
state** — a blue tint, a `#36BCFF` label and glyph, a 4px dot — where `21:2977` painted all four
chips alike; that is what retired the "no active indicator" deviation below. Contrast: `#94A3B8` on
`#151F32` measures **6.43:1**; `#36BCFF` on the tint composited over `#090E1A` (`#072448`) measures
**7.23:1**. `#36BCFF` is the same value note ² keeps out of the theme while it lived only in SVG
files; it is now written in CSS, so by that note's own rule it gets a variable and a token. The
glyphs reach it as a CSS mask over the existing icon files, so `search-blue.svg` and `bonus-buy.svg`
still carry the hex themselves.

⁵ This used to be `bg-elevated`, that is white at 6%. While the panel was `--bg-card` the two were
indistinguishable: 6% over `#151624` composites to `#232431`, one unit off what Figma draws. Moving
the panel to `--bg-quaternary` (`#0D1420`, owner's decision 2026-09-09) would have taken the same
fill down to `#1C222D` and quietly broken a colour that was right. The node declares an opaque fill
anyway, not a translucent one — and a translucent fill only matches the design while it agrees with
the surface beneath it.

⁴ The label written **on** it is white in Figma. White on `#00B579` measures 2.66:1, so the label is
`text-page` — see "Contrast deviations" below. The green itself stays exactly as the design has it.

The last four values come from the menu frames rebuilt in Figma on 2026-09-09 (`13:2307`
post-login, `13:2519` VIP; the old `1:8260` / `1:8503` / `1:8504` no longer resolve). `#00B579` is
not from the `emerald` family — that one is `#00F299`, much lighter, and stays on the `Support`
button. `#FF787A` is the only red in the whole file and has no relative in either UI Kit; it
measures 7.01:1 on `--bg-card`, so it asks for no deviation.

³ The only shadow colour in the entire design. It gets no variable because the theme carries no
shadow colours at all: the card's other shadow, the desktop one, is also written inline in
`GameCard.tsx`, as `rgb(0_0_0/0.25)`. The phone frames draw it differently from desktop — shifted
left, three times the blur and nearly opaque — so the card now carries both values, separated by the
`mobile:` variant.

² Owner's decision, 2026-09-09. Our file drew the magnifier with `#007AFF`, the blue written in both
UI Kits; Figma exports `#36BCFF` on both nodes (checked with `get_design_context` on `1:2239`, which
returns `stroke="#36BCFF"`). No CSS variable and no Tailwind token come with it: the only consumer
of the colour is the SVG file itself, and `Icon` serves it through `next/image` with `unoptimized`,
that is an `<img src>` pointing at the exported file — there is nowhere for a Tailwind class to
reach the stroke. The same value also appears, again as hex inside an SVG, in `bonus-buy.svg`. If
the colour ever ends up written in CSS as well, then — and only then — it gets a variable in
`globals.css` plus a token in `tailwind.config.ts`.

None of those three appears in the two UI Kits: the tables in §2 are their complete transcription
(26 Desktop swatches, 22 Mobile) and contain neither `#A5A6B5` nor `#09090D`, while `#F2C146`
appears there only at 10% opacity, as `--amber-tint`. `--amber-soft` is the same colour in solid
form, not a second amber.

Two values derived from `--ink` get no token of their own, because the theme holds finite colours
rather than RGB channels — see the comment in `Button.tsx`. Each is an opacity class on the element
that uses it, which is a smaller change than a token used exactly once:

| Design                                                | How it is written                       | Node     |
| ----------------------------------------------------- | --------------------------------------- | -------- |
| `#09090D @ 80%` — the "Time left" label               | `text-ink opacity-80`                   | `1:6259` |
| `#09090D @ 15%` — the 16px vertical rule in the pill  | `bg-ink opacity-15`, on a 1px span      | `1:6257` |

### Accepted deviations, with no new token

Three values in the design are close enough to an existing token that a new one would add noise for
no visible gain. They are noted here so they are not rediscovered as a "bug" at the visual check.

| Design                                                            | Token used           | The difference                                                                                                                       |
| ----------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `#00E5FF` (the active pill's ring, node `1:2503`)                 | `cyan` `#00F0FF`     | imperceptible                                                                                                                        |
| `#FFFFFF @ 9%` (the active pill's background)                     | `bg-elevated` `@ 6%` | 3 points of opacity                                                                                                                  |
| `#11111A` (the game card's background, node `1:2602`)             | `bg-card` `#151624`  | `#11111A` is the **desktop** page background, which the "mobile wins" decision replaced with `#0F121D`                                |
| `#000000` (the pill button's label, node `I1:6256;112:330`)       | `ink` `#09090D`      | Figma writes pure black on the button and `#09090D` on the clock 3px away. The difference is imperceptible, so both use `ink`         |

### Layout deviations — owner's decisions, 2026-09-10

Not colours, but recorded here for the same reason: so the visual check does not report them as bugs.

| Design | Ours | Why |
| --- | --- | --- |
| Text fields at 13–14px (search, providers, category bar) | **16px on the phone**, one rule in `globals.css` | iOS zooms the page when a field under 16px takes focus; seen on the owner's iPhone |

### Stale node citations — the `1:5720`–`1:8234` band

The mobile subtree was rebuilt in Figma on 2026-09-09 and the whole `1:5720`–`1:8234` id band was
deleted with it. A dead id still matches `screens.test.ts`'s `^\d+:\d+$` check, so a citation can rot
without a single test failing. `CategoryPill.tsx` carried "node `1:5799` draws 32px tall" for weeks;
the real chip (`21:2978`) is 42.

Repointed on 2026-09-10: `CategoryPill.tsx` (→ `21:2978` / `21:2979`), `CategoryNavBar.tsx`
(→ `21:2975` / `21:2977`), and — same day, from a `get_metadata` read of the whole `21:2926`
subtree — `HeroBanner.tsx` and `Badge.tsx`:

| Dead | Live | What it is |
| --- | --- | --- |
| `1:5750` | `21:2926` | `Hero-Card`, x=16 y=0, 358x170 |
| `1:5751` | `21:2927` | `Image`, the card's own artwork |
| `1:5752` | `21:2929` | `Label-Stack`, x=16 y=16, 326x138 — the "padding 16" frame |
| `1:5753` | `21:2930` | the frame that adds 8 on the left, x=8, 318x95 |
| `1:5755` | `21:2931` | `Tag-Row`, 158x18, 6px gap |
| `1:5756` | `21:2932` | `Promo-Badge` (`WELCOME`), 72x18 |
| `1:5758` | `21:2934` | `Wager-Badge` (`20X WAGER`), 80x18 |
| `1:5761` | `21:2937` | `Bonus-Title`, 318x31 at card y=50 |
| `1:5762` | `21:2938` | `Bonus-Subtitle`, 318x16 at card y=87 |
| — | `21:2939` | `Button` (`Get`), 97x32 at card x=24 y=122 |

The first two, and the last four, were handed over verified. `1:5752` / `1:5753` / `1:5755` were
**derived**, not given: they are matched to the live tree by the geometry the existing comments
already described (padding 16, "adding 8 on the left", the two-pill row). Stated as derived so the
next reader knows which rung of the ladder they are standing on.

**Still stale** and to be re-derived against the live file before anyone trusts a number taken from
them — roughly 45 distinct ids across ~78 sites:

| File | Ids still cited |
| --- | --- |
| `src/app/page.tsx`                          | `1:5720`, `1:5799`, `1:5859` |
| `src/lib/screens.ts`, `src/lib/sections.ts` | `1:5720`, `1:5799`, `1:6517`, `1:5882`–`1:6499` |
| `src/lib/assets.ts`, `src/lib/types.ts`     | `1:5751`, `1:5741` |
| `src/components/cards/PromoBannerMobile.tsx`| `1:6195`, `1:6247`, `1:6249`, `1:6250`–`1:6260`, `1:6282`, `1:6464`–`1:6480` |
| `src/components/cards/GameCard.tsx`         | `1:5888`, `1:6179` |
| `src/components/layout/Header.tsx`, `HeaderPostlogin.tsx`, `HeaderPrelogin.tsx`, `MobileShell.tsx` | `1:5722`, `1:5736`, `1:5741`, `1:5743`, `1:6978`, `1:6980`, `1:6994`, `1:7000` |
| `src/components/sections/*`                 | `1:5884`, `1:5887`, `1:5882`, `1:5936`, `1:6175`, `1:6192`, `1:6194` |
| `src/components/primitives/Icon.tsx`        | `1:5741` |
| `src/app/globals.css`                       | `1:5687`, `1:6254`, `1:6255`, `1:6256`–`1:6260`, `1:8235` |
| this file                                   | `1:5655`, `1:6179`, `1:6254`, `1:6255`, `1:6256`–`1:6260` |

They are listed rather than rewritten because each replacement has to be read back from the live
file one at a time — `sections.ts` was remapped that way once already. Fixing them blind would trade
a citation that is knowably dead for one that only looks alive.

### Contrast deviations — owner's decision, 2026-09-08

`node scripts/a11y.mjs` (axe-core 4.10.2, nine states, mobile first) was reporting 12–15
`color-contrast` violations of "serious" severity in every state. All of them came from four colour
pairs taken as-is from Figma, not invented here. The owner's decision: change the colours until the
rule passes AA (4.5:1 for normal text), and write the deviation from Figma down here.

Each new value keeps the original's hue and saturation exactly; only the lightness moved. `#006EE6`
is the `0 122 255` channels multiplied by 0.9 — hue 211.3° and saturation 100%, the same as
`#007AFF`. `#479FFF` is the same hue and saturation taken up to 64% lightness. `#7F7A85` is
`#65616A`'s hue 266.7° and saturation 4.4% at 50% lightness instead of 39.8%.

| Token                | Figma node          | Figma value | New value | Where it shows                                                                | Ratio before → after |
| -------------------- | ------------------- | ----------- | --------- | ----------------------------------------------------------------------------- | -------------------- |
| `--blue`             | `1:5199` / `1:4745` | `#007AFF`   | `#006EE6` | white on solid blue: the mobile hero's "Get" pill, `Button` `primaryBlue`      | 4.02:1 → 4.80:1     |
| `--blue-text` (new)  | `1:5199` / `1:4745` | `#007AFF`   | `#479FFF` | blue text on a tint: the `See All (206)` pill (`1:5655`), the blue badges in the suggestions (`1:4479`), the mobile hero's eyebrow pill (`21:2932`) | 3.51–4.06:1 → 5.15–5.97:1 |
| `--text-legal`       | `1:4115`            | `#65616A`   | `#7F7A85` | the footer's legal strip                                                      | 3.17:1 → 4.58:1     |

The ratios are computed with the WCAG 2.1 formula against the **actual composited background** — the
tint laid over the surface beneath it, not over white — and are confirmed by axe-core, which reports
the same numbers in `passes`:

| The pair measured                                                   | Composited background | Ratio  |
| ------------------------------------------------------------------- | --------------------- | ------ |
| `#FFFFFF` on `--blue`                                                | `#006EE6`             | 4.80:1 |
| `--blue-text` on `--see-all-bg` (13% over `--bg-page`)               | `#0D203A`             | 5.97:1 |
| `--blue-text` on `--see-all-bg-hover` (22%)                          | `#0C294F`             | 5.31:1 |
| `--blue-text` on `--see-all-bg-active` (30%)                         | `#0B3161`             | 4.72:1 |
| `--blue-text` on `--blue-tint` over `--bg-field`                     | `#162B4D`             | 5.15:1 |
| `--blue-text` on `--blue-tint` over `--bg-section`                   | `#0F254B`             | 5.53:1 |
| `--text-legal` on `--bg-footer`                                      | `#070F1D`             | 4.58:1 |

#### Addition, 2026-09-09: the `Deposit` button's label

The rebuilt menu frames take the `Deposit` button off the gold ramp and make it solid green,
`#00B579` (node `32:4885`), with the `DEPOSIT` label written in white. White on that green measures
**2.66:1** — under 4.5 — and two of the nine states `scripts/a11y.mjs` checks are exactly this menu
(`mob-menu`, `mob-menu-prelogin`), so drawing it as Figma has it would have turned the Pages
workflow red.

Here the owner's decision goes to the **other** side of the pair than the three above: keep the
design's green untouched and change the label, to `text-page` (`#0F121D`), which measures
**7.01:1**. The reason is that the background is a large coloured surface — moving it would show —
while the label is 12px and seven letters. The same choice is already made in `JackpotMenu` for the
green buttons. The variant lives in `Button.tsx` as `deposit`, with the node cited beside it.

| The pair                         | Background | Ratio  |
| -------------------------------- | ---------- | ------ |
| `#FFFFFF` on `--deposit-green`   | `#00B579`  | 2.66:1 |
| `--bg-page` on `--deposit-green` | `#00B579`  | 7.01:1 |

The two `See All` pill states are in the table because axe measures only the resting state: hover
and pressed were computed separately, so the change does not pass AA only while nobody touches the
button.

The fourth pair, the footer's legal strip, was not in the report's list of three, but it produces one
"serious" violation in each of the nine states, so `a11y.mjs` could not reach 0 without it.

### Animations

| Utility                    | Definition                                  | Figma node |
| -------------------------- | ------------------------------------------- | ---------- |
| `.animate-marquee`         | translate from 0 to −50%, 40s linear, infinite | `1:2658`  |
| `.animate-marquee-reverse` | the reverse, for the second band            | `1:2919`   |

The provider band is drawn in Figma as a 1680px track inside a 1280px clip — that is, a marquee. The
track has to render its items twice so the loop has no seam. Both respect
`prefers-reduced-motion`.

---

## 3. Totals

- 26 colours in the Desktop UI Kit, 22 in the Mobile UI Kit
- **37 distinct tokens** after unifying the duplicate names and resolving the conflicts (30 from the first wave, plus `text-subtitle`, `amber-soft` and `ink`, required by the mobile promo cards, plus `blue-text`, required by the AA threshold, plus `wager-tint`, `wager-amber` and `violet-glow`, required by the rebuilt mobile hero)
- plus six for the rebuilt mobile category bar (`32:1893`), replacing `border-chip` — see §2b note ⁶
- 2 composed gradients
- 1 documented exception
- of those 37, one — `violet-glow` — is a CSS variable with no Tailwind token, because it is only
  ever a shadow colour

## 4. The discipline rule

No component under `src/components/` may contain a hexadecimal code written directly.
It is enforced by an `eslint` rule that rejects `#[0-9a-fA-F]{3,8}` in that directory.
Every exception is written down here, with its reason.
