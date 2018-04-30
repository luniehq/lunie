<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    .ni-session-title Welcome to Voyager
  .ni-session-main
    .description Through governance, you can vote on the future of the Cosmos Network.
    img(src="~@/assets/images/onboarding/step-4.png")
  .ni-session-footer
    btn(value="Skip" @click.native="skip" icon="close")
    btn(value="Next" @click.native="next('explore')" color="primary" icon="chevron_right" icon-pos="right" )
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
export default {
  name: "ni-onboarding-vote",
  components: { Btn },
  computed: {
    ...mapGetters(["onboarding"])
  },
  methods: {
    skip(value) {
      this.$store.commit("setOnboardingActive", false)
    },
    next(value) {
      this.$store.commit("setOnboardingState", value)
    }
  }
}
</script>
