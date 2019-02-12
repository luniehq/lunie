<template>
  <tm-page
    :tabs="tabs"
    :refresh="getDelegates"
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
    const myDelegations = {
      displayName: `My Delegations`,
      pathName: `My Delegations`
    }
    if (this.user.signedIn) {
      this.tabs.unshift(myDelegations)
    } else if (Object.is(this.tabs[0], myDelegations) && !this.user.signedIn) {
      this.tabs.shift()
    }
  },
  methods: {
    ...mapActions([`getDelegates`])
  }
}
</script>
