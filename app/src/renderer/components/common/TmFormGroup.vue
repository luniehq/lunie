<template>
  <div :class="cssClass">
    <span v-if="subLabel" class="tm-form-group__sub-label">{{ subLabel }}</span
    ><label
      v-if="fieldId && fieldLabel"
      :for="fieldId"
      class="tm-form-group__label"
      >{{ fieldLabel }}</label
    >
    <div class="tm-form-group__field"><slot></slot></div>
  </div>
</template>

<script>
export default {
  name: `tm-form-group`,
  props: {
    error: {
      type: Boolean,
      default: false
    },
    "field-id": {
      type: String,
      default: null
    },
    "field-label": {
      type: String,
      default: null
    },
    "sub-label": {
      type: String,
      default: null
    }
  },
  computed: {
    cssClass() {
      let value = `tm-form-group`
      if (this.error) value += ` tm-form-group--error`
      return value
    }
  }
}
</script>

<style>
.tm-form-group {
  padding: 0.5rem 1rem;
  position: relative;
}

.tm-form-group:last-child {
  border-bottom: none;
}

.tm-form-group input {
  width: 100%;
}

.tm-form-group .tm-form-msg--error {
  display: none;
}

.tm-form-group__sub-label {
  position: absolute;
  bottom: 0.5rem;
  left: 1rem;
  font-size: var(--xs);
  color: var(--dim);
}

.tm-form-group__sub-label ~ .tm-form-group__label {
  line-height: 1rem;
}

.tm-form-group--error .tm-field,
.tm-form-group--error .tm-select {
  border-color: var(--danger);
}

.tm-form-group--error .tm-form-msg--error {
  display: flex;
}

.tm-form-group__label {
  display: block;
  line-height: 2rem;
  color: var(--txt);
  text-align: left;
}

@media (min-width: 768px) {
  .tm-form-group {
    display: flex;
  }

  .tm-form-group__label {
    flex: 0 0 16rem;
  }

  .tm-form-group__field {
    flex: 1;
  }

  .tm-form-group__field > .tm-field,
  .tm-form-group__field > .tm-field-group {
    width: 100%;
  }
}
</style>
