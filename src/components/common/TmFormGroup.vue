<template>
  <div :class="cssClass">
    <span v-if="subLabel" class="tm-form-group__sub-label">
      {{ subLabel }}
    </span>
    <label
      v-if="fieldId && fieldLabel"
      :for="fieldId"
      class="tm-form-group__label"
    >
      {{ fieldLabel }}
    </label>
    <div class="tm-form-group__field">
      <slot />
    </div>
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
    fieldId: {
      type: String,
      default: null
    },
    fieldLabel: {
      type: String,
      default: null
    },
    subLabel: {
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

<style scoped>
.tm-form-group {
  padding: 0.5rem 0;
}

.tm-form-group__label {
  display: block;
  color: var(--txt);
  font-size: 14px;
  font-weight: 400;
  padding-left: 0.25rem;
  line-height: 1.75rem;
}

.tm-form-group--error .tm-field,
.tm-form-group--error .tm-select {
  border-color: var(--danger);
}
</style>
