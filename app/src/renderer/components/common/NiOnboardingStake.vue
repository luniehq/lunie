<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    .ni-session-title Welcome to Voyager
  .ni-session-main
    .description You can stake your Atoms to Cosmos Validators to earn even more Atoms.
    img(src="~@/assets/images/onboarding/step-3.png")
  .ni-session-footer
    btn(value="Skip" @click.native="skip" icon="close")
    btn(value="Next" @click.native="next('vote')" color="primary" icon="chevron_right" icon-pos="right" )
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
export default {
  name: "ni-onboarding-stake",
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
