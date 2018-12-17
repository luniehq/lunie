<template>
  <div class="tm-li-tx">
    <div class="tm-li-tx__icon">
      <img src="../../assets/cosmos-logo.png" :style="{ borderColor: color }" />
    </div>
    <div class="tm-li-tx__content">
      <div class="tm-li-tx__content__left">
        <div class="tm-li-tx__content__caption">
          <p class="tm-li-tx__content__caption__title">
            <slot name="caption"></slot>
          </p>
        </div>
        <div class="tm-li-tx__content__information">
          <slot name="details"></slot>
        </div>
      </div>
      <div class="tm-li-tx__content__block">
        <a :href="'https://explorecosmos.network/blocks/' + block"
          >Block #{{ block }}&nbsp;</a
        >@ {{ date }}
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment"

export default {
  name: "tm-li-transaction",
  computed: {
    date() {
      return moment(this.time).format("h:mm a")
    }
  },
  props: ["color", "time", "block"]
}
</script>

<style lang="stylus">
@require '~variables'

.tm-li-tx
  display flex
  align-items center
  font-size m
  margin-bottom 0.5rem
  border 1px solid var(--bc-dim)
  background var(--app-fg)
  min-width 45rem

  &:hover
    background var(--hover-bg)

  b
    font-weight 500

  &__icon
    padding 12px 0 12px 1rem

    img
      max-height 100%
      max-width 52px
      border 2px solid
      border-radius 50%
      display block

  &__content
    display flex
    flex-direction row
    width 100%
    padding 1rem
    font-size m

    &__left, &__action, &__block
      display flex
      flex-direction column

    &__left
      flex 0.5

    &__action
      flex 0.3
      justify-content center
      padding 0 1rem
      border-left 1px solid var(--bc-dim)

      button
        width 9rem

    &__block
      flex 0.3

    &__caption
      line-height lg
      font-size lg
      color var(--bright)

    &__information, &__block
      display flex
      width 100%
      font-size 14px
      color var(--dim)
      align-items baseline

    &__information
      padding-top 3px

    &__block
      margin-left auto
      flex-direction row
      align-items flex-end
      justify-content flex-end
</style>
