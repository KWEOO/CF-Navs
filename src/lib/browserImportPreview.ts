import type { AdminData, ImportReq } from '../../shared/types'
import { getCategoryPathMap } from '../../shared/categoryHierarchy'
import { bookmarkIdentityKey } from '../../shared/bookmarkIdentity'

export type BrowserImportDatabasePreview = {
  createdCategories: number
  reusedCategories: number
  duplicateBookmarks: number
  importableBookmarks: number
}

function normalizedPath(value: string): string {
  return value
    .split(' / ')
    .map((part) => part.trim().toLowerCase())
    .join(' / ')
}

export function previewBrowserImportAgainstCurrent(
  current: Pick<AdminData, 'categories' | 'bookmarks'>,
  incoming: Pick<ImportReq, 'categories' | 'bookmarks'>,
): BrowserImportDatabasePreview {
  const currentPaths = getCategoryPathMap(current.categories)
  const incomingPaths = getCategoryPathMap(incoming.categories)
  const currentCategoryByPath = new Map(
    [...currentPaths].map(([categoryId, path]) => [normalizedPath(path), categoryId]),
  )
  const incomingCategoryTarget = new Map<number, number | null>()
  let createdCategories = 0
  let reusedCategories = 0
  let virtualCategoryId = -1

  for (const category of incoming.categories) {
    const path = incomingPaths.get(category.id)
    const existingId = path ? currentCategoryByPath.get(normalizedPath(path)) : undefined
    if (existingId != null) {
      incomingCategoryTarget.set(category.id, existingId)
      reusedCategories += 1
    } else {
      incomingCategoryTarget.set(category.id, virtualCategoryId--)
      createdCategories += 1
    }
  }

  const existingKeys = new Set(
    current.bookmarks
      .map((bookmark) => bookmarkIdentityKey(bookmark.category_id, bookmark.url))
      .filter(Boolean),
  )
  let duplicateBookmarks = 0
  let importableBookmarks = 0

  for (const bookmark of incoming.bookmarks) {
    const targetCategoryId = incomingCategoryTarget.get(bookmark.category_id)
    if (targetCategoryId == null) continue
    const identityKey = bookmarkIdentityKey(targetCategoryId, bookmark.url)
    if (identityKey && existingKeys.has(identityKey)) {
      duplicateBookmarks += 1
      continue
    }
    if (identityKey) existingKeys.add(identityKey)
    importableBookmarks += 1
  }

  return { createdCategories, reusedCategories, duplicateBookmarks, importableBookmarks }
}
