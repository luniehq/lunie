<template>
  <div class="text-block" v-html="htmlContent" />
</template>

<script>
import MarkdownIt from "markdown-it"
export default {
  name: `text-block`,
  props: {
    content: {
      type: String,
      required: true
    }
  },
  computed: {
    htmlContent() {
      let md = new MarkdownIt()
      return md.render(this.content)
    }
  }
}
</script>

<style>
.text-block {
  padding: 1rem;
}

.text-block pre {
  white-space: pre-wrap /* Since CSS 2.1 */;
  white-space: -moz-pre-wrap /* Mozilla, since 1999 */;
  white-space: -pre-wrap /* Opera 4-6 */;
  white-space: -o-pre-wrap /* Opera 7 */;
  word-wrap: break-word /* Internet Explorer 5.5+ */;
  max-width: width-main -2rem;
}

.text-block p {
  margin-bottom: 1rem;
}

.text-block p,
.text-block ul,
.text-block ol,
.text-block blockquote,
.text-block pre {
  max-width: 40rem;
}
</style>
