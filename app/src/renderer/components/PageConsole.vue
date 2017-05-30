<template>
  <div class="page-exchange">
    <page-header title="Console">
      <menu>
        <btn-copy :value="logOutput"></btn-copy>
      </menu>
    </page-header>
    <!-- TODO: HTML output instead of text -->
    <textarea class="console scrollable-area" v-html="logOutput" readonly="1"></textarea>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PageHeader from './PageHeader'
import BtnCopy from './BtnCopy'
export default {
  name: 'page-exchange',
  components: {
    PageHeader,
    BtnCopy
  },
  computed: {
    ...mapGetters(['logOutput'])
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-exchange
  flex 1
  display flex
  flex-flow column

.console
  border none
  margin 0.5rem
  flex 1
  overflow-y scroll

  mono()
  font-size 0.75rem
  line-height 1.25
  padding 0.5rem
  background c-app-fg
  &:focus
    outline none

.break-all
  /* These are technically the same, but use both */
  overflow-wrap break-word
  word-wrap break-word

  -ms-word-break break-all
  /* This is the dangerous one in WebKit, as it breaks things wherever */
  word-break break-all
  /* Instead use this non-standard one */
  word-break break-word

  /* Adds a hyphen where the word breaks, if supported (No Blink) */
  -ms-hyphens auto
  -moz-hyphens auto
  -webkit-hyphens auto
  hyphens auto

@media screen and (min-width: 400px)
  .console
    font-size 0.875rem
</style>
