<template>
  <tm-page data-title="Preferences">
    <tm-part>
      <tm-list-item
        type="field"
        title="Node IP"
      >
        {{ nodeUrl }}
      </tm-list-item>
      <tm-list-item
        type="field"
        title="Automatically send usage statistics and crash reports"
        subtitle="to the Cosmos Wallet development team"
      >
        <tm-field
          :style="{ margin: '1em auto 0 auto' }"
          :options="{
            checked: ' ',
            unchecked: ' '
          }"
          :value="session.errorCollection"
          :is-disabled="session.experimentalMode"
          type="toggle"
          @click.native="setErrorCollection"
        />
        <tm-form-msg
          v-if="showError"
          name="Error collection is disabled during development."
          type="custom"
        />
      </tm-list-item>
    </tm-part>
  </tm-page>
</template>

<script>
import { mapGetters } from "vuex"
import TmListItem from "common/TmListItem"
import TmPage from "common/TmPage"
import TmPart from "common/TmPart"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"

export default {
  name: `page-preferences`,
  components: {
    TmField,
    TmFormMsg,
    TmListItem,
    TmPage,
    TmPart
  },
  data: () => ({
    showError: false
  }),
  computed: {
    ...mapGetters([`session`, `nodeUrl`])
  },
  methods: {
    setErrorCollection() {
      if (this.session.experimentalMode) {
        this.showError = true
        setTimeout(() => {
          this.showError = false
        }, 5000)
      } else {
        this.$store.dispatch(`setErrorCollection`, {
          address: this.session.address,
          optin: !this.session.errorCollection
        })
      }
    }
  }
}
</script>
<style scoped>
/* TODO: fix style */
.tm-form-msg {
  display: block;
  position: relative;
}
</style>
