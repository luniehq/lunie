<template>
  <btn
    class="btn-copy"
    icon="copy"
    @click.native="click"
    :data-clipboard-text="value"
    value="Copy">
  </btn>
</template>

<script>
/* eslint-disable no-new */
import Clipboard from 'clipboard'
import Btn from '@nylira/vue-button'
export default {
  components: {
    Btn
  },
  methods: {
    click () {
      console.log('copied:', this.value)
    }
  },
  mounted () {
    new Clipboard('.btn-copy')
  },
  props: ['value']
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.btn-copy
  width 8rem
</style>
