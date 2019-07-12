<template>
  <div v-if="connection.stopConnecting" class="disconnected-bar">
    <i></i>
    <p>
      You are currently not connected to a node. Retry?
    </p>
    <a class="close">
      <i class="material-icons" @click="reconnect">refresh</i>
    </a>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
export default {
  name: `disconnected-bar`,
  computed: {
    ...mapGetters([`connection`])
  },
  methods: {
    reconnect() {
      this.$store.dispatch("reconnect")
    }
  }
}
</script>

<style scoped>
.disconnected-bar {
  left: 0;
  right: 0;
  top: 0;
  width: 100%;
  padding: 1rem;
  font-family: var(--sans);
  background-color: #551f38;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--bright);
}

.disconnected-bar .link {
  text-decoration: underline;
  color: var(--bright);
}

.disconnected-bar .close {
  cursor: pointer;
  height: 1rem;
  width: 1rem;
  color: var(--bright);
}

@media (max-width: 1024px) {
  .disconnected-bar {
    position: fixed;
    top: auto;
    bottom: 0;
    z-index: 99;
    padding: 0.5rem;
    justify-content: space-around;
  }

  .hide-on-mobile {
    display: none;
  }
}
</style>
