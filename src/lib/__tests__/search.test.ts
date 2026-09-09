import { describe, expect, it } from 'vitest'
import { SUGGESTION_LIMIT, getSuggestions, searchGames } from '@/lib/search'
import gamesData from '@/data/games.json'
import type { Game } from '@/lib/types'

/**
 * All three search states — popular/recent, typing, no results — run through this one function, so
 * a change here moves three Figma frames at once. The cases below are the ones the design shows:
 * `?q=swe` is the deep link used for the suggestion frame (node 1:4479).
 */

const games = gamesData as Game[]

describe('searchGames', () => {
  it('returns nothing for an empty or whitespace query', () => {
    expect(searchGames('', games)).toEqual([])
    expect(searchGames('   ', games)).toEqual([])
  })

  it('returns nothing when no title and no provider matches', () => {
    expect(searchGames('zzzzqq', games)).toEqual([])
  })

  it('ranks a title that starts with the query above one that merely contains it', () => {
    const titles = searchGames('swe', games).map((game) => game.title)

    expect(titles.slice(0, 4)).toEqual([
      'Sweet Bonanza',
      'Sweet Bonanza CandyLand',
      'Sweet Bonanza Xmas',
      'Sweet Boom',
    ])
  })

  it('is case- and punctuation-insensitive', () => {
    // Players type "Gonzos" for "Gonzo's"; the apostrophe must not kill the match. It did: the
    // normaliser replaced it with a space, so the stored title read "gonzo s quest" and no query
    // spelled the way a player spells it could reach it.
    expect(searchGames('gonzos quest', games).map((game) => game.title)).toContain("Gonzo's Quest")
    expect(searchGames('gonzos', games).map((game) => game.title)).toContain("Gonzo's Quest")
    expect(searchGames('SWEET BONANZA', games).length).toBeGreaterThan(0)
  })

  it('still finds the same titles spelled with the apostrophe', () => {
    for (const [query, title] of [
      ["gonzo's", "Gonzo's Quest"],
      ["pharaoh's gold", "Pharaoh's Gold Megaways"],
      ["cleopatra's", "Cleopatra's Crown"],
    ]) {
      expect(searchGames(query, games).map((game) => game.title)).toContain(title)
    }
  })

  it('matches on the provider name, but below every title match', () => {
    const results = searchGames('pragmatic', games)

    expect(results.length).toBe(8)
    expect(results.every((game) => game.provider === 'pragmatic-play')).toBe(true)
  })

  it('puts the title match first when the query also names a studio', () => {
    // "gates" is a title word of a Pragmatic game; the studio's other titles must not outrank it.
    expect(searchGames('gates', games)[0]?.title).toBe('Gates of Olympus 1000')
  })

  it('keeps catalogue order inside a score band, so the row does not reshuffle per keystroke', () => {
    const first = searchGames('bonanza', games).map((game) => game.id)
    const second = searchGames('bonanza', games).map((game) => game.id)

    expect(first).toEqual(second)
  })
})

describe('getSuggestions', () => {
  it('shows four rows, the count the dropdown draws', () => {
    expect(SUGGESTION_LIMIT).toBe(4)
    expect(getSuggestions('swe', games)).toHaveLength(4)
  })

  it('honours an explicit limit', () => {
    expect(getSuggestions('swe', games, 2)).toHaveLength(2)
  })

  it('returns fewer rows rather than padding when the query matches less', () => {
    const results = getSuggestions('yeti', games)

    expect(results.length).toBeGreaterThan(0)
    expect(results.length).toBeLessThanOrEqual(SUGGESTION_LIMIT)
  })
})
