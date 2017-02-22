<template>
  <div class="page-exchange">
    <page-header title="Console">
      <menu>
        <btn icon="copy" value="Copy"></btn>
      </menu>
    </page-header>
    <textarea class="console scrollable-area">Welcome to Basecoin!&#13;&#10;>> </textarea>
  </div>
</template>

<script>
import PageHeader from './PageHeader'
import Btn from '@nylira/vue-button'
export default {
  name: 'page-exchange',
  components: {
    PageHeader,
    Btn
  },
  methods: {
    captureEnter (el) {
      el.addEventListener('keyup', function (event) {
        event = event || window.event
        if (event.keyCode === 13) {
          el.value += '>> '
        }
      })
    }
  },
  mounted () {
    let ta = document.querySelector('.console.scrollable-area')
    this.captureEnter(ta)
    ta.focus()
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
  border 1px solid bc
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
</style>
