<template>
  <div class="tm-data-msg">
    <div class="tm-data-msg__icon" :class="{ success: success }">
      <i
        :style="`background: ${iconColor}`"
        :class="spinnerClass"
        class="material-icons notranslate"
        >{{ icon }}</i
      >
    </div>
    <div class="tm-data-msg__text">
      <h2 class="tm-data-msg__title">
        <slot name="title">
          {{ title }}
        </slot>
      </h2>
      <h3 class="tm-data-msg__subtitle">
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </h3>
    </div>
  </div>
</template>

<script>
export default {
  name: `tm-data-msg`,
  props: {
    title: {
      type: String,
      default: null,
    },
    subtitle: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    spin: {
      type: Boolean,
      default: false,
    },
    success: {
      type: Boolean,
      default: false,
    },
    iconColor: {
      type: String,
      default: `var(--warning)`,
    },
  },
  computed: {
    spinnerClass({ spin } = this) {
      return spin ? `fa-spin` : ``
    },
  },
}
</script>

<style>
.tm-data-msg {
  padding: 2rem;
  display: flex;
  align-items: center;
  border-radius: 0.25rem;
  background: var(--app-fg);
  border: 2px solid var(--app-fg-hover);
}

.tm-data-msg__icon {
  margin-right: 1.5rem;
}

.tm-data-msg__icon i.material-icons {
  font-size: 2rem;
  color: var(--menu-bright);
  background: var(--warning);
  padding: 0.5rem;
  border-radius: 50%;
}

.tm-data-msg__icon.success i.material-icons {
  background: var(--success);
}

.tm-data-msg__title {
  font-weight: 400;
  color: var(--bright);
  font-size: var(--h2);
}

.tm-data-msg__subtitle {
  color: var(--txt);
  font-size: 1rem;
  word-break: break-word;
}

.fa-spin {
  animation: spin 1400ms linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 767px) {
  .tm-data-msg {
    padding: 2rem 1rem;
    margin: 1rem;
  }
}

@media screen and (max-width: 1023px) {
  .tm-data-msg {
    display: block;
    padding: 2rem;
  }

  .tm-data-msg__icon {
    margin-bottom: 1rem;
  }
}
</style>
