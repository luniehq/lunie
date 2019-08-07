<template>
  <div class="tm-modal-error__wrapper">
    <div class="tm-modal-error">
      <div class="tm-modal-error__icon">
        <i class="material-icons">{{ icon }}</i>
      </div>
      <div class="tm-modal-error__title">
        {{ title }}
      </div>
      <div class="tm-modal-error__body">
        {{ body }}
      </div>
      <div class="tm-modal-error__footer">
        <TmBtn
          id="tm-modal-error__btn-issue"
          :href="issueUrl"
          icon="bug_report"
          color="primary"
          value="Create an issue"
          type="anchor"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import TmBtn from "common/TmBtn"
export default {
  name: `tm-modal-error`,
  components: { TmBtn },
  props: {
    title: {
      default: `Voyager ran into an error`,
      type: String
    },
    body: {
      default: `Voyager has encountered a critical error that blocks the app from running. Please create an issue and include a copy of the app logs.`,
      type: String
    },
    icon: {
      default: `error_outline`,
      type: String
    }
  },
  data: () => ({
    logPath: ``,
    issueUrl: `https://github.com/cosmos/voyager/issues`
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`lastHeader`])
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
