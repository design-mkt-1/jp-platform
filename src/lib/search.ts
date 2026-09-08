import providersData from '@/data/providers.json'
import type { Game, Provider } from './types'

/**
 * One search implementation for all three search states (popular/recent, typing, no results).
 * Having the three screens share it is the point: otherwise "Bonanza" would return four rows in
 * one state and three in another and nobody would know which was right.
 */

const providers = providersData as Provider[]

const providerNameById = new Map(providers.map((provider) => [provider.id, provider.name]))

/**
 * Case- and accent-insensitive. Players type "Gonzos" for "Gonzo's" and "Cleopatras" for
 * "Cleopatra's", so punctuation is dropped too — otherwise the apostrophe silently kills the match.
 */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Lower is better. A title that starts with the query outranks one that merely contains it, and a
 * title match always outranks a provider-only match — typing "pragmatic" should list games, but
 * typing "gates" should not bury Gates of Olympus under its studio mates.
 */
function rank(game: Game, needle: string): number | null {
  const title = normalize(game.title)
  const provider = normalize(providerNameById.get(game.provider) ?? game.provider)

  if (title.startsWith(needle)) return 0
  if (title.includes(` ${needle}`)) return 1
  if (title.includes(needle)) return 2
  if (provider.startsWith(needle)) return 3
  if (provider.includes(needle)) return 4
  return null
}

/** Empty or whitespace-only queries return nothing; the caller shows popular/recent instead. */
export function searchGames(query: string, games: Game[]): Game[] {
  const needle = normalize(query)
  if (!needle) return []

  const scored: { game: Game; score: number }[] = []

  for (const game of games) {
    const score = rank(game, needle)
    if (score !== null) scored.push({ game, score })
  }

  // Stable within a score band: ties keep catalogue order, so the row does not reshuffle
  // between keystrokes that produce the same set.
  return scored
    .map((entry, index) => ({ ...entry, index }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((entry) => entry.game)
}

/** The suggestion dropdown (Figma 1:4479) shows four rows. */
export const SUGGESTION_LIMIT = 4

export function getSuggestions(query: string, games: Game[], limit = SUGGESTION_LIMIT): Game[] {
  return searchGames(query, games).slice(0, limit)
}

/** Tags in the focused-empty search panel, Figma node 1:4434. */
export const popularSearches: string[] = [
  'Sweet Bonanza',
  'Gates of Olympus',
  'Big Bass',
  'Crazy Time',
  'Mega Ball',
  'Book of Dead',
  'Starburst',
  "Gonzo's Quest",
]

/** Seed for the recent-searches list, Figma node 1:4454. The store owns it once the user types. */
export const defaultRecentSearches: string[] = [
  'Blackjack VIP',
  'Lightning Roulette',
  'Aviator',
  'Sugar Rush',
]
