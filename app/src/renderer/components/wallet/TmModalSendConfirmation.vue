<template lang="pug">
modal.tm-modal-send-confirmation(:close="close")
  div(slot='title') Confirm Your Transaction
  p Please confirm that you would like to send <b>{{ amount + ' ' + denom}}</b> to <b>{{ recipient }}</b>.
  p.warning This transaction cannot be undone.

  div(slot='footer')
    tm-btn(
          id="send-cancel-btn"
          type='button'
          @click.native="close"
          value='Cancel')
    tm-btn(
          id="send-confirmation-btn"
          type='button'
          color="primary"
          @click.native="approve"
          value='Confirm')
</template>

<script>
import { TmBtn, TmListItem } from "@tendermint/ui"
import Modal from "common/TmModal"
export default {
  name: "tm-modal-send-confirmation",
  props: ["amount", "denom", "recipient"],
  components: {
    TmBtn,
    TmListItem,
    Modal
  },
  methods: {
    close() {
      this.$emit("canceled")
    },
    approve() {
      this.$emit("approved")
    }
  }
}
</script>
