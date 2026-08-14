import { describe, expect, it } from 'vitest'
import {
  createBookmarkFaviconState,
  normalizeFaviconLookupUrl,
  resolveBookmarkFaviconError,
  resolveBookmarkFaviconSuccess,
  scheduleBookmarkFaviconLookup,
} from '../../src/lib/bookmarkFaviconController'

const CREATE = { mode: 'create' as const }

describe('bookmark favicon lookup url normalization', () => {
  it('accepts public-looking http(s) urls and strips credentials', () => {
    expect(normalizeFaviconLookupUrl('https://example.com')).toBe('https://example.com/')
    expect(normalizeFaviconLookupUrl('https://user:secret@example.com/a')).toBe('https://example.com/a')
  })

  it('rejects incomplete or unsupported urls', () => {
    for (const url of ['', 'example.com', 'ftp://example.com', 'http://localhost']) {
      expect(normalizeFaviconLookupUrl(url)).toBe('')
    }
  })
})

describe('bookmark favicon controller scheduling', () => {
  it('schedules a lookup for a new bookmark without an icon', () => {
    const state = createBookmarkFaviconState()
    const result = scheduleBookmarkFaviconLookup(state, {
      ...CREATE,
      url: 'https://example.com',
      icon: '',
      iconSource: '',
    })

    expect(result.changed).toBe(true)
    expect(result.state.loading).toBe(true)
    expect(result.task).toEqual({ url: 'https://example.com/', requestId: state.requestId + 1 })
  })

  it('does not overwrite a manually selected icon', () => {
    const result = scheduleBookmarkFaviconLookup(createBookmarkFaviconState(), {
      ...CREATE,
      url: 'https://example.com',
      icon: 'https://api.iconify.design/mdi/home.svg',
      iconSource: 'iconify',
    })

    expect(result.changed).toBe(false)
    expect(result.task).toBeNull()
  })

  it('does not overwrite an existing icon while editing', () => {
    const result = scheduleBookmarkFaviconLookup(createBookmarkFaviconState(), {
      mode: 'edit',
      url: 'https://example.com',
      icon: 'https://example.com/custom.png',
      iconSource: 'custom',
    })

    expect(result.task).toBeNull()
  })

  it('allows a changed url to replace the favicon previously applied automatically', () => {
    const initial = createBookmarkFaviconState()
    const first = scheduleBookmarkFaviconLookup(initial, {
      ...CREATE,
      url: 'https://a.example.com',
      icon: '',
      iconSource: '',
    })
    const applied = resolveBookmarkFaviconSuccess(first.state, {
      requestId: first.task!.requestId,
      icon: 'https://a.example.com/favicon.ico',
      currentUrl: 'https://a.example.com',
      currentIcon: '',
      currentIconSource: '',
    })
    const second = scheduleBookmarkFaviconLookup(applied.state, {
      ...CREATE,
      url: 'https://b.example.com',
      icon: applied.icon!,
      iconSource: applied.iconSource!,
    })

    expect(second.task?.url).toBe('https://b.example.com/')
  })
})

describe('bookmark favicon controller resolution', () => {
  function scheduled() {
    return scheduleBookmarkFaviconLookup(createBookmarkFaviconState(), {
      ...CREATE,
      url: 'https://example.com',
      icon: '',
      iconSource: '',
    })
  }

  it('applies the fetched icon as a direct favicon', () => {
    const start = scheduled()
    const resolved = resolveBookmarkFaviconSuccess(start.state, {
      requestId: start.task!.requestId,
      icon: 'https://example.com/favicon.ico',
      currentUrl: 'https://example.com',
      currentIcon: '',
      currentIconSource: '',
    })

    expect(resolved.icon).toBe('https://example.com/favicon.ico')
    expect(resolved.iconSource).toBe('direct')
    expect(resolved.state.appliedIcon).toBe('https://example.com/favicon.ico')
    expect(resolved.state.loading).toBe(false)
  })

  it('does not overwrite an icon selected while the request is in flight', () => {
    const start = scheduled()
    const resolved = resolveBookmarkFaviconSuccess(start.state, {
      requestId: start.task!.requestId,
      icon: 'https://example.com/favicon.ico',
      currentUrl: 'https://example.com',
      currentIcon: 'https://api.iconify.design/mdi/home.svg',
      currentIconSource: 'iconify',
    })

    expect(resolved.icon).toBeNull()
    expect(resolved.iconSource).toBeNull()
  })

  it('ignores stale responses after the url changes', () => {
    const first = scheduled()
    const second = scheduleBookmarkFaviconLookup(first.state, {
      ...CREATE,
      url: 'https://other.example.com',
      icon: '',
      iconSource: '',
    })
    const stale = resolveBookmarkFaviconSuccess(second.state, {
      requestId: first.task!.requestId,
      icon: 'https://example.com/favicon.ico',
      currentUrl: 'https://other.example.com',
      currentIcon: '',
      currentIconSource: '',
    })

    expect(stale.icon).toBeNull()
    expect(stale.state).toEqual(second.state)
  })

  it('stops loading after a current request fails', () => {
    const start = scheduled()
    expect(resolveBookmarkFaviconError(start.state, { requestId: start.task!.requestId }).loading).toBe(false)
  })
})
