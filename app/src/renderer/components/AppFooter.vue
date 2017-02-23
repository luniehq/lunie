<template>
  <div class="app-footer">
    <div class="status-sync">
      <div v-if="statusSynced"><i class="fa fa-spin fa-refresh"></i> Syncing&hellip;</div>
      <div v-else>Your balance: 0.00 (TODO)</div>
    </div>
    <div class="menu">
      <a href="#"><i class="fa fa-lock"></i></a>
      <router-link to="/settings"><i class="fa fa-gear"></i></router-link>
      <a href="#"><i class="fa fa-user-secret"></i></a>
      <div class="status-online" :class="{ online: statusOnline }">
        <i v-if="statusOnline" class="fa fa-link"></i>
        <i v-else="statusOnline" class="fa fa-chain-broken"></i>
      </div>
    </div>
  </div>
</template>

<script>
import Btn from '@nylira/vue-button'
export default {
  components: {
    Btn
  },
  data () {
    return {
      statusSynced: true,
      statusOnline: true
    }
  },
  methods: {
    go (route) {
      this.$router.push(route)
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.app-footer
  height 2rem + 0.0625rem
  border-top 1px solid bc
  background c-app-fg
  display flex
  align-items center

  padding 0 0.5rem

  .status-sync
    flex 1
    font-size 0.875rem

  .menu
    display flex

    a, .status-online
      color dim
      height 2rem
      width 2rem
      display flex
      align-items center
      justify-content center

    a
      &:hover
        color link

    .status-online
      i.fa
        color hsl(0,100%,35%)
      &.online i.fa
        color hsl(120,100%,35%)
</style>
