<template lang="pug">
.text-block: pre {{ content }}
  slot
</template>

<script>
import MarkdownIt from 'markdown-it'
export default {
  name: 'text-block',
  computed: {
    htmlContent () {
      let md = new MarkdownIt()
      return md.render(this.content)
    }
  },
  props: ['content', 'author']
}
</script>

<style lang="stylus">
@require '~variables'

.text-block
  padding 1rem

  pre
    white-space pre-wrap       /* Since CSS 2.1 */
    white-space -moz-pre-wrap  /* Mozilla, since 1999 */
    white-space -pre-wrap      /* Opera 4-6 */
    white-space -o-pre-wrap    /* Opera 7 */
    word-wrap break-word       /* Internet Explorer 5.5+ */
    max-width width-main - 2rem

  p
    margin-bottom 1rem

  p, ul, ol, blockquote, pre
    max-width 40rem
</style>
