<template lang="pug">
.fundraiser-warning
  .fundraiser-warning__title WARNING &ndash; DO NOT ENTER YOUR FUNDRAISER SEED. THIS SOFTWARE HAS NOT BEEN AUDITED. NEVER ENTER YOUR FUNDRAISER SEED 12 WORDS ONTO AN ONLINE COMPUTER.
  .fundraiser-warning__subtitle Even when we do start supporting fundraiser seeds, don't use it except for testing or with small amounts. We will release a command-line cli to use for off-line signing of transactions, and we will also add hardware support for this UI.
</template>

<script>
export default {
  name: 'fundraiser-warning'
}
</script>

<style lang="stylus">
@import '~variables'

.fundraiser-warning
  margin-top 2rem
  padding 0.75rem 1rem 0.875rem

  background app-fg
  
.fundraiser-warning__title
  padding 0 0 0.625rem
  font-weight bold
  color danger

.fundraiser-warning__subtitle
  color dim
  font-size sm
</style>
