<template>
  <div :class="cssClass" @click.self="close()">
    <div class="tm-modal-container">
      <header class="tm-modal-header">
        <div class="tm-modal-icon" v-if="icon">
          <i class="material-icons">{{ icon }}</i>
        </div>
        <div class="tm-modal-title"><slot name="title"></slot></div>
        <div class="tm-modal-icon tm-modal-close" @click="close()">
          <i class="material-icons" v-if="close">close</i>
        </div>
      </header>
      <main class="tm-modal-main">
        <slot></slot>
        <footer class="tm-modal-footer"><slot name="footer"></slot></footer>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: `tm-modal`,
  props: {
    icon: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    close: {
      type: Function,
      required: true
    }
  },
  computed: {
    cssClass() {
      let value = `tm-modal`
      if (this.size === `fullscreen` || this.size === `fs`) {
        value += ` tm-modal-fullscreen`
      }
      return value
    }
  }
}
</script>

<style>
.tm-modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: z(modal);
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
  font-size: lg;
}

.tm-modal-icon.tm-modal-close {
  cursor: pointer;
}

.tm-modal-icon.tm-modal-close:hover i {
  color: var(--link);
}

.tm-modal-title {
  flex: 1;
  font-size: h3;
  font-weight: 500;
  color: var(--bright);
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
</style>
