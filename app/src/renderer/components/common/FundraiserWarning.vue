<template lang="pug">
.fundraiser-warning
  .fundraiser-warning__title Warning &ndash; Do not enter your fundraiser seed. This software has not been audited. Never enter your 12-word seed while your computer is connected to the internet.
  .fundraiser-warning__subtitle Even when we do start supporting fundraiser seeds, don't use it except for testing or with small amounts. Soon we will release a command line interface to use for the signing of transactions offline including support for certain hardware ledgers.
</template>

<script>
export default { name: 'fundraiser-warning' }
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
