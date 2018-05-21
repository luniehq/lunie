<template>
  <div class="master-detail">
    <div class="master">
      <slot name="master"></slot>
    </div>
    <div class="detail">
      <slot name="detail"></slot>
    </div>
  </div>
</template>

<style lang="stylus">
@require '~variables'

.master-detail
  background app-fg
  min-height 100vh

.master-detail + .app-bottom .section-bottom
  display none

.master 
  position fixed
  top 0
  left 0
  width 100vw
  z-index 1

  nav
    padding-top 3rem
    padding-bottom 0.75rem
    position relative
    height 100vh
    overflow-y scroll
    z-index 10
    background app-bg

  .btn-thumb
    display block

  &.mobile-active nav
    display block

  &.mobile-inactive nav
    display none

  .title
    font-size 0.75rem
    font-weight bold
    text-transform uppercase
    letter-spacing 0.0625em
    line-height 2
    padding 1rem 1.5rem 0.25rem

    color lighten(mc, 40%)

  a + .title
    margin-top 0.75rem
  a
    display block
    padding 0.25rem 1.5rem
    padding-left 1.25rem
    position relative
    border-left 0.25rem solid transparent

    color txt
    color lighten(mc,75%)

    &:hover
      color lighten(mc,90%)
      border-left-color link
    &.router-link-active
      color lighten(mc,75%)
      border-left-color link

@media screen and (min-width: 768px)
  .master
    width 16rem

    nav
      padding-top 3.5rem

    .btn-thumb
      display none !important

  .detail
    margin-left 16rem

  .master-detail + .app-bottom .section-cosmos
    padding-left 16rem !important

  .master-detail + .app-bottom .app-footer
    .sections
      margin-left 16rem !important
    section
      flex 0 0 50% !important

@media screen and (min-width: 1024px)
  .master
    width 20rem

  .detail
    margin-left 20rem

  .master-detail + .app-bottom .section-cosmos
    padding-left 20rem !important

  .master-detail + .app-bottom .app-footer
    .sections
      margin-left 20rem !important
    section
      flex 0 0 25% !important
</style>
