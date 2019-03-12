<template>
  <!-- TODO:SECURITY try to add a malicious block and see how is rendered,
  like <script>alert('danger')</script> -->
  <!-- eslint-disable vue/no-v-html -->
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
      const md = new MarkdownIt()
      return md.render(this.content)
    }
  }
}
</script>

<style>
.text-block pre {
  white-space: pre-wrap /* Since CSS 2.1 */;
  white-space: -moz-pre-wrap /* Mozilla, since 1999 */;
  white-space: -o-pre-wrap /* Opera 7 */;
  word-wrap: break-word /* Internet Explorer 5.5+ */;
  max-width: calc(var(--width-main) - 2rem);
}

.text-block p {
  line-height: 22px;
  margin-bottom: 1.5rem;
}

.text-block p,
.text-block ul,
.text-block ol,
.text-block blockquote,
.text-block pre {
  max-width: 40rem;
}
</style>
