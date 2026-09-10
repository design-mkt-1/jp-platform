'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import Button from '../primitives/Button'
import { useAppStore } from '@/store/useAppStore'

/**
 * The bottom tab bar of Figma node 32:4828 (390x84): four routes around a centre action that opens
 * the Jackpot menu, all sitting on a 360x64 glass capsule. The frame it replaced, the deleted
 * 1:8235, raised the centre disc 42px above a full-width strip and labelled it "Menu"; the rebuilt
 * one keeps the disc inside the capsule and draws no label, so the button is named by
 * `aria-label` instead.
 *
 * Mobile only. The desktop frames have no equivalent — navigation there lives in the header — so
 * the whole bar is behind the `mobile:` breakpoint rather than being hidden by a page-level wrapper.
 *
 * Client-side because the active tab follows the route and the centre action dispatches into the
 * store.
 *
 * ## Why the glyphs are inline and not files
 *
 * The active tab tints its mark amber and the other four sit muted, so a mark has to inherit
 * `currentColor`. Every file under `public/images/icons/` is a flattened export with a baked fill
 * and is served through `<img>`, which cannot take a colour — that is the constraint, and it is
 * the only one left. So the geometry lives here, inline, painting on `currentColor`.
 *
 * The four outer tab marks are Figma's own vectors, lifted path-for-path from nodes 1:8245
 * (casino), 1:8249 (live casino), 1:8254 (sport) and 1:8257 (promos) and stripped of their baked
 * `fill`. Figma outlines its strokes, so these are filled compound paths in a 22-unit box that
 * they fill edge to edge — which is the point: the hand-redrawn versions they replace spanned only
 * ~18 x 13.6 of a 24-unit box and read visibly smaller than the design. They ignore `strokeWidth`.
 *
 * Everything else — the burger and the eight menu rows — is still hand-drawn on the 24-unit stroke
 * grid, because those nodes have no usable export.
 *
 * `MenuGlyph` is exported because `JackpotMenu` draws from the same set. One source of truth beats
 * two files whose stroke weights drift apart; it lives here because this is the smaller of the two.
 */

/** The four tab marks that come from Figma as outlined fills in a 22-unit box. */
type FilledGlyphName = 'casino' | 'live-casino' | 'sport' | 'promotions'

/** Everything still hand-drawn on the 24-unit stroke grid. */
type StrokedGlyphName =
  | 'burger'
  | 'referral'
  | 'bonuses'
  | 'cashback'
  | 'payments'
  | 'profile'
  | 'terms'
  | 'signout'
  | 'copy'
  | 'chevron-down'
  | 'user'
  | 'support'
  | 'whatsapp'

export type MenuGlyphName = FilledGlyphName | StrokedGlyphName

/**
 * Figma's own vectors, `fill` removed so they take `currentColor`.
 *
 * Each keeps the viewBox its node was authored in. Live Casino is the one that is not square —
 * node 1:8249 is 17.77 x 22 and sits centred in the 22px column — so its box is shifted left by
 * half the difference instead of the art being stretched to fill a square it was never drawn for.
 */
const FILLED_GLYPHS: Record<FilledGlyphName, { viewBox: string; path: ReactNode }> = {
  // Node 1:8245: slot cabinet, three reels, no lever.
  casino: {
    viewBox: '0 0 22 22',
    path: (
      <path d="M20.412 17.8879H1.58804V19.2241C1.58804 19.9622 2.24784 20.5604 3.06202 20.5604H18.938C19.7522 20.5604 20.412 19.9622 20.412 19.2241V17.8879ZM4.53599 13.056V8.94396C4.53599 8.54653 4.89161 8.22415 5.33001 8.22415C5.76841 8.22415 6.12403 8.54653 6.12403 8.94396V13.056C6.12403 13.4535 5.76841 13.7759 5.33001 13.7759C4.89161 13.7759 4.53599 13.4535 4.53599 13.056ZM10.206 13.056V8.94396C10.206 8.54653 10.5616 8.22415 11 8.22415C11.4384 8.22415 11.794 8.54653 11.794 8.94396V13.056C11.794 13.4535 11.4384 13.7759 11 13.7759C10.5616 13.7759 10.206 13.4535 10.206 13.056ZM15.876 13.056V8.94396C15.876 8.54653 16.2316 8.22415 16.67 8.22415C17.1084 8.22415 17.464 8.54653 17.464 8.94396V13.056C17.464 13.4535 17.1084 13.7759 16.67 13.7759C16.2316 13.7759 15.876 13.4535 15.876 13.056ZM8.732 1.43963C6.9377 1.43963 5.43832 2.58422 5.0742 4.11207H16.9258C16.5617 2.58422 15.0623 1.43963 13.268 1.43963H8.732ZM20.412 6.88793C20.412 6.14984 19.7522 5.5517 18.938 5.5517H3.06202C2.24784 5.5517 1.58804 6.14984 1.58804 6.88793V16.4483H20.412V6.88793ZM22 19.2241C22 20.7571 20.629 22 18.938 22H3.06202C1.37103 22 0 20.7571 0 19.2241V6.88793C1.27919e-06 5.35498 1.37103 4.11207 3.06202 4.11207H3.46179C3.84526 1.78506 6.05831 5.40867e-07 8.732 0H13.268C15.9417 2.11897e-07 18.1547 1.78506 18.5382 4.11207H18.938C20.629 4.11207 22 5.35498 22 6.88793V19.2241Z" />
    ),
  },
  // Node 1:8249: one playing card with a club pip, plus the stack of chips at its corner.
  'live-casino': {
    viewBox: '-2.11538 0 22 22',
    path: (
      <>
        <path d="M5.17458 10.4303C4.84792 10.4303 4.64782 10.1064 4.61898 9.7864C4.61562 9.74966 4.62038 9.75825 4.61418 9.73642C4.61401 9.70626 4.61715 9.63442 4.6431 9.52601C4.70767 9.25676 4.85905 9.00957 5.08097 8.81092L6.27772 7.75917L7.45293 8.80967C7.67559 9.0084 7.82754 9.25612 7.89223 9.52605C7.91823 9.6345 7.92133 9.70635 7.92115 9.73651C7.91496 9.75834 7.91972 9.74975 7.9164 9.78648C7.88752 10.1065 7.68746 10.4304 7.36075 10.4304C7.07257 10.4304 6.93663 10.2027 6.88838 10.0947C6.86587 10.0397 6.83586 9.98861 6.79965 9.94246C6.79913 9.94173 6.79856 9.941 6.79799 9.94031C6.79638 9.93825 6.79472 9.93619 6.79311 9.93417C6.79206 9.93288 6.79106 9.93163 6.78997 9.93039C6.78853 9.92862 6.78704 9.92686 6.7856 9.9251C6.78442 9.92372 6.78329 9.92239 6.78216 9.92102C6.78128 9.92003 6.78041 9.919 6.77954 9.91801C6.77718 9.91535 6.77491 9.91268 6.77256 9.91006C6.7719 9.90933 6.77129 9.90864 6.77064 9.90796C6.76916 9.90628 6.76763 9.9046 6.76606 9.90293C6.7658 9.90263 6.76549 9.90233 6.76523 9.90203C6.76209 9.89863 6.7589 9.89528 6.75572 9.89197C6.75541 9.89167 6.75515 9.89141 6.75493 9.89111C6.75328 9.88939 6.75153 9.88767 6.74987 9.886C6.74957 9.88565 6.74926 9.88535 6.74896 9.88505C6.74599 9.88209 6.74307 9.87917 6.74006 9.87629C6.73932 9.8756 6.73862 9.87487 6.73788 9.87418C6.73639 9.87276 6.73495 9.87139 6.73343 9.86997C6.73225 9.86885 6.73103 9.86769 6.72976 9.86658C6.72797 9.8649 6.72619 9.86327 6.7244 9.86164C6.72287 9.86022 6.72126 9.8588 6.71973 9.85742C6.71877 9.85657 6.71785 9.85575 6.71689 9.85493C6.71436 9.85274 6.71183 9.85051 6.70935 9.84836C6.70956 9.84853 6.70913 9.84819 6.70935 9.84836C6.7066 9.84599 6.70311 9.84312 6.70027 9.8408C6.59562 9.75494 6.46322 9.7005 6.31842 9.69255C6.31075 9.69212 6.30281 9.69182 6.29509 9.69169L6.29256 9.69165C6.28889 9.69157 6.28518 9.69152 6.28147 9.69152C6.27777 9.69152 6.27406 9.69157 6.27039 9.69165L6.26791 9.69169C6.26014 9.69182 6.25242 9.69212 6.24474 9.69255C6.09995 9.7005 5.96755 9.75477 5.8629 9.84062C5.86006 9.84294 5.85705 9.84548 5.85426 9.84784C5.85448 9.84767 5.85404 9.84801 5.85426 9.84784C5.85177 9.84999 5.84859 9.85274 5.8461 9.85493C5.8451 9.85575 5.84418 9.85657 5.84322 9.85742C5.84169 9.8588 5.84008 9.86022 5.83855 9.86164C5.83676 9.86327 5.83498 9.8649 5.83319 9.86658C5.83192 9.86769 5.8307 9.86885 5.82952 9.86997C5.82804 9.87139 5.82656 9.87276 5.82507 9.87418C5.82437 9.87487 5.82363 9.8756 5.82289 9.87629C5.81988 9.87917 5.81696 9.88209 5.81399 9.88505C5.81369 9.88535 5.81342 9.88565 5.81308 9.886C5.81142 9.88767 5.80972 9.88939 5.80806 9.89111C5.8078 9.89141 5.80754 9.89167 5.80723 9.89197C5.80405 9.89528 5.80086 9.89863 5.79772 9.90203C5.79746 9.90233 5.79715 9.90263 5.79689 9.90293C5.79532 9.9046 5.79379 9.90628 5.79231 9.90796C5.7917 9.90864 5.79105 9.90933 5.79039 9.91006C5.78808 9.91268 5.78577 9.91535 5.78341 9.91801C5.78258 9.919 5.78167 9.92003 5.78079 9.92102C5.77966 9.92239 5.77853 9.92372 5.77735 9.9251C5.77591 9.92686 5.77442 9.92862 5.77298 9.93039C5.77189 9.93163 5.77089 9.93288 5.76989 9.93417C5.76823 9.93619 5.76657 9.93825 5.76496 9.94031C5.76443 9.941 5.76382 9.94173 5.7633 9.94246C5.72714 9.98852 5.69717 10.0396 5.6747 10.0944C5.58322 10.2988 5.38795 10.4303 5.17458 10.4303ZM7.36075 11.7195C8.32102 11.7195 9.11625 10.9475 9.21812 9.92037C9.23295 9.81196 9.24774 9.57138 9.16594 9.22991C9.04009 8.70479 8.75155 8.22912 8.33206 7.85478L6.72126 6.41485C6.47334 6.19326 6.09559 6.19167 5.84584 6.4112L4.20742 7.851C4.20616 7.85212 4.20489 7.85323 4.20363 7.85435C3.7837 8.22925 3.49521 8.70487 3.36939 9.22991C3.2876 9.57125 3.30238 9.81188 3.31722 9.92029C3.41908 10.9474 4.21432 11.7194 5.17458 11.7194C5.3295 11.7194 5.48122 11.7001 5.6271 11.6633V12.2967C5.6271 12.6527 5.92009 12.9412 6.28147 12.9412C6.64286 12.9412 6.93585 12.6527 6.93585 12.2967V11.6699C7.07252 11.7025 7.21483 11.7195 7.36075 11.7195Z" />
        <path d="M3.61913 4.80633V2.84566C3.61913 2.48971 3.32615 2.20113 2.96476 2.20113C2.60337 2.20113 2.31039 2.48971 2.31039 2.84566V4.80633C2.31039 5.16228 2.60337 5.45086 2.96476 5.45086C3.32615 5.45086 3.61913 5.16228 3.61913 4.80633Z" />
        <path d="M15.6841 20.2401C15.0347 20.5393 14.1208 20.7109 13.1766 20.7109C11.1395 20.7109 9.89274 19.9532 9.89274 19.5406V18.6805C9.96398 18.7183 10.0379 18.7548 10.1146 18.7901C10.9434 19.1721 12.0308 19.3824 13.1766 19.3824C14.3224 19.3824 15.4098 19.1721 16.2387 18.7901C16.3153 18.7548 16.3892 18.7183 16.4605 18.6805V19.5406C16.4605 19.7107 16.2204 19.993 15.6841 20.2401ZM1.30874 15.9915V1.97562C1.30874 1.59706 1.62144 1.28906 2.00578 1.28906H10.5296C10.9139 1.28906 11.2266 1.59706 11.2266 1.97562V12.0346C10.8228 12.1302 10.4478 12.256 10.1146 12.4095C9.12756 12.8644 8.584 13.5275 8.584 14.2767V16.6781H2.00578C1.62144 16.6781 1.30874 16.3701 1.30874 15.9915ZM16.4605 16.923C16.4605 17.0931 16.2204 17.3754 15.6841 17.6226C15.0347 17.9218 14.1208 18.0934 13.1766 18.0934C11.1395 18.0934 9.89274 17.3356 9.89274 16.923V16.0341C9.96398 16.0719 10.0379 16.1084 10.1146 16.1437C10.9434 16.5257 12.0308 16.736 13.1766 16.736C14.3224 16.736 15.4098 16.5257 16.2387 16.1437C16.3153 16.1084 16.3892 16.0719 16.4605 16.0341V16.923ZM16.4605 14.2767C16.4605 14.4467 16.2204 14.729 15.6841 14.9762C15.0347 15.2754 14.1208 15.447 13.1766 15.447C11.1395 15.447 9.89274 14.6893 9.89274 14.2767C9.89274 14.1066 10.1328 13.8243 10.6692 13.5772C11.3185 13.2779 12.2324 13.1063 13.1766 13.1063C15.2137 13.1063 16.4605 13.8641 16.4605 14.2767ZM16.2387 12.4095C15.4098 12.0276 14.3224 11.8173 13.1766 11.8173C12.9603 11.8173 12.7461 11.8247 12.5354 11.8395V1.97562C12.5354 0.886273 11.6355 0 10.5296 0H2.00578C0.899804 0 0 0.886273 0 1.97562V15.9915C0 17.0809 0.899804 17.9671 2.00578 17.9671H8.584V19.5406C8.584 20.2898 9.12756 20.9529 10.1146 21.4077C10.9434 21.7897 12.0308 22 13.1766 22C14.3224 22 15.4098 21.7897 16.2387 21.4077C17.2257 20.9529 17.7692 20.2898 17.7692 19.5406V14.2767C17.7692 13.5275 17.2257 12.8644 16.2387 12.4095Z" />
      </>
    ),
  },
  // Node 1:8254 ("soccer"): a football, panel seams and all.
  sport: {
    viewBox: '0 0 22 22',
    path: (
      <path d="M10.9995 0C4.92525 0 0 4.92484 0 11C0 17.0752 4.92525 22 10.9995 22C17.0748 22 22 17.0752 22 11C22 4.92484 17.0748 0 10.9995 0ZM21.0833 11C21.0833 13.3306 20.284 15.4768 18.9466 17.1843V13.2482L19.9018 9.73169L20.8785 9.13428C20.8578 9.02801 20.8345 8.92313 20.8106 8.8192L19.784 9.44282L17.9039 7.76765C17.5716 6.90526 16.8314 5.23384 15.8528 4.24456L16.3345 3.36953L17.6335 3.50389C17.534 3.41681 17.4336 3.3316 17.3319 3.2478L16.483 3.10032L16.5073 3.05631L14.6543 1.62366C18.4131 3.08721 21.0833 6.73718 21.0833 11ZM15.7158 10.2738C15.5045 10.1507 14.6515 9.88853 10.8914 9.00366L10.8895 9.01162L10.0788 6.17629L12.6005 3.40511C13.3568 3.51513 14.6181 3.94071 15.3056 4.18557C16.3827 5.02971 17.2452 6.97314 17.6055 7.88845L15.7158 10.2738ZM10.9995 0.936369C12.1376 0.936369 13.2316 1.12833 14.2523 1.47665L11.5541 1.99447L12.1935 3.3817H12.1944L9.977 5.8186L9.95729 5.74884H6.24983L5.21492 3.63545L5.96246 2.60779L5.69067 2.44954C7.23342 1.49164 9.05208 0.936369 10.9995 0.936369ZM6.93229 18.0705C4.83588 17.6112 3.45583 16.7184 3.01354 16.401C2.63542 15.4454 2.84167 13.4823 2.91225 12.6967C4.1085 11.581 4.81525 10.8979 5.23554 10.4724C5.99546 10.9728 7.87417 12.06 7.95071 12.1044L8.84813 16.6177L8.94437 16.5967L6.93229 18.0705ZM0.916667 11C0.916667 9.16284 1.41487 7.43992 2.28021 5.95625C2.30908 5.99042 2.33475 6.02039 2.35904 6.04801C2.01254 7.17165 1.43642 9.30377 1.47079 10.9232L0.963417 11.9612C0.933625 11.6447 0.916667 11.324 0.916667 11ZM1.83288 11.5262C1.49967 9.41894 2.88842 5.43656 2.904 5.39255L2.80958 5.35791C3.49708 4.55169 4.92388 4.03528 4.92388 4.03528L5.00363 3.92573L5.99546 5.9511C5.79379 6.83269 4.99308 10.3085 4.92433 10.2373C4.92938 10.2472 4.94542 10.2635 4.97154 10.2851C4.39771 10.8567 3.51221 11.699 2.82608 12.3409C2.40533 12.2524 2.06525 11.876 1.83288 11.5262ZM2.96725 17.0747C3.07175 17.0368 3.15563 16.9876 3.22713 16.9328C3.93021 17.3767 5.26671 18.0743 7.12892 18.4371L8.46862 20.7425C6.24525 20.1666 4.31842 18.8505 2.96725 17.0747ZM9.13779 16.4539L8.2225 11.8568L10.8616 9.32811C12.5327 9.72092 15.185 10.3717 15.5201 10.521L15.229 10.8886C15.229 10.8886 16.1081 11.2978 16.5073 13.9908C16.5128 13.9959 16.5252 14.0001 16.5449 14.0034C15.5503 15.6041 13.871 16.9722 13.0726 17.5682V17.4998C13.0726 17.4998 9.71667 17.0916 9.1575 16.4389L9.13779 16.4539ZM10.6686 21.0557L13.0721 20.1113V20.0833L14.2404 20.5271C13.2225 20.8726 12.133 21.0636 10.9995 21.0636C10.8886 21.0636 10.7791 21.0585 10.6686 21.0557ZM14.8743 20.2902L13.0721 19.7298V17.9671C13.8018 17.4427 15.8043 15.8986 16.9043 14.0254C17.429 14.0343 18.3178 14.0057 18.6294 13.9954V17.4361H18.7449C17.7114 18.6735 16.3854 19.66 14.8743 20.2902Z" />
    ),
  },
  // Node 1:8257: a scalloped seal around the percent sign.
  promotions: {
    viewBox: '0 0 22 22',
    path: (
      <>
        <path d="M20.9393 11.285C20.847 11.1039 20.847 10.8961 20.9393 10.7151L21.7944 9.03652C22.2705 8.10192 21.8933 6.98796 20.9356 6.5004L19.2156 5.62471C19.03 5.53027 18.9028 5.36217 18.8665 5.1637L18.5301 3.32342C18.3428 2.2988 17.355 1.61027 16.2818 1.75598L14.3538 2.01766C14.1457 2.04584 13.94 1.98165 13.789 1.84153L12.3896 0.542512C11.6104 -0.180816 10.3896 -0.180859 9.61046 0.542512L8.21099 1.84166C8.05999 1.98182 7.85422 2.04589 7.64617 2.01778L5.71824 1.75611C4.64463 1.61032 3.65722 2.29893 3.4699 3.32355L3.13351 5.16375C3.09719 5.36226 2.96997 5.53031 2.78445 5.6248L1.06443 6.50049C0.106757 6.98801 -0.270474 8.10205 0.205632 9.03665L1.06071 10.7152C1.15296 10.8963 1.15296 11.104 1.06071 11.285L0.205587 12.9636C-0.270518 13.8982 0.106712 15.0121 1.06439 15.4997L2.7844 16.3754C2.96997 16.4698 3.09719 16.6379 3.13351 16.8364L3.4699 18.6767C3.64043 19.6094 4.47397 20.2636 5.43196 20.2635C5.52631 20.2635 5.62205 20.2571 5.71828 20.2441L7.64622 19.9824C7.85413 19.9541 8.06003 20.0184 8.21103 20.1585L9.61046 21.4575C10.0001 21.8192 10.5 22 11 22C11.4999 22 12 21.8191 12.3895 21.4575L13.789 20.1585C13.94 20.0184 14.1458 19.9544 14.3538 19.9824L16.2818 20.2441C17.3555 20.3898 18.3428 19.7012 18.5301 18.6766L18.8665 16.8364C18.9029 16.6379 19.0301 16.4699 19.2156 16.3754L20.9356 15.4997C21.8933 15.0122 22.2705 13.8981 21.7944 12.9635L20.9393 11.285ZM20.3158 14.3788L18.5958 15.2545C18.0474 15.5337 17.6713 16.0303 17.5641 16.6171L17.2277 18.4574C17.1643 18.804 16.8303 19.0369 16.467 18.9877L14.539 18.726C13.9242 18.6424 13.3158 18.8323 12.8696 19.2465L11.4701 20.5454C11.2065 20.7901 10.7935 20.7901 10.5299 20.5454L9.13042 19.2464C8.75328 18.8964 8.26024 18.7067 7.74554 18.7067C7.65123 18.7067 7.55616 18.713 7.46096 18.7259L5.53303 18.9876C5.17004 19.0369 4.83575 18.804 4.77234 18.4573L4.43591 16.617C4.32861 16.0302 3.95255 15.5336 3.40412 15.2544L1.6841 14.3787C1.36007 14.2138 1.23245 13.8369 1.39352 13.5207L2.24865 11.8421C2.52127 11.3069 2.52127 10.6931 2.24865 10.1579L1.39352 8.47931C1.23245 8.1631 1.36007 7.78623 1.6841 7.62127L3.40412 6.74558C3.9525 6.46633 4.32861 5.9697 4.43586 5.38293L4.77225 3.54268C4.83566 3.19602 5.16963 2.96313 5.53294 3.01237L7.46087 3.27405C8.07548 3.35753 8.68409 3.16774 9.13033 2.75357L10.5298 1.45456C10.7934 1.20989 11.2064 1.20989 11.4701 1.45456L12.8695 2.75357C13.3157 3.16779 13.9243 3.35753 14.539 3.27405L16.4669 3.01237C16.8299 2.96309 17.1642 3.19602 17.2276 3.54268L17.564 5.38297C17.6713 5.96975 18.0473 6.46642 18.5957 6.74558L20.3158 7.62127C20.6398 7.78623 20.7674 8.1631 20.6063 8.47931L19.7512 10.1578C19.4786 10.693 19.4786 11.3069 19.7512 11.8421L20.6063 13.5206C20.7675 13.8369 20.6398 14.2138 20.3158 14.3788Z" />
        <path d="M15.8311 6.36437C15.5729 6.11661 15.1542 6.11661 14.896 6.36437L6.16882 14.7384C5.91061 14.9862 5.91061 15.3879 6.16882 15.6357C6.29792 15.7595 6.46715 15.8215 6.63633 15.8215C6.80551 15.8215 6.97478 15.7596 7.10383 15.6357L15.831 7.26163C16.0893 7.01383 16.0893 6.61216 15.8311 6.36437Z" />
        <path d="M8.35522 5.29016C7.01844 5.29016 5.93086 6.33373 5.93086 7.61642C5.93086 8.89911 7.01844 9.94268 8.35522 9.94268C9.69201 9.94268 10.7796 8.89911 10.7796 7.61642C10.7796 6.33373 9.69201 5.29016 8.35522 5.29016ZM8.35522 8.67378C7.7476 8.67378 7.25327 8.19945 7.25327 7.61638C7.25327 7.03334 7.7476 6.55901 8.35522 6.55901C8.96285 6.55901 9.45723 7.03334 9.45723 7.61638C9.45718 8.19945 8.96285 8.67378 8.35522 8.67378Z" />
        <path d="M13.6447 12.0574C12.3079 12.0574 11.2203 13.101 11.2203 14.3837C11.2203 15.6663 12.3079 16.7099 13.6447 16.7099C14.9815 16.7099 16.0691 15.6663 16.0691 14.3837C16.0691 13.101 14.9815 12.0574 13.6447 12.0574ZM13.6447 15.441C13.0371 15.441 12.5427 14.9667 12.5427 14.3837C12.5427 13.8006 13.037 13.3263 13.6447 13.3263C14.2523 13.3263 14.7466 13.8006 14.7466 14.3837C14.7466 14.9667 14.2523 15.441 13.6447 15.441Z" />
      </>
    ),
  },
}

/** Head and shoulders, shared by the avatar disc and the referral row. */
const PERSON = (
  <>
    <circle cx="12" cy="8.7" r="3.5" />
    <path d="M5.4 19.6c0-3.35 2.95-5.7 6.6-5.7s6.6 2.35 6.6 5.7" />
  </>
)

const GLYPHS: Record<StrokedGlyphName, ReactNode> = {
  /** Node 1:8239: three 2px bars in a 20x18 box. Pass `strokeWidth={2.6}` to match. */
  burger: <path d="M2 3h20M2 12h20M2 21h20" />,
  referral: PERSON,
  bonuses: (
    <>
      <path d="M4.6 10.4h14.8v3.2H4.6z" />
      <path d="M6.2 13.6v5.2a1 1 0 0 0 1 1h9.6a1 1 0 0 0 1-1v-5.2" />
      <path d="M12 10.4v9.4" />
      <path d="M12 10.4S10.9 6.4 8.9 6.4a2 2 0 1 0 0 4M12 10.4s1.1-4 3.1-4a2 2 0 1 1 0 4" />
    </>
  ),
  cashback: (
    <path d="M4.4 8.6 7.6 13.2 12 6.4l4.4 6.8 3.2-4.6v8.6a1.4 1.4 0 0 1-1.4 1.4H5.8a1.4 1.4 0 0 1-1.4-1.4Z" />
  ),
  payments: (
    <>
      <path d="M4.6 8.4a2 2 0 0 1 2-2h10.8a2 2 0 0 1 2 2v9.2a2 2 0 0 1-2 2H6.6a2 2 0 0 1-2-2Z" />
      <path d="M15 11.9h4.4v3.4H15a1.7 1.7 0 0 1 0-3.4Z" />
    </>
  ),
  profile: (
    <>
      <circle cx="10.4" cy="8.4" r="3.4" />
      <path d="M4 19.4c0-3.3 2.87-5.6 6.4-5.6 1.1 0 2.14.22 3.03.62" />
      <path d="M16.2 15.6H21M16.2 19h4.8" />
    </>
  ),
  terms: (
    <>
      <path d="M6.6 3.8h7.6l4 4v12.4a1.4 1.4 0 0 1-1.4 1.4H6.6a1.4 1.4 0 0 1-1.4-1.4V5.2a1.4 1.4 0 0 1 1.4-1.4Z" />
      <path d="M14.2 3.8v4.2h4" />
      <path d="M8.4 13h7.2M8.4 16.4h4.8" />
    </>
  ),
  signout: (
    <>
      <path d="M10.2 4.6H6.6a1.6 1.6 0 0 0-1.6 1.6v11.6a1.6 1.6 0 0 0 1.6 1.6h3.6" />
      <path d="M19.4 12H9.6M12.6 8.6 9.2 12l3.4 3.4" />
    </>
  ),
  copy: (
    <>
      <path d="M9.8 8.4h7.4a1.6 1.6 0 0 1 1.6 1.6v7.4a1.6 1.6 0 0 1-1.6 1.6H9.8a1.6 1.6 0 0 1-1.6-1.6V10a1.6 1.6 0 0 1 1.6-1.6Z" />
      <path d="M15.2 8.4V6.6A1.6 1.6 0 0 0 13.6 5H6.8a1.6 1.6 0 0 0-1.6 1.6v6.8a1.6 1.6 0 0 0 1.6 1.6h1.4" />
    </>
  ),
  'chevron-down': <path d="M6.5 9.75 12 15.25l5.5-5.5" />,
  user: PERSON,
  support: (
    <>
      <path d="M5.2 13.4v-1.2a6.8 6.8 0 0 1 13.6 0v1.2" />
      <path d="M5.2 13.4h1.5a1.4 1.4 0 0 1 1.4 1.4v2.2a1.4 1.4 0 0 1-1.4 1.4H5.2Z" />
      <path d="M18.8 13.4h-1.5a1.4 1.4 0 0 0-1.4 1.4v2.2a1.4 1.4 0 0 0 1.4 1.4h1.5Z" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M20 11.8a8 8 0 0 1-11.94 6.95L4.2 19.8l1.1-3.8A8 8 0 1 1 20 11.8Z" />
      <path d="M9.6 9.4c.2-.45.4-.45.66-.46h.45c.15 0 .35 0 .53.42l.58 1.36c.1.2.02.4-.1.55l-.36.44c-.12.15-.2.28-.1.47.28.65 1.1 1.47 1.75 1.75.2.1.32.02.47-.1l.44-.36c.15-.12.35-.2.55-.1l1.36.58c.42.18.42.38.42.53v.45c-.01.26-.01.46-.46.66-.38.17-.94.25-1.4.17-.94-.16-2.2-.9-3.13-1.83-.93-.93-1.67-2.19-1.83-3.13-.08-.46 0-1.02.17-1.4Z" />
    </>
  ),
}

export interface MenuGlyphProps {
  name: MenuGlyphName
  /**
   * Rendered box in px. The stroked glyphs are authored in a 24-unit grid and the four Figma
   * vectors in a 22-unit one, but both are square boxes scaled to `size`, so the two sets still
   * measure the same on screen.
   */
  size?: number
  /** Ignored by the four Figma marks — they are outlined fills and carry no stroke. */
  strokeWidth?: number
  className?: string
}

function isFilled(name: MenuGlyphName): name is FilledGlyphName {
  return name in FILLED_GLYPHS
}

export function MenuGlyph({ name, size = 22, strokeWidth = 1.6, className }: MenuGlyphProps) {
  if (isFilled(name)) {
    const glyph = FILLED_GLYPHS[name]
    return (
      <svg
        viewBox={glyph.viewBox}
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden
        className={className}
      >
        {glyph.path}
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {GLYPHS[name]}
    </svg>
  )
}

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

/** Node 32:4838 and siblings: a 64px column, 22px mark, 6px gap, 10px label. */
const TAB_CLASSES = `relative flex w-16 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg py-1 ${FOCUS_RING}`

interface Tab {
  label: string
  href: string
  glyph: MenuGlyphName
}

/** Hrefs match `Header`'s primary nav so the two never disagree about where a section lives. */
const TABS: readonly [Tab, Tab, Tab, Tab] = [
  { label: 'Casino', href: '/', glyph: 'casino' },
  { label: 'Live Casino', href: '/live-casino', glyph: 'live-casino' },
  { label: 'Sport', href: '/sport', glyph: 'sport' },
  { label: 'Promos', href: '/promos', glyph: 'promotions' },
]

function NavTab({
  tab,
  active,
  onNavigate,
}: {
  tab: Tab
  active: boolean
  onNavigate: () => void
}) {
  return (
    <Link
      href={tab.href}
      // The bar stays live while the jackpot menu is open — Figma draws it lit, with `Menu`
      // active — so a tab has to close the menu itself. Without this, tapping `Casino` while
      // already on `/` navigates nowhere and the menu stays open on top of the page it was meant
      // to reveal. `closePanel` is passed down rather than read from the store again here: the bar
      // above already holds it, and two subscriptions to the same slice is one more than needed.
      onClick={onNavigate}
      // Three of the four tabs point at routes this demo does not have, so Next's default prefetch
      // fires three 404s into the console on every load of the mobile layout — one
      // `<route>/index.txt?_rsc=` per tab. Tapping one still lands on `not-found.tsx`, which is
      // the intended behaviour; a background request for a page nobody asked for is not.
      prefetch={false}
      // The amber tint is the only visual cue for the current tab, and colour alone never
      // reaches a screen reader. Node 32:4841 and its siblings draw the rest white at 90%.
      aria-current={active ? 'page' : undefined}
      className={`${TAB_CLASSES} ${active ? 'text-amber' : 'text-primary opacity-90'}`}
    >
      <MenuGlyph name={tab.glyph} size={22} />
      <span
        // Node 32:3296 and its siblings are 10px at `line-height: normal` — 12px for Inter.
        className={`text-[10px] leading-3 tracking-[0.2px] ${active ? 'font-semibold' : 'font-medium'} whitespace-nowrap`}
      >
        {tab.label}
      </span>
    </Link>
  )
}

/**
 * Node 32:4798 / 32:4823: the signed-out strip on top of the bar — 390x70 in the bar's own colour,
 * its top corners at 34, holding Log In and Sign In side by side, 12 apart, 20 in from each edge.
 *
 * It replaces the Log In / Register pair the phone header and the pre-login jackpot menu used to
 * carry: the rebuilt frames (32:3308, 32:5279) draw neither, only this. "Sign In" is Figma's word
 * and the owner's decision of 2026-09-10; desktop keeps its own "Register" (node 1:4312). There is
 * no authentication in the demo, so both flip the mocked account state, as the header's did.
 *
 * `data-auth-strip` is what turns on `--mobile-auth-h` in globals.css, so the page's end spacer
 * and the jackpot menu's sheet clear the strip as well as the bar. `data-login-control` is where
 * `Header` puts focus after a sign out.
 */
function AuthStrip() {
  const setAuthMode = useAppStore((state) => state.setAuthMode)
  const closePanel = useAppStore((state) => state.closePanel)
  const signIn = () => {
    closePanel()
    setAuthMode('postlogin')
  }

  return (
    <div data-auth-strip className="h-[70px] rounded-t-[34px] bg-quaternary px-5 pt-[17px]">
      <div className="flex gap-3 drop-shadow-[0_12px_14px_rgb(0_0_0/0.2)]">
        <button
          type="button"
          onClick={signIn}
          data-login-control
          className={`flex h-10 flex-1 items-center justify-center rounded-[20px] border border-solid border-strong bg-white/5 px-6 text-sm font-semibold tracking-[-0.14px] text-primary backdrop-blur-[8px] transition-[filter] hover:brightness-150 ${FOCUS_RING}`}
        >
          Log In
        </button>
        <Button onClick={signIn} className="!h-10 flex-1 !text-sm tracking-[-0.14px]">
          Sign In
        </Button>
      </div>
    </div>
  )
}

export default function MobileNavBar() {
  const pathname = usePathname()
  const panel = useAppStore((state) => state.panel)
  const openPanel = useAppStore((state) => state.openPanel)
  const closePanel = useAppStore((state) => state.closePanel)
  const signedOut = useAppStore((state) => state.authMode === 'prelogin')

  const menuOpen = panel === 'jackpotMenu'

  return (
    <nav
      aria-label="Mobile"
      className={[
        'fixed inset-x-0 bottom-0 hidden pb-[env(safe-area-inset-bottom)] mobile:block',
        // Under the z-50 scrims, which is what dims the bar behind the search sheet. The jackpot
        // menu's sheet stops at the bar's top edge, and nothing in the bar reaches past it any more,
        // so the bar needs no second z-index while that menu is open.
        'z-40',
      ].join(' ')}
    >
      {signedOut ? <AuthStrip /> : null}

      {/* Node 32:4828: `bg-quaternary` (#0D1420) under a 1px white-8% rule, 20px to the first tab.
          Its 84 is declared once as `--mobile-nav-h` in globals.css, because two other places
          measure this bar: MobileShell's end-of-document spacer and the jackpot menu's sheet,
          which stops its scrim exactly here. */}
      <div className="relative flex h-[var(--mobile-nav-h)] w-full items-center justify-between border-t border-solid border-medium bg-quaternary px-5">
        {/* Node 32:4829, the glass capsule: 360 wide at 390 (15px each side), 64 tall, centred.
            Decorative, so it takes no pointer events and the tabs above it keep every tap. */}
        <span
          aria-hidden
          className={[
            'pointer-events-none absolute inset-x-[15px] top-1/2 h-16 -translate-y-1/2 rounded-[32px]',
            'border border-solid border-white/50 bg-gradient-to-r from-white/[0.12] to-white/0',
            'shadow-[0_10px_24px_rgb(0_0_0/0.25)] backdrop-blur-[14px]',
          ].join(' ')}
        />
        {TABS.slice(0, 2).map((tab) => (
          <NavTab key={tab.href} tab={tab} active={pathname === tab.href} onNavigate={closePanel} />
        ))}

        {/* Node 32:4830: a 64px slot holding the 56px disc of 32:4831, centred on the capsule.
            The whole slot is the hit target. */}
        <button
          type="button"
          onClick={() => (menuOpen ? closePanel() : openPanel('jackpotMenu'))}
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          aria-label="Menu"
          className={`relative flex size-16 shrink-0 items-center justify-center rounded-[32px] ${FOCUS_RING}`}
        >
          <span
            aria-hidden
            className={[
              'flex size-14 items-center justify-center rounded-[28px] text-page',
              'border border-solid border-white/20',
              // The design's #FFD182 -> #F59E0B is the gold highlight falling into amber. Both
              // ends already exist as tokens, so the ramp is built from them rather than minting
              // two more. `image:` keeps Tailwind from reading the value as a colour.
              'bg-[image:linear-gradient(180deg,var(--gold-light),var(--amber))]',
              'shadow-[0_2px_4px_color-mix(in_srgb,var(--amber)_20%,transparent),0_10px_12px_color-mix(in_srgb,var(--amber)_40%,transparent)]',
              'transition-transform active:scale-95',
            ].join(' ')}
          >
            <MenuGlyph name="burger" size={20} strokeWidth={2.6} />
          </span>
        </button>

        {TABS.slice(2).map((tab) => (
          <NavTab key={tab.href} tab={tab} active={pathname === tab.href} onNavigate={closePanel} />
        ))}
      </div>
    </nav>
  )
}
