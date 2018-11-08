<template lang="pug">
  .modal-vote#modal-vote(v-click-outside="close")
    .modal-vote-header
      img.icon(class='modal-vote-atom' src="~assets/images/cosmos-logo.png")
      span.tm-modal-title Cast Vote
      .tm-modal-icon.tm-modal-close#closeBtn(@click="close()")
        i.material-icons close

    tm-form-group.modal-vote-form-group.options
      tm-btn#vote-yes(
        @click.native="voteYes"
        color="secondary"
        value="Yes"
        size="md")

      tm-btn#vote-no(
        @click.native="voteNo"
        color="secondary"
        value="No"
        size="md")

      tm-btn#vote-veto(
        @click.native="voteVeto"
        color="secondary"
        value="No With Veto"
        size="md")

      tm-btn#vote-abstain(
        @click.native="voteAbstain"
        color="secondary"
        value="Abstain"
        size="md")

    tm-form-group.modal-vote-form-group(
      field-id='checkbox'
    )

      tm-field#checkbox(
        type="checkbox"
        v-model="approve"
        )

    tm-form-group.modal-vote-form-group
    .modal-vote-footer
      tm-btn(
        @click.native="onVote"
        :disabled="$v.option.$invalid"
        color="primary"
        value="Vote"
        size="lg")
</template>

<script>
import { mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import { required, helpers } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"

const isValid = option =>
  option === `Yes` ||
  option === `No` ||
  option === `No With Veto` ||
  option === `Abstain`

const checked = value => !!value

export default {
  name: `modal-vote`,
  props: [`proposalId`],
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
      },
      approve: {
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
      this.option = `yes`
    },
    voteNo() {
      this.option = `no`
    },
    voteVeto() {
      this.option = `no_with_veto`
    },
    voteAbstain() {
      this.option = `abstain`
    },
    onVote() {
      if (this.approve) {
        this.$emit(`submitVote`, {
          proposal_id: this.proposalId,
          option: this.option
        })
        this.close()
      }
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

  &-form-group
    display block
    padding 0

    .options

  &-footer
    display flex
    justify-content flex-end

    button
      margin-left 1rem
</style>
