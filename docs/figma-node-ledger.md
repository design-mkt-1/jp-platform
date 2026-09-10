# Figma node id ledger — 374 of 374

File `2MyylxdZblfGnf05nQacUz`. Started 2026-09-10 session 13, finished session 15. Every id cited
anywhere in `src/`, `docs/`, `public/` or the repository root is settled.

279 came from the Figma MCP, which stopped for the third time on its per-seat quota:

> You've reached the Figma MCP tool call limit for your Full seat on the Professional plan.

The last 45 came from the Figma editor itself, driven in Chrome — see *A fourth probe* below. Five
more were found only when the finished ledger was checked against every citation in the tree —
`1:3447`, `1:4587` and `32:3296` are cited in `src/` and were never inventoried; `1:4436` and
`1:4457` were cited by session 15 itself. All five are alive: the first three read in Chrome, the
last two from `1:4431`'s live subtree. That
probe is slower, and it has two traps of its own that each gave a confident wrong answer before it
was trusted.

## Why it exists

A dead node id breaks nothing today and breaks every future comparison. `CategoryPill.tsx` derived
the mobile chip's 32px height and 12px label from `1:5799`, a node that no longer exists — and that
is exactly the category bar the owner rejected. `screens.test.ts` validates the `^\d+:\d+$`
**shape**, which a dead id matches perfectly.

## The method, and the two that look right and are not

Probe one id at a time with `get_screenshot` at `maxDimension: 16`:

- **alive** — a small JSON carrying `original_width` / `original_height`
- **dead** — the error *"The provided node ID was not found in the file"*

`get_screenshot` rather than `get_metadata` because `get_metadata` on a live node returns the whole
subtree XML — `32:1813` is a 390x7159 page — while the screenshot costs about a hundred tokens
whichever way the answer goes. Both shapes were measured before the sweep began.

Two methods that were tried in session 12 and gave confident wrong answers:

- **A whole-page dump.** `get_metadata` on `0:1` and on `32:1812` both exceed the tool's limit and
  are written to a file **truncated**. A classification built on one reported 149 dead ids under
  `src/` — false. Seven ids confirmed alive one at a time were simply missing from it. **Absence
  from a dump proves nothing.**
- **Numeric ranges.** `1:5687` sits inside a band recorded as dead and is alive — a UI-Kit spec
  frame, not a page node. `21:3297`, `21:3675` and `21:3693` are dead and sit nowhere near it.

**A second probe, added when the quota came back.** `get_design_context` answers the same question
and answers more of it: on a live node it returns the subtree as JSX with every child's
`data-node-id`, its font sizes and its `line-height`; on a deleted one it returns the identical
*"The provided node ID was not found in the file"*. That is how `1:8536` was settled dead and how
the nine `text-[Npx]` line-heights were read. It costs more tokens than a 16px screenshot, so it is
the right probe when the answer is wanted, not just the status. The four rows marked `—` for size
come from it; `get_screenshot` is still what gives dimensions.

**A third kind of evidence, used in session 15.** A live `get_design_context` returns every
descendant with its own `data-node-id`. An id that appears there **is alive**, and one call settles
a whole family: `1:4431` returned `1:4434`, `1:4454` and `1:4459` inside itself, so all four are
settled from one call. This is the mirror image of the dump mistake above and it does not repeat it:
*presence* in a live subtree is positive evidence, *absence* from a truncated dump is not evidence at
all.

A third guard was added in session 14 and is cheap: **put one known-alive id in every batch**. In the
batch where 39 of 40 answered *"not found"*, `1:2431` answered alive at 1440x7453 in the same turn,
so the run was the tool working, not the tool failing. Without that control, forty identical errors
and a dead connector look the same.

**A fourth probe, for when the MCP quota is gone: the editor, in Chrome.** The same account is
logged into figma.com in the local Chrome, so the file opens there without the MCP. Open
`/design/2MyylxdZblfGnf05nQacUz/Jackpot?node-id=1-2431` and read two things:

- **alive** — the URL keeps the `node-id` asked for, and the properties panel header names the
  node's type (`Frame`, `Image`, …). For many nodes the `Width` / `Height` inputs carry its size:
  `1:4575` read `12` / `12`, the same 12x12 the MCP returned.
- **dead** — Figma rewrites the URL to `node-id=0-1&p=f` and the panel header reads `Page`, meaning
  nothing is selected.

*Dead* is only recorded on that positive rewrite, never on "nothing selected yet". It was validated
on six ids the MCP had already settled — `1:2431` and `1:4575` alive, `1:5799`, `1:6994`,
`21:3693` and `1:5720` dead — and all six agreed. `1:2431` or `1:4575` then answered alive again
every few ids through the sweep.

Two traps, both measured:

- **`history.pushState` is not a navigation.** Changing `node-id` in place and firing `popstate`
  left the URL showing whatever was written — the dead `1:5799` and `21:3693` both "stayed". Figma
  does not listen. Every probe is a full page load.
- **A background tab never resolves the selection.** The automation tab reports
  `document.visibilityState === "hidden"`. `21:3693` sat in the URL for **116 seconds** looking
  alive, then flipped to `0-1` within three seconds of a screenshot forcing a frame. So each probe
  loads, waits 18 seconds, captures a small crop of the panel header (which paints a frame), and
  only then reads.

The 45 settled this way: `1:2435` `1:2655` `1:3638` `1:4154` `1:4797` `1:5697` alive; the other 39 dead.

## What the sweep is worth, and what it is not

356 settled — **206 alive, 150 dead**, none left to check. The whole of `21:*` (55 ids),
the whole of `13:*` (16 ids) and `112:330` are dead. The whole of `32:*` is alive: that is the
subtree the designers rebuilt, and it is where the dead `21:*` work went.

Things measured rather than quoted, worth keeping:

- `1:2504` is **14x20**, confirming session 11's §2 C #5 against the live file: the desktop flame is
  forced to 20x20 in our CSS, which is why the `Popular` pill is 143.30 against Figma's 135.
- `1:2433` is alive but is a **1440x643 block**, not a divider. The desktop dividers are
  `1:2448` / `1:2457` / `1:2466` / `1:2475`, all **1x40**.
- `32:1968` is still **390x66**, so the wins-ticker band survived the designers' rebuild.
- `32:2626` **footer-mobile** is **390x1140**, which is where the mobile footer's 1140.4 target
  survives even though `21:3693`, the id it was originally read from, is dead.
- `21:3035` — *Recent wins - Ticker (iOS)*, 390x66 — is **dead**. `session-11-plan.md` tells a
  future session to go and read `21:2897` and `21:3035` before touching the mobile ticker. Both are
  dead. That instruction is now a dead end and the live pair to read is `32:1968`.
- **The dead ids cluster, and the cluster was probed rather than assumed.** Every id session 15
  probed between `1:5720` and `1:6517` came back dead — 34 of them, one call each. Three more are
  dead outside it: `1:6994`, `1:8239` and `1:8247`. `1:5687`, which
  sits just below that band, is **alive at 1312x378**. That is the same warning as the numeric-range
  mistake above, now with the boundary measured: the band is real, its edge is not where a reader
  would guess.
- **The desktop tree is intact.** All 65 ids settled alive in session 15 are `1:*`,
  including the whole search dropdown family — `1:4334`, `1:4479` and `1:4611` are each
  **1440x720** — and `1:4153` *personal-info*, **1440x1036**, the same frame size as `1:4116`.
- `1:4431` *search-active-panel* is alive. Its recent-search label `1:4457` is Roboto Medium 13px
  with `line-height: normal`, the identical spec to the popular tag `1:4436`. That is what closed
  handoff item 2.
- The dead ids cited under `src/` went from **71 to 108** in one session. Every one of the 37 new
  ones is in the mobile band above.
- **The last 45 are almost all dead: 39 of them.** All 27 still open under `src/` were dead —
  `1:6978`–`1:7000` and `1:8235`–`1:8910`. That includes **`1:8751`**, the mobile menu. The
  `?panel=jackpotMenu` deep link in `docs/next-session.md` names three nodes, `1:8751`, `13:2307`
  and `13:2519`; all three are now confirmed deleted.
- `1:4154` is alive and is an **Image**, 1440x1036 — the same frame size as `1:4116` and `1:4153`.
- The inventory is **356**. Session 13 recorded 322 and session 14 324; each count missed
  citations its scan did not reach. The check that closes this is mechanical — every id `citations()`
  in `scripts/dead-nodes.mjs` finds must have a row here. It passed at 329, and again at 356
  after the live `32:*` ids replaced the dead ones in `screens.ts`, `sections.ts` and the seven
  colour tokens: 27 new rows, every one read from the live metadata of `32:1812`.
- Earlier: 324, not the 322 session 13 recorded. The difference is
  `1:2435` and `1:2655`, cited in `public/review/index.html` — a directory the earlier count did
  not scan. Both are alive; `1:2655` is 40x40.

## Dead ids that are cited under `src/` — 104

These are the ones that would earn a guard test. Every row is a citation in shipped source of a node
that no longer exists in the file.

| id | cited in |
| --- | --- |
| `1:5720` | src/app/page.tsx, src/components/layout/MobileShell.tsx |
| `1:5722` | src/components/layout/Header.tsx |
| `1:5736` | src/components/layout/HeaderPostlogin.tsx |
| `1:5741` | src/components/layout/HeaderPostlogin.tsx, src/components/primitives/Icon.tsx, src/lib/types.ts |
| `1:5743` | src/components/layout/Header.tsx |
| `1:5751` | src/lib/assets.ts |
| `1:5882` | src/components/sections/GameGrid.tsx |
| `1:5884` | src/components/sections/SectionHeader.tsx |
| `1:5887` | src/components/sections/GameGrid.tsx |
| `1:5888` | src/components/cards/GameCard.tsx |
| `1:5936` | src/components/sections/ProviderRow.tsx |
| `1:6175` | src/components/sections/ContentRow.tsx |
| `1:6179` | src/components/cards/GameCard.tsx |
| `1:6192` | src/components/sections/PromoRow.tsx |
| `1:6194` | src/components/sections/SectionHeader.tsx |
| `1:6195` | src/components/cards/PromoBannerMobile.tsx |
| `1:6247` | src/components/cards/PromoBannerMobile.tsx |
| `1:6249` | src/components/cards/PromoBannerMobile.tsx |
| `1:6250` | src/components/cards/PromoBannerMobile.tsx |
| `1:6254` | src/app/globals.css |
| `1:6255` | src/app/globals.css, src/components/cards/PromoBannerMobile.tsx |
| `1:6256` | src/app/globals.css, src/components/cards/PromoBannerMobile.tsx |
| `1:6257` | src/components/cards/PromoBannerMobile.tsx |
| `1:6260` | src/app/globals.css, src/components/cards/PromoBannerMobile.tsx |
| `1:6282` | src/components/cards/PromoBannerMobile.tsx |
| `1:6464` | src/components/cards/PromoBannerMobile.tsx |
| `1:6467` | src/components/cards/PromoBannerMobile.tsx |
| `1:6478` | src/components/cards/PromoBannerMobile.tsx |
| `1:6479` | src/components/cards/PromoBannerMobile.tsx |
| `1:6480` | src/components/cards/PromoBannerMobile.tsx |
| `1:6978` | src/components/layout/MobileShell.tsx |
| `1:6980` | src/components/layout/Header.tsx |
| `1:6994` | src/components/layout/HeaderPrelogin.tsx |
| `1:7000` | src/components/layout/Header.tsx |
| `1:8235` | src/app/globals.css, src/app/layout.tsx, src/components/layout/MobileNavBar.tsx |
| `1:8239` | src/components/layout/MobileNavBar.tsx |
| `1:8245` | src/components/layout/MobileNavBar.tsx |
| `1:8249` | src/components/layout/MobileNavBar.tsx |
| `1:8254` | src/components/layout/MobileNavBar.tsx |
| `1:8257` | src/components/layout/MobileNavBar.tsx |
| `1:8260` | src/components/panels/JackpotMenu.tsx |
| `1:8285` | src/components/panels/JackpotMenu.tsx |
| `1:8305` | src/components/panels/JackpotMenu.tsx |
| `1:8503` | src/components/panels/JackpotMenu.tsx |
| `1:8528` | src/components/panels/JackpotMenu.tsx |
| `1:8536` | src/components/layout/HeaderPostlogin.tsx, src/components/layout/HeaderVip.tsx |
| `1:8751` | src/components/panels/JackpotMenu.tsx, src/components/primitives/Sheet.tsx |
| `1:8753` | src/components/panels/JackpotMenu.tsx |
| `1:8772` | src/components/panels/JackpotMenu.tsx |
| `1:8781` | src/components/panels/JackpotMenu.tsx |
| `1:8792` | src/components/panels/JackpotMenu.tsx |
| `1:8834` | src/components/panels/JackpotMenu.tsx |
| `1:8875` | src/components/panels/JackpotMenu.tsx |
| `1:8885` | src/components/panels/JackpotMenu.tsx |
| `1:8908` | src/components/panels/JackpotMenu.tsx |
| `1:8910` | src/components/panels/JackpotMenu.tsx |
| `13:2307` | src/components/panels/JackpotMenu.tsx, src/components/primitives/Sheet.tsx |
| `13:2325` | src/components/panels/JackpotMenu.tsx |
| `13:2333` | src/components/panels/JackpotMenu.tsx |
| `13:2338` | src/components/panels/JackpotMenu.tsx |
| `13:2339` | src/components/panels/JackpotMenu.tsx |
| `13:2340` | src/components/panels/JackpotMenu.tsx, src/components/primitives/Button.tsx |
| `13:2342` | src/components/panels/JackpotMenu.tsx |
| `13:2345` | src/components/panels/JackpotMenu.tsx |
| `13:2362` | src/components/panels/JackpotMenu.tsx |
| `13:2486` | src/components/panels/JackpotMenu.tsx |
| `13:2487` | src/components/panels/JackpotMenu.tsx |
| `13:2492` | src/components/panels/JackpotMenu.tsx |
| `13:2519` | src/components/panels/JackpotMenu.tsx, src/components/primitives/Sheet.tsx |
| `13:2550` | src/components/panels/JackpotMenu.tsx |
| `13:2552` | src/components/panels/JackpotMenu.tsx |
| `21:2896` | src/app/page.tsx |
| `21:2897` | src/components/layout/Header.tsx |
| `21:2898` | src/components/layout/Header.tsx |
| `21:2899` | src/components/layout/Header.tsx |
| `21:2916` | src/app/globals.css, src/components/layout/HeaderPostlogin.tsx |
| `21:2919` | src/components/layout/Header.tsx, src/components/primitives/IconButton.tsx |
| `21:2922` | src/components/layout/CategoryNavBar.tsx |
| `21:2926` | src/components/layout/HeroBanner.tsx |
| `21:2927` | src/components/layout/HeroBanner.tsx |
| `21:2929` | src/components/layout/HeroBanner.tsx |
| `21:2930` | src/components/layout/HeroBanner.tsx |
| `21:2931` | src/components/layout/HeroBanner.tsx |
| `21:2932` | src/app/globals.css, src/components/layout/HeroBanner.tsx, src/components/primitives/Badge.tsx |
| `21:2933` | src/components/primitives/Badge.tsx |
| `21:2934` | src/components/layout/HeroBanner.tsx, src/components/primitives/Badge.tsx |
| `21:2935` | src/components/primitives/Badge.tsx |
| `21:2937` | src/components/layout/HeroBanner.tsx |
| `21:2938` | src/components/layout/HeroBanner.tsx |
| `21:2939` | src/app/globals.css, src/components/layout/HeroBanner.tsx |
| `21:2977` | src/app/globals.css, src/components/primitives/CategoryPill.tsx |
| `21:3035` | src/components/layout/RecentWinsTicker.tsx |
| `21:3036` | src/components/cards/RecentWinItem.tsx |
| `21:3037` | src/components/cards/RecentWinItem.tsx |
| `21:3042` | src/components/cards/RecentWinItem.tsx |
| `21:3043` | src/components/layout/RecentWinsTicker.tsx |
| `21:3050` | src/components/cards/RecentWinItem.tsx |
| `21:3057` | src/components/cards/RecentWinItem.tsx |
| `21:3095` | src/components/sections/ProviderRow.tsx |
| `21:3118` | src/components/cards/ProviderCard.tsx |
| `21:3297` | src/app/page.tsx |
| `21:3693` | src/components/layout/Footer.tsx |
| `21:3785` | src/components/layout/Footer.tsx |
| `21:4020` | src/components/layout/Footer.tsx |

## Settled

| id | status | size | cited under src/ |
| --- | --- | --- | --- |
| `1:1483` | alive | 111x10 | yes |
| `1:2218` | alive | 390x458 | yes |
| `1:2220` | alive | 358x201 | yes |
| `1:2221` | alive | 358x84 | yes |
| `1:2222` | alive | 358x24 | yes |
| `1:2238` | alive | 358x44 | yes |
| `1:2239` | alive | 20x20 | yes |
| `1:2242` | alive | 28x28 | yes |
| `1:2245` | alive | 358x109 | yes |
| `1:2246` | alive | 48x48 | yes |
| `1:2431` | alive | 1440x7453 | yes |
| `1:2432` | alive | 1440x80 | yes |
| `1:2433` | alive | 1440x643 | yes |
| `1:2434` | alive | 1424x201 | yes |
| `1:2435` | alive | - | docs only |
| `1:2436` | alive | 1280x340 | yes |
| `1:2437` | alive | 1280x340 | yes |
| `1:2438` | alive | 1440x104 | yes |
| `1:2439` | alive | 1280x80 | yes |
| `1:2441` | alive | 201x48 | yes |
| `1:2447` | alive | 142x10 | yes |
| `1:2448` | alive | 1x40 | yes |
| `1:2457` | alive | 1x40 | docs only |
| `1:2466` | alive | 1x40 | docs only |
| `1:2475` | alive | 1x40 | docs only |
| `1:2500` | alive | 1440x106 | yes |
| `1:2503` | alive | 167x86 | docs only |
| `1:2504` | alive | 14x20 | docs only |
| `1:2588` | alive | 244x48 | yes |
| `1:2589` | alive | 16x16 | yes |
| `1:2592` | alive | 1294x324 | yes |
| `1:2593` | alive | 1280x28 | yes |
| `1:2601` | alive | 1294x280 | yes |
| `1:2602` | alive | 219x280 | yes |
| `1:2620` | alive | 1294x324 | yes |
| `1:2649` | alive | 1280x340 | yes |
| `1:2650` | alive | 1280x40 | yes |
| `1:2653` | alive | 187x13 | yes |
| `1:2654` | alive | 160x1 | yes |
| `1:2655` | alive | 40x40 | docs only |
| `1:2656` | alive | 20x20 | yes |
| `1:2657` | alive | 1280x280 | yes |
| `1:2658` | alive | 1280x140 | yes |
| `1:2660` | alive | 140x140 | yes |
| `1:2919` | alive | 1280x140 | yes |
| `1:3180` | alive | 1294x608 | yes |
| `1:3230` | alive | 1294x324 | yes |
| `1:3264` | alive | 116x28 | yes |
| `1:3265` | alive | 82x12 | yes |
| `1:3285` | alive | 1294x608 | yes |
| `1:3364` | alive | 1294x324 | yes |
| `1:3367` | alive | 20x20 | docs only |
| `1:3427` | alive | 1280x302 | yes |
| `1:3435` | alive | 160x1 | yes |
| `1:3436` | alive | 1280x260 | yes |
| `1:3441` | alive | 186x9 | yes |
| `1:3442` | alive | 426x62 | yes |
| `1:3443` | alive | 374x24 | yes |
| `1:3445` | alive | 368x28 | yes |
| `1:3446` | alive | 191x28 | yes |
| `1:3447` | alive | 159x16 | yes |
| `1:3448` | alive | 165x28 | yes |
| `1:3451` | alive | 180x48 | yes |
| `1:3452` | alive | 86x12 | yes |
| `1:3453` | alive | 177x18 | yes |
| `1:3456` | alive | 1294x324 | yes |
| `1:3485` | alive | 1294x324 | yes |
| `1:3524` | alive | 1280x302 | yes |
| `1:3531` | alive | 160x1 | yes |
| `1:3532` | alive | 1280x260 | yes |
| `1:3534` | alive | 372x260 | yes |
| `1:3535` | alive | 249x24 | yes |
| `1:3537` | alive | 308x23 | yes |
| `1:3538` | alive | 176x23 | yes |
| `1:3540` | alive | 124x23 | yes |
| `1:3543` | alive | 206x19 | yes |
| `1:3544` | alive | 75x9 | yes |
| `1:3545` | alive | 118x12 | yes |
| `1:3547` | alive | 82x12 | yes |
| `1:3548` | alive | 1294x324 | yes |
| `1:3551` | alive | 20x20 | docs only |
| `1:3556` | alive | 110x13 | docs only |
| `1:3580` | alive | 1280x302 | yes |
| `1:3586` | alive | 160x1 | yes |
| `1:3587` | alive | 1280x260 | yes |
| `1:3589` | alive | 344x260 | yes |
| `1:3590` | alive | 278x24 | yes |
| `1:3591` | alive | 256x28 | yes |
| `1:3593` | alive | 180x120 | yes |
| `1:3594` | alive | 180x34 | yes |
| `1:3600` | alive | 180x34 | yes |
| `1:3602` | alive | 64x14 | yes |
| `1:3604` | alive | 36x12 | yes |
| `1:3605` | alive | 1294x324 | yes |
| `1:3635` | alive | 1294x324 | yes |
| `1:3638` | alive | 20x20 | docs only |
| `1:3666` | alive | 1440x729 | yes |
| `1:3993` | alive | 108x48 | yes |
| `1:3998` | alive | 300x165 | yes |
| `1:4007` | alive | 300x165 | yes |
| `1:4016` | alive | 600x69 | yes |
| `1:4114` | alive | 1280x32 | yes |
| `1:4115` | alive | 1267x27 | yes |
| `1:4116` | alive | 1440x1036 | yes |
| `1:4118` | alive | 384x495 | yes |
| `1:4124` | alive | 384x463 | yes |
| `1:4125` | alive | 280x299 | yes |
| `1:4140` | alive | 23x18 | yes |
| `1:4145` | alive | 23x18 | yes |
| `1:4149` | alive | 23x18 | yes |
| `1:4151` | alive | 304x68 | yes |
| `1:4153` | alive | 1440x1036 | yes |
| `1:4154` | alive | 1440x1036 | docs only |
| `1:4155` | alive | 235x428 | yes |
| `1:4160` | alive | 235x396 | yes |
| `1:4161` | alive | 131x40 | yes |
| `1:4186` | alive | 131x40 | yes |
| `1:4244` | alive | 1440x200 | yes |
| `1:4245` | alive | 1440x80 | yes |
| `1:4250` | alive | 113x56 | yes |
| `1:4259` | alive | — | yes |
| `1:4272` | alive | 421x60 | yes |
| `1:4280` | alive | 32x32 | yes |
| `1:4282` | alive | 1440x80 | yes |
| `1:4309` | alive | 230x60 | yes |
| `1:4310` | alive | 91x36 | yes |
| `1:4314` | alive | 720x80 | yes |
| `1:4319` | alive | 16x16 | yes |
| `1:4321` | alive | 720x251 | yes |
| `1:4322` | alive | 656x48 | yes |
| `1:4323` | alive | 22x22 | yes |
| `1:4329` | alive | 48x48 | yes |
| `1:4334` | alive | 1440x720 | yes |
| `1:4431` | alive | - | yes |
| `1:4434` | alive | - | yes |
| `1:4435` | alive | — | yes |
| `1:4436` | alive | — | yes |
| `1:4454` | alive | - | yes |
| `1:4457` | alive | — | docs only |
| `1:4459` | alive | - | yes |
| `1:4479` | alive | 1440x720 | yes |
| `1:4568` | alive | 344x72 | yes |
| `1:4575` | alive | 12x12 | yes |
| `1:4576` | alive | 12x12 | yes |
| `1:4579` | alive | 784x378 | yes |
| `1:4583` | alive | — | yes |
| `1:4587` | alive | 546x13 | yes |
| `1:4611` | alive | 1440x720 | yes |
| `1:4707` | alive | 12x12 | yes |
| `1:4710` | alive | 1440x371 | yes |
| `1:4711` | alive | 784x371 | yes |
| `1:4712` | alive | 80x80 | yes |
| `1:4719` | alive | 128x31 | yes |
| `1:4721` | alive | 14x14 | yes |
| `1:4724` | alive | 800x119 | yes |
| `1:4725` | alive | 126x63 | yes |
| `1:4731` | alive | 118x73 | yes |
| `1:4737` | alive | 75x28 | yes |
| `1:4745` | alive | 1440x1114 | yes |
| `1:4759` | alive | 140x124 | yes |
| `1:4797` | alive | - | docs only |
| `1:4800` | alive | 82x10 | yes |
| `1:5199` | alive | 1440x1114 | yes |
| `1:5325` | alive | 1312x37 | yes |
| `1:5587` | alive | 1440x1896 | yes |
| `1:5591` | alive | 1312x377 | yes |
| `1:5623` | alive | 1312x371 | yes |
| `1:5655` | alive | 1312x366 | yes |
| `1:5687` | alive | 1312x378 | yes |
| `1:5697` | alive | - | docs only |
| `1:5720` | dead | - | yes |
| `1:5722` | dead | - | yes |
| `1:5736` | dead | - | yes |
| `1:5741` | dead | - | yes |
| `1:5743` | dead | - | yes |
| `1:5749` | dead | - | docs only |
| `1:5750` | dead | - | docs only |
| `1:5751` | dead | - | yes |
| `1:5752` | dead | - | docs only |
| `1:5753` | dead | - | docs only |
| `1:5755` | dead | - | docs only |
| `1:5756` | dead | - | docs only |
| `1:5758` | dead | - | docs only |
| `1:5761` | dead | - | docs only |
| `1:5762` | dead | - | docs only |
| `1:5799` | dead | - | docs only |
| `1:5859` | dead | - | docs only |
| `1:5882` | dead | - | yes |
| `1:5884` | dead | - | yes |
| `1:5887` | dead | - | yes |
| `1:5888` | dead | - | yes |
| `1:5936` | dead | - | yes |
| `1:6175` | dead | - | yes |
| `1:6179` | dead | - | yes |
| `1:6192` | dead | - | yes |
| `1:6194` | dead | - | yes |
| `1:6195` | dead | - | yes |
| `1:6247` | dead | - | yes |
| `1:6249` | dead | - | yes |
| `1:6250` | dead | - | yes |
| `1:6253` | dead | - | docs only |
| `1:6254` | dead | - | yes |
| `1:6255` | dead | - | yes |
| `1:6256` | dead | - | yes |
| `1:6257` | dead | - | yes |
| `1:6259` | dead | - | docs only |
| `1:6260` | dead | - | yes |
| `1:6282` | dead | - | yes |
| `1:6464` | dead | - | yes |
| `1:6467` | dead | - | yes |
| `1:6478` | dead | - | yes |
| `1:6479` | dead | - | yes |
| `1:6480` | dead | - | yes |
| `1:6499` | dead | - | docs only |
| `1:6517` | dead | - | docs only |
| `1:6978` | dead | - | yes |
| `1:6980` | dead | - | yes |
| `1:6994` | dead | - | yes |
| `1:7000` | dead | - | yes |
| `1:8234` | dead | - | docs only |
| `1:8235` | dead | - | yes |
| `1:8236` | dead | - | not cited |
| `1:8239` | dead | - | yes |
| `1:8244` | dead | - | not cited |
| `1:8245` | dead | - | yes |
| `1:8247` | dead | - | not cited |
| `1:8249` | dead | - | yes |
| `1:8254` | dead | - | yes |
| `1:8257` | dead | - | yes |
| `1:8259` | dead | - | not cited |
| `1:8260` | dead | - | yes |
| `1:8285` | dead | - | yes |
| `1:8305` | dead | - | yes |
| `1:8503` | dead | - | yes |
| `1:8504` | dead | - | docs only |
| `1:8528` | dead | - | yes |
| `1:8536` | dead | — | yes |
| `1:8751` | dead | - | yes |
| `1:8753` | dead | - | yes |
| `1:8772` | dead | - | yes |
| `1:8781` | dead | - | yes |
| `1:8792` | dead | - | yes |
| `1:8834` | dead | - | yes |
| `1:8875` | dead | - | yes |
| `1:8885` | dead | - | yes |
| `1:8908` | dead | - | yes |
| `1:8910` | dead | - | yes |
| `13:2307` | dead | — | yes |
| `13:2325` | dead | — | yes |
| `13:2333` | dead | — | yes |
| `13:2338` | dead | — | yes |
| `13:2339` | dead | — | yes |
| `13:2340` | dead | — | yes |
| `13:2342` | dead | — | yes |
| `13:2345` | dead | — | yes |
| `13:2362` | dead | — | yes |
| `13:2486` | dead | — | yes |
| `13:2487` | dead | — | yes |
| `13:2491` | dead | — | not cited |
| `13:2492` | dead | — | yes |
| `13:2519` | dead | — | yes |
| `13:2550` | dead | — | yes |
| `13:2552` | dead | — | yes |
| `21:2896` | dead | — | yes |
| `21:2897` | dead | — | yes |
| `21:2898` | dead | — | yes |
| `21:2899` | dead | — | yes |
| `21:2913` | dead | — | docs only |
| `21:2916` | dead | — | yes |
| `21:2919` | dead | — | yes |
| `21:2922` | dead | — | yes |
| `21:2926` | dead | — | yes |
| `21:2927` | dead | — | yes |
| `21:2929` | dead | — | yes |
| `21:2930` | dead | — | yes |
| `21:2931` | dead | — | yes |
| `21:2932` | dead | — | yes |
| `21:2933` | dead | — | yes |
| `21:2934` | dead | — | yes |
| `21:2935` | dead | — | yes |
| `21:2937` | dead | — | yes |
| `21:2938` | dead | — | yes |
| `21:2939` | dead | — | yes |
| `21:2975` | dead | — | docs only |
| `21:2977` | dead | — | yes |
| `21:2978` | dead | — | docs only |
| `21:2979` | dead | — | docs only |
| `21:2982` | dead | — | not cited |
| `21:3017` | dead | — | not cited |
| `21:3022` | dead | — | not cited |
| `21:3035` | dead | — | yes |
| `21:3036` | dead | — | yes |
| `21:3037` | dead | — | yes |
| `21:3042` | dead | — | yes |
| `21:3043` | dead | — | yes |
| `21:3050` | dead | — | yes |
| `21:3057` | dead | — | yes |
| `21:3058` | dead | — | docs only |
| `21:3077` | dead | — | not cited |
| `21:3095` | dead | — | yes |
| `21:3118` | dead | — | yes |
| `21:3296` | dead | — | docs only |
| `21:3297` | dead | — | yes |
| `21:3314` | dead | — | not cited |
| `21:3332` | dead | — | not cited |
| `21:3350` | dead | — | not cited |
| `21:3368` | dead | — | not cited |
| `21:3384` | dead | — | not cited |
| `21:3402` | dead | — | not cited |
| `21:3420` | dead | — | not cited |
| `21:3437` | dead | — | not cited |
| `21:3455` | dead | — | not cited |
| `21:3657` | dead | — | docs only |
| `21:3675` | dead | — | docs only |
| `21:3693` | dead | — | yes |
| `21:3785` | dead | — | yes |
| `21:4020` | dead | — | yes |
| `21:4026` | dead | — | docs only |
| `21:4154` | dead | — | docs only |
| `32:1812` | alive | 3358x7788 | docs only |
| `32:1813` | alive | 390x7159 | yes |
| `32:1814` | alive | 390x335 | docs only |
| `32:1829` | alive | 141x40 | docs only |
| `32:1852` | alive | 80x18 | yes |
| `32:1853` | alive | 64x12 | yes |
| `32:1893` | alive | 390x72 | yes |
| `32:1894` | alive | 791x56 | yes |
| `32:1895` | alive | 104x36 | yes |
| `32:1896` | alive | 11x16 | yes |
| `32:1898` | alive | 49x16 | yes |
| `32:1899` | alive | 4x4 | yes |
| `32:1900` | alive | 82x36 | yes |
| `32:1901` | alive | 16x16 | yes |
| `32:1934` | alive | 32x16 | yes |
| `32:1936` | alive | 16x16 | yes |
| `32:1937` | alive | 13x9 | yes |
| `32:1941` | alive | 18x16 | yes |
| `32:1968` | alive | 390x66 | yes |
| `32:1991` | alive | 390x368 | yes |
| `32:2010` | alive | 390x376 | yes |
| `32:2028` | alive | 390x264 | yes |
| `32:2229` | alive | 390x376 | yes |
| `32:2247` | alive | 390x376 | yes |
| `32:2265` | alive | 390x376 | yes |
| `32:2283` | alive | 390x376 | yes |
| `32:2301` | alive | 390x284 | yes |
| `32:2317` | alive | 390x376 | yes |
| `32:2335` | alive | 390x376 | yes |
| `32:2353` | alive | 390x284 | yes |
| `32:2370` | alive | 390x376 | yes |
| `32:2388` | alive | 390x284 | yes |
| `32:2590` | alive | 390x376 | yes |
| `32:2608` | alive | 390x410 | yes |
| `32:2626` | alive | 390x1140 | yes |
| `32:3087` | alive | 390x769 | docs only |
| `32:3284` | alive | 390x84 | yes |
| `32:3296` | alive | 35x12 | yes |
| `32:3308` | alive | 390x769 | docs only |
| `32:3530` | alive | 390x7159 | yes |
| `32:4828` | alive | 390x84 | yes |
| `32:4829` | alive | 360x64 | yes |
| `32:4830` | alive | 64x64 | yes |
| `32:4831` | alive | 56x56 | yes |
| `32:4838` | alive | 64x40 | yes |
| `32:4841` | alive | 64x40 | yes |
| `32:4852` | alive | 390x874 | yes |
| `32:4870` | alive | 78x40 | yes |
| `32:4885` | alive | 113x38 | yes |
| `32:4887` | alive | 358x44 | yes |
| `32:4907` | alive | 358x46 | yes |
| `32:5036` | alive | 58x20 | yes |
| `32:5063` | alive | 390x874 | yes |
| `32:5279` | alive | 390x769 | yes |
| `112:330` | dead | — | docs only |

## Still to check — none

Every one of the 356 ids is settled.
