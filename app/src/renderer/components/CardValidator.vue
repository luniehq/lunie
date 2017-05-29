<template>
  <div class="card-validator">
    <div class="card-validator-container">
      <div class="left">
        <div class="validator">
          <span class="value">Validator</span>
        </div>
      </div>
      <menu>
        <btn value="Stake Tokens"></btn>
      </menu>
    </div>
  </div>
</template>

<script>
import Btn from '@nylira/vue-button'
export default {
  name: 'card-validator',
  props: ['validator'],
  components: {
    Btn
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'
.card-validator
  font-size 0.75rem
  padding 0.25em
  transition

  .card-validator-container
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

  .validator
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
  .card-validator
    font-size 0.875rem
    .ni-btn
      font-size 0.875em

@media screen and (min-width: 640px)
  .card-validator
    font-size 1rem
    .ni-btn
      font-size 1rem
</style>
