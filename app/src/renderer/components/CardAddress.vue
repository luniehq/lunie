<template>
  <div id="cssId" class="card-address">
    <div class="card-address-container">
      <div class="left">
        <div class="title">
          <i class="fa fa-envelope-o"></i>
          <span>{{ address.walletId.toUpperCase() }}</span>
        </div>
        <div class="address">
          <span class="value">{{ address.address.toString('hex') }}</span>
        </div>
      </div>
      <menu>
        <btn-copy :value="address.address.toString('hex')"></btn-copy>
      </menu>
    </div>
  </div>
</template>

<script>
import BtnCopy from './BtnCopy'
export default {
  components: {
    BtnCopy
  },
  computed: {
    cssId () {
      return 'address-' + this.address.address.toString('hex')
    }
  },
  methods: {
    capitalize (string) {
      return string.toUpperCase()
    }
  },
  props: ['address']
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'
.card-address
  padding 0.25rem
  transition

  .card-address-container
    background c-app-fg
    
    height 3rem
    display flex
    align-items stretch

    .left
      flex 1
      display flex
      overflow hidden
    
    .title
      display flex
      align-items center
      border-right 1px dotted bc
      padding 0 0.75rem

      i.fa
        color light
        margin-right 0.375rem
      span
        mono()
        font-size 0.75rem
        font-weight bold

    .address
      overflow hidden
      border-right 1px dotted bc

      flex 1
      display flex
      align-items center
      padding 0 0.75rem

      .value
        mono()

    menu
      display flex
      align-items center

      padding 0 0.75rem
      border-right 1px dotted bc

      mono()
      font-size 0.75rem
      color light
</style>
