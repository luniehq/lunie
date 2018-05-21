<template lang="pug">
.section-social: .section-social__container
  .app-footer__row.app-footer__row-actions
    part(title="Testnet Status: LIVE")
      btn(
        type="anchor"
        href="http://explorer.cosmos.network"
        icon="wifi_tethering"
        size="lg"
        target="_blank"
        value="Testnet Explorer")
    part(title="Get Newsletter"): form-email-signup
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
import Cards from "common/NiCards"
import CardSocial from "cards/CardSocial"
import FormEmailSignup from "forms/FormEmailSignup"
import Part from "common/NiPart"
export default {
  name: "app-footer",
  components: {
    Btn,
    Cards,
    CardSocial,
    FormEmailSignup,
    Part
  },
  computed: {
    ...mapGetters(["links"])
  }
}
</script>

<style lang="stylus">
@require '~variables'

.section-social__container
  max-width 1024px
  margin 1.5rem auto 0

.app-footer__row-actions
  margin-bottom 1rem
  .ni-part-main
    padding 1rem
    margin-top 0.25rem

    .ni-btn:only-child
      width 100%
      max-width 20rem

    .form-email-signup
      max-width 20rem
      margin 0

@media screen and (min-width: 768px)
  .app-footer__row
    display flex
    flex-flow row nowrap
    margin 0 0 1rem

    .ni-part:first-child
      margin-right 0.5rem
    .ni-part:last-child
      margin-left 0.5rem

    .ni-part
      flex 1
</style>
