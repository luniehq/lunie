<template lang="pug">
page(title="HackAtom" subtitle="Alert: HackAtom is currently on hiatus as we focus all of our efforts on the launch of Cosmos Hub.")
  div(slot="menu"): btn(href='https://blog.cosmos.network/announcement-hackatom-2-winners-d31fe584b70b', target='_blank' icon="stars" value="HackAtom #2 Winners")

  // menu-locale

  text-container
    h2 What's HackAtom?
    ul
      li $50k to be won
      li Particpate for anywhere
      li Aug 5 - Sept 14, 2017

    p HackAtom is seeking individuals and teams worldwide for a $50k open-source hackathon from August 5 – September 14, 2017. Participants will turn innovative ideas into working applications, with rewards from the Cosmos community.
    p HackAtom is four weeks long. You'll build a real product while the crypto and blockchain communities watch and cast their vote on the project that captures their imagination. Tell the story behind your innovative idea, turn it into a working product, get other members to join, and build something cool.

    h2 Prizes
    p There is $50,000 USD worth of ETH to be won. The prizes for the best open source apps are as follows:
    .prizes
      .prize.grand
        i.material-icons monetization_on
        .key Grand Prize
        .value $20k worth of ETH
      .prize.second
        i.material-icons monetization_on
        .key 2nd Place
        .value $10k worth of ETH
      .prize.third
        i.material-icons monetization_on
        .key 3rd Place
        .value $6k worth of ETH
      .prize.fourth
        i.material-icons monetization_on
        .key 4th Place
        .value $4k worth of ETH
    p Five prizes of $2,000 worth of ETH will also be awarded to recognize the hardworking volunteers who help us during HackAtom.

    h2 Participate
    p To participate in the hackathon, all you need to do is:
    .participation-steps
      .step
        .key 1
        .value
          a(@click='setModal(true)') Sign up
      .step
        .key 2
        .value Build your open source app
      .step
        .key 3
        .value Submit by September 14 at 10:00 AM PDT

    h2 Meetup with Cosmonauts
    p We're having HackAtom meetups around the world. If you're located nearby—please do come join us! Meet us to get free tips and support while building your app.
    card-location

    h2 Judging
    p We’re looking for a high level of professionalism and quality, and have invited experienced hackers and entrepreneurs to influence the competition right from the start. You’ll be rewarded by the judges and the community. Your project will be judged by members of the Interchain Foundation.

    h2 Sign Up
    p Enter your details in the form to participate in Cosmos HackAtom. You’ll receive further instructions on how to compete.
    btn(@click.native='setModal(true)', size='lg', icon='done', value='Sign Up for HackAtom')
    p For inquiries about hackathon, please talk to us on #[a(:href="'mailto:' + links.cosmos.community.matrix") Developer Chat].
  modal-agreement(v-if='hackatom.modal')
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
import MenuLocale from "navigation/MenuLocale"
import CardLocation from "cards/CardLocation"
import ModalAgreement from "modals/ModalAgreement"
import Page from "common/NiPage"
import Part from "common/NiPart"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-hackatom",
  metaInfo: { title: "HackAtom - Developers" },
  components: {
    Btn,
    MenuLocale,
    CardLocation,
    ModalAgreement,
    Page,
    Part,
    TextContainer
  },
  computed: {
    ...mapGetters(["allPeople", "hackatom", "links"])
  },
  methods: {
    ppl(tag) {
      return this.allPeople.filter(p => p.groups[tag])
    },
    setModal(value) {
      this.$store.commit("setHackAtomModal", value)
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.prizes
  display flex
  flex-flow row wrap
  margin-bottom 0.5rem
  .prize
    flex 1
    min-width 9rem
    height 10rem
    background app-fg
    margin 0 0 1rem

    display flex
    flex-flow column nowrap
    align-items center
    justify-content center
    &:last-of-type
      margin-right 0

    i.material-icons
      margin-bottom 0.5rem
      width 4rem
      height 4rem
      border-radius 2rem
      display flex
      align-items center
      justify-content center
      font-size h1

      background app-bg

    .key
      color bright

    .value
      font-size h6
      color dim

    &.grand i.material-icons
      background url('~images/hackatom/atom-avatar.png') center center no-repeat
      background-size cover
      color transparent
      box-shadow inset bc 0 0 0 1px
    &.second i.material-icons
      color hsl(51,100%,50%)
    &.third i.material-icons
      color hsl(0,0%,75%)
    &.fourth i.material-icons
      color hsl(30,75.6%,60.4)

.participation-steps
  margin-bottom 1.5rem
  .step
    display flex
    align-items center
    margin-bottom 1rem
    .key, .value
      padding 0.75rem 1rem
      background app-fg
    .key
      width 3rem
      font-size h3
      line-height 1.5rem
      margin-right 1rem
      text-align center
    .value
      flex 1

@media screen and (min-width:768px)
  .prizes .prize
    margin 0 1rem 1rem 0
</style>
