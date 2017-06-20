<template lang="pug">
.ni-article-body
  .ni-article-body-container
    slot
</template>

<script>
export default {
  name: 'ni-article-body'
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.ni-article-body
  margin 1rem 0
  border 2px solid bc-dim
  border-radius 0.25rem
  ul, ol, p
    &:last-child
      margin-bottom 0

  hr
    border none
    border-top 1px solid #eee
    background transparent
    height 0
    margin 0
    padding 0
  a
    color link
    overflow-wrap break-word
    word-wrap break-word
    -ms-word-break break-all
    word-break break-all
    word-break break-word
    &:hover
      text-decoration underline
  strong
    font-weight bold
  em
    font-style italic
  code
    font-family Consolas, 'Deja Vu Sans Mono', 'Andale Sans Mono', monospace
    margin-bottom 1.5rem
    font-size 0.875rem
    background #eee
    font-weight bold
    padding 0 0.25rem
    overflow-wrap break-word
    word-wrap break-word
    -ms-word-break break-all
    word-break break-all
    word-break break-word
  pre
    margin-left -1rem
    margin-right -1rem
    overflow-x scroll
    padding 0.375rem 0.5rem
    line-height 1.125
    background hsl(220,13%,18%)
    color hsl(220, 14%, 71%)
    & + figcaption
      font-size 0.875rem
      margin-top -1.5rem
      background #eee
      border 1px solid #eee
      border-top none
      padding 0.5rem
      color #555
      margin-bottom 1.5rem
    code
      margin-bottom 0
      font-weight normal
      background hsl(220,13%,18%)
      color hsl(220, 14%, 71%)
      padding 0
  p
    &:empty
      display none
    img
      margin-bottom 0
  .youtube
    display block
    margin-bottom 1.5em
  .left
    float left !important
    padding-right 2.5em !important
  .right
    float right !important
    padding-left 2.5em !important
  img
    max-width 100%
  h1
    font-size 2rem
    margin-top 1.5rem
  h2
    font-size 1.75rem
  h3
    font-size 1.53125rem
  h4
    font-size 1.33984375rem
  h5
    font-size 1.1723632813rem
  h6
    font-size 1rem
  ul
    li
      list-style square
      margin-bottom 0.25em
  ol
    li
      list-style decimal
  table
    border 1px solid #ddd
    border-collapse collapse
    width 100%
    th
      font-weight 600
      background #e5f3ff
      color #004480
  blockquote
    padding 0.75rem 1rem
    background hsl(210,50%,90)
    position relative
    color hsl(210,75%,33%)
    & + h2
      margin-top 1.5rem

.ni-article-body-container
  max-width 48rem
  padding 1rem
  margin-left auto
  margin-right auto
  font-family sans
  font-size 1rem
  line-height 1.5
  font-weight 400
  color txt

.ni-article-body p,
.ni-article-body hr,
.ni-article-body ul,
.ni-article-body ol,
.ni-article-body table,
.ni-article-body pre,
.ni-article-body figcaption,
.ni-article-body blockquote,
.ni-article-body img,
.ni-article-body .btn
  margin-bottom 1.5em

.ni-article-body p code:before,
.ni-article-body p code:after
  letter-spacing -0.375em
  content "\00a0"

.ni-article-body .left,
.ni-article-body .right
  margin-bottom 2.5em !important

.ni-article-body h1,
.ni-article-body h2,
.ni-article-body h3,
.ni-article-body h4,
.ni-article-body h5,
.ni-article-body h6
  position relative
  line-height 1.05
  margin 1.5rem 0 0.75rem

.ni-article-body h1:first-child,
.ni-article-body h2:first-child,
.ni-article-body h3:first-child,
.ni-article-body h4:first-child,
.ni-article-body h5:first-child,
.ni-article-body h6:first-child
  margin-top 0

.ni-article-body h1,
.ni-article-body h3,
.ni-article-body h5
  color txt
  font-weight 600

.ni-article-body h2,
.ni-article-body h4,
.ni-article-body h6
  color dim
  font-weight bold

.ni-article-body ul,
.ni-article-body ol
  padding-left 1.5em

.ni-article-body ul ul,
.ni-article-body ul ol,
.ni-article-body ol ul,
.ni-article-body ol ol
  margin-bottom 0
  padding-top 0.25em

.ni-article-body li p + ul,
.ni-article-body li p + ol
  margin-top -1.5em

.ni-article-body li p + ul:last-child,
.ni-article-body li p + ol:last-child
  margin-bottom 1.5em

.ni-article-body table td,
.ni-article-body table th
  border 1px solid #e0e0e0
  padding 0.25em 0.5em

.ni-article-body blockquote p,
.ni-article-body blockquote ul,
.ni-article-body blockquote ol
  margin-bottom 0.75rem

.ni-article-body blockquote p:last-child,
.ni-article-body blockquote ul:last-child,
.ni-article-body blockquote ol:last-child
  margin-bottom 0

@media screen and (min-width: 360px)
  .ni-article-body-container
    padding 1.125rem
  .ni-article-body
    pre
      margin-left -1.125rem
      margin-right -1.125rem

@media screen and (min-width: 414px)
  .ni-article-body-container
    padding 1.25rem
  .ni-article-body
    pre
      margin-left -1.25rem
      margin-right -1.25rem

@media screen and (min-width: 540px)
  .ni-article-body-container
    padding 1.5rem
  .ni-article-body
    pre
      margin-left -1.5rem
      margin-right -1.5rem

@media screen and (min-width: 768px)
  .ni-article-body-container
    padding 3rem 3rem 1.5rem
  .ni-article-body
    pre
      margin-left 0
      margin-right 0
    iframe
      &.iframe-video
        max-width 48rem
        max-height 27rem

  .ni-article-body h1,
  .ni-article-body h2,
  .ni-article-body h3,
  .ni-article-body h4,
  .ni-article-body h5,
  .ni-article-body h6
    margin 3rem 0 1.5rem
</style>
