<template lang='pug'>
.ti-votes(:class="cssClass" @click='vote')
  .btn-vote.btn-vote-yea: i.material-icons expand_less
  .value {{ votes }}
</template>

<script>
import { mapGetters } from "vuex"
// import {countVotes} from '../../scripts/votes'
export default {
  name: "ti-votes",
  computed: {
    ...mapGetters(["user"]),
    votes() {
      // return countVotes(this.parent.votes)
      return 0
    },
    userVoted() {
      return this.parent.votes ? !!this.parent.votes[this.user.uid] : false
    },
    cssClass() {
      let value = ""
      if (this.orientation === "hz") {
        value = "ti-votes-hz"
      } else {
        value = "ti-votes-vt"
      }
      if (this.userVoted) {
        value += " ti-votes-voted"
      }
      return value
    }
  },
  methods: {
    vote() {
      this.$store
        .dispatch(this.resource + "Vote", {
          [this.resource]: this.parent,
          rootId: this.parent.rootId, // for comments
          userUid: this.user.uid
        })
        .then(null, error => {
          this.$store.commit("notifyError", {
            title: "Updating vote failed",
            body: error.message
          })
        })
    }
  },
  props: ["parent", "resource", "orientation"]
}
</script>

<style lang='stylus'>
@require '~variables'

.ti-votes
  position relative
  display flex
  cursor pointer

  &.ti-votes-vt
    width 3rem
    height 5rem
    flex-flow column
    align-items center
    justify-content center

    .btn-vote
      display flex
      align-items center
      justify-content center
      width 1rem
      height 1rem
      background app-fg
      margin-bottom 0.25rem

      i.material-icons
        font-size lg

    .value
      text-align center
      font-weight 500
      min-width 1.75rem

  &.ti-votes-hz
    flex-flow row
    width 3rem
    height 1.5rem
    align-items center
    justify-content center

    .btn-vote
      height 1.5rem
      display flex
      align-items center
      justify-content center
      width 1.5rem
      color link

    .value
      width 1.5rem
      text-align center
      font-size sm
      font-weight bold

  &.ti-votes-voted
    .btn-vote, .value
      color mc

  &:not(.ti-votes-voted):hover
    .btn-vote
      background mc
      color app-bg
</style>
