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
  font-size 0.75rem
  padding 0.25em
  transition

  .card-address-container
    background c-app-fg
    
    height 3em
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
    padding 0 0.75em

    i.fa
      color light
      margin-right 0.375em
    span
      mono()
      font-size 0.75em
      font-weight bold

  .address
    overflow hidden
    border-right 1px dotted bc

    flex 1
    display flex
    align-items center
    padding 0 0.75em

    .value
      mono()

  menu
    display flex
    align-items center
    padding 0 0.75em

  .ni-btn
    font-size 0.75em

@media screen and (min-width: 400px)
  .card-address
    font-size 0.875rem
    .ni-btn
      font-size 0.875em

@media screen and (min-width: 640px)
  .card-address
    font-size 1rem
    .ni-btn
      font-size 1rem
</style>
