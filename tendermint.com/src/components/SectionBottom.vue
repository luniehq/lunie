<template lang="pug">
.section-bottom-container
  section-cosmos
  section.section-bottom
    h2 Get Started
    btn#download-button(type='link', to='/download', size='lg', icon='cloud_download' value='Download')
  section.section-bottom
    h2 Get Newsletter
    form-email-signup
</template>

<script>
import SectionCosmos from "./SectionCosmos"
import FormEmailSignup from "./FormEmailSignup"
import Btn from "@nylira/vue-button"
export default {
  name: "section-bottom",
  components: {
    Btn,
    FormEmailSignup,
    SectionCosmos
  }
}
</script>

<style lang="stylus">
@require '~variables'

.section-bottom
  padding 2rem 1rem
  border-bottom 1px solid var(--bc)
  display flex
  flex-flow column
  justify-content center
  h2
    color var(--bright)
    font-weight 500
    font-size 1.25rem
    text-align center
    line-height 1
    margin-bottom 1.5rem

  #download-button, form
    margin 0 auto
    width 100%
    max-width 18rem

@media screen and (min-width: 768px)
  .section-bottom-container
    display flex
    flex-flow row wrap
    .section-cosmos
      width 100%
    .section-bottom
      padding-top 3rem
      padding-bottom 3rem
      flex 1

@media screen and (min-width: 1024px)
  .section-bottom-container
    .section-bottom
      h2
        font-size 1.5rem
        margin-bottom 2rem
    .section-bottom:last-of-type
      border-left 1px solid var(--bc)

@media screen and (min-width: 1200px)
  .section-bottom-container
    .section-bottom
      padding-top 4rem
      padding-bottom 4rem
</style>
