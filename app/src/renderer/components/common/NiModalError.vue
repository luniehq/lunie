<template lang="pug">
.ni-modal-error__wrapper
  .ni-modal-error
    .ni-modal-error__icon: i.material-icons {{ errorIcon }}
    .ni-modal-error__title {{ errorTitle }}
    .ni-modal-error__body {{ errorBody }}
    .ni-modal-error__footer
      btn#ni-modal-error__btn-issue(
        size="lg"
        icon="bug_report"
        color="primary"
        value="Create an issue"
        type="anchor"
        :href="issueUrl")
      btn#ni-modal-error__btn-logs(
        size="lg"
        icon="info_outline"
        value="View app logs"
        @click.native="viewLogs")
</template>

<script>
import { remote, shell } from 'electron'
import Btn from '@nylira/vue-button'
export default {
  name: 'ni-modal-error',
  components: { Btn },
  computed: {
    errorIcon () {
      if (this.icon) return this.icon
      else return 'error_outline'
    },
    errorTitle () {
      if (this.title) return this.title
      else return 'Voyager ran into an error'
    },
    errorBody () {
      if (this.body) return this.body
      else return 'Voyager has encountered a critical error that blocks the app from running. Please create an issue and include a copy of the app logs.'
    }
  },
  data: () => ({
    logPath: '',
    chatUrl: 'https://web.telegram.org/#/im?p=@cosmosproject',
    issueUrl: 'https://github.com/cosmos/voyager/issues'
  }),
  methods: {
    viewLogs () {
      shell.openItem(this.logPath)
    }
  },
  mounted () {
    this.logPath = remote.app.getPath('home') + '/.Cosmos/main.log'
  },
  props: ['icon', 'title', 'body']
}
</script>

<style lang="stylus">
@import '~variables'

.ni-modal-error__wrapper
  position absolute
  top 0
  left 0

  z-index z(modalError)
  background app-bg
  width 100vw
  height 100vh
  max-width 100%

  display flex
  align-items center
  justify-content center

.ni-modal-error
  padding 1.5rem
  max-width 40rem

.ni-modal-error__icon
  position fixed
  top 0
  left 0
  z-index z(below)
  i.material-icons
    font-size 25vw + 25vh
    line-height 1
    color bc-dim

.ni-modal-error__title
  font-size h1
  font-weight 500
  line-height 1
  margin-bottom 1.5rem

.ni-modal-error__body
  font-size lg
  color dim
  margin-bottom 3rem

.ni-modal-error__footer
  .ni-btn
    width 100%
    margin-right 1.5rem
    margin-bottom 1rem
    max-width 14rem
    &:last-child
      margin-bottom 0

@media screen and (min-width: 768px)
  .ni-modal-error__icon i.material-icons
    font-size 20vw + 20vh

  .ni-modal-error__body
    margin-bottom 4.5rem

  .ni-modal-error__footer
    min-width: 31rem

  .ni-modal-error__footer .ni-btn
      margin-bottom 0
</style>
