import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('private login gate layout', () => {
  it('uses a dedicated static login background instead of the loading splash', () => {
    const app = readFileSync('src/App.svelte', 'utf8')
    const gate = readFileSync('src/views/LoginGate.svelte', 'utf8')

    expect(app).toContain("import LoginGate from './views/LoginGate.svelte'")
    expect(app).toContain("{:else if currentView === 'login'}\n      <LoginGate title={homeTitle} />")
    expect(gate).toContain('class="login-gate"')
    expect(gate).toContain('欢迎回来')
    expect(gate).not.toContain('app-splash')
    expect(gate).not.toContain('spinner')
    expect(gate).not.toContain('正在加载')
  })

  it('makes the forced private login non-dismissible and right aligned on desktop', () => {
    const app = readFileSync('src/App.svelte', 'utf8')
    const modal = readFileSync('src/components/LoginModal.svelte', 'utf8')

    expect(app).toContain('dismissible={canSeeHome}')
    expect(modal).toContain('export let dismissible = true')
    expect(modal).toContain('class:private-gate={!dismissible}')
    expect(modal).toContain('justify-content: flex-end')
    expect(modal).toContain('{#if dismissible}')
  })
})
