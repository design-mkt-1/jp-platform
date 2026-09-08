'use client'

import { AccountCluster } from './HeaderPostlogin'

/**
 * The right-hand cluster of the header for a VIP player.
 *
 * Figma has no VIP header frame: the only place the tier is drawn is the account drawer
 * (node 1:8536, the star badge inside `jackpot-menu postlog VIP`). The bar itself is the
 * post-login bar, so this variant is the post-login cluster with `tier="vip"` — which swaps in the
 * VIP balance from `user.json` and adds that same badge. Reproducing the cluster here instead
 * would give the demo two balance pills to keep in step.
 */

export default function HeaderVip() {
  return <AccountCluster tier="vip" />
}
