<template>
  <TmPage :tabs="tabs" class="staking" data-title="Staking">
    <keep-alive>
      <router-view />
    </keep-alive>
  </TmPage>
</template>

<script>
import { mapActions } from "vuex"
import TmPage from "common/TmPage"

export default {
  name: `page-staking`,
  components: { TmPage },
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
