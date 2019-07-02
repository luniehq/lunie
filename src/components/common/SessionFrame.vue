<template>
  <transition name="component-fade" mode="out-in">
    <div class="session-modal">
      <slot></slot>
      <ConnectedNetwork />
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex"
import ConnectedNetwork from "common/TmConnectedNetwork"

export default {
  name: `session-frame`,
  components: {
    ConnectedNetwork
  },
  computed: {
    ...mapGetters([`session`])
  }
}
</script>

<style>
@import "../../styles/session.css";

.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.2s ease;
}

.component-fade-enter,
.component-fade-leave-to .component-fade-leave-active {
  opacity: 0;
}

.session-modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-modal);
  width: 100vw;
  height: 100vh;
  background: var(--app-fg);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

