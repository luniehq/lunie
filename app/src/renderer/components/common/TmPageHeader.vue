<template>
  <header class="tm-page-header">
    <div class="tm-page-header-container">
      <div class="tm-page-header-text">
        <div v-if="$slots['title']" class="tm-page-header-title">
          <slot name="title"></slot>
        </div>
        <div v-if="$slots['subtitle']" class="tm-page-header-subtitle">
          <slot name="subtitle"></slot>
        </div>
        <div v-if="$slots['menu-body']" class="tm-page-header-body">
          <slot name="menu-body"></slot>
        </div>
      </div>
      <menu class="tm-page-header-menu"> <slot name="menu"></slot> </menu>
    </div>
  </header>
</template>

<script>
export default {
  name: `tm-page-header`
}
</script>

<style lang="stylus">
@require '~variables'

.tm-page-header
  -webkit-app-region drag

.tm-page-header-title
  font-size var(--xl)

  > div
    display inline-block

.tm-page-header-container
  min-height 4.22rem
  border-bottom px solid var(--bc)
  display flex

.tm-page-header-text
  flex 1
  display flex
  min-width 0 // fix truncation
  padding 11px 0 0 1rem
  align-items center

  .tm-page-header-body
    flex 1
    display flex

  i.material-icons
    font-size calc(1.375 * var(--x)) // TODO to variable
    padding-right 0.375rem

  > div
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

  h2
    font-size var(--xl)
    font-weight 500
    color var(--bright)

@media screen and (min-width: 1024px)
  .tm-page-header
    border-bottom-color var(--bc)

  .tm-page-header-container
    display flex

  .tm-page-header-menu
    display flex
    align-items flex-start
    padding-top 11px
</style>
