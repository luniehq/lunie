<template lang="pug">
.section-home: .section-home__container
  .section-home__header
    .section-home__title {{ communityTitle }}
    .section-home__subtitle {{ communitySubtitle }}
  .community__row
    part(:title="communityUrlsTitle"): .community-cards
      card-community(v-for="i in communityUrls"
        :key="i.title"
        :dt="i.title"
        :icon="i.icon"
        :anchor="i.href")
    part(:title="socialMediaUrlsTitle"): .community-cards
      card-community(v-for="i in socialMediaUrls"
        :key="i.title"
        :dt="i.title"
        :icon="i.icon"
        :anchor="i.href")
</template>

<script>
import {mapGetters} from 'vuex'
import Cards from 'common/NiCards'
import CardCommunity from 'cards/CardCommunity'
import Part from 'common/NiPart'
export default {
  name: 'community',
  components: {
    Cards,
    CardCommunity,
    Part
  },
  computed: {
    ...mapGetters(['text', 'cosmos']),
    communitySubtitle () {
      return `${this.text.zoneName} is a zone on the Cosmos Network. Learn more about the Cosmos community and get involved in development.`
    },
    communityUrls () {
      return [
        { title: 'Telegram', href: this.cosmos.community.telegram, icon: 'telegram' },
        { title: 'Matrix', href: this.cosmos.community.matrix, icon: 'comments-o' }
      ]
    },
    socialMediaUrls () {
      return [
        { title: 'Twitter', href: this.cosmos.community.twitter, icon: 'twatter' },
        { title: 'Reddit', href: this.cosmos.community.reddit, icon: 'raddit' }
      ]
    }
  },
  data: () => ({
    communityTitle: 'Join the Cosmos Network',
    communityUrlsTitle: 'Discuss & Chat',
    socialMediaUrlsTitle: 'Social Media'
  })
}
</script>

<style lang="stylus">
@require '~variables'

.community__row
  margin 0 0 0.25rem

.community__row-actions
  .ni-part-main
    padding 1rem
    background app-fg
    margin-top 0.25rem

    .ni-btn:only-child
      width 100%
      max-width 20rem

    .form-email-signup
      max-width 20rem
      margin 0

@media screen and (min-width: 768px)
  .community__row
    margin-left 1rem
    margin-right 1rem

    display flex
    flex-flow row nowrap

    .ni-part:first-child
      margin-right 2px
    .ni-part:last-child
      margin-left 2px

    .ni-part
      flex 1
</style>
