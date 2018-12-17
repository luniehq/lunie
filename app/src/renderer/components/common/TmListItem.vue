<template>
  <a v-if="dt &amp;&amp; href" :href="href" class="tm-li tm-li-link">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-dl">
        <div class="tm-li-dt">{{ dt }}</div>
        <div v-if="$slots['dd']" class="tm-li-dd tm-li-dd-flush">
          <slot name="dd"></slot>
        </div>
        <div v-else class="tm-li-dd">{{ dd }}</div>
      </div>
      <div class="tm-li-icon">
        <i class="material-icons inactive">chevron_right</i
        ><i class="material-icons active">my_location</i>
      </div>
    </div>
  </a>
  <div v-else-if="type === 'field'" class="tm-li tm-li-field">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-label">
        <div class="tm-li-title">{{ title }}</div>
        <div class="tm-li-subtitle">{{ subtitle }}</div>
      </div>
      <div class="tm-li-input"><slot></slot></div>
    </div>
  </div>
  <router-link
    v-else-if="dt &amp;&amp; to &amp;&amp; !btn"
    :to="to"
    class="tm-li tm-li-link"
  >
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-dl">
        <div class="tm-li-dt">{{ dt }}</div>
        <div v-if="$slots['dd']" class="tm-li-dd tm-li-dd-flush">
          <slot name="dd"></slot>
        </div>
        <div v-else class="tm-li-dd">{{ dd }}</div>
      </div>
      <div class="tm-li-icon">
        <i class="material-icons inactive">chevron_right</i
        ><i class="material-icons active">my_location</i>
      </div>
    </div>
  </router-link>
  <router-link v-else-if="btn &amp;&amp; to" :to="to" class="tm-li tm-li-link">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-dl">
        <div class="tm-li-dt">{{ dt }}</div>
        <div v-if="$slots['dd']" class="tm-li-dd tm-li-dd-flush">
          <slot name="dd"></slot>
        </div>
        <div v-else class="tm-li-dd">{{ dd }}</div>
      </div>
      <tm-btn
        :value="btn"
        icon="chevron_right"
        icon-pos="right"
        color="primary"
      ></tm-btn>
    </div>
  </router-link>
  <div v-else-if="dt" class="tm-li">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-dl">
        <div class="tm-li-dt">{{ dt }}</div>
        <div v-if="$slots['dd']" class="tm-li-dd tm-li-dd-flush">
          <slot name="dd"></slot>
        </div>
        <div v-else class="tm-li-dd">{{ dd }}</div>
      </div>
    </div>
  </div>
  <a v-else-if="href" :href="href" class="tm-li tm-li-link">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-label">
        <div class="tm-li-title">{{ title }}</div>
        <div class="tm-li-subtitle">{{ subtitle }}</div>
      </div>
      <div class="tm-li-icon">
        <i class="material-icons inactive">chevron_right</i
        ><i class="material-icons active">my_location</i>
      </div>
    </div>
  </a>
  <router-link v-else-if="to" :to="to" class="tm-li tm-li-link">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-label">
        <div class="tm-li-title">{{ title }}</div>
        <div class="tm-li-subtitle">{{ subtitle }}</div>
      </div>
      <div class="tm-li-icon">
        <i class="material-icons inactive">chevron_right</i
        ><i class="material-icons active">my_location</i>
      </div>
    </div>
  </router-link>
  <div
    v-else-if="title &amp;&amp; btn &amp;&amp; !to"
    class="tm-li tm-li-receive"
  >
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-label">
        <div class="tm-li-title">{{ title }}</div>
        <div class="tm-li-subtitle">{{ subtitle }}</div>
      </div>
      <slot name="btn-receive"></slot>
    </div>
  </div>
  <div v-else-if="title" class="tm-li">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-label">
        <div class="tm-li-title">{{ title }}</div>
        <div class="tm-li-subtitle">{{ subtitle }}</div>
      </div>
    </div>
  </div>
  <div v-else-if="type === 'image'" class="tm-li">
    <div class="tm-li-container"><slot></slot></div>
  </div>
</template>

<script>
import TmBtn from "../TmBtn/TmBtn.vue"
export default {
  name: `tm-list-item`,
  components: { TmBtn },
  props: [
    `type`,
    `title`,
    `subtitle`,
    `image`,
    `icon`,
    `to`,
    `dt`,
    `dd`,
    `href`,
    `btn`,
    `spin`,
    `overflow`
  ],
  computed: {
    spinClass() {
      if (this.spin) {
        return `fa-spin`
      }
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.tm-li
  display block
  min-height 3rem
  position relative
  border-bottom calc(2 * var(--px)) solid var(--bc-dim)

  &:last-child
    border-bottom calc(2 * var(--px)) solid transparent

  &.tm-li-link
    &:hover, &.router-link-exact-active
      background var(--hover-bg)

      .tm-li-label
        cursor pointer

      .tm-li-title
        color var(--bright)

    &:before
      content ''
      display block
      position absolute
      top 0
      left 0
      height 3rem
      width var(--bw)
      background transparent
      z-index var(--z-listItem)

    .tm-li-dt, .tm-li-dd
      color var(--link)

  &.router-link-exact-active
    .tm-li-title
      color var(--bright)

    &:before
      background var(--mc)

    .tm-li-icon
      i.material-icons
        color var(--mc)

.tm-li-label, .tm-li-dl
  .tm-btn
    position absolute
    top calc(0.5rem - var(--px))
    right 1rem

.tm-li-container
  display flex
  flex-flow row nowrap
  align-items center
  position relative
  min-height calc(3rem - 2 * var(--px))
  max-width 60rem

// type: anchor & link
.tm-li-thumb, .tm-li-label, .tm-li-icon
  min-height calc(3rem - 2 * var(--px))

.tm-li-thumb:empty
  display none

.tm-li-thumb
  width 3rem - var(--px)

  i.material-icons, img
    display block
    width 3rem - var(--px)
    height 3rem - var(--px)

  i.material-icons
    display flex
    align-items center
    justify-content center
    color var(--txt)

.tm-li-label
  flex 1
  display flex
  align-items flex-start
  justify-content center
  padding 0 1rem
  flex-flow column nowrap

  .tm-li-title
    color var(--txt)
    line-height 1.25

  .tm-li-subtitle
    color var(--dim)
    font-size var(--xs)
    line-height 1.25

.tm-li-link
  .tm-li-label
    // padding 0 1rem 0 0

// type: field
.tm-li-field .tm-li-container
  display flex

  .tm-li-label
    flex 2

  .tm-li-input
    flex 1
    display flex

    .tm-btn
      flex 1

    .tm-select
      width 100%

// type: dl definition list
.tm-li-dl
  flex 1
  height 3rem - var(--px)
  padding 0 0.5rem
  display flex
  align-items center
  // truncate
  min-width 0

.tm-li-dt, .tm-li-dd
  // truncate
  white-space nowrap
  text-overflow ellipsis
  overflow hidden
  color var(--txt)

.tm-li-dt, .tm-li-dd
  &:empty
    display none

.no-overflow
  .tm-li-dt, .tm-li-dd
    overflow visible

.tm-li-dt
  padding-left 0.5rem
  padding-right 0.25rem
  max-width width-side
  flex 2

.tm-li-dd
  padding-left 0.25rem
  padding-right 0.5rem
  flex 3
  line-height 1.25

  &.tm-li-dd-flush
    padding 0

  &.tm-li-dd-flush > div
    display flex
    height 3rem - var(--px)

a.tm-li-dd
  color var(--mc)
  cursor pointer

.tm-li-icon
  width 1.5rem
  display flex
  align-items center
  position absolute
  top 0
  right 0

  .inactive
    display block

  .active
    display none
</style>
