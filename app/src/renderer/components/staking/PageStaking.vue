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
import { mapActions } from "vuex"
import TmPage from "common/TmPage"

export default {
  name: `page-staking`,
  components: {
    TmPage
  },
  data: () => ({
    query: ``,
    tabs: [
      {
        displayName: `My Delegations`,
        pathName: `My Delegations`
      },
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
  methods: {
    ...mapActions([`getDelegates`])
  }
}
</script>
