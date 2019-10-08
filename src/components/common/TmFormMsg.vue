<template>
  <div :class="cssClass">
    <template>
      {{ name }} {{ error }}
    </template>
  </div>
</template>

<script>
import { prettyDecimals } from "../../scripts/num"
export default {
  props: {
    type: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: ``
    },
    min: {
      type: [String, Number], // for convenience you can provide a string
      default: null
    },
    max: {
      type: [String, Number], // for convenience you can provide a string
      default: null
    },
    length: {
      type: Number,
      default: null
    },
    msg: {
      type: String,
      default: ``
    }
  },
  computed: {
    cssClass() {
      let value = `tm-form-msg sm`
      if (this.type) {
        value += ` tm-form-msg--error`
      }
      return value
    },
    error() {
      let msg = ``
      switch (this.type) {
        case `alphaNum`:
          msg = `must contain only alphanumeric characters`
          break
        case `numeric`:
          msg = `must contain only numerals`
          break
        case `between`:
          msg = `must be between ${prettyDecimals(this.min)} and ${this.max}`
          break
        case `date`:
          msg = `must be a valid date`
          break
        case `datetime`:
          msg = `must be a valid date and time`
          break
        case `exactLength`:
          msg = `must be exactly ${this.length} characters`
          break
        case `ipAddress`:
          msg = `must be a valid IPv4 or IPv6 address`
          break
        case `length`:
          msg = `must be between ${this.min} and ${this.max} characters`
          break
        case `minLength`:
          msg = `must be longer than ${this.min} characters`
          break
        case `match`:
          msg = `must match`
          break
        case `maxLength`:
          msg = `must be shorter than ${this.max} characters`
          break
        case `required`:
          msg = `is required`
          break
        case `words16`:
          msg = `phrase must be 16 words`
          break
        case `words24`:
          msg = `phrase must be 24 words`
          break
        case `url`:
          msg = `must be a valid URL (http:// required)`
          break
        case `bech32`:
          msg = `is invalid bech32`
          break
        case `integer`:
          msg = `must be an integer`
          break
        case `custom`:
          msg = this.msg
          break
        default:
          msg = `must be valid`
          break
      }
      return msg
    }
  }
}
</script>

<style>
.tm-form-msg {
  padding: 0;
  display: flex;
  margin: 0 !important;
}

.tm-form-msg.sm {
  font-size: var(--sm);
}

.tm-form-msg::before {
  content: "";
  /* stylelint-disable */
  font-family: "Material Icons";
  padding-right: 0.35rem;
}

.tm-form-msg--error {
  display: flex;
}

.tm-form-msg.tm-form-msg--error {
  color: var(--danger);
  font-style: italic;
  font-weight: 500;
  position: absolute;
}

.tm-form-msg.tm-form-msg--error::before {
  content: "error";
  color: var(--danger);
  font-style: normal;
}

.tm-form-msg.tm-form-msg--desc {
  color: var(--warning);
}

.tm-form-msg.tm-form-msg--desc::before {
  content: "priority_high";
  color: var(--warning);
}
</style>
