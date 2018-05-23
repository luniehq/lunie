<template lang="pug">
page.page-community(
  title="Community"
  subtitle="These are the only official Cosmos communication channels.")

  part(title="Chat"): .community-cards
    card-social(
      dt="All Matrix Chats"
      dd="View +cosmos:matrix.org"
      icon-type="mi"
      icon="chat"
      anchor="https://riot.im/app/#/group/+cosmos:matrix.org")
    card-social(
      dt="Community Chat"
      dd="Join #cosmos:matrix.org"
      icon-type="mi"
      icon="chat"
      :anchor="links.cosmos.community.matrix")
    card-social(
      dt="Cosmos SDK Chat"
      dd="Join #cosmos-sdk:matrix.org"
      icon-type="mi"
      icon="chat"
      anchor="https://riot.im/app/#/room/#cosmos-sdk:matrix.org")
    card-social(
      dt="Cosmos Validator Chat"
      dd="Join #cosmos_validators:matrix.org"
      icon-type="mi"
      icon="chat"
      anchor="https://riot.im/app/#/room/#cosmos_validators:matrix.org")
    card-social(
      dt="Tendermint Chat"
      dd="Join #tendermint:matrix.org"
      icon-type="mi"
      icon="chat"
      anchor="https://riot.im/app/#/room/#tendermint:matrix.org")
    card-social(
      dt="Ethermint Chat"
      dd="Join #ethermint:matrix.org"
      icon-type="mi"
      icon="chat"
      anchor="https://riot.im/app/#/room/#ethermint:matrix.org")
    card-social(
      dt="Telegram"
      dd="Join cosmosproject on Telegram"
      icon="telegram"
      :anchor="links.cosmos.community.telegram")
  part(title="Forums"): .community-cards
    card-social(
      dt="Official Forum"
      dd="Discuss the Cosmos Network"
      icon="discourse"
      :anchor="links.cosmos.community.discourse")
    card-social(
      dt="Reddit"
      dd="Subscribe to /r/cosmosnetwork"
      icon="reddit"
      :anchor="links.cosmos.community.reddit")
  part(title="Social Media"): .community-cards
    card-social(
      dt="Twitter"
      dd="Follow @cosmos, our official account"
      icon="twitter"
      :anchor="links.cosmos.community.twitter")
    card-social(
      dt="Medium"
      dd="Read the latest on the Cosmos Blog"
      icon="medium"
      :anchor="links.cosmos.blog")
    card-social(
      dt="YouTube"
      dd="Watch videos on our official channel"
      icon="youtube"
      anchor="https://www.youtube.com/c/CosmosProject")
</template>

<script>
import { mapGetters } from "vuex"
import CardSocial from "cards/CardSocial"
import Page from "common/NiPage"
import Part from "common/NiPart"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-community",
  metaInfo: { title: "Community" },
  components: {
    CardSocial,
    Part,
    Page,
    TextContainer
  },
  computed: {
    ...mapGetters(["links"])
  }
}
</script>

<style lang="stylus">
@require '~variables'

@media screen and (min-width: 768px)
  .page-community .community-cards
    display flex
    flex-flow row wrap

    .ni-card-social
      flex 0 0 50%
</style>
