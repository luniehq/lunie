<template lang="pug">
a.ni-card-issue(:href="issue.html_url" target="_blank")
  .ni-card-issue__state(v-if="issue.state === 'open'"): i.material-icons error
  .ni-card-issue__state(v-else): i.material-icons check_circle
  .ni-card-issue__text
    .ni-card-issue__title {{ issue.title }}
    .ni-card-issue__body \#{{issue.number}} opened on {{prettyDate(issue.created_at)}} by {{issue.user.login}}
</template>

<script>
import moment from "moment"
import MarkdownIt from "markdown-it"
export default {
  name: "ni-card-issue",
  methods: {
    prettyDate(date) {
      return moment(date).format("MMM D, YYYY, h:mm A")
    },
    markdown(text) {
      let md = new MarkdownIt()
      return md.renderInline(text)
    }
  },
  props: ["issue"]
}
</script>

<style lang="stylus">
@require '~variables'

.ni-card-issue
  display block
  color var(--txt)
  display flex
  flex-flow row nowrap

  text-align left

  &:hover
    .ni-card-issue__title
      color var(--link)

.ni-card-issue__state
  text-transform uppercase
  display flex
  justify-content center
  padding 0.75rem 0.5rem 0.5rem

  i
    font-size 1.25rem
    color var(--primary)

.ni-card-issue__text
  flex 1
  padding 0.5rem

.ni-card-issue__title
  font-weight 500
  line-height 1.25rem
  margin-bottom 0.25rem

.ni-card-issue__body
  color var(--dim)
  font-size 0.75rem
</style>
