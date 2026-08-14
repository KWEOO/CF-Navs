import { describe, expect, it } from 'vitest'
import { mergeImportData } from '../../worker/lib/db/importMerge'

const bookmark = (id: number, categoryId: number, title: string) => ({
  id,
  category_id: categoryId,
  title,
  url: `https://${title.toLowerCase()}.test`,
  icon: null,
  icon_source: null,
  icon_background_color: null,
  icon_blob: null,
  description: null,
  description_mode: null,
  open_method: 1 as const,
  sort: 0,
  created_at: 1,
})

describe('merge import data', () => {
  it('matches normalized full paths and remaps parents and bookmarks', () => {
    const result = mergeImportData({
      categories: [
        { id: 4, parent_id: null, title: ' Work ', icon: 'x', sort: 0, created_at: 1 },
        { id: 5, parent_id: null, title: 'Personal', icon: null, sort: 1, created_at: 1 },
        { id: 6, parent_id: 4, title: 'Frontend', icon: null, sort: 0, created_at: 1 },
        { id: 7, parent_id: 5, title: 'Frontend', icon: null, sort: 0, created_at: 1 },
      ],
      bookmarks: [],
      settings: null,
    }, {
      categories: [
        { id: 1, parent_id: null, title: 'work', icon: null, sort: 0, created_at: 1 },
        { id: 2, parent_id: null, title: 'New Root', icon: null, sort: 1, created_at: 1 },
        { id: 3, parent_id: 1, title: 'Frontend', icon: null, sort: 0, created_at: 1 },
        { id: 8, parent_id: 2, title: 'Frontend', icon: null, sort: 0, created_at: 1 },
      ],
      bookmarks: [bookmark(1, 3, 'ExistingPath'), bookmark(2, 8, 'NewPath')],
      settings: { site_title: 'Imported' },
    })

    expect(result.reusedCategories).toBe(2)
    expect(result.createdCategories).toBe(2)
    expect(result.payload.categories.find((category) => category.title === 'New Root')).toMatchObject({ id: 8, parent_id: null })
    expect(result.payload.categories.find((category) => category.id === 9)).toMatchObject({ title: 'Frontend', parent_id: 8 })
    expect(result.payload.bookmarks.map((item) => item.category_id)).toEqual([6, 9])
    expect(result.payload.settings).toBeUndefined()
  })

  it('skips matching urls in the reused category only when dedupe is enabled', () => {
    const current = {
      categories: [
        { id: 1, parent_id: null, title: 'Work', icon: null, sort: 0, created_at: 1 },
        { id: 2, parent_id: null, title: 'Personal', icon: null, sort: 1, created_at: 1 },
      ],
      bookmarks: [bookmark(1, 1, 'Existing')],
      settings: null,
    }
    current.bookmarks[0].url = 'https://example.com/'
    const incoming = {
      categories: [
        { id: 10, parent_id: null, title: 'work', icon: null, sort: 0, created_at: 1 },
        { id: 11, parent_id: null, title: 'Personal', icon: null, sort: 1, created_at: 1 },
      ],
      bookmarks: [
        { ...bookmark(10, 10, 'Duplicate'), url: 'https://EXAMPLE.com' },
        { ...bookmark(11, 11, 'Other category'), url: 'https://example.com' },
      ],
      dedupe_bookmarks: true,
    }

    const result = mergeImportData(current, incoming)
    expect(result.skippedBookmarks).toBe(1)
    expect(result.payload.bookmarks.map((item) => item.title)).toEqual(['Existing', 'Other category'])
  })

  it('keeps duplicate urls for legacy import sources when dedupe is disabled', () => {
    const current = {
      categories: [{ id: 1, parent_id: null, title: 'Work', icon: null, sort: 0, created_at: 1 }],
      bookmarks: [{ ...bookmark(1, 1, 'Existing'), url: 'https://example.com/' }],
      settings: null,
    }
    const result = mergeImportData(current, {
      categories: [{ id: 10, parent_id: null, title: 'Work', icon: null, sort: 0, created_at: 1 }],
      bookmarks: [{ ...bookmark(10, 10, 'Duplicate'), url: 'https://example.com' }],
    })

    expect(result.skippedBookmarks).toBe(0)
    expect(result.payload.bookmarks).toHaveLength(2)
  })
})
