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
      <option
        value=""
        disabled="disabled"
        selected="selected"
        hidden="hidden"
        >{{ selectPlaceholder }}</option
      >
      <template v-if="options">
        <option
          v-for="(option, index) in options"
          :key="index"
          :value="option.value"
          >{{ option.key }}</option
        >
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
  ></textarea
  ><label v-else-if="type === 'toggle'" :class="toggleClass" class="tm-toggle">
    <div class="tm-toggle-wrapper">
      <span>{{ toggleLongerWord }}</span>
      <div class="toggle-option-checked">
        <div>{{ toggleOptions.checked }}</div>
      </div>
      <div class="toggle-option-unchecked">
        <div>{{ toggleOptions.unchecked }}</div>
      </div>
      <div class="toggle-handle"></div>
      <input :value="value" type="checkbox" @change="onChange" />
    </div> </label
  ><input
    v-else
    ref="numTextInput"
    :type="type"
    :class="css"
    :placeholder="placeholder"
    :value="value"
    :max="max"
    :min="min"
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
      type: [String, Number],
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
    theme: {
      type: String,
      default: null
    },
    options: {
      type: [Array, Object],
      default: () => ({
        checked: {
          type: String,
          default: `off`
        },
        unchecked: {
          type: String,
          default: `off`
        }
      })
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
    max: {
      type: [String, Number], // for convenience you can provide a string
      default: null
    },
    min: {
      type: [String, Number], // for convenience you can provide a string
      default: null
    }
  },
  computed: {
    css() {
      let value = `tm-field`
      if (this.type === `select`) {
        value += ` tm-field-select`
      }
      if (this.type === `toggle`) {
        value += ` tm-field-toggle`
      }
      if (this.size) value += ` tm-field-size-${this.size}`
      if (this.theme) value += ` tm-field-theme-${this.theme}`
      return value
    },
    toggleClass() {
      return {
        unchecked: !this.value
      }
    },
    toggleLongerWord() {
      return this.toggleOptions.checked.length >
        this.toggleOptions.unchecked.length
        ? this.toggleOptions.checked
        : this.toggleOptions.unchecked
    },
    selectPlaceholder() {
      if (this.placeholder) return this.placeholder
      else return `Select option...`
    },
    toggleOptions() {
      if (this.options && this.options.checked && this.options.unchecked)
        return this.options
      return {
        checked: `on`,
        unchecked: `off`
      }
    }
  },
  mounted() {
    let el = this.$el
    if (this.type === `number`) {
      el.addEventListener(`focus`, function() {
        el.select()
      })
    }
  },
  methods: {
    toggle() {
      this.value = !this.value
    },
    updateValue(value) {
      let formattedValue = this.forceMinMax(value)
      // so that the user can type in "-" and it isn't removed
      if (formattedValue && this.$refs.numTextInput) {
        // so the actual text box displays the correct number
        this.$refs.numTextInput.value = formattedValue
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
    },
    forceMinMax(value) {
      if (this.type !== `number`) return value
      value = value ? Number(value.trim()) : value
      if (this.max && value > this.max) {
        value = Number(this.max)
      } else if (this.min && value && value < this.min) {
        value = Number(this.min)
      }
      return value
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
  vertical-align: top;
  width: 100%;
  -webkit-appearance: none;
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

.tm-toggle .tm-toggle-wrapper:before,
.tm-toggle .tm-toggle-wrapper:after {
  content: "";
  height: 1.625rem;
  position: absolute;
  top: 2px;
  width: 1.625rem;
  z-index: 0;
}

.tm-toggle .tm-toggle-wrapper:before {
  background: var(--success, #4acf4a);
  border-radius: 1em 0 0 1em;
  left: calc((-1.625rem / 2));
}

.tm-toggle .tm-toggle-wrapper:after {
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

.tm-toggle .tm-toggle-wrapper .toggle-handle:after {
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

.tm-toggle.unchecked .toggle-handle:after {
  right: calc(100% - 0.75rem);
}

.tm-select {
  position: relative;
}

.tm-select select {
  appearance: none;
  background: var(--input-bg, #fff);
  border-radius: 0;
  color: var(--txt, #333);
  padding-right: 2rem;
  width: 100%;
}

.tm-select select:invalid {
  color: dim;
}

.tm-select select option {
  background: var(--input-bg, #fff);
  color: txt;
  font-family: var(--sans);
}

.tm-select select option:checked {
  background: var(--hover-bg, #ccf);
  color: var(--bright, #000);
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

/* ============================================================================== */
.tm-datetime {
  position: relative;
}

.tm-datetime:after {
  align-items: center;
  background: var(--app-bg, #fff);
  border: 1px solid var(--input-bc, #ccc);
  box-sizing: border-box;
  color: var(--bright);
  content: "\f073";
  display: flex;
  font-family: FontAwesome;
  height: 2rem;
  justify-content: center;
  pointer-events: none;
  position: absolute;
  right: 0;
  text-align: center;
  top: 0;
  width: 2rem;
}

/* ============================================================================== */
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

/* ============================================================================== */
/* WebKit, Blink, Edge */
.tm-field::-webkit-input-placeholder {
  color: var(--dim, #666);
}

/* Mozilla Firefox 4 to 18 */
.tm-field:-moz-placeholder {
  color: var(--dim, #666);
  opacity: 1;
}

/* Mozilla Firefox 19+ */
.tm-field::-moz-placeholder {
  color: var(--dim, #666);
  opacity: 1;
}

/* Internet Explorer 10-11 */
.tm-field:-ms-input-placeholder {
  color: var(--dim, #666);
}

/* Standard (https//drafts.csswg.org/selectors-4/#placeholder) */
.tm-field:placeholder-shown {
  color: var(--dim, #666);
}

/* ============================================================================== */
/* sizes */
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

/* ============================================================================== */
/* tendermint styles */
.tm-field.tm-field-theme-tendermint {
  background: #0e2e4e;
  border-color: #1d61a5;
  color: #fff;
}

.tm-field.tm-field-theme-tendermint:focus {
  border-color: #216eba;
}

.tm-field.tm-field-theme-tendermint::-webkit-input-placeholder {
  color: #7db2e8;
}

/* Mozilla Firefox 4 to 18 */
.tm-field.tm-field-theme-tendermint:-moz-placeholder {
  color: #7db2e8;
  opacity: 1;
}

/* Mozilla Firefox 19+ */
.tm-field.tm-field-theme-tendermint::-moz-placeholder {
  color: #7db2e8;
  opacity: 1;
}

/* Internet Explorer 10-11 */
.tm-field.tm-field-theme-tendermint:-ms-input-placeholder {
  color: #7db2e8;
}

/* Standard (https//drafts.csswg.org/selectors-4/#placeholder) */
.tm-field.tm-field-theme-tendermint:placeholder-shown {
  color: #7db2e8;
}
</style>
