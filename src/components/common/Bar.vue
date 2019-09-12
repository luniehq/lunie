<template>
  <div v-if="show" v-bind:class="`bar ${type}`">
    <i></i>
    <p>
      <slot />
    </p>
    <a class="close">
      <i class="material-icons close-icon" @click="close(show)">close</i>
    </a>
  </div>
</template>

<script>
export default {
  name: `bar`,
  props: ["show", "type" ],
  methods: {
    close() {
      this.show = false
    }
  }
}
</script>

<style scoped>
.bar {
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

.bar.primary {
  background-color: var(--primary);
}

.bar.success {
  background-color: var(--success);
}

.bar.warning {
  background-color: var(--warning);
}

.bar.danger {
  background-color: var(--danger);
}

.bar.info {
  background-color: var(--info);
}

.bar .link {
  text-decoration: underline;
  color: var(--bright);
  cursor: pointer;
}

.bar .close {
  cursor: pointer;
  height: 1rem;
  width: 1rem;
  color: var(--bright);
}

.close-icon {
  line-height: 18px;
}
</style>
