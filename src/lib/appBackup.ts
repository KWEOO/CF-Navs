import type { AdminData, BackupData, ImportResp } from '../../shared/types'

export const BACKUP_VERSION = 2

export type BackupExportArtifact = {
  payload: BackupData
  json: string
  fileName: string
  message: string
}

export function createBackupPayload(
  data: Pick<AdminData, 'categories' | 'bookmarks' | 'settings'>,
  exportedAt = Date.now(),
): BackupData {
  return {
    version: BACKUP_VERSION,
    exported_at: exportedAt,
    categories: data.categories,
    bookmarks: data.bookmarks,
    settings: data.settings,
  }
}

export function createBackupFileName(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10)
  return `cf-navs-backup-${stamp}.json`
}

export function createBackupExportMessage(payload: Pick<BackupData, 'categories' | 'bookmarks'>): string {
  return `已导出 ${payload.categories.length} 个分类、${payload.bookmarks.length} 个书签。`
}

export function createBackupExportArtifact(
  data: Pick<AdminData, 'categories' | 'bookmarks' | 'settings'>,
  exportedAt = Date.now(),
): BackupExportArtifact {
  const payload = createBackupPayload(data, exportedAt)
  return {
    payload,
    json: JSON.stringify(payload, null, 2),
    fileName: createBackupFileName(new Date(payload.exported_at)),
    message: createBackupExportMessage(payload),
  }
}

export function createImportSuccessMessage(result: ImportResp): string {
  const parts = [`导入成功：${result.categories} 个分类、${result.bookmarks} 个书签`]
  if (result.created_categories != null || result.reused_categories != null) {
    parts.push(`新建分类 ${result.created_categories ?? 0} 个，复用分类 ${result.reused_categories ?? 0} 个`)
  }
  if ((result.duplicate_bookmarks ?? 0) > 0) {
    parts.push(`跳过重复 ${result.duplicate_bookmarks} 个`)
  }
  if ((result.invalid_bookmarks ?? 0) > 0) {
    parts.push(`跳过无效链接 ${result.invalid_bookmarks} 个`)
  }
  if (result.retained_icons != null || result.generated_icons != null) {
    parts.push(`保留图标 ${result.retained_icons ?? 0} 个，自动补图标 ${result.generated_icons ?? 0} 个`)
  }
  return `${parts.join('；')}。`
}
