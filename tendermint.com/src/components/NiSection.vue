<template>
  <section class="ni-section">
    <div class="ni-section-container">
      <header class="ni-section-header" v-if="$slots['title']">
        <h2 class="ni-section-title">
          <slot name="title"></slot>
        </h2>
      </header>
      <main class="ni-section-main">
        <slot></slot>
      </main>
    </div>
  </section>
</template>

<style lang="stylus">
@require '~variables'

.ni-section
  border-bottom 1px solid var(--bc)
  &:last-of-type
    border none

.ni-section-container
.ni-section-header
.ni-section-title
.ni-section-main
  &:empty
    display none

.ni-section-container
  max-width 1200px
  margin 0 auto

.ni-section-header
  padding 1rem 1rem 0

.ni-section-title
  font-weight 600
  font-size 1rem

.ni-section-main
  padding 1rem

@media screen and (min-width: 360px)
  .ni-section-header
    padding-left 1.25rem
    padding-right 1.25rem

  .ni-section-title
    font-size 1.125rem

  .ni-section-main
    padding 1.5rem

@media screen and (min-width: 768px)
  .ni-section-header
    margin-left 1.5rem
    margin-right 1.5rem
    padding 1rem
    border 1px solid bc
    border-top none

  .ni-section-title
    font-size 1.25rem
</style>
