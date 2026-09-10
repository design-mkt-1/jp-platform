# Figma node id ledger — INCOMPLETE, 67 of 322

File `2MyylxdZblfGnf05nQacUz`. Started 2026-09-10, session 13. **Do not read this as a finished
inventory.** It stops where the Figma MCP quota stopped it:

> You've reached the Figma MCP tool call limit for your Full seat on the Professional plan.

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

## What the sweep is worth so far, and what it is not

67 settled, **66 alive, 1 dead**, 255 still to check. Everything reached is in the `1:*` desktop
tree, which is intact. The ids already known to be dead live in `21:*`, which the quota cut off
before. **So the part of this table that would earn its keep is the part that is missing.** A guard
test built on it today would know one dead id and would give false confidence.

Two things worth keeping came out of it anyway, both measured rather than quoted:

- `1:2504` is **14x20**, confirming session 11's §2 C #5 against the live file: the desktop flame is
  forced to 20x20 in our CSS, which is why the `Popular` pill is 143.30 against Figma's 135.
- `1:2433` is alive but is a **1440x643 block**, not a divider. The desktop dividers are
  `1:2448` / `1:2457` / `1:2466` / `1:2475`, all **1x40**. Session 12 moved `--border-emphasis` onto
  those on that reading; the reading is now verified.

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
| `1:3448` | alive | 165x28 | yes |
| `1:3451` | alive | 180x48 | yes |
| `1:3452` | alive | 86x12 | yes |
| `1:3453` | alive | 177x18 | yes |
| `1:3456` | alive | 1294x324 | yes |
| `1:3485` | alive | 1294x324 | yes |
| `1:3524` | alive | 1280x302 | yes |
| `21:2896` | dead | — | yes |
| `32:1813` | alive | 390x7159 | docs only |

## Still to check — 255 ids

Grouped only for reading. **Do not classify by group**; that is the mistake above.

**`1:*`** (176)

`1:3531` `1:3532` `1:3534` `1:3535` `1:3537` `1:3538` `1:3540` `1:3543` `1:3544` `1:3545` `1:3547` `1:3548` `1:3551` `1:3556` `1:3580` `1:3586` `1:3587` `1:3589` `1:3590` `1:3591` `1:3593` `1:3594` `1:3600` `1:3602` `1:3604` `1:3605` `1:3635` `1:3638` `1:3666` `1:3993` `1:3998` `1:4007` `1:4016` `1:4114` `1:4115` `1:4116` `1:4118` `1:4124` `1:4125` `1:4140` `1:4145` `1:4149` `1:4151` `1:4153` `1:4154` `1:4155` `1:4160` `1:4161` `1:4186` `1:4244` `1:4245` `1:4250` `1:4259` `1:4272` `1:4280` `1:4282` `1:4309` `1:4310` `1:4314` `1:4319` `1:4321` `1:4322` `1:4323` `1:4329` `1:4334` `1:4431` `1:4434` `1:4435` `1:4454` `1:4459` `1:4479` `1:4568` `1:4575` `1:4576` `1:4579` `1:4583` `1:4611` `1:4707` `1:4710` `1:4711` `1:4712` `1:4719` `1:4721` `1:4724` `1:4725` `1:4731` `1:4737` `1:4745` `1:4759` `1:4797` `1:4800` `1:5199` `1:5325` `1:5587` `1:5591` `1:5623` `1:5655` `1:5687` `1:5697` `1:5720` `1:5722` `1:5736` `1:5741` `1:5743` `1:5749` `1:5750` `1:5751` `1:5752` `1:5753` `1:5755` `1:5756` `1:5758` `1:5761` `1:5762` `1:5799` `1:5859` `1:5882` `1:5884` `1:5887` `1:5888` `1:5936` `1:6175` `1:6179` `1:6192` `1:6194` `1:6195` `1:6247` `1:6249` `1:6250` `1:6253` `1:6254` `1:6255` `1:6256` `1:6257` `1:6259` `1:6260` `1:6282` `1:6464` `1:6467` `1:6478` `1:6479` `1:6480` `1:6499` `1:6517` `1:6978` `1:6980` `1:6994` `1:7000` `1:8234` `1:8235` `1:8236` `1:8239` `1:8244` `1:8245` `1:8247` `1:8249` `1:8254` `1:8257` `1:8259` `1:8260` `1:8285` `1:8305` `1:8503` `1:8504` `1:8528` `1:8536` `1:8751` `1:8753` `1:8772` `1:8781` `1:8792` `1:8834` `1:8875` `1:8885` `1:8908` `1:8910`

**`13:*`** (16)

`13:2307` `13:2325` `13:2333` `13:2338` `13:2339` `13:2340` `13:2342` `13:2345` `13:2362` `13:2486` `13:2487` `13:2491` `13:2492` `13:2519` `13:2550` `13:2552`

**`21:*`** (55)

`21:2897` `21:2898` `21:2899` `21:2913` `21:2916` `21:2919` `21:2922` `21:2926` `21:2927` `21:2929` `21:2930` `21:2931` `21:2932` `21:2933` `21:2934` `21:2935` `21:2937` `21:2938` `21:2939` `21:2975` `21:2977` `21:2978` `21:2979` `21:2982` `21:3017` `21:3022` `21:3035` `21:3036` `21:3037` `21:3042` `21:3043` `21:3050` `21:3057` `21:3058` `21:3077` `21:3095` `21:3118` `21:3296` `21:3297` `21:3314` `21:3332` `21:3350` `21:3368` `21:3384` `21:3402` `21:3420` `21:3437` `21:3455` `21:3657` `21:3675` `21:3693` `21:3785` `21:4020` `21:4026` `21:4154`

**`32:*`** (7)

`32:1812` `32:1814` `32:1968` `32:2626` `32:3087` `32:3284` `32:3308`

**`112:*`** (1)

`112:330`

