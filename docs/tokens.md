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
| Blue Tinted BG  | `#007AFF @ 13%` | `#007AFF @ 15%` | `#007AFF @ 15%`                            |
| Card Border     | `#FFFFFF @ 4%`  | `#262632`       | `#262632`                                  |

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
| Blue Tinted BG  | `#007AFF @ 15%`  | `blue-tint`    | `--blue-tint` | D M |
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
| `#FFFFFF @ 15%` | `border-emphasis` | `--border-emphasis` | `1:2433`                              | the separator in the wins ticker                                            |
| `#A5A6B5`       | `text-subtitle`   | `--text-subtitle`   | `1:6254`                              | the mobile promo card's subtitle                                            |
| `#F2C146`       | `amber-soft`      | `--amber-soft`      | `1:6255`                              | the "join + timer" pill on the mobile promo card, solid                     |
| `#09090D`       | `ink`             | `--ink`             | `1:6256`–`1:6260`                     | the text written **on** that pill: the button label, "Time left" and the clock |
| `#36BCFF` ²     | — (SVG only)      | —                   | `1:2239`, `1:4323`                    | the magnifier in the provider search field (`public/images/icons/search-blue.svg`) |
| `rgba(8,8,20,0.75)` ³ | — (inline)  | —                   | `1:6179`                              | the game card's shadow on mobile: `-2px 2px 12px`                           |
| `#00B579` ⁴     | `deposit-green`   | `--deposit-green`   | `13:2340`                             | the `Deposit` button's fill in the jackpot menu                             |
| `#FF787A`       | `signout`         | `--text-signout`    | `13:2491`                             | the "Sign out" label in the jackpot menu                                    |
| `#222431` ⁵     | `menu-row`        | `--bg-menu-row`     | `13:2362`, `13:2342`                  | the rows and the ID field in the jackpot menu                               |
| `rgba(0,92,64,0.04)` | `balance-chip` | `--bg-balance-chip` | `13:2325`                          | the balance pill in that menu's header                                      |

¹ Figma writes `#65616A`. Raised to `#7F7A85` for AA — see "Contrast deviations" below.

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
| `--blue-text` (new)  | `1:5199` / `1:4745` | `#007AFF`   | `#479FFF` | blue text on a tint: the `See All (206)` pill (`1:5655`), the blue badges in the suggestions (`1:4479`), the mobile hero's eyebrow pill (`1:5756`) | 3.51–4.06:1 → 5.15–5.97:1 |
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
`#00B579` (node `13:2340`), with the `DEPOSIT` label written in white. White on that green measures
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
- **34 distinct tokens** after unifying the duplicate names and resolving the conflicts (30 from the first wave, plus `text-subtitle`, `amber-soft` and `ink`, required by the mobile promo cards, plus `blue-text`, required by the AA threshold)
- 2 composed gradients
- 1 documented exception

## 4. The discipline rule

No component under `src/components/` may contain a hexadecimal code written directly.
It is enforced by an `eslint` rule that rejects `#[0-9a-fA-F]{3,8}` in that directory.
Every exception is written down here, with its reason.
