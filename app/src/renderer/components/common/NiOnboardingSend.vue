<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    .ni-session-title You can send your tokens
  .ni-session-main
    p From me
    p To you
  .ni-session-footer
    btn(value="Skip" @click.native="skip" icon="close")
    btn(value="Next" @click.native="next('stake')" color="primary" icon="chevron_right" icon-pos="right" )
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
