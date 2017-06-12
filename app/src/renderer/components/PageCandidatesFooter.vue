<template lang="pug">
.page-candidates-footer
  border(color='dim')
  .page-candidates-footer-container
    h1.title {{candidatesNum }} Candidates Selected
    menu
      btn(
        theme='cosmos'
        type='link'
        to='/delegate'
        icon='angle-right'
        icon-pos='right'
        :value='btnLabel')
</template>

<script>
import Border from './NiBorder'
import Btn from '@nylira/vue-button'
import { mapGetters } from 'vuex'
export default {
  name: 'page-candidates-footer',
  components: {
    Border,
    Btn
  },
  computed: {
    ...mapGetters(['shoppingCart']),
    candidatesNum () {
      return this.shoppingCart.length
    },
    btnLabel () {
      return `Confirm Candidates (${this.candidatesNum})`
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-candidates-footer
  display flex
  flex-flow column nowrap

.page-candidates-footer-container
  padding 1rem 0
  flex 1
  display flex
  align-items center
  justify-content spacen-between

  h1.title
    flex 1
    color dim
    font-weight bold
    font-size 1.25rem
    line-height 1
    text-transform uppercase

  menu
    .ni-btn, .ni-field
      margin-left 1rem

@media screen and (min-width: 480px)
  .page-candidates-footer-container
    padding 1.5rem 0
</style>
