<template>
  <div :class="cssClass">
    <template v-if="name">{{ name }} {{ error }}</template>
    <slot v-else></slot>
  </div>
</template>

<script>
export default {
  computed: {
    cssClass () {
      let value = 'ni-form-msg'
      if (this.type) {
        value += ' ni-form-msg-error'
      } else {
        value += ' ni-form-msg-desc'
      }
      return value
    },
    error () {
      let msg = ''
      switch (this.type) {
        case 'alphaNum':
          msg = 'must contain only alphanumeric characters'; break
        case 'numeric':
          msg = 'must contain only numerals'; break
        case 'between':
          msg = `must be between ${this.min} and ${this.max}`; break
        case 'date':
          msg = `must be a valid date`; break
        case 'datetime':
          msg = `must be a valid date and time`; break
        case 'exactLength':
          msg = `must be exactly ${this.length} characters`; break
        case 'ipAddress':
          msg = 'must be a valid IPv4 or IPv6 address'; break
        case 'length':
          msg = `must be between ${this.min} and ${this.max} characters`; break
        case 'minLength':
          msg = `must be longer than ${this.min} characters`; break
        case 'match':
          msg = 'must match'; break
        case 'maxLength':
          msg = `must be shorter than ${this.max} characters`; break
        case 'required':
          msg = 'is required'; break
        case 'url':
          msg = 'must be a valid URL (http:// required)'; break
        default:
          msg = 'must be valid'; break
      }
      return msg
    }
  },
  props: ['type', 'body', 'name', 'min', 'max', 'length']
}
</script>

<style lang="stylus">
@import '../styles/variables.styl'

.ni-form-msg
  line-height 2rem
  font-size 0.75rem
  display flex
 
.ni-form-msg:before
  content ''
  font-family FontAwesome
  padding-right 0.35rem
 
.ni-form-msg.ni-form-msg-error
  color #f00
 
.ni-form-msg.ni-form-msg-error:before
  content '\f06a'
  color #f00
 
.ni-form-msg.ni-form-msg-desc
  color #666
 
.ni-form-msg.ni-form-msg-desc:before
  content '\f059'
  color #ffbf00
</style>
