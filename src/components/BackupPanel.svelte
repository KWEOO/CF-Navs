<script lang="ts">
  import type { ImportSource } from '../lib/importData'

  type AsyncVoid<T = void> = T | Promise<T>

  export let isAuthenticated = false
  export let importing = false
  export let backupError = ''
  export let backupMessage = ''
  export let importSource: ImportSource = 'cf-navs'
  export let onExportData: (() => AsyncVoid) | undefined = undefined
  export let onImportData: ((file: File, source: ImportSource, mode: 'replace' | 'merge') => AsyncVoid) | undefined = undefined

  let importInput: HTMLInputElement | null = null
  let browserImportInput: HTMLInputElement | null = null
  let importMode: 'replace' | 'merge' = 'replace'
  let browserDragActive = false

  function triggerImport() {
    importInput?.click()
  }

  function triggerBrowserImport() {
    browserImportInput?.click()
  }

  async function importBrowserFile(file: File | undefined) {
    if (!file || !onImportData) return
    await onImportData(file, 'browser-html', 'merge')
  }

  async function handleBrowserImportChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    await importBrowserFile(input.files?.[0])
    input.value = ''
  }

  async function handleBrowserDrop(event: DragEvent) {
    event.preventDefault()
    browserDragActive = false
    await importBrowserFile(event.dataTransfer?.files?.[0])
  }

  async function handleImportChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (file && onImportData) {
      const source = /\.html?$/i.test(file.name) ? 'browser-html' : importSource
      await onImportData(file, source, source === 'browser-html' && importSource !== 'browser-html' ? 'merge' : importMode)
    }
    input.value = ''
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault()
    const file = event.dataTransfer?.files?.[0]
    if (!file || !onImportData) return
    const source = /\.html?$/i.test(file.name) ? 'browser-html' : importSource
    await onImportData(file, source, source === 'browser-html' && importSource !== 'browser-html' ? 'merge' : importMode)
  }
</script>

<section class="panel backup-panel">
  <div class="panel-header">
    <div>
      <p class="panel-eyebrow">数据备份与导入</p>
      <h2>导入 / 导出</h2>
    </div>
  </div>
  <p class="backup-desc">
    浏览器书签可使用下方专用入口一键追加；完整备份与 SunPanel 数据继续使用高级导入。
  </p>

  {#if backupError}
    <p class="backup-alert error">{backupError}</p>
  {:else if backupMessage}
    <p class="backup-alert ok">{backupMessage}</p>
  {/if}

  <div class="backup-operations">
    <section
      class="backup-operation browser-import-operation"
      class:drag-active={browserDragActive}
      aria-labelledby="browser-import-title"
      on:dragenter|preventDefault={() => browserDragActive = true}
      on:dragover|preventDefault={() => browserDragActive = true}
      on:dragleave={() => browserDragActive = false}
      on:drop={handleBrowserDrop}
    >
      <div class="backup-operation-copy">
        <p class="operation-badge">推荐</p>
        <h3 id="browser-import-title">一键导入浏览器书签</h3>
        <p>选择或拖入 Chrome、Edge、Firefox 导出的 HTML。自动恢复分类、补全网站图标，并跳过同分类重复网址。</p>
        <ul class="import-features" aria-label="浏览器书签导入规则">
          <li>默认追加，不覆盖现有数据</li>
          <li>导入前显示分类、书签、无效链接、重复项和图标统计</li>
          <li>文件仅在浏览器中解析，原始 HTML 不会上传</li>
        </ul>
      </div>
      <button type="button" class="primary-button" on:click={triggerBrowserImport} disabled={!isAuthenticated || importing}>
        {#if importing}导入中...{:else}选择 HTML 一键导入{/if}
      </button>
      <input
        bind:this={browserImportInput}
        class="import-input"
        type="file"
        accept="text/html,.html,.htm"
        on:change={handleBrowserImportChange}
      />
    </section>

    <section class="backup-operation" aria-labelledby="export-backup-title">
      <div class="backup-operation-copy">
        <h3 id="export-backup-title">导出当前数据</h3>
        <p>将当前分类、书签与站点设置下载为 JSON 备份文件。</p>
      </div>
      <button type="button" class="primary-button" on:click={() => onExportData?.()} disabled={!isAuthenticated}>
        导出备份
      </button>
    </section>

    <section class="backup-operation" aria-labelledby="import-backup-title" on:dragover|preventDefault on:drop={handleDrop}>
      <div class="backup-operation-copy">
        <h3 id="import-backup-title">高级数据导入</h3>
        <p>用于 CF-Navs JSON 备份、SunPanel 导出，或需要覆盖模式的高级操作。</p>
      </div>
      <div class="import-actions">
        <label class="import-source-field" for="import-source">
          <span>导入来源</span>
          <select class="native-select" id="import-source" bind:value={importSource} disabled={!isAuthenticated || importing}>
            <option value="cf-navs">CF-Navs 备份</option>
            <option value="sunpanel">SunPanel 导出</option>
          </select>
        </label>
        <label class="import-source-field">
          <span>导入模式</span>
          <select class="native-select" bind:value={importMode} disabled={!isAuthenticated || importing}>
            <option value="merge">追加合并</option>
            <option value="replace">覆盖现有数据</option>
          </select>
        </label>
        <button type="button" class="ghost-button" on:click={triggerImport} disabled={!isAuthenticated || importing}>
          {#if importing}导入中...{:else}选择文件并导入{/if}
        </button>
        <input
          bind:this={importInput}
          class="import-input"
          type="file"
          accept="application/json,.json,.sun-panel.json,.sunpanel.json"
          on:change={handleImportChange}
        />
      </div>
    </section>
  </div>
</section>

<style>
  .panel {
    border: 1px solid var(--admin-border);
    border-radius: 18px;
    background: var(--admin-surface);
    box-shadow: var(--admin-shadow);
    padding: 18px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;
  }

  .panel-eyebrow,
  h2,
  p {
    margin: 0;
  }

  .panel-eyebrow {
    margin-bottom: 8px;
    color: var(--admin-subtle);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2 {
    font-size: 22px;
  }

  .backup-desc {
    margin-bottom: 16px;
    color: var(--admin-muted);
    line-height: 1.6;
  }

  .backup-operations {
    display: grid;
    gap: 12px;
  }

  .backup-operation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 16px;
    border: 1px solid var(--admin-border);
    border-radius: 14px;
    background: var(--admin-control-bg);
    transition: border-color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
  }

  .browser-import-operation {
    border-color: color-mix(in srgb, #2563eb 34%, var(--admin-border));
    background: color-mix(in srgb, #2563eb 5%, var(--admin-control-bg));
  }

  .browser-import-operation.drag-active {
    border-color: #2563eb;
    background: color-mix(in srgb, #2563eb 10%, var(--admin-control-bg));
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }

  .backup-operation-copy {
    min-width: 0;
  }

  .operation-badge {
    display: inline-flex;
    margin-bottom: 6px;
    border-radius: 999px;
    padding: 3px 8px;
    background: #dbeafe;
    color: #1d4ed8;
    font-size: 11px;
    font-weight: 700;
  }

  .backup-operation-copy h3 {
    margin: 0 0 5px;
    font-size: 15px;
  }

  .backup-operation-copy p,
  .import-features {
    color: var(--admin-muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .import-features {
    margin: 8px 0 0;
    padding-left: 18px;
  }

  .import-actions {
    display: flex;
    flex: 0 0 auto;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 10px;
  }

  .import-source-field {
    display: inline-grid;
    gap: 6px;
    min-width: 180px;
  }

  .import-source-field span {
    color: var(--admin-muted);
    font-size: 13px;
    font-weight: 600;
  }

  .import-source-field select {
    --select-hover-border: var(--admin-input-hover-border);
    min-height: 39px;
    border: 1px solid var(--admin-input-border);
    border-radius: 12px;
    background: var(--admin-input-bg);
    color: var(--admin-text);
    font: inherit;
    padding: 8px 12px;
  }

  .import-input {
    display: none;
  }

  .backup-alert {
    margin: 0 0 14px;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 14px;
  }

  .backup-alert.error {
    border: 1px solid var(--admin-danger-border);
    background: var(--admin-danger-bg);
    color: var(--admin-danger);
  }

  .backup-alert.ok {
    border: 1px solid var(--admin-ok-border);
    background: var(--admin-ok-bg);
    color: var(--admin-ok);
  }

  .primary-button,
  .ghost-button {
    min-height: 39px;
    border-radius: 12px;
    padding: 10px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: var(--transition-base);
  }

  .primary-button {
    flex: 0 0 auto;
    border: none;
    background: #2563eb;
    color: #ffffff;
  }

  .ghost-button {
    border: 1px solid var(--admin-input-border);
    background: var(--admin-control-bg);
    color: var(--admin-text);
  }

  .ghost-button:hover:not(:disabled) {
    border-color: var(--admin-input-hover-border);
    background: var(--admin-control-hover-bg);
  }

  .primary-button:disabled,
  .ghost-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 760px) {
    .backup-operation {
      align-items: stretch;
      flex-direction: column;
      gap: 12px;
    }

    .import-actions {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-areas:
        "source source"
        "mode button";
      align-items: end;
      width: 100%;
      flex: none;
      gap: 10px;
    }

    .import-source-field {
      min-width: 0;
      width: 100%;
    }

    .import-source-field:first-child {
      grid-area: source;
    }

    .import-source-field:nth-child(2) {
      grid-area: mode;
    }

    .import-actions > .ghost-button {
      grid-area: button;
      align-self: stretch;
      min-width: 0;
      width: 100%;
      padding-left: 8px;
      padding-right: 8px;
      white-space: nowrap;
    }

    .primary-button {
      align-self: flex-start;
    }
  }
</style>
