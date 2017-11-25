<template>
  <div :id="cssId" class="card-address">
    <div class="card-address-container">
      <div class="left">
        <div class="address">
          <span class="value">{{ address }}</span>
        </div>
      </div>
      <menu>
        <btn-copy :value="address"></btn-copy>
      </menu>
    </div>
  </div>
</template>

<script>
import BtnCopy from 'wallet/BtnCopy'
export default {
  name: 'card-address',
  components: {
    BtnCopy
  },
  computed: {
    cssId () {
      return 'address-' + this.address
    }
  },
  props: ['address']
}
</script>

<style lang="stylus">
@require '~variables'

.card-address
  font-size sm
  padding 0.25em
  transition

  .card-address-container
    background app-fg

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
    border-right px dotted bc
    padding 0 0.75em

    i.fa
      color dim
      margin-right 0.375em
    span
      mono()
      font-size sm
      font-weight bold

  .address
    overflow hidden
    border-right px dotted bc

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
    font-size sm

@media screen and (min-width: 400px)
  .card-address
    font-size x
    .ni-btn
      font-size x
</style>
