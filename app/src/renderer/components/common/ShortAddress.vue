<template lang="pug">
.short-address
  .address(@click.prevent.stop="copy" v-tooltip.top="address")#address {{ shortAddress }}
  .success(:class="{active:showSuccess}")
    i.material-icons check
    span Copied
</template>

<script>
import { clipboard } from "electron"
export default {
  name: `short-address`,
  props: [`address`],
  data: () => ({
    showSuccess: false
  }),
  computed: {
    shortAddress({ address } = this, length = 4) {
      if (!address) return "Address Not Found"
      if (address.indexOf(`1`) === -1) {
        return address.length <= length * 2
          ? address
          : address.slice(0, Math.floor(length)) +
              `…` +
              address.slice(-1 * Math.ceil(length))
      } else {
        if (length > address.split(`1`)[1].length) return address
        return address.split(`1`)[0] + `…` + address.slice(-1 * length)
      }
    }
  },
  methods: {
    copy() {
      clipboard.writeText(this.address)
      this.showSuccess = true
      setTimeout(() => {
        this.showSuccess = false
      }, 3000)
    }
  }
}
</script>
<style lang="stylus">
@import '~variables'

.short-address
  align-items flex-start
  display flex
  padding 0
  margin 0

  .address
    color var(--dim)
    cursor pointer
    font-size 14px
    line-height 14px

    &:hover
      color var(--link)

  .success
    align-items flex-end
    display flex
    font-size sm
    opacity 0
    padding-left 10px
    transition opacity 500ms ease
    position relative
    top -2px

    &.active
      opacity 1

    i
      color var(--success)
      font-size m
      padding-bottom 2px
      padding-right 0
</style>
