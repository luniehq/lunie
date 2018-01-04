<template lang="pug">
.ni-page
  page-header(:icon='icon')
    h2(slot='title') {{ title }}
    h3(slot='subtitle') {{ subtitle }}
    div(slot="menu"): slot(name="menu")
  main.ni-page-main: slot
</template>

<script>
import { mapGetters } from 'vuex'
import PerfectScrollbar from 'perfect-scrollbar'
import PageHeader from 'common/NiPageHeader'
import PageFooter from 'common/NiPageFooter'
export default {
  name: 'ni-page',
  props: ['title', 'subtitle', 'icon'],
  components: {
    PageHeader,
    PageFooter
  },
  computed: {
    ...mapGetters(['config'])
  },
  data: () => ({
    ps: ''
  }),
  methods: {
    handleResize () {
      if (this.config.desktop) {
        const container = this.$el.querySelector('.ni-page-main')
        this.ps = new PerfectScrollbar(container)
      } else if (this.ps) {
        this.ps.destroy()
        this.ps = null
      }
    }
  },
  mounted () {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  }
}
</script>

<style lang="stylus">
@require '~variables'

.ni-page
  flex 1
  display flex
  flex-flow column nowrap

.ni-page-main
  flex 1
  position relative

.ni-page-title
  color bright
  font-size h2
  padding 0.5rem 1rem 1rem

.ni-page-subtitle
  > div
    color dim
    font-size sm

@media screen and (min-width: 768px)
  .ni-page-main
    padding 1rem
</style>
