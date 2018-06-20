<template lang='pug'>
div(:class='cssClass')
  template(v-if='name') {{ name }} {{ error }}
  slot(v-else='')
</template>

<script>
export default {
  computed: {
    cssClass() {
      let value = "tm-form-msg sm"
      if (this.type) {
        value += " tm-form-msg--error"
      } else {
        value += " tm-form-msg--desc"
      }
      return value
    },
    error() {
      let msg = ""
      switch (this.type) {
        case "alphaNum":
          msg = "must contain only alphanumeric characters"
          break
        case "numeric":
          msg = "must contain only numerals"
          break
        case "between":
          msg = `must be between ${this.min} and ${this.max}`
          break
        case "date":
          msg = `must be a valid date`
          break
        case "datetime":
          msg = `must be a valid date and time`
          break
        case "exactLength":
          msg = `must be exactly ${this.length} characters`
          break
        case "ipAddress":
          msg = "must be a valid IPv4 or IPv6 address"
          break
        case "length":
          msg = `must be between ${this.min} and ${this.max} characters`
          break
        case "minLength":
          msg = `must be longer than ${this.min} characters`
          break
        case "match":
          msg = "must match"
          break
        case "maxLength":
          msg = `must be shorter than ${this.max} characters`
          break
        case "required":
          msg = "is required"
          break
        case "words16":
          msg = "phrase must be 16 words"
          break
        case "url":
          msg = "must be a valid URL (http:// required)"
          break
        case "bech32":
          msg = "is invalid (" + this.body + ")"
          break
        default:
          msg = "must be valid"
          break
      }
      return msg
    }
  },
  props: ["type", "body", "name", "min", "max", "length"]
}
</script>

<style lang="stylus">
@require '~variables'

.tm-form-msg
  padding 0.25rem 0 0
  display flex
  margin 0 !important

  &.sm
    font-size sm

.tm-form-msg:before
  content ''
  font-family 'Material Icons'
  padding-right 0.35rem

.tm-form-msg.tm-form-msg--error
  color var(--danger)

.tm-form-msg.tm-form-msg--error:before
  content 'error'
  color var(--danger)

.tm-form-msg.tm-form-msg--desc
  color var(--warning)

.tm-form-msg.tm-form-msg--desc:before
  content 'priority_high'
  color var(--warning)
</style>
