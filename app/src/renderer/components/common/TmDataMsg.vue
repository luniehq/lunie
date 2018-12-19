<template>
  <div class="tm-data-msg">
    <div class="tm-data-msg__icon">
      <i :class="iconCssClass" class="material-icons">{{ icon }}</i>
    </div>
    <div class="tm-data-msg__text">
      <div class="tm-data-msg__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div class="tm-data-msg__subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: `tm-data-msg`,
  props: {
    title: {
      type: String,
      default: null
    },
    subtitle: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    spin: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    iconCssClass() {
      if (this.spin) {
        return `fa-spin`
      }
    }
  }
}
</script>

<style>
.tm-data-msg {
  background: var(--app-fg);
  padding: 1rem;
}

.tm-data-msg__icon {
  margin-bottom: 0.5rem;
}

.tm-data-msg__icon i.material-icons {
  font-size: 3rem;
  color: var(--txt);
}

.tm-data-msg__text {
  max-width: 30rem;
}

.tm-data-msg__title {
  color: var(--bright);
  font-size: h2;
}

.tm-data-msg__subtitle {
  color: var(--dim);
}

@media screen and (min-width: 768px) {
  .tm-data-msg {
    display: flex;
    padding: 3rem;
  }

  .tm-data-msg__icon {
    margin-bottom: 0;
    margin-right: 1.5rem;
  }

  .tm-data-msg__icon i.material-icons {
    font-size: 4rem;
  }
}
</style>
