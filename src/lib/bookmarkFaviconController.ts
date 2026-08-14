// 新增书签时自动获取站点 favicon 的纯状态机。
// requestId 防止旧网址的响应覆盖新表单；appliedIcon 用来区分自动图标与用户手动选择。

export type BookmarkFaviconState = {
  loading: boolean
  requestId: number
  lastUrl: string
  appliedIcon: string
}

export type BookmarkFaviconLookupTask = {
  url: string
  requestId: number
}

export type BookmarkFaviconScheduleResult = {
  state: BookmarkFaviconState
  changed: boolean
  task: BookmarkFaviconLookupTask | null
}

export type BookmarkFaviconResolveResult = {
  state: BookmarkFaviconState
  icon: string | null
  iconSource: 'direct' | null
}

export function createBookmarkFaviconState(previousRequestId = 0): BookmarkFaviconState {
  return {
    loading: false,
    requestId: previousRequestId + 1,
    lastUrl: '',
    appliedIcon: '',
  }
}

export function normalizeFaviconLookupUrl(raw: string): string {
  const value = raw.trim()
  if (!value) return ''

  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    if (!url.hostname || !url.hostname.includes('.')) return ''
    url.username = ''
    url.password = ''
    return url.toString()
  } catch {
    return ''
  }
}

export function canAutoApplyBookmarkFavicon(
  state: BookmarkFaviconState,
  input: { icon: string; iconSource: string },
): boolean {
  const icon = input.icon.trim()
  if (!icon) return true

  return input.iconSource === 'direct' && Boolean(state.appliedIcon) && icon === state.appliedIcon
}

export function scheduleBookmarkFaviconLookup(
  state: BookmarkFaviconState,
  input: {
    mode: 'create' | 'edit'
    url: string
    icon: string
    iconSource: string
  },
): BookmarkFaviconScheduleResult {
  const skipped: BookmarkFaviconScheduleResult = { state, changed: false, task: null }
  const url = normalizeFaviconLookupUrl(input.url)

  if (!url) return skipped
  if (!canAutoApplyBookmarkFavicon(state, input)) return skipped
  if (url === state.lastUrl) return skipped

  // 编辑模式只补全没有图标的书签；已有图标一律不覆盖。
  if (input.mode === 'edit' && input.icon.trim() && !state.appliedIcon) return skipped

  const requestId = state.requestId + 1
  return {
    state: {
      ...state,
      loading: true,
      requestId,
      lastUrl: url,
    },
    changed: true,
    task: { url, requestId },
  }
}

export function resolveBookmarkFaviconSuccess(
  state: BookmarkFaviconState,
  input: {
    requestId: number
    icon: string
    currentUrl: string
    currentIcon: string
    currentIconSource: string
  },
): BookmarkFaviconResolveResult {
  if (input.requestId !== state.requestId) {
    return { state, icon: null, iconSource: null }
  }

  const nextState = { ...state, loading: false }
  if (normalizeFaviconLookupUrl(input.currentUrl) !== state.lastUrl) {
    return { state: nextState, icon: null, iconSource: null }
  }
  if (!canAutoApplyBookmarkFavicon(state, {
    icon: input.currentIcon,
    iconSource: input.currentIconSource,
  })) {
    return { state: nextState, icon: null, iconSource: null }
  }

  const icon = input.icon.trim()
  if (!icon) {
    return { state: nextState, icon: null, iconSource: null }
  }

  return {
    state: { ...nextState, appliedIcon: icon },
    icon,
    iconSource: 'direct',
  }
}

export function resolveBookmarkFaviconError(
  state: BookmarkFaviconState,
  input: { requestId: number },
): BookmarkFaviconState {
  if (input.requestId !== state.requestId) return state
  return { ...state, loading: false }
}
