<template>
  <div v-if="type === 'select'" class="tm-select">
    <select
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
    <div class="tm-field-select-addon">
      <i class="material-icons">arrow_drop_down</i>
    </div>
  </div>

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

<style>
.tm-field {
  background: var(--input-bg, #fff);
  border: 1px solid var(--input-bc, #ccc);
  border-radius: 0;
  color: var(--txt, #333);
  display: block;
  font-size: 16px;
  line-height: 1.5rem;
  min-width: 0;
  padding: 0.1875rem 0.5rem;
  width: 100%;
  -webkit-appearance: none;
}

.tm-field::placeholder {
  color: var(--dim);
}

.tm-field:disabled {
  background: var(--app-fg, #eee);
  border: var(--app-fg, #eee);
  box-shadow: none;
  color: var(--dim, #666);
  text-shadow: none;
}

.tm-field:focus {
  border: 1px solid var(--link, #00f);
  box-shadow: none;
  outline: none;
}

input.tm-field {
  height: 2rem;
}

textarea.tm-field {
  height: 4rem;
  resize: vertical;
}

.tm-toggle {
  border: 1px solid var(--input-bc, #ccc);
  border-radius: 1rem;
  height: 2rem;
  padding: 0 2px;
}

.tm-toggle * {
  cursor: pointer;
}

.tm-toggle .tm-toggle-wrapper {
  margin-left: calc((1.625rem / 2));
  margin-right: calc((1.625rem / 2));
  padding: 0 1.25rem;
  transform: rotate(0deg);
}

.tm-toggle .tm-toggle-wrapper::before,
.tm-toggle .tm-toggle-wrapper::after {
  content: "";
  height: 1.625rem;
  position: absolute;
  top: 2px;
  width: 1.625rem;
  z-index: 0;
}

.tm-toggle .tm-toggle-wrapper::before {
  background: var(--success, #4acf4a);
  border-radius: 1em 0 0 1em;
  left: calc((-1.625rem / 2));
}

.tm-toggle .tm-toggle-wrapper::after {
  background: var(--danger, #8c8fa6);
  border-radius: 0 1em 1em 0;
  right: calc((-1.625rem / 2));
}

.tm-toggle .tm-toggle-wrapper .toggle-option-checked,
.tm-toggle .tm-toggle-wrapper .toggle-option-unchecked {
  clip: rect(0, auto, auto, 0);
  height: 1.625rem;
  overflow: hidden;
  position: absolute;
  top: 2px;
  transition: width 500ms ease;
  z-index: 1;
}

.tm-toggle .tm-toggle-wrapper .toggle-option-checked > div,
.tm-toggle .tm-toggle-wrapper .toggle-option-unchecked > div {
  left: 0;
  position: fixed;
  text-align: center;
  top: 2px;
  width: 100%;
}

.tm-toggle .tm-toggle-wrapper .toggle-option-checked {
  background: var(--success, #4acf4a);
  left: 0;
  width: 100%;
}

.tm-toggle .tm-toggle-wrapper .toggle-option-unchecked {
  background: var(--danger, #8c8fa6);
  right: 0;
  width: 0%;
}

.tm-toggle .tm-toggle-wrapper .toggle-handle::after {
  background: var(--grey, #d4d5de);
  border-radius: 1rem;
  content: "";
  height: 1.625rem;
  left: auto;
  position: absolute;
  right: calc((-1.65rem / 2));
  top: 2px;
  transition: right 500ms ease, left 500ms ease;
  width: 1.625rem;
  z-index: var(--z-listItem);
}

.tm-toggle .tm-toggle-wrapper input[type="checkbox"] {
  display: none;
}

.tm-toggle.unchecked .toggle-option-checked {
  width: 0;
}

.tm-toggle.unchecked .toggle-option-unchecked {
  width: 100%;
}

.tm-toggle.unchecked .toggle-handle::after {
  right: calc(100% - 0.75rem);
}

.tm-select {
  position: relative;
}

.tm-select select {
  appearance: none;
  background: var(--input-bg);
  border-radius: 0;
  color: var(--txt, #333);
  padding-right: 2rem;
  width: 100%;
}

.tm-select select:invalid {
  color: dim;
}

.tm-select select option {
  background: var(--app-bg);
  color: var(--txt);
  font-family: var(--sans);
}

.tm-select .tm-field-select-addon {
  align-items: center;
  background: var(--input-bg, #fff);
  border-left: 1px solid var(--input-bc, #ccc);
  box-sizing: border-box;
  color: var(--txt, #333);
  display: flex;
  height: 2rem;
  justify-content: center;
  pointer-events: none;
  position: absolute;
  right: 0;
  text-align: center;
  top: 0;
  width: 2rem;
}

.input-group-addon {
  background: var(--input-bg, #fff);
  border: 1px solid var(--input-bc, #ccc);
  border-left: none;
  color: var(--txt, #333);
  font-size: 0.75rem;
  line-height: 1.875rem;
  padding: 0 0.5rem;
}

@media screen and (min-width: 360px) {
  .input-group-addon {
    font-size: 1rem;
  }
}

.tm-field.tm-field-size-sm {
  font-size: 0.75rem;
  height: 1.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.tm-field.tm-field-size-lg {
  font-size: 1.125rem;
  height: 3rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
</style>
