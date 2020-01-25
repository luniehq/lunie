<template>
  <TmDataMsg icon="sentiment_very_dissatisfied" @on:intercom="handleIntercom()">
    <div slot="title">
      Aw shucks!
    </div>
    <div slot="subtitle">
      Even though you're connected a full node, we can't display this data for
      you right now. Please try again later or
      <a href="https://github.com/luniehq/lunie/issues">file a bug report</a> or
      <a class="intercom-button" href="#" @click="$emit('intercom')">
        open a support chat
      </a>
      . Apologies!
    </div>
  </TmDataMsg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
import config from "src/../config"
import { mapState } from "vuex"
export default {
  name: `tm-data-error`,
  components: { TmDataMsg },
  computed: {
    ...mapState([`intercom`])
  },
  methods: {
    handleIntercom() {
      if (config.mobileApp) {
        this.$store.dispatch(`displayMessenger`)
      }
    }
  }
}
</script>
