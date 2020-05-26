<template>
  <div v-if="showMessage" :class="`bar ${barType}`">
    <p>
      <slot />
      <span
        >Come visit
        <span v-if="link" class="link" @click="goToLink(link)">us!</span>
      </span>
    </p>
    <div class="right">
      <i class="material-icons notranslate close-icon" @click="close()"
        >close</i
      >
    </div>
  </div>
</template>

<script>
export default {
  name: `bar`,
  props: {
    barType: {
      type: String,
      default: "primary",
    },
    show: Boolean,
    link: {
      type: String,
      default: "",
    },
  },
  data: function () {
    return {
      showMessage: this.show,
    }
  },
  methods: {
    close() {
      this.showMessage = false
      this.$emit(`close`)
    },
    goToLink(link) {
      if (link) {
        // make safe and independent from API
        window.open(link, "_blank")
      }
    },
  },
}
</script>

<style scoped>
.bar {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  font-family: var(--sans);
  background-color: transparent;
  font-size: 14px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--menu-bright);
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
  cursor: pointer;
}

.bar .button {
  background-color: transparent;
  color: var(--txt);
  border-radius: 5px;
  padding: 0.1rem 0.5rem;
  cursor: pointer;
}

.bar .right {
  display: flex;
  align-items: center;
}

.close-icon {
  cursor: pointer;
  font-size: 18px;
  padding-left: 1rem;
}
</style>
