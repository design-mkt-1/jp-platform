"use client";

import Panel from "../primitives/Panel";
import Sheet from "../primitives/Sheet";
import { useDesktopViewport } from "../search/SearchOverlay";
import { profile as PROFILE, vipProfile as VIP_PROFILE } from "@/lib/data";
import { useAppStore } from "@/store/useAppStore";

/**
 * The menu that drops out of the username pill — frame `Personal information Opened` (1:4153),
 * popover node 1:4160.
 *
 * Despite the frame name it is a navigation menu, not a details form: the six rows are Wallet,
 * History, Invite Friends, Bonuses, Profile and Sign out. Nothing in the frame renders the
 * email, phone, date of birth or address that `user.json` carries, so this panel does not
 * invent a place for them.
 *
 * Glyphs are drawn inline rather than loaded through the `Icon` primitive. None of the six exist
 * in `public/images/icons/` and `IconName` cannot name them; more to the point every icon in that
 * folder is a flattened export with its own baked fill, so it could not take the row's hover
 * colour. The header already redraws its chevron and plus for exactly this reason. The exported
 * assets are requested in the report.
 *
 * As in `BalancePanel`, the modal behaviour is `Panel`'s and the backdrop is whatever `bg-overlay`
 * resolves to at the current viewport — see globals.css, not a value copied to here.
 *
 * ## Two surfaces, one at a time
 *
 * Below 768 the panel is not opened from the username pill — the pill does not exist there — but
 * from the jackpot menu's `More` row, which closes the menu on its way out. A popover with no
 * trigger left on screen is a card floating in the middle of the phone, so the phone gets `Sheet`
 * instead, the same surface the jackpot menu it replaces was drawn on.
 *
 * Only ever one of them is rendered. Both are `role="dialog" aria-modal`, both run
 * `useOverlayBehavior`, so mounting both would put two focus traps and two accessible names in the
 * document for one menu. The switch is `useDesktopViewport` — `SearchOverlay`'s hook, already
 * imported across areas by `CategoryNavBar`, reading the same 768px edge Tailwind's `mobile:`
 * variant uses. It is not moved to a file of its own here only because two of its four callers are
 * outside this change's reach.
 */

/** Nodes 1:4161 → 1:4186: 20px box, 18px glyph, stroked rather than filled. */
const GLYPH = "size-[18px]";

function glyphProps() {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: GLYPH,
    "aria-hidden": true,
  } as const;
}

function WalletIcon() {
  return (
    <svg {...glyphProps()}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg {...glyphProps()}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </svg>
  );
}

function InviteIcon() {
  return (
    <svg {...glyphProps()}>
      <path d="M14 19a6 6 0 0 0-12 0" />
      <circle cx="8" cy="9" r="4" />
      <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg {...glyphProps()}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg {...glyphProps()}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg {...glyphProps()}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

const ITEM = [
  "flex w-full items-center gap-4 rounded-xl px-2 py-2.5 text-left",
  "font-flex text-sm font-medium leading-4",
  // Every row keeps a focus ring, including the unavailable ones: they stay in the tab order (see
  // below), and a control you can reach but cannot see you have reached is worse than either.
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
].join(" ");

/** The one row that does something. */
const ITEM_AVAILABLE = `${ITEM} text-primary transition-colors hover:bg-elevated active:bg-subtle`;

/**
 * The five that do not.
 *
 * No hover fill, no active fill, no pointer cursor, and the label drops from `text-primary` to
 * `text-tertiary` — every signal that says "press me" is removed, because pressing does nothing.
 * They are still `<button aria-disabled>` rather than plain text: the frame draws six menu
 * destinations and five of them are unavailable in this demo, which is a different statement from
 * "these are captions". `aria-disabled` announces them as such while leaving them where a keyboard
 * user can find them, which the `disabled` attribute would not — it drops them from the tab order
 * entirely, and `FOCUSABLE_SELECTOR` in `Panel` would then skip them in the focus trap as well.
 */
const ITEM_UNAVAILABLE = `${ITEM} cursor-default text-tertiary`;

/** Wallet, History, Invite Friends, Bonuses and Profile lead nowhere in the demo — there are no
    such routes and none are invented here. Sign out is the one row with a real effect available. */
const NAVIGATION = [
  { id: "wallet", label: "Wallet", Glyph: WalletIcon },
  { id: "history", label: "History", Glyph: HistoryIcon },
  { id: "invite", label: "Invite Friends", Glyph: InviteIcon },
  { id: "bonuses", label: "Bonuses", Glyph: GiftIcon },
  { id: "profile", label: "Profile", Glyph: ProfileIcon },
] as const;

export default function PersonalInfoPanel() {
  const open = useAppStore((state) => state.panel === "personalInfo");
  const closePanel = useAppStore((state) => state.closePanel);
  const authMode = useAppStore((state) => state.authMode);
  const setAuthMode = useAppStore((state) => state.setAuthMode);

  const desktop = useDesktopViewport();

  const user = authMode === "vip" ? VIP_PROFILE : PROFILE;

  const rows = (
    // Node 1:4160: 8px between rows.
    <nav className="flex flex-col gap-2">
      {NAVIGATION.map(({ id, label, Glyph }) => (
        <button
          key={id}
          type="button"
          aria-disabled
          className={ITEM_UNAVAILABLE}
        >
          {/* Inherits the row's muted colour rather than setting its own, so the glyph dims
              with the label instead of staying brighter than the text it belongs to. */}
          <span className="flex size-5 shrink-0 items-center justify-center">
            <Glyph />
          </span>
          {label}
        </button>
      ))}

      {/* `setAuthMode` already clears the open panel, so this closes itself. */}
      <button
        type="button"
        onClick={() => setAuthMode("prelogin")}
        className={ITEM_AVAILABLE}
      >
        <span className="flex size-5 shrink-0 items-center justify-center text-muted">
          <SignOutIcon />
        </span>
        Sign out
      </button>
    </nav>
  );

  // `useDesktopViewport` answers `false` for the server and for the hydration pass; both surfaces
  // portal nothing until their own `mounted` flips, so neither renders markup that could mismatch.
  if (!desktop) {
    return (
      <Sheet
        open={open}
        onClose={closePanel}
        title={`Account menu — ${user.displayName}`}
        hideTitle
      >
        {rows}
      </Sheet>
    );
  }

  return (
    <Panel
      open={open}
      onClose={closePanel}
      // The popover carries no heading of its own, so the account it belongs to becomes the
      // dialog's accessible name — otherwise a screen reader announces an unnamed dialog.
      title={`Account menu — ${user.displayName}`}
      hideTitle
      // 171 is the width of the username pill this hangs off (node 1:4160). It needs no breakpoint
      // guard: this branch is only reached at 768 and above, which is where that pill exists.
      className="!max-w-[171px] !rounded-3xl"
    >
      {rows}
    </Panel>
  );
}
