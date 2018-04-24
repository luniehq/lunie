<template lang="pug">
.ni-session-wrapper
  img.ni-session-backdrop(src="~assets/images/cosmos-logo.png")
  onboarding-welcome(v-if="onboarding.state == 'welcome'")
  onboarding-send(v-if="onboarding.state == 'send'")
  onboarding-stake(v-if="onboarding.state == 'stake'")
  onboarding-vote(v-if="onboarding.state == 'vote'")
  onboarding-explore(v-if="onboarding.state == 'explore'")
</template>

<script>
import { mapGetters } from "vuex"
import OnboardingWelcome from "common/NiOnboardingWelcome"
import OnboardingSend from "common/NiOnboardingSend"
import OnboardingStake from "common/NiOnboardingStake"
import OnboardingVote from "common/NiOnboardingVote"
import OnboardingExplore from "common/NiOnboardingExplore"
export default {
  name: "ni-onboarding",
  components: {
    OnboardingWelcome,
    OnboardingSend,
    OnboardingStake,
    OnboardingVote,
    OnboardingExplore
  },
  computed: { ...mapGetters(["onboarding"]) }
}
</script>
