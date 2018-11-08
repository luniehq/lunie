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
        :disabled="option != `yes` && option != ``"
        color="secondary"
        value="Yes"
        size="md")

      tm-btn#vote-no(
        @click.native="voteNo"
        :disabled="option != `no` && option != ``"
        color="secondary"
        value="No"
        size="md")

      tm-btn#vote-veto(
        @click.native="voteVeto"
        :disabled="option != `no_with_veto` && option != ``"
        color="secondary"
        value="No With Veto"
        size="md")

      tm-btn#vote-abstain(
        @click.native="voteAbstain"
        :disabled="option != `abstain` && option != ``"
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
      tm-btn#cast-vote(
        @click.native="onVote"
        :disabled="$v.option.$invalid || $v.approve.$invalid"
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
        checked
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

  &-footer
    display flex
    justify-content flex-end

    button
      margin-left 1rem
</style>
