<script lang="ts">
  export let open = false
  export let loading = false
  export let error = ''
  export let dismissible = true
  export let onSubmit:
    | ((payload: { username: string; password: string }) => void | Promise<void>)
    | undefined = undefined
  export let onCancel: (() => void) | undefined = undefined

  let username = ''
  let password = ''
  let formKey = ''

  $: nextKey = open ? 'open' : 'closed'
  $: if (nextKey !== formKey) {
    formKey = nextKey
    if (open) {
      username = ''
      password = ''
    }
  }

  async function handleSubmit() {
    await onSubmit?.({
      username: username.trim(),
      password,
    })
  }

  function handleCancel() {
    if (loading) {
      return
    }

    onCancel?.()
  }
</script>

{#if open}
  <div class="modal-backdrop" class:private-gate={!dismissible}>
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <div class="modal-header">
        <div>
          <p class="modal-eyebrow">管理员登录</p>
          <h2 id="login-modal-title">请输入账号信息</h2>
        </div>
        {#if dismissible}
          <button type="button" class="ghost-button" on:click={handleCancel} disabled={loading}>取消</button>
        {/if}
      </div>

      <form class="modal-form" on:submit|preventDefault={handleSubmit}>
        <label>
          <span>用户名</span>
          <input bind:value={username} type="text" placeholder="请输入用户名" autocomplete="username" required />
        </label>

        <label>
          <span>密码</span>
          <input
            bind:value={password}
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            required
          />
        </label>

        {#if error}
          <p class="error-text">{error}</p>
        {/if}

        <div class="modal-actions">
          {#if dismissible}
            <button type="button" class="ghost-button" on:click={handleCancel} disabled={loading}>取消</button>
          {/if}
          <button type="submit" class="primary-button" disabled={loading || !username.trim() || !password}>
            {#if loading}登录中...{:else}登录{/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(15, 23, 42, 0.56);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  .modal-backdrop::before {
    content: '';
    position: absolute;
    inset: 0;
  }

  .modal-backdrop.private-gate {
    justify-content: flex-end;
    padding: clamp(20px, 7vw, 100px);
    background: linear-gradient(90deg, rgba(3, 7, 18, 0.08), rgba(3, 7, 18, 0.58));
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .modal-card {
    position: relative;
    width: min(100%, 420px);
    border-radius: var(--radius-xl);
    background: #ffffff;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
    padding: 20px;
  }

  .private-gate .modal-card {
    width: min(100%, 440px);
    border: 1px solid rgba(255, 255, 255, 0.7);
    border-radius: 20px;
    padding: clamp(22px, 4vw, 30px);
    box-shadow:
      0 32px 72px rgba(2, 6, 23, 0.42),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .modal-eyebrow {
    margin: 0 0 6px;
    font-size: 12px;
    color: #64748b;
  }

  h2 {
    margin: 0;
    font-size: 20px;
    color: #0f172a;
  }

  .modal-form {
    display: grid;
    gap: 14px;
  }

  label {
    display: grid;
    gap: 8px;
    color: #334155;
    font-size: 14px;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: var(--radius-lg);
    padding: var(--control-padding-input);
    font-size: var(--font-size-base);
    color: #0f172a;
    background: #ffffff;
  }

  input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }

  .error-text {
    margin: 0;
    color: #dc2626;
    font-size: 13px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
  }

  .primary-button,
  .ghost-button {
    border-radius: var(--radius-lg);
    padding: var(--control-padding-md);
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: var(--transition-base);
  }

  .primary-button {
    border: none;
    background: #2563eb;
    color: #ffffff;
  }

  .ghost-button {
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #0f172a;
  }

  .primary-button:disabled,
  .ghost-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 860px) {
    .modal-backdrop.private-gate {
      align-items: flex-end;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(180deg, rgba(3, 7, 18, 0.12), rgba(3, 7, 18, 0.72));
    }

    .private-gate .modal-card {
      width: min(100%, 460px);
      max-height: calc(100dvh - 250px);
      overflow-y: auto;
    }
  }

  @media (max-width: 520px) {
    .modal-backdrop.private-gate {
      padding: 14px;
    }

    .private-gate .modal-card {
      max-height: calc(100dvh - 230px);
      border-radius: 18px;
      padding: 20px;
    }
  }
</style>
