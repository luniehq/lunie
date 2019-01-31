<template>
  <tm-page
    :tabs="tabs"
    :refresh="updateDelegates"
    class="staking"
    data-title="Staking"
  >
    <router-view />
  </tm-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import TmPage from "common/TmPage"

export default {
  name: `page-staking`,
  components: { TmPage },
  data: () => ({
    query: ``,
    tabs: [
      {
        displayName: `Validators`,
        pathName: `Validators`
      },
      {
        displayName: `Parameters`,
        pathName: `Staking Parameters`
      }
    ]
  }),
  computed: {
    ...mapGetters([`connected`, `delegates`, `filters`, `user`])
  },
  mounted() {
    if (this.user.signedIn) {
      this.tabs.unshift({
        displayName: `My Delegations`,
        pathName: `My Delegations`
      })
    }
  },
  methods: {
    ...mapActions([`updateDelegates`])
  }
}
</script>
