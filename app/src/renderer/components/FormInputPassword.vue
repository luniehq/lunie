<template lang="pug">
.form-group.form-input-password
  label(:for="id") {{ label }}
  .input-group
    input(:id="id", v-model="model"
      type="password", placeholder="Minimum of eight characters", required,
      pattern=".{8,255}", title="8 to 255 characters")
    .input-group-addon(@click="toggleVisibility",
      v-bind:class="{ 'visible': isVisible }")
      span.visible #[i.fa.fa-eye] Show
      span.invisible #[i.fa.fa-eye-slash] Hide
</template>

<script>
import shortid from 'shortid'
export default {
  name: 'form-input-password',
  data () {
    return {
      isVisible: false,
      id: shortid.generate()
    }
  },
  methods: {
    toggleVisibility () {
      let input = document.querySelector('#' + this.id)

      if (input.type === 'password') {
        this.isVisible = true
        input.type = 'text'
      } else {
        this.isVisible = false
        input.type = 'password'
      }
    }
  },
  props: {
    label: {
      type: String,
      default: 'Password'
    },
    model: String
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.form-input-password
  .input-group-addon
    text-align center
    font-weight 600

    cursor pointer
    user-select none

    &.visible

      span.visible
        display none

      span.invisible
        display block

  .invisible
    display none
</style>
