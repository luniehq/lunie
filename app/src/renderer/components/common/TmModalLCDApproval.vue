<template>
  <div class="tm-modal-lcd-approval__wrapper">
    <div class="tm-modal-lcd-approval">
      <div class="tm-modal-lcd-approval__icon">
        <i class="material-icons">sync problem</i>
      </div>
      <div class="tm-modal-lcd-approval__title">Node approval required</div>
      <div class="tm-modal-lcd-approval__body">
        Voyager needs to approve the node you're trying to connect to. Please
        compare the hash below against the hash from a trusted source. If you
        are 100% sure that the hashes match, click approve to proceed.<tm-field
          id="node-hash"
          :value="hash"
          type="textarea"
          disabled="disabled"
        />
      </div>
      <div class="tm-modal-lcd-approval__footer">
        <tm-btn
          id="tm-modal-lcd-approval__btn-approve"
          size="lg"
          icon="check"
          color="primary"
          value="Approve Node"
          @click.native="approve"
        />
        <tm-btn
          id="tm-modal-lcd-approval__btn-disapprove"
          size="lg"
          icon="skip_next"
          value="Switch Node"
          @click.native="newNode"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TmBtn from "common/TmBtn"
import TmField from "common/TmField"
export default {
  name: `modal-lcd-approval`,
  components: {
    TmBtn,
    TmField
  },
  props: {
    hash: {
      type: String,
      required: true
    }
  },
  computed: {},
  methods: {
    approve() {
      this.$store.dispatch(`approveNodeHash`, this.hash)
    },
    newNode() {
      this.$store.dispatch(`disapproveNodeHash`, this.hash)
    }
  }
}
</script>

<style>
.tm-modal-lcd-approval {
  padding: 1.5rem;
  max-width: 40rem;
}

.tm-modal-lcd-approval__wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: var(--z-modalError);
  background: var(--app-bg);
  width: 100vw;
  height: 100vh;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tm-modal-lcd-approval__icon {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-below);
}

.tm-modal-lcd-approval__icon i.material-icons {
  font-size: 50vw;
  line-height: 1;
  color: var(--bc-dim);
}

.tm-modal-lcd-approval__title {
  font-size: var(--h1);
  font-weight: 500;
  line-height: 1;
  margin-bottom: 1.5rem;
}

.tm-modal-lcd-approval__body {
  font-size: var(--lg);
  color: var(--dim);
  margin-bottom: 2.5rem;
}

.tm-modal-lcd-approval__footer {
  flex-direction: row;
  justify-content: flex-start;
}

.tm-modal-lcd-approval__footer .tm-btn {
  width: 100%;
  margin-right: 1.5rem;
  margin-bottom: 1rem;
  max-width: 14rem;
}

.tm-modal-lcd-approval__footer .tm-btn:last-child {
  margin-bottom: 0;
}

.tm-modal-lcd-approval #node-hash {
  margin-top: 3rem;
}
</style>
