<template>
  <div class="tm-modal-error__wrapper">
    <div class="tm-modal-error">
      <div class="tm-modal-error__icon">
        <i class="material-icons">sync_problem</i>
      </div>
      <div class="tm-modal-error__title">Node has halted</div>
      <div class="tm-modal-error__body">
        The node your are connected to appears to have halted. You can try to
        connect to another node or switch to a demo connection so you can try
        out Voyager.
      </div>
      <div class="tm-modal-error__footer">
        <tm-btn
          id="tm-modal-error__btn-retry"
          size="lg"
          icon="autorenew"
          color="primary"
          value="Switch Node"
          @click.native="switchNode"
        />
        <tm-btn
          id="tm-modal-error__btn-mock"
          size="lg"
          icon="pageview"
          value="Try Demo"
          @click.native="useMock"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron"
import { TmBtn } from "@tendermint/ui"
export default {
  name: `modal-node-halted`,
  components: { TmBtn },
  methods: {
    switchNode() {
      ipcRenderer.send(`reconnect`)
      this.$store.commit(`setModalNodeHalted`, false)
    },
    useMock() {
      this.$store.dispatch(`setMockedConnector`, true)
      this.$store.commit(`setModalNodeHalted`, false)
    }
  }
}
</script>

<style>
.tm-modal-error__wrapper {
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

.tm-modal-error {
  padding: 1.5rem;
  max-width: 40rem;
}

.tm-modal-error__icon {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-below);
}

.tm-modal-error__icon i.material-icons {
  font-size: 50vw;
  line-height: 1;
  color: var(--bc-dim);
}

.tm-modal-error__title {
  font-size: var(--h1);
  font-weight: 500;
  line-height: 1;
  margin-bottom: 1.5rem;
}

.tm-modal-error__body {
  font-size: var(--lg);
  color: var(--dim);
  margin-bottom: 3rem;
}

.tm-modal-error__footer .tm-btn {
  width: 100%;
  margin-right: 1.5rem;
  margin-bottom: 1rem;
  max-width: 14rem;
}

.tm-modal-error__footer .tm-btn:last-child {
  margin-bottom: 0;
}
</style>
