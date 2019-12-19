<template>
  <div
    v-if="show"
    v-focus-last
    class="tm-modal-tutorial"
    tabindex="0"
    @keyup.esc="close()"
  >
    <main class="tm-modal-tutorial-main">
      <template v-for="(step, index) in steps">
        <template v-if="currentStep === index + 1">
          <h1 :key="index + step.title">{{ step.title }}</h1>
          <p :key="index + step.content" v-html="step.content"></p>
          <TmBtn
            :key="index + `btn`"
            v-focus
            value="Next"
            type="primary"
            @click.native="nextLink"
          />
        </template>
      </template>
    </main>
  </div>
</template>

<script>
import TmBtn from "src/components/common/TmBtn"

export default {
  name: `tm-modal-tutorial`,
  components: {
    TmBtn
  },
  props: {
    close: {
      type: Function,
      required: true
    },
    show: {
      type: Boolean,
      required: true
    }
  },
  data: function() {
    return {
      targetURL: "https://lunie.io",
      currentStep: 1,
      steps: [
        {
          title: "How to get tokens? I",
          content:
            "Praesent vitae tristique erat.<br />Integer ullamcorper ligula vel dolor sagittis nec fermentum risus pharetra.<br />Nulla mollis tempus sem, a sollicitudin est facilisis ac"
        },
        {
          title: "How to get tokens? II",
          content:
            "Praesent vitae tristique erat.<br />Integer ullamcorper ligula vel dolor sagittis nec fermentum risus pharetra.<br />Nulla mollis tempus sem, a sollicitudin est facilisis ac"
        },
        {
          title: "How to get tokens? III",
          content:
            "Praesent vitae tristique erat.<br />Integer ullamcorper ligula vel dolor sagittis nec fermentum risus pharetra.<br />Nulla mollis tempus sem, a sollicitudin est facilisis ac"
        }
      ]
    }
  },
  methods: {
    nextLink() {
      if (this.steps.length === this.currentStep) {
        window.open(this.targetURL, "_blank")
        this.close()
      } else {
        this.currentStep = this.currentStep + 1
      }
    }
  }
}
</script>

<style scoped>
.tm-modal-tutorial {
  position: fixed;
  bottom: 0;
  right: 1rem;
  z-index: var(--z-modal);
  width: 22rem;
  height: 28rem;
  background: var(--app-fg);
  display: flex;
  backdrop-filter: blur(0.5em);
}

.tm-modal-tutorial h1 {
  font-weight: 500;
  font-size: 1.6rem;
  color: var(--bright);
  margin-bottom: 1rem;
}

.tm-modal-tutorial b {
  font-weight: 500;
  color: var(--bright);
}

.tm-modal-tutorial-main {
  display: flex;
  flex-flow: column;
  padding: 1.5rem;
}

.tm-modal-tutorial .button {
  width: 100%;
  margin-top: 2rem;
}
</style>
