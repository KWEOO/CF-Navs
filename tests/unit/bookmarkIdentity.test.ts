import { describe, expect, it } from 'vitest'
import { bookmarkIdentityKey, normalizeBookmarkIdentityUrl } from '../../shared/bookmarkIdentity'

describe('bookmark import identity', () => {
  it('normalizes hostname case, default ports, and root slash', () => {
    expect(normalizeBookmarkIdentityUrl('https://EXAMPLE.com:443')).toBe('https://example.com/')
    expect(normalizeBookmarkIdentityUrl('http://EXAMPLE.com:80/a')).toBe('http://example.com/a')
  })

  it('keeps path, query, and hash distinctions', () => {
    expect(normalizeBookmarkIdentityUrl('https://example.com/A?q=X#Top')).toBe('https://example.com/A?q=X#Top')
  })

  it('strips embedded credentials and rejects unsupported urls', () => {
    expect(normalizeBookmarkIdentityUrl('https://user:secret@example.com/a')).toBe('https://example.com/a')
    expect(normalizeBookmarkIdentityUrl('javascript:alert(1)')).toBe('')
  })

  it('scopes identity to the resolved category', () => {
    expect(bookmarkIdentityKey(1, 'https://example.com')).not.toBe(bookmarkIdentityKey(2, 'https://example.com/'))
    expect(bookmarkIdentityKey(1, 'https://EXAMPLE.com')).toBe(bookmarkIdentityKey(1, 'https://example.com/'))
  })
})
