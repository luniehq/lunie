<template>
  <div v-if="type === 'select'" class="tm-select">
    <select
      :class="css"
      :value="value"
      :disabled="isDisabled"
      @input="updateValue($event.target.value)"
      @change="onChange"
      @keyup="onKeyup"
      @keydown="onKeydown"
    >
      <option value disabled="disabled" selected="selected" hidden="hidden">
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
      <i class="material-icons notranslate">arrow_drop_down</i>
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

  <input
    v-else
    ref="numTextInput"
    :type="type"
    :class="css"
    :placeholder="placeholder"
    :value="value"
    step="0.000001"
    :disabled="isDisabled"
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
      default: `text`,
    },
    value: {
      type: [String, Number, Boolean],
      default: null,
    },
    placeholder: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: null,
    },
    options: {
      type: [Array, Object],
      default: null,
    },
    change: {
      type: Function,
      default: null,
    },
    keyup: {
      type: Function,
      default: null,
    },
    keydown: {
      type: Function,
      default: null,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    css() {
      let value = `tm-field`
      if (this.type === `select`) {
        value += ` tm-field-select`
      }
      if (this.size) value += ` tm-field-size-${this.size}`
      return value
    },
    resolvedOptions() {
      if (this.type === `select`) {
        return this.options || []
      }
      return []
    },
    selectPlaceholder() {
      if (this.placeholder) return this.placeholder
      else return `Select option...`
    },
  },
  methods: {
    updateValue(value) {
      let formattedValue = value

      if (this.type === `number`) {
        formattedValue = value.trim()
      }

      // Emit the number value through the input event
      this.$emit(`input`, formattedValue)
    },
    onChange(...args) {
      if (this.type === `number` && this.$refs.numTextInput) {
        this.$refs.numTextInput.focus()
      }
      if (this.change) return this.change(...args)
    },
    onKeyup(...args) {
      if (this.keyup) return this.keyup(...args)
    },
    onKeydown(...args) {
      if (this.keydown) return this.keydown(...args)
    },
  },
}
</script>

<style>
input[type="checkbox"] {
  margin: 0.3rem 0.3rem 0.5rem 0;
  vertical-align: middle;
}

.tm-field {
  background: var(--input-bg);
  border: 2px solid var(--input-bc);
  border-radius: 0;
  color: var(--txt);
  display: block;
  font-size: 14px;
  min-width: 0;
  padding: 0.5rem 0.5rem;
  width: 100%;
  -webkit-appearance: none;
}

.tm-field-addon {
  background: var(--input-bg);
  border: 2px solid var(--input-bc);
  border-radius: 0;
  color: var(--txt);
  display: block;
  font-size: 14px;
  min-width: 0;
  padding: 0.5rem 0.5rem;
  width: 100%;
  -webkit-appearance: none;
  border-top-left-radius: 0.25rem !important;
  border-bottom-left-radius: 0.25rem !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.tm-field::placeholder {
  color: var(--dim);
}

.tm-field:disabled {
  background: var(--app-fg);
  border: 2px solid black;
  box-shadow: none;
  color: var(--dim);
  text-shadow: none;
}

.tm-field:focus {
  border: 2px solid var(--link);
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
  background: var(--input-bg);
  border-left: 1px solid var(--input-bc);
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
  background: var(--input-bg);
  border: 2px solid var(--input-bc);
  border-left: none;
  color: var(--txt);
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
