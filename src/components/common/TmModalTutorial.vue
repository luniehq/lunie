<template>
  <div
    v-if="show"
    v-focus-last
    class="tm-modal-tutorial"
    tabindex="0"
    @keyup.esc="close()"
  >
    <main class="tm-modal-tutorial-main">
      <slot name="main" />
    </main>
  </div>
</template>

<script>
export default {
  name: `tm-modal-tutorial`,
  props: {
    close: {
      type: Function,
      required: true
    },
    show: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style scoped>
.tm-modal-tutorial {
  position: fixed;
  bottom: 0;
  right: 1rem;
  z-index: var(--z-modal);
  width: 22rem;
  height: 28rem;
  background: var(--app-fg);
  display: flex;
  backdrop-filter: blur(0.5em);
}

.tm-modal-tutorial h1 {
  font-weight: 500;
  font-size: 1.6rem;
  color: var(--bright);
  margin-bottom: 1rem;
}

.tm-modal-tutorial b {
  font-weight: 500;
  color: var(--bright);
}

.tm-modal-tutorial-main {
  display: flex;
  flex-flow: column;
  padding: 1.5rem;
}
</style>
