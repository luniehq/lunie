<template lang="pug">
.ni-asset__container: .ni-asset
  .ni-asset__thumbnail-container
    a.ni-asset__thumbnail(:href="asset.url" target="_blank")
      img(:src="assetThumbnail")
  .ni-asset__content
    .ni-asset__header
      .ni-asset__title {{ asset.title }}
      .ni-asset__subtitle
        .ni-asset__date Published on {{ assetDate }}
    .ni-asset__body(v-if="asset.body") {{ asset.body }}
    .ni-asset__footer
      btn(
        type="anchor"
        :href="asset.url"
        target="_blank"
        color="primary"
        icon="cloud_download"
        value="Download")
</template>

<script>
import moment from "moment"
import Btn from "@nylira/vue-button"
export default {
  name: "ni-asset-container",
  components: {
    Btn
  },
  computed: {
    assetThumbnail() {
      return require(`assets/images/assets/${this.asset.id}.png`)
    },
    assetDate() {
      return moment(this.asset.date).format("YYYY-MM-DD")
    }
  },
  props: ["asset"]
}
</script>

<style lang="stylus">
@require '~variables'

.ni-asset__container
  border-top 1px solid bc

.ni-asset__thumbnail-container
  padding 1rem 1rem 0

.ni-asset__thumbnail
  position relative
  display block
  box-shadow hsla(0,0,0,0.5) 0 0.25rem 0.5rem
  border 1px solid bc
  img
    display block
    max-width 100%
    height auto

.ni-asset__content
  padding 1rem
  display flex
  flex-flow column

.ni-asset__header
.ni-asset__body
  margin 0 0 0.5rem

.ni-asset__title
  font-size h3
  line-height 1
  padding 0.375rem 0
  font-weight 500

.ni-asset__subtitle
  display flex

.ni-asset__date
.ni-asset__location
  font-size sm
  display flex
  align-items center
  color dim

.ni-asset__date
  margin-right 0.75rem

.ni-asset__body
  flex 1

.ni-asset__footer
  .ni-btn
    margin-right 0.5rem
    &:last-child
      margin-right 0

@media screen and (min-width: 768px)
  .ni-asset
    display flex

  .ni-asset__thumbnail-container
  .ni-asset__content
    padding-top 1.5rem
    padding-bottom 1.5rem

  .ni-asset__thumbnail-container
    padding-left 1rem
    padding-right 0.5rem
    flex 0 0 24rem + 1.5rem

  .ni-asset__header
  .ni-asset__body
    margin-bottom 1rem

  .ni-asset__date
  .ni-asset__location
    font-size x

@media screen and (min-width: 1024px)
  .ni-asset__thumbnail-container
  .ni-asset__content
    padding-top 2rem
    padding-bottom 2rem

  .ni-asset__thumbnail-container
    flex 0 0 30rem + 1.5rem
</style>
