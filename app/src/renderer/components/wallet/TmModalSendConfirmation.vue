<template>
  <modal class="tm-modal-send-confirmation" :close="close">
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
        @click.native="close"
        value="Cancel"
      ></tm-btn>
      <tm-btn
        id="send-confirmation-btn"
        type="button"
        color="primary"
        @click.native="approve"
        value="Confirm"
      ></tm-btn>
    </div>
  </modal>
</template>

<script>
import { TmBtn, TmListItem } from "@tendermint/ui"
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
