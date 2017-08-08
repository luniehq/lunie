<template>
  <section class="ni-section">
    <div class="ni-section-container">
      <header class="ni-section-header" v-if="$slots['title']">
        <div class="ni-section-header-container">
          <h2 class="ni-section-title">
            <slot name="title"></slot>
          </h2>
          <menu class="ni-section-menu">
            <slot name="menu"></slot>
          </menu>
        </div>
      </header>
      <main class="ni-section-main">
        <slot></slot>
      </main>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ni-section'
}
</script>

<style lang="stylus">
@require '../../styles/variables.styl'

.ni-section
  margin-bottom 1rem
  position relative

.ni-section-container
.ni-section-header
.ni-section-title
.ni-section-menu
.ni-section-main
  &:empty
    display none

.ni-section-container
  margin 0 auto

.ni-section-header
  margin-bottom 0.5rem
  margin-top 1rem

.ni-section-header-container
  display flex
  align-items center
  height 2rem - px
  border-bottom 1px solid bc

.ni-section-title
.ni-section-menu
  font-label()
  color bright

  white-space nowrap
  text-overflow ellipsis
  text-transform uppercase
  overflow hidden

  span.dim
    font-weight light

.ni-section-title
  flex 1
</style>
