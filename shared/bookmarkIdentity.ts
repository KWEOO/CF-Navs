// 浏览器书签导入的重复判定规则，前后端共用。
// 保留路径、查询参数和 hash 的大小写/内容；只做 URL 解析器天然会做的主机名、
// 默认端口和根路径规范化，并去掉不应参与身份判定的内嵌账号密码。

export function normalizeBookmarkIdentityUrl(raw: string): string {
  const value = raw.trim()
  if (!value) return ''

  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    url.username = ''
    url.password = ''
    return url.toString()
  } catch {
    return ''
  }
}

export function bookmarkIdentityKey(categoryId: number, url: string): string {
  const normalizedUrl = normalizeBookmarkIdentityUrl(url)
  return normalizedUrl ? `${categoryId}\u0000${normalizedUrl}` : ''
}
