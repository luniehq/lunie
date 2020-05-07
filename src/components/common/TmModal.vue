<template>
  <transition name="fade" mode="out-in">
    <div v-if="show" class="modal" @click.self="close()" @keyup.esc="close()">
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: `tm-modal`,
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    close() {
      this.show = false
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-modal);
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 2px;
  padding: 2rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.modal-content {
  background: var(--app-bg);
  max-width: 560px;
  border-radius: 2px;
  padding: 2rem;
  position: relative;
  overflow: auto;
  max-height: 90vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to .fade-leave-active {
  opacity: 0;
}
</style>
