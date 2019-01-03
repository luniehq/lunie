<template>
  <modal :close="close" class="tm-modal-send-confirmation">
    <div slot="title">Confirm Your Transaction</div>
    <p>
      Please confirm that you would like to send
      <b>{{ amount + " " + denom }}</b> to <b>{{ recipient }}</b
      >.
    </p>
    <p class="warning">This transaction cannot be undone.</p>
    <div slot="footer">
      <tm-btn
        id="send-cancel-btn"
        type="button"
        value="Cancel"
        @click.native="close"
      />
      <tm-btn
        id="send-confirmation-btn"
        :disabled="!connected"
        :value="connected ? 'Confirm' : 'Connecting...'"
        type="button"
        color="primary"
        @click.native="approve"
      />
    </div>
  </modal>
</template>

<script>
import TmListItem from "common/TmListItem"
import TmBtn from "common/TmBtn"
import Modal from "common/TmModal"
export default {
  name: `tm-modal-send-confirmation`,
  components: {
    TmBtn,
    TmListItem,
    Modal
  },
  props: {
    denom: {
      type: String,
      required: true
    },
    recipient: {
      type: String,
      required: true
    },
    amount: {
      type: [String, Number],
      required: true
    },
    connected: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    close() {
      this.$emit(`canceled`)
    },
    approve() {
      this.$emit(`approved`)
    }
  }
}
</script>
