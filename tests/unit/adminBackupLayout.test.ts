import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('admin backup layout', () => {
  it('separates one-click browser import, export, and advanced import', () => {
    const source = readFileSync('src/components/BackupPanel.svelte', 'utf8')

    expect(source).toContain('class="backup-operations"')
    expect(source.match(/class="backup-operation(?: browser-import-operation)?"/g)).toHaveLength(3)
    expect(source).toContain('id="browser-import-title"')
    expect(source).toContain('一键导入浏览器书签')
    expect(source).toContain('选择 HTML 一键导入')
    expect(source).toContain("onImportData(file, 'browser-html', 'merge')")
    expect(source).toContain('id="export-backup-title"')
    expect(source).toContain('id="import-backup-title"')
    expect(source).toContain('class="import-actions"')
    expect(source).toContain('选择文件并导入')
    expect(source).not.toContain('class="backup-actions"')
  })
})
