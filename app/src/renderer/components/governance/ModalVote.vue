<template lang="pug">
  .modal-vote#modal-vote(v-click-outside="close")
    .modal-vote-header
      img.icon(class='modal-vote-atom' src="~assets/images/cosmos-logo.png")
      span.tm-modal-title Vote
      .tm-modal-icon.tm-modal-close#closeBtn(@click="close()")
        i.material-icons close

    div
      h2 Title: {{ proposalTitle }}
      h3 Proposal ID: {{ `#` + proposalId }}

    tm-form-group.modal-vote-form-group.options
      tm-btn#vote-yes(
        @click.native="voteYes"
        :class="[option ===  `yes` ? 'active' : '']"
        color="secondary"
        value="Yes"
        size="md")

      tm-btn#vote-no(
        @click.native="voteNo"
        :class="[option === `no` ? 'active' : '']"
        color="secondary"
        value="No"
        size="md")

      tm-btn#vote-veto(
        @click.native="voteVeto"
        :class="[option === `no_with_veto` ? 'active' : '']"
        color="secondary"
        value="No With Veto"
        size="md")

      tm-btn#vote-abstain(
        @click.native="voteAbstain"
        :class="[option === `abstain` ? 'active' : '']"
        color="secondary"
        value="Abstain"
        size="md")

    tm-form-group.modal-vote-form-group
    .modal-vote-footer
      tm-btn#cast-vote(
        @click.native="onVote"
        :disabled="$v.option.$invalid"
        color="primary"
        value="Vote"
        size="lg")
</template>

<script>
import ClickOutside from "vue-click-outside"
import { required } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"

const isValid = option =>
  option === `yes` ||
  option === `no` ||
  option === `no_with_veto` ||
  option === `abstain`

const checked = value => !!value

export default {
  name: `modal-vote`,
  props: [`proposalId`, `proposalTitle`],
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  data: () => ({
    option: ``,
    approve: false
  }),
  validations() {
    return {
      option: {
        required,
        isValid
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showModalVote`, false)
    },
    voteYes() {
      if (this.option === `yes`) {
        this.option = ``
      } else {
        this.option = `yes`
      }
    },
    voteNo() {
      if (this.option === `no`) {
        this.option = ``
      } else {
        this.option = `no`
      }
    },
    voteVeto() {
      if (this.option === `no_with_veto`) {
        this.option = ``
      } else {
        this.option = `no_with_veto`
      }
    },
    voteAbstain() {
      if (this.option === `abstain`) {
        this.option = ``
      } else {
        this.option = `abstain`
      }
    },
    onVote() {
      this.$emit(`castVote`, { option: this.option })
      this.close()
    }
  },
  directives: {
    ClickOutside
  }
}
</script>

<style lang="stylus">
@import '~variables'

.modal-vote
  background var(--app-nav)
  display flex
  flex-direction column
  height 50%
  justify-content space-between
  left 50%
  padding 2rem
  position fixed
  top 50%
  width 40%
  z-index z(modal)

  &-header
    align-items center
    display flex

  &-atom
    height 4rem
    width 4rem

  &-form-group
    display block
    padding 0

  &-footer
    display flex
    justify-content flex-end

  h3
    margin 0

  button
    margin 0
    min-width 50%

    span
      margin 0.25rem

    &.active
      span
        background var(--tertiary)

    .tm-btn__container
      padding 0.5rem
</style>
