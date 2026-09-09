import { describe, expect, it } from 'vitest'
import { desktopSections, mobileSections, selectGames } from '@/lib/sections'
import gamesData from '@/data/games.json'
import type { Game } from '@/lib/types'

/**
 * `src/lib/sections.ts` is the spine of the homepage: twelve of the fifteen rows are the same
 * component reading a different `SectionSpec`. That is what makes a new row a four-line diff — and
 * also what makes an empty row invisible. A filter that matches nothing renders a header with a
 * blank strip under it, which reads as "loading" rather than as a mistake.
 */

const games = gamesData as Game[]

describe('selectGames', () => {
  it('filters by tag', () => {
    const result = selectGames({ tag: 'crash' }, games)

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((game) => game.tags.includes('crash'))).toBe(true)
  })

  it('filters by category', () => {
    const result = selectGames({ category: 'live-casino' }, games)

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((game) => game.categories.includes('live-casino'))).toBe(true)
  })

  it('filters by provider', () => {
    const result = selectGames({ provider: 'pragmatic-play' }, games)

    expect(result).toHaveLength(8)
  })

  it('combines the three as AND, not OR', () => {
    const result = selectGames({ category: 'slots', tag: 'bonusbuy' }, games)

    expect(
      result.every((game) => game.categories.includes('slots') && game.tags.includes('bonusbuy')),
    ).toBe(true)
  })

  it('applies the limit last, after filtering', () => {
    expect(selectGames({ limit: 6 }, games)).toHaveLength(6)
    expect(selectGames({ tag: 'crash', limit: 3 }, games)).toHaveLength(3)
  })

  it('returns everything when no limit is given', () => {
    expect(selectGames({}, games)).toHaveLength(games.length)
  })
})

describe('the row registries', () => {
  it('fills every desktop games row', () => {
    for (const section of desktopSections) {
      if (section.kind !== 'games') continue

      const rows = selectGames(section.filter, games)
      expect(rows.length, `row "${section.id}" would render empty`).toBeGreaterThan(0)
    }
  })

  it('fills every mobile games row', () => {
    for (const section of mobileSections) {
      if (section.kind !== 'games') continue

      const rows = selectGames(section.filter, games)
      expect(rows.length, `mobile row "${section.id}" would render empty`).toBeGreaterThan(0)
    }
  })

  it('describes the same fifteen rows in the same order on both viewports', () => {
    expect(mobileSections.map((section) => section.id)).toEqual(
      desktopSections.map((section) => section.id),
    )
    expect(desktopSections).toHaveLength(15)
  })

  it('gives every row its own Figma node id', () => {
    const ids = desktopSections.map((section) => section.figmaNodeId)

    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^\d+:\d+$/)
  })

  it('asks mobile for one grid of six, the difference the mobile frame draws', () => {
    for (const section of mobileSections) {
      if (section.kind !== 'games') continue

      expect(section.grids).toBe(1)
      expect(section.filter.limit).toBe(6)
    }
  })
})
