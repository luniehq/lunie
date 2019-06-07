<template>
  <select
    v-if="type === 'select'"
    :class="css"
    :value="value"
    @input="updateValue($event.target.value)"
    @change="onChange"
    @keyup="onKeyup"
    @keydown="onKeydown"
  >
    <option value="" disabled="disabled" selected="selected" hidden="hidden">
      {{ selectPlaceholder }}
    </option>
    <template>
      <option
        v-for="(option, index) in resolvedOptions"
        :key="index"
        :value="option.value"
      >
        {{ option.key }}
      </option>
    </template>
  </select>

  <textarea
    v-else-if="type === 'textarea'"
    :class="css"
    :placeholder="placeholder"
    :value="value"
    @change="onChange"
    @keyup="onKeyup"
    @keydown="onKeydown"
    @input="updateValue($event.target.value)"
  />

  <label v-else-if="type === 'toggle'" :class="toggleClass" class="tm-toggle">
    <div class="tm-toggle-wrapper" @click.prevent="toggle">
      <span>
        {{
          currentToggleState
            ? resolvedOptions.checked
            : resolvedOptions.unchecked
        }}
      </span>
      <div class="toggle-option-checked">
        <div>{{ resolvedOptions.checked }}</div>
      </div>
      <div class="toggle-option-unchecked">
        <div>{{ resolvedOptions.unchecked }}</div>
      </div>
      <div class="toggle-handle" />
      <input
        :disabled="isDisabled"
        :value="currentToggleState"
        type="checkbox"
        @change="onChange"
      />
    </div>
  </label>

  <input
    v-else
    ref="numTextInput"
    :type="type"
    :class="css"
    :placeholder="placeholder"
    :value="value"
    @change="onChange"
    @keyup="onKeyup"
    @keydown="onKeydown"
    @input="updateValue($event.target.value)"
  />
</template>

<script>
export default {
  name: `tm-field`,
  props: {
    type: {
      type: String,
      default: `text`
    },
    value: {
      type: [String, Number, Boolean],
      default: null
    },
    placeholder: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    options: {
      type: [Array, Object],
      default: null
    },
    change: {
      type: Function,
      default: null
    },
    keyup: {
      type: Function,
      default: null
    },
    keydown: {
      type: Function,
      default: null
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    defaultToggleOptions: {
      checked: `on`,
      unchecked: `off`
    },
    currentToggleState: false
  }),
  computed: {
    css() {
      let value = `tm-field`
      if (this.type === `select`) {
        value += ` tm-field-select`
      }
      if (this.size) value += ` tm-field-size-${this.size}`
      return value
    },
    toggleClass() {
      return !this.currentToggleState ? `unchecked` : undefined
    },
    resolvedOptions() {
      if (this.type === `select`) {
        return this.options || []
      }
      // else is always `toggle`
      return this.options || this.defaultToggleOptions
    },
    selectPlaceholder() {
      if (this.placeholder) return this.placeholder
      else return `Select option...`
    }
  },
  watch: {
    value(newValue) {
      this.currentToggleState = !!newValue
    }
  },
  mounted() {
    this.currentToggleState = !!this.value
  },
  methods: {
    toggle() {
      if (!this.isDisabled) {
        this.currentToggleState = !this.currentToggleState
        this.onChange(this.currentToggleState)
      }
    },
    updateValue(value) {
      let formattedValue = value

      if (this.type === `number`) {
        formattedValue = value.trim()
      }

      // Emit the number value through the input event
      this.$emit(`input`, formattedValue)
    },
    onChange(...args) {
      if (this.change) return this.change(...args)
    },
    onKeyup(...args) {
      if (this.keyup) return this.keyup(...args)
    },
    onKeydown(...args) {
      if (this.keydown) return this.keydown(...args)
    }
  }
}
</script>

<style scoped>
.tm-field {
  display: block;
  font-size: 14px;
  background: var(--input-bg);
  color: var(--bright);
  border: 2px solid var(--bc);
  line-height: 2.25rem;
  padding: 0 0.75rem;
  width: 100%;
  box-sizing: border-box;
  font-family: var(--sans);
  border-radius: 0.25rem;
}

.tm-field::placeholder {
  color: var(--dim);
}

/* .tm-field:disabled {
  background: var(--app-fg);
  border: var(--app-fg);
  box-shadow: none;
  color: var(--dim);
  text-shadow: none;
} */

.tm-field:focus {
  border: 2px solid var(--grey);
  box-shadow: none;
  outline: none;
}

.input-group-addon {
  background: var(--input-bg);
  border: 2px solid var(--bc);
  border-left: none;
  color: var(--txt);
  font-size: 0.75rem;
  line-height: 1.875rem;
  padding: 0 0.5rem;
}
</style>
