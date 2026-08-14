import { describe, expect, it } from 'vitest'
import { previewBrowserImportAgainstCurrent } from '../../src/lib/browserImportPreview'

const category = (id: number, title: string, parent_id: number | null = null) => ({
  id,
  parent_id,
  title,
  icon: null,
  sort: id,
  created_at: 1,
})

const bookmark = (id: number, category_id: number, url: string) => ({
  id,
  category_id,
  title: `Bookmark ${id}`,
  url,
  icon: null,
  icon_source: null,
  icon_background_color: null,
  icon_blob: null,
  description: null,
  description_mode: null,
  open_method: 1 as const,
  sort: id,
  created_at: 1,
})

describe('browser import database preview', () => {
  it('matches full category paths and counts existing duplicate urls', () => {
    const result = previewBrowserImportAgainstCurrent({
      categories: [category(1, 'Work'), category(2, 'Frontend', 1), category(3, 'Personal')],
      bookmarks: [bookmark(1, 2, 'https://example.com/')],
    }, {
      categories: [category(10, ' work '), category(11, 'Frontend', 10), category(12, 'New Root')],
      bookmarks: [
        bookmark(10, 11, 'https://EXAMPLE.com'),
        bookmark(11, 12, 'https://example.com'),
      ],
    })

    expect(result).toEqual({
      createdCategories: 1,
      reusedCategories: 2,
      duplicateBookmarks: 1,
      importableBookmarks: 1,
    })
  })

  it('keeps the same url when it maps to another category', () => {
    const result = previewBrowserImportAgainstCurrent({
      categories: [category(1, 'Work')],
      bookmarks: [bookmark(1, 1, 'https://example.com')],
    }, {
      categories: [category(10, 'Personal')],
      bookmarks: [bookmark(10, 10, 'https://example.com/')],
    })

    expect(result.duplicateBookmarks).toBe(0)
    expect(result.importableBookmarks).toBe(1)
  })
})
