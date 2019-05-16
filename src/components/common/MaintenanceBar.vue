<template>
  <div v-if="session.maintenanceBar && show" class="maintenance-bar">
    <i></i>
    <p>
      We've identified problems with our servers that are causing issues for
      some of our users. We apologize for the disruption and are working on a
      fix.
    </p>
    <a class="close">
      <i class="material-icons" @click="close">close</i>
    </a>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
export default {
  name: `maintenance-bar`,
  computed: {
    ...mapGetters([`session`])
  },
  data: () => ({
    show: true
  }),
  methods: {
    close() {
      this.show = false
    }
  }
}
</script>

<style scoped>
.maintenance-bar {
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

.maintenance-bar .link {
  text-decoration: underline;
  color: var(--bright);
}

.maintenance-bar .close {
  cursor: pointer;
  height: 1rem;
  width: 1rem;
  color: var(--bright);
}

@media (max-width: 1024px) {
  .maintenance-bar {
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
