import { describe, expect, it } from 'vitest'
import { getScreen, screens } from '@/lib/screens'

/**
 * `/dev/screens` is `screens.map()` and nothing else, so a duplicate id or a malformed node id
 * shows up as a dead entry in the review harness rather than as an error anywhere.
 */

describe('the screen registry', () => {
  it('has a unique id per entry', () => {
    const ids = screens.map((screen) => screen.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('carries a well-formed Figma node id on every entry', () => {
    for (const screen of screens) {
      expect(screen.figmaNodeId, screen.id).toMatch(/^\d+:\d+$/)
    }
  })

  it('describes every entry, since the description is the only text in the list', () => {
    for (const screen of screens) {
      expect(screen.label.length, screen.id).toBeGreaterThan(0)
      expect(screen.description.length, screen.id).toBeGreaterThan(0)
    }
  })

  it('uses only the two viewports the Figma file has frames for', () => {
    for (const screen of screens) {
      expect([1440, 390]).toContain(screen.viewport)
    }
  })

  it('finds an entry by id and nothing by an unknown one', () => {
    expect(getScreen('desktop-main')?.figmaNodeId).toBe('1:2431')
    expect(getScreen('no-such-screen')).toBeUndefined()
  })
})
