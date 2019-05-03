<template>
  <div
    v-focus-last
    class="tm-modal"
    tabindex="0"
    @click.self="close()"
    @keyup.esc="close()"
  >
    <main class="tm-modal-main">
      <slot name="main" />
    </main>

    <footer class="tm-modal-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script>
export default {
  name: `tm-modal`,
  props: {
    close: {
      type: Function,
      required: true
    }
  }
}
</script>

<style>
.tm-modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-modal);
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(0.5em);
}

.tm-modal b {
  font-weight: 500;
  color: var(--bright);
}

.tm-modal.tm-modal-fullscreen {
  display: flex;
}

.tm-modal-container {
  background: var(--app-fg);
  box-shadow: rgba(0, 0, 0, 0.25) 0 0.25rem 1rem;
  display: flex;
  flex-flow: column nowrap;
  width: 30rem;
}

.tm-modal-header {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--app-nav);
}

.tm-modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tm-modal-icon i {
  font-size: var(--lg);
}

.tm-modal-icon.tm-modal-close {
  cursor: pointer;
}

.tm-modal-icon.tm-modal-close:hover i {
  color: var(--link);
}

.tm-modal-title {
  flex: 1;
  font-size: var(--h3);
  font-weight: 500;
  color: var(--bright);
  padding-left: 1rem;
}

.tm-modal-main {
  padding: 1rem 1.5rem;
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.tm-modal-main .ps-scrollbar-y-rail {
  display: none;
}

.tm-modal-main p {
  margin-bottom: 1rem;
  word-wrap: break-word;
}

.tm-modal-footer {
  padding-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

@media screen and (max-width: 1023px) {
  .tm-modal {
    background: rgba(0, 0, 0, 1);
  }
}
</style>
