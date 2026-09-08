# How this codebase got its shape

Historical record. It explains the decisions behind the architecture — the things the code cannot
say about itself. For what is still to be done, read `docs/next-session.md`.

The original planning document was overwritten when the session re-entered planning for a later
task. This is a rewrite of the part worth keeping: the decisions and the reasons, not the execution
schedule that has already happened.

---

## What we started from

`D:\jp-platform` was empty — a `.git` with no commits. Everything comes from one Figma file,
`2MyylxdZblfGnf05nQacUz`, a single page named `Platform`.

Five things were measured in that file before any code was written, and each one shaped what
followed.

**Figma has no variables.** `get_variable_defs` returns exactly one value, `BG/Quaternary #0D1420`,
on the whole desktop frame and nothing at all on either UI Kit. Every colour in the design is a
hardcoded fill on a layer. That single fact is why `docs/tokens.md` exists and why an eslint rule
rejects hex under `src/components/`: without them there is no link at all between the design and
the code, and a colour change in Figma would have to be hunted through forty components.

**The two UI Kits contradict each other.** Five names carry different values —
`Page Background` is `#11111A` on desktop and `#0F121D` on mobile, `Card Border` is white at 4% in
one and the opaque `#262632` in the other. Not typos; decisions for different screens. The owner
chose the Mobile values for all five, with one exception added later: `bg-overlay` keeps both,
because a scrim behind a corner popover and a scrim behind a full-screen sheet are not the same job.

**The design has no per-game artwork.** `PopularGames` and `CrashGames` contain the same six
identical cards, "Gates of Olympus 1000". Three distinct game images exist in the entire file. That
is why `GameCard` draws a brand gradient with the title written on it when a game has no art — and
why it has to draw the title itself, since in Figma the title is baked into the image and the card
node contains no text.

**Twelve of the fifteen content rows are the same thing.** Popular, New Games, Crash Games,
Megaways, Jackpots and the rest differ only in their title, their icon and which games they query.

**The two `mob main` frames are not duplicates.** Out of 894 lines of structure they differ in
exactly one place: the header. One is pre-login with two Sign In buttons, the other post-login with
a balance pill. Mobile is one page with two headers, not two pages.

---

## The decisions

### Rows are data, not components

`src/lib/sections.ts` holds a registry of `SectionSpec` entries — kind, title, icon, filter, and the
Figma node id. `ContentRow` renders any of them. There are three renderers in total, not fifteen
components.

This is the spine of the project. A new row from the designer is four lines in that file and no new
component. If a change ever needs an `if` for a named section, something has gone wrong.

The `figmaNodeId` on every entry is not decoration: it is what turns the visual review into a loop
over the registry instead of twenty manual comparisons.

### Next.js App Router, though there is no backend

The win is not APIs, it is the render split. The fifteen rows, the header and the footer stay Server
Components that import the JSON at build time, so sixty static cards ship no JavaScript. Four
islands are client: the search overlay, the two header panels and the jackpot menu.

### Tailwind v3, not v4

The requirement was that `tailwind.config.ts` be the single source of colour. In v4 the theme moves
into `@theme` blocks inside `globals.css` — the same file that holds fonts, base layers and
keyframes. v3 keeps the theme and the stylesheet as two separately owned files.

### Zustand without a provider

A context provider would force a client boundary at the top of the tree and drag every card into the
client bundle. The store is imported directly by the islands that need it.

The URL is a mirror of three slices — `auth`, `panel`, `q` — written with `replaceState`, never a
source of truth. It exists so a single state can be linked to: `?auth=vip&panel=balance` opens the
VIP header with the balance panel already up. Without it, reviewing a state means clicking to it,
and a screenshot of "the balance panel" is really a screenshot of the default page.

### Build orchestration: file ownership, not isolation

The build ran as two waves of parallel agents. What kept them from colliding was not worktrees but
two explicit lists in every prompt — the files an agent may create, and the files it may only read.
Disjoint sets, so nothing had to be merged.

Worktrees were rejected deliberately: `node_modules` is not shared between them, so eight agents
would have meant eight full installs before writing a line, and without dependencies an agent cannot
even typecheck — losing the one gate that makes parallel work safe.

Phases 1 to 3 were serialized on purpose. Tokens and primitives are the shared vocabulary: two
agents reading the UI Kit independently produce `bg-surface` and `bg-card` for the same swatch, and
two agents writing `GameCard` produce two different cards.

---

## Traps this project already fell into

Each of these cost real time. They are listed so they cost it only once.

**`.next` is shared between `next dev` and `next build`.** Running a production build while the
review server was up corrupted it: every route began returning 500 with
`ENOENT ... _buildManifest.js.tmp.<random>` while the source was perfectly fine. The prohibition was
written into every agent prompt and then broken by the parent. `npm run build:check` now points the
build at its own directory. Editing `next.config.ts` while dev runs has the same effect, because
Next restarts itself on config change.

**`download_assets` returns the whole subtree.** Artwork, masks, and sometimes the Figma canvas
frame, with no way to tell them apart. `search-btn.svg` arrived that way: a 20×20 file containing
the entire page — a `#1E1E1E` backdrop and paths running from −2254 to 8005 — which rendered as a
giant magnifier spilling off the edge of the providers row. For icons use `get_design_context`,
which returns one clean SVG per leaf.

**`basePath` does not reach an image `src`.** Next rewrites links and its own bundles for a
sub-path deployment but not images. The first GitHub Pages export 404'd every picture on the page
while the dev server, served from the root, looked perfect. `withBase()` in `src/lib/assets.ts`
handles it; paths coming out of `src/data/*.json` have to be wrapped at their call sites.

**Parallel agents guess each other's conventions.** The contracts agent and the asset agent ran at
the same time. `footer.json` listed all fourteen payment and partner logos with a null source while
the files sat on disk under different names — `bitcoin-cash` in the data, `gatewaycrypto-bch.svg` on
disk. Anything two parallel agents must agree on has to be decided before they start.

**A frame's backdrop can be a stale bitmap.** The `Personal information Opened` frame shows game
cards with titles written under them, which contradicts the live page. Node `1:4154` is a
rectangle named `desktop-main 2` — a flattened screenshot of an older render. Reading the design
from a state frame's background is reading the past.

**Present in the DOM is not the same as visible.** `Sign out` existed in `JackpotMenu` the whole
time, correctly hidden pre-login. It was simply below the fold, because the sheet was docked to the
bottom where the design anchors it at the top. No test of the code would have caught it.
