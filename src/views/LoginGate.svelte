<script lang="ts">
  export let title = 'CF-Navs'
</script>

<section class="login-gate" aria-labelledby="login-gate-title">
  <div class="login-gate-grid" aria-hidden="true"></div>
  <div class="login-gate-glow login-gate-glow--top" aria-hidden="true"></div>
  <div class="login-gate-glow login-gate-glow--bottom" aria-hidden="true"></div>

  <header class="login-gate-brand">
    <img src="/icon.png" alt="" width="44" height="44" />
    <div>
      <strong>{title}</strong>
      <span>私人导航工作台</span>
    </div>
  </header>

  <div class="login-gate-copy">
    <p class="login-gate-label">PRIVATE WORKSPACE</p>
    <h1 id="login-gate-title">欢迎回来</h1>
    <p class="login-gate-description">登录后继续管理分类、书签、访问数据与站点设置。</p>
    <div class="login-gate-features" aria-label="站点能力">
      <span>分类管理</span>
      <span>书签整理</span>
      <span>数据备份</span>
    </div>
  </div>

  <p class="login-gate-note">当前站点未公开，仅管理员可以访问。</p>
</section>

<style>
  .login-gate {
    position: relative;
    isolation: isolate;
    min-height: 100dvh;
    overflow: hidden;
    padding: clamp(24px, 5vw, 64px);
    color: #e5eefb;
    background:
      linear-gradient(115deg, rgba(5, 10, 22, 0.22), rgba(5, 10, 22, 0.76)),
      radial-gradient(circle at 18% 24%, rgba(14, 165, 233, 0.2), transparent 28rem),
      radial-gradient(circle at 74% 82%, rgba(45, 212, 191, 0.12), transparent 30rem),
      linear-gradient(145deg, #080d18 0%, #0b1220 48%, #0a101b 100%);
  }

  .login-gate-grid {
    position: absolute;
    inset: 0;
    z-index: -3;
    opacity: 0.2;
    background-image:
      linear-gradient(rgba(148, 163, 184, 0.09) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.09) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: linear-gradient(90deg, #000 0%, rgba(0, 0, 0, 0.7) 46%, transparent 78%);
  }

  .login-gate-glow {
    position: absolute;
    z-index: -2;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(1px);
  }

  .login-gate-glow--top {
    top: -18rem;
    left: -12rem;
    width: 38rem;
    height: 38rem;
    border: 1px solid rgba(125, 211, 252, 0.1);
    box-shadow:
      inset 0 0 8rem rgba(56, 189, 248, 0.06),
      0 0 8rem rgba(56, 189, 248, 0.05);
  }

  .login-gate-glow--bottom {
    right: 22%;
    bottom: -24rem;
    width: 44rem;
    height: 44rem;
    border: 1px solid rgba(94, 234, 212, 0.08);
    box-shadow: inset 0 0 9rem rgba(45, 212, 191, 0.05);
  }

  .login-gate-brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }

  .login-gate-brand img {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    object-fit: contain;
    box-shadow: 0 12px 32px rgba(2, 6, 23, 0.32);
  }

  .login-gate-brand div {
    display: grid;
    gap: 3px;
  }

  .login-gate-brand strong {
    max-width: min(40vw, 440px);
    overflow: hidden;
    color: #f8fafc;
    font-size: 15px;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .login-gate-brand span {
    color: #8291a8;
    font-size: 12px;
  }

  .login-gate-copy {
    position: absolute;
    left: clamp(24px, 7vw, 104px);
    bottom: clamp(88px, 16vh, 170px);
    width: min(480px, calc(100% - 48px));
  }

  .login-gate-label {
    margin: 0 0 14px;
    color: #38bdf8;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
  }

  .login-gate-copy h1 {
    margin: 0;
    color: #f8fafc;
    font-size: clamp(38px, 5vw, 64px);
    font-weight: 700;
    letter-spacing: -0.045em;
    line-height: 1.05;
  }

  .login-gate-description {
    max-width: 38ch;
    margin: 18px 0 0;
    color: #9aa9bd;
    font-size: 16px;
    line-height: 1.7;
  }

  .login-gate-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 24px;
  }

  .login-gate-features span {
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: var(--radius-pill);
    padding: 7px 11px;
    background: rgba(15, 23, 42, 0.28);
    color: #aebbd0;
    font-size: 12px;
    backdrop-filter: blur(8px);
  }

  .login-gate-note {
    position: absolute;
    left: clamp(24px, 5vw, 64px);
    bottom: clamp(22px, 4vw, 44px);
    margin: 0;
    color: #65758b;
    font-size: 12px;
  }

  @media (max-width: 860px) {
    .login-gate {
      padding: 22px;
    }

    .login-gate-grid {
      mask-image: radial-gradient(circle at 50% 35%, #000, transparent 82%);
    }

    .login-gate-copy {
      top: 104px;
      bottom: auto;
      left: 22px;
      width: calc(100% - 44px);
      text-align: center;
    }

    .login-gate-copy h1 {
      font-size: 34px;
    }

    .login-gate-description {
      margin-left: auto;
      margin-right: auto;
      font-size: 14px;
    }

    .login-gate-features {
      justify-content: center;
    }

    .login-gate-note {
      right: 22px;
      bottom: 18px;
      left: 22px;
      text-align: center;
    }
  }

  @media (max-height: 650px) {
    .login-gate-copy,
    .login-gate-note {
      display: none;
    }
  }
</style>
