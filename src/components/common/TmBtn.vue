<template>
  <router-link
    v-if="type === 'link'"
    :to="to"
    exact="exact"
    :disabled="disabled"
  >
    {{ value }}
  </router-link>
  <a v-else-if="type === 'anchor'" :disabled="disabled">
    <span :class="btnClass">
      <i v-if="icon" :class="'tm-btn__icon material-icons'" aria-hidden="true">
        {{ icon }} </i
      ><span v-if="value" class="tm-btn__value">{{ value }}</span>
    </span>
  </a>
  <button v-else :type="type" class="tm-btn" :disabled="disabled">
    <span :class="btnClass">
      <i v-if="icon" :class="'tm-btn__icon material-icons'" aria-hidden="true">
        {{ icon }} </i
      ><img
        v-else-if="img"
        :src="img"
        :class="'tm-btn__img'"
        aria-hidden="true"
      /><span v-if="value" class="tm-btn__value">{{ value }}</span>
    </span>
  </button>
</template>

<script>
// TODO refactor btn content into mixin?
export default {
  name: `TmBtn`,
  props: {
    value: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    iconPos: {
      type: String,
      default: null
    },
    img: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    to: {
      type: String,
      default: null
    },
    color: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    btnClass() {
      let value = `tm-btn__container`
      if (this.iconPos) value += ` tm-btn__icon-${this.iconPos}`
      if (this.size) value += ` tm-btn--size-${this.size}`
      if (this.color) value += ` tm-btn--${this.color}`
      return value
    }
  }
}
</script>

<style scoped>
.tm-btn {
  padding: 0;
  border: none;
  background: transparent;
  text-decoration: none !important;
  display: inline-block;
  font-size: 16px;
}

a {
  cursor: pointer;
}

[disabled] * {
  opacity: 0.7;
  cursor: not-allowed;
}

.tm-btn .tm-btn__container {
  font-family: var(--sans);
  font-size: 1rem !important;
  font-weight: 400;
  height: 2em;
  line-height: 1;
  color: var(--bright, #333) !important;
  padding: 0.5rem 2rem;
  margin: 0;
  background: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 0.25rem;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tm-btn .tm-btn--secondary {
  background: var(--app-bg, #fff);
}

.tm-btn .tm-btn__container::before,
.tm-btn .tm-btn__container::after {
  content: "";
  flex: 1 0 auto;
}

.tm-btn .tm-btn__container:hover:enabled {
  color: var(--txt, #333);
  text-decoration: none;
  border-color: var(--bc, #ddd);
  background: var(--app-fg, #eee);
}

.tm-btn .tm-btn__value {
  line-height: 1.5;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.tm-btn.disabled,
.tm-btn[disabled] {
  opacity: 0.333;
  user-select: none;
  color: var(--dim, #666) !important;
}

.tm-btn.disabled:focus:enabled,
.tm-btn[disabled]:focus:enabled {
  outline: none;
}

.tm-btn .tm-btn__container.tm-btn--size-sm {
  font-size: 0.75em;
  height: 1.5rem;
  line-height: 1rem;
  padding: 0 1rem;
}

.tm-btn .tm-btn__container.tm-btn--size-sm .tm-btn__value {
  font-size: 0.75rem;
}

.tm-btn .tm-btn__container.tm-btn--size-lg {
  font-size: 1.125em !important;
  height: 3rem;
  font-weight: normal;
  padding: 0 1rem;
}

@media screen and (max-width: 1023px) {
  .tm-btn .tm-btn__container {
    width: 100%;
  }
}
</style>
