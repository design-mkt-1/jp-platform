# `text-[Npx]` line-height audit

Session 13 counted 48 `text-[Npx]` sites, 25 with a `leading-` on the same source line, leaving
~23 called "approximate" because a per-line grep misses a `leading-` on a different line of a
multi-line `className`. This pass reads every occurrence's **full** className (arrays joined with
`.join(' ')`, template literals, multi-line JSX attributes) rather than the matched line alone, then
measures the ones that still carry no `leading-` in a real browser at 390×844 and 1440×900.

## Method

- `npm ci` (this worktree had no `node_modules`), then `next dev --turbopack` on an isolated
  `NEXT_DIST_DIR`/port. Killed by PID after the run; port and directory both verified clear.
- Measurement is Playwright (`chromium.launch({channel:'chrome'})`), never a screenshot diff:
  `getComputedStyle(el).lineHeight` and `el.getBoundingClientRect().height` on the live DOM.
  `page.click()` / `getByRole().click()` only — no `element.click()`.
  `window.innerWidth` asserted equal to the requested width before trusting any measurement, on
  every run (never hit a maximised-Chrome mismatch here, since the rig is a fixed Playwright
  viewport, not `resize_window`).
- States reached: default homepage load (`authMode` defaults to `postlogin`), `?panel=balance`,
  `?auth=prelogin`, `?auth=vip` (all via `UrlStateBridge`, mounted on `/`), a real click on the
  "Search games…" trigger (empty-query Popular/Recent state), and `?q=sweet` (Suggestions state).
- Not reached, for lack of a matching data state: `SearchNoResults`'s `sm` variant (needs a
  committed query with zero matches). That one row is a static-code finding only, not
  browser-verified — flagged below rather than guessed.
- No Figma connector on this worker (per `CLAUDE.md`'s orchestration section — connectors don't
  follow a worktree). Every "wrong by Npx" figure below is a real DOM measurement; there is no
  Figma-target comparison in this report because that number was not available to fetch. Where the
  file's own comments state a Figma target (Badge `xs`), that is quoted, not re-derived.

## Full split: 47 sites found under `src/` (session 13's ~48)

**25 already carry a `leading-` somewhere in their own className — confirmed safe, no action:**
`CategoryView.tsx:41`, `JackpotMenu.tsx:77,219,335,351,380,400`, `FooterBottom.tsx:18`,
`Footer.tsx:81`, `FooterLinkColumn.tsx:42`, `GameCard.tsx:99`, `HeroBanner.tsx:108,198,201`,
`SearchNoResults.tsx:79`, `PromoBannerMobile.tsx:137,149,192,207,246`, `Badge.tsx:48` (the `xs`
size — the one the file's own comment already documents), `PromoBanner.tsx:147`,
`RecentWinItem.tsx:75`.

**22 sites carry no `leading-` anywhere in their own className.** This replaces session 13's "~23,
approximate" with an exact, checked list. Two of the 22 were missed by a first same-line-only pass
of this audit itself and only surfaced by reading the full array: `PromoBannerMobile.tsx:172`
(joined array, `leading-` sits on neighbouring *lines* of *other* elements, not this one) and
`SearchNoResults.tsx:92`, `HeaderPostlogin.tsx:45` (`VipBadge`) — the same failure mode the brief
warned about, reproduced while doing the audit.

## The 22, measured

Legend: **VISIBLE** = the element's own rendered height is driven directly by the inherited
line-height (no ancestor locks the box to a fixed height) — a real, measured layout effect.
**LOCKED** = an ancestor (usually the `Button` primitive's `h-9`/`h-11`/`h-12` override, or a
literal `h-[Npx]`) fixes the box height, so the taller inherited line box is centered inside it and
produces no visible change. **DEAD** = not reachable from any state this app's data can produce.

| Site | Reachable at | Own line-height (measured) | Box height (measured) | Verdict |
|---|---|---|---|---|
| `Header.tsx:57` NAV_ITEM_BASE (desktop nav `Casino`/`Live Casino`/…) | 1440, default load | 19.5px (13px×1.5, inherited) | 35.5px, intrinsic (`py-2` + line box) | **VISIBLE** |
| `HeaderPostlogin.tsx:45` `VipBadge` (★ VIP pill) | 1440, `?auth=vip` | 16.5px (11px×1.5) | 24.5px, intrinsic (`py-1` + line box) | **VISIBLE** |
| `GameCard.tsx:102` provider line | both, default load | 16.5px @1440 (11px) / 15px @390 (10px) | 16.5px / 15px, intrinsic | **VISIBLE** (shifts the title/provider gap inside the card; the card itself doesn't grow — `aspect-[203/264]` + `overflow-hidden` clips the outer box, only the internal stack moves) |
| `Badge.tsx:50` `md` size (tournament pills, e.g. "1,000,000.00 GBP PRIZE") | 1440 only — `PromoBanner` (desktop) is what renders these; `PromoBannerMobile` takes over at 390 and never calls Badge `md` | 19.5px (13px×1.5) | 31.5px, intrinsic (`py-1.5` + line box) | **VISIBLE** — same load-bearing gap the file's own comment already names for `xs` (21 vs Figma's 18), left unfixed on `md` |
| `SearchPopularRecent.tsx:33` TAG_CLASSES (popular-search pill) | both, via a real click on the search trigger, empty query | 19.5px | 37.5px, intrinsic (`py-2` + 2×1px border + line box) | **VISIBLE** |
| `SearchPopularRecent.tsx:78` recent-term button | both, same click path | 19.5px | 35.5px, intrinsic (`py-2` + line box) | **VISIBLE** |
| `SearchSuggestions.tsx:110` provider line | both, `?q=sweet` | 16.5px | 16.5px, intrinsic (`flex-col gap-0.5` row, no fixed height) | **VISIBLE** |
| `MobileNavBar.tsx:280` tab label (`Casino`, `Sport`, …) | 390, default load | 15px (10px×1.5) | 15px, intrinsic | **VISIBLE** on the icon/gap/label stack inside the tab column (`flex-col justify-center`, no `h-*` of its own); did not re-derive whether the outer 84px bar itself shifts — the column isn't height-locked, so treat as the same class of defect as `GameCard`, not confirmed catastrophic |
| `MobileNavBar.tsx:358` "Menu" label | 390, default load | 15px | 15px, intrinsic | same as above |
| `BalancePanel.tsx:102` Button `!text-[15px]` "Deposit" | both, `?panel=balance` | 24px | 44px (`h-11` on the caller's className) | LOCKED — no visible effect |
| `CategoryNavBar.tsx:50` SEARCH_TRIGGER_CLASSES | 1440 only, default load | 19.5px | 48px (`h-12`) | LOCKED |
| `CategoryNavBar.tsx:261` inline search `<input>` | 1440 only — measured directly, since `<input>` has no `textContent` to catch in a blanket DOM sweep; confirmed mobile routes through a *different* field (`text-sm`, not this one) | 19.5px | 19.5px intrinsic, but sits inside `SEARCH_FIELD_CLASSES`' `h-12` | LOCKED |
| `HeaderPostlogin.tsx:82` balance amount span | 1440 only, default load | 19.5px | 19.5px, inside the balance button's `h-10` | LOCKED |
| `HeaderPostlogin.tsx:90` Button "Deposit" | 1440 only, default load | 24px | 36px (`!h-9`) | LOCKED |
| `HeaderPostlogin.tsx:100` display-name span | 1440 only, default load | 19.5px | 19.5px, inside the profile button's `h-9` | LOCKED |
| `HeaderPrelogin.tsx:48` OUTLINE_PILL "Log In" | 1440 only, `?auth=prelogin` | 19.5px | 36px (`h-9`) | LOCKED |
| `HeaderPrelogin.tsx:74` Button "Register" | 1440 only, `?auth=prelogin` | 24px | 36px (`!h-9`) | LOCKED |
| `PromoBannerMobile.tsx:172` "JOIN NOW" link | 390, default load | 19.5px | 30px (`h-[30px]`) | LOCKED |
| `PromoBannerMobile.tsx:255` Button, wheel-card CTA | 390 (not independently re-measured — same `Button` + `h-[34px]` pattern as the row above, not re-clicked to confirm) | — | `h-[34px]` fixed | presumed LOCKED, not directly measured |
| `Button.tsx:111` `tinted` size × `primaryBlue` variant (HeroBanner "Get" pill) | **DEAD** — `HeroBanner`'s `ctaHref` prop is never passed from `page.tsx`; the branch that would render this `<Button>` never executes, the aria-hidden fallback span (which already has `leading-[19px]`) renders instead | — | — | DEAD, not reachable with current data |
| `Button.tsx:113` `header` size | **DEAD** — its only consumer is `variant="outline"`'s default size, and no call site anywhere in `src/` passes `variant="outline"` to `<Button>` | — | — | DEAD |
| `SearchNoResults.tsx:92` "Clear search" (`sm` size) | Not reached — needs a committed search query with zero matches; not clicked through in this pass | — | — | **not browser-verified** — static check only. No `leading-` in its own className, no fixed height on the button, so the same VISIBLE pattern is likely, but this is reasoning, not a measurement. |

## What "VISIBLE" means concretely, one named example

`Badge.tsx`'s own comment already explains the mechanism for the `xs` pill (10px text, no
`leading-`): the arbitrary `text-[10px]` sets font-size only, the element falls back to the
inherited `line-height: 1.5` ratio computed against its own 10px font, giving 15px, and with the
pill's `py-[3px]` padding that is 15+3+3 = 21px tall against Figma's 18. That fix (`leading-3`) is
already shipped for `xs`. The **same** component's `md` size (`Badge.tsx:50`, used by
`PromoBanner`'s tournament/lottery pills — "1,000,000.00 GBP PRIZE" on the homepage right now) has
the identical gap: measured 19.5px inherited line-height, `py-1.5` padding, 31.5px rendered pill
height, and no `leading-` anywhere to stop it. It is live on the homepage at 1440 today.

## Proposed fixes (not applied — reporting only, per the brief)

Only the 8 rows marked **VISIBLE** above need a code change; the 9 **LOCKED** rows are cosmetically
inert (fixed-height ancestor already absorbs the extra line box) and touching them is optional
cleanup, not a bug fix. For each VISIBLE row, the fix is the same shape already used elsewhere in
this codebase: add one `leading-<n>` (or `leading-[Npx]` when the target isn't one of Tailwind's
named steps) next to the `text-[Npx]` that currently has none — same pattern as `Badge.tsx:48`,
`JackpotMenu.tsx`'s rows, `RecentWinItem.tsx:75`. None of the 8 have a documented Figma target
height available to this worker, so the exact `leading-` value needs either the Figma connector
(coordinator-side per `CLAUDE.md`) or an explicit pixel target from the owner before it's chosen —
picking one by guessing the ratio would be exactly the kind of unverified fix this brief is trying
to avoid.
