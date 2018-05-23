<template lang="pug">
.ni-panel: .ni-panel-container
  .ni-panel__image: i.material-icons {{ icon }}
  .ni-panel__text
    .ni-panel__title {{ title }}
    .ni-panel__body {{ body }}
</template>

<script>
export default {
  name: 'ni-panel',
  props: ['icon', 'title', 'body']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-panels
  padding 0.5rem
  margin -1rem 0

.ni-panel-container
  margin 1rem 0
  background app-fg

.ni-panel__title
.ni-panel__body
.ni-panel__action
  padding 1rem

.ni-panel__title + .ni-panel__body
  padding-top 0

.ni-panel__body + .ni-panel__action
  padding-top 0

.ni-panel__title
  color bright 
  font-size h2
  font-weight 500

.ni-panel__image
  i.material-icons
    background link
    color bright
    font-size 5rem
    display flex
    align-items center
    justify-content center
    padding 2rem 0
    width 100%
    max-width 22.25rem
    max-height 8rem

.ni-panel__img
  width 100%

.ni-panel__action
  display block

@media screen and (min-width: 768px)
  .ni-panels
    display flex
    flex-flow row wrap
    justify-content center
    margin -1rem
    padding 0 1rem

  .ni-panel
    flex 0 0 50%

  .ni-panel-container
    margin 1rem

  .ni-panel__image
    flex 1

  .ni-panel__text
    flex 2

  .ni-panel__title
  .ni-panel__body
  .ni-panel__action
    padding 1.5rem

  .ni-panel__body
    flex 1

@media screen and (min-width: 1024px)
  .ni-panel
    flex 0 0 33.3333%
</style>
