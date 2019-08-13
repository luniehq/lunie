<template>
  <p class="text-block">{{ content.trim() }}</p>
</template>

<script>
export default {
  name: `text-block`,
  props: {
    content: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.text-block {
  word-break: break-word;
  font-size: 14px;
  white-space: pre-wrap;
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
