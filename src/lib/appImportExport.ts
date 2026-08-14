import type { AdminData } from '../../shared/types'
import { api, getErrorMessage } from './api'
import { createBackupExportArtifact, createImportSuccessMessage } from './appBackup'
import {
  createBrowserBookmarkImportConfirmation,
  createImportOverwriteConfirmation,
  type ConfirmDialogInput,
} from './appConfirmDialog'
import type { ImportSource } from './importData'
import { toastStore } from './toast'

export interface ImportExportState {
  importing: boolean
  backupError: string
  backupMessage: string
}

export function createImportExportState(): ImportExportState {
  return {
    importing: false,
    backupError: '',
    backupMessage: '',
  }
}

function notifyState(
  state: ImportExportState,
  listener?: (next: ImportExportState) => void,
): void {
  listener?.({ ...state })
}

/**
 * Synchronous export: builds the backup JSON artifact from current admin data,
 * triggers a file download, and sets the success/error state + toast.
 */
export function exportDataToFile(
  state: ImportExportState,
  adminData: AdminData,
  onStateChange?: (next: ImportExportState) => void,
): void {
  state.backupError = ''
  state.backupMessage = ''
  notifyState(state, onStateChange)

  try {
    const artifact = createBackupExportArtifact(adminData)
    const blob = new Blob([artifact.json], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = artifact.fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(href)
    state.backupMessage = artifact.message
    notifyState(state, onStateChange)
    toastStore.addToast(artifact.message, 'success')
  } catch (error) {
    state.backupError = getErrorMessage(error)
    notifyState(state, onStateChange)
  }
}

/** Dependencies that the import handler needs from the host component. */
export interface ImportDeps {
  adminData: AdminData
  requestConfirmation: (input: ConfirmDialogInput) => Promise<boolean>
  applyLoggedInData: (data: AdminData) => void
  persistCurrentAdminData: () => Promise<void>
  onStateChange?: (next: ImportExportState) => void
}

/**
 * Asynchronous import: reads the file, parses it, asks for overwrite confirmation,
 * sends to the API, then applies the result and re-persists admin data.
 */
export async function importDataFromFile(
  state: ImportExportState,
  file: File,
  source: ImportSource,
  mode: 'replace' | 'merge',
  deps: ImportDeps,
): Promise<void> {
  state.backupError = ''
  state.backupMessage = ''
  notifyState(state, deps.onStateChange)

  try {
    const text = await file.text()
    const { detectImportSource, prepareImportText } = await import('./importData')
    const detectedSource = detectImportSource(text, file.name)
    const prepared = prepareImportText(text, detectedSource || source)
    const effectiveMode = detectedSource === 'browser-html' && source !== 'browser-html' ? 'merge' : mode
    prepared.payload.mode = effectiveMode
    const browserPreview = detectedSource === 'browser-html'
      ? (await import('./browserImportPreview')).previewBrowserImportAgainstCurrent(deps.adminData, prepared.payload)
      : null

    const confirmed = await deps.requestConfirmation(detectedSource === 'browser-html'
      ? createBrowserBookmarkImportConfirmation({
          ...prepared,
          createdCategories: browserPreview?.createdCategories,
          reusedCategories: browserPreview?.reusedCategories,
          existingDuplicates: browserPreview?.duplicateBookmarks,
          importableBookmarks: browserPreview?.importableBookmarks,
        })
      : effectiveMode === 'replace'
        ? createImportOverwriteConfirmation(prepared)
        : { title: '追加导入数据', message: `将追加 ${prepared.categories} 个分类中的 ${prepared.bookmarks} 个书签，重复链接会保留。`, confirmLabel: '确认导入' })
    if (!confirmed) {
      return
    }

    state.importing = true
    notifyState(state, deps.onStateChange)
    const result = await api.data.importAll(prepared.payload)
    if (detectedSource === 'browser-html') {
      result.invalid_bookmarks = prepared.skipped ?? 0
      result.retained_icons = prepared.retainedIcons ?? 0
      result.generated_icons = prepared.generatedIcons ?? 0
      result.duplicate_bookmarks = (result.duplicate_bookmarks ?? 0) + (prepared.duplicateBookmarks ?? 0)
    }
    deps.applyLoggedInData(result.data)
    await deps.persistCurrentAdminData()
    state.backupMessage = createImportSuccessMessage(result)
    notifyState(state, deps.onStateChange)
    toastStore.addToast(state.backupMessage, 'success')
  } catch (error) {
    state.backupError = getErrorMessage(error)
    notifyState(state, deps.onStateChange)
  } finally {
    state.importing = false
    notifyState(state, deps.onStateChange)
  }
}
