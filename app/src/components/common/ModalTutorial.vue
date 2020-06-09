<template>
  <div v-focus-last class="modal-tutorial" tabindex="0" @keyup.esc="close()">
    <main class="modal-tutorial-main">
      <div class="modal-tutorial-header">
        <div class="modal-tutorial-button-container">
          <div>
            <a href="#" @click.prevent="prevLink">
              <i class="material-icons notranslate chevron_left"></i>
            </a>
            <a href="#" @click.prevent="nextLink">
              <i class="material-icons notranslate chevron_right"></i>
            </a>
          </div>
          <a href="#" @click.prevent="close">
            <i class="material-icons notranslate close"></i>
          </a>
        </div>
        <div class="top-bg" :class="background"></div>
      </div>
      <div class="content">
        <div class="steps">
          <span class="current-step">STEP {{ currentStep }}</span>
          <div class="steps-container">
            <span
              v-for="(item, index) in steps.length"
              :key="`step-${index}`"
              :class="{ step: true, completed: index < currentStep }"
            >
            </span>
          </div>
        </div>
        <template v-for="(step, index) in steps">
          <template v-if="currentStep === index + 1">
            <h2 :key="`title-${index}`">{{ step.title }}</h2>
            <p :key="`content-${index}`">
              <span
                v-for="(item, contentIndex) in step.content"
                :key="`content-item-${index}-${contentIndex}`"
                class="content-item"
              >
                {{ item }}
              </span>
              <span
                v-for="(item, affiliateIndex) in step.affiliate"
                :key="`affiliate-item-${index}-${affiliateIndex}`"
                class="affiliate-link"
              >
                <span
                  >{{ item.text }}
                  <a
                    :href="item.link"
                    :onclick="item.onClickFunction(item.onClickParam)"
                  >
                    {{ item.linkText }}</a
                  >
                </span>
              </span>
            </p>
            <button
              :key="`btn-${index}`"
              class="button primary"
              @click="nextLink"
            >
              {{ finalStep ? `Read the full guide` : `Next step` }}
              <i
                class="material-icons notranslate arrow_forward"
                :class="finalStep ? `final-step` : ``"
              ></i>
            </button>
          </template>
        </template>
      </div>
    </main>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
export default {
  name: `modal-tutorial`,
  props: {
    close: {
      type: Function,
      required: true,
    },
    fullguide: {
      type: String,
      required: true,
    },
    steps: {
      type: Array,
      required: true,
    },
    // Possible values: red, green, yellow, blue and lightblue
    background: {
      type: String,
      required: true,
    },
  },
  data: function () {
    return {
      currentStep: 1,
    }
  },
  computed: {
    ...mapGetters([`address`, `network`]),
    finalStep() {
      return this.currentStep === this.steps.length
    },
  },
  methods: {
    nextLink() {
      if (this.currentStep === this.steps.length) {
        window.open(this.fullguide, "_blank")
      } else {
        this.currentStep++
      }
    },
    prevLink() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
  },
}
</script>

<style scoped>
.button {
  font-size: 13px;
  font-weight: 500;
  padding: 16px;
  background-color: rgba(122, 136, 184, 0.1);
  color: var(--faded-blue);
  margin: 0;
  border-radius: 4px;
  cursor: pointer;
  border: 0;
  transition: all 0.5s ease;
  white-space: nowrap;
  outline: none;
  text-align: left;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.button:hover {
  background-color: rgba(122, 136, 184, 0.25);
}

.button i.arrow_forward {
  font-size: 1rem;
}

.modal-tutorial {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: var(--z-modal);
  max-width: 295px;
  display: flex;
  outline: none;
  font-family: var(--sans);
}

.modal-tutorial-main {
  display: flex;
  flex-flow: column;
  padding: 0;
}

.modal-tutorial p {
  line-height: 24px;
  font-size: 12px;
  color: var(--dark-grey-blue);
  opacity: 0.7;
  margin-bottom: 18px;
}

.modal-tutorial h2 {
  font-size: 16px;
  font-weight: normal;
  color: var(--dark-grey-blue);
  margin-bottom: 18px;
}

.modal-tutorial b {
  font-weight: 500;
  color: var(--bright);
}

.modal-tutorial .button {
  width: 100%;
  margin-top: 20px;
}

.modal-tutorial-button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-tutorial-header a:first-child {
  margin-right: 0.5rem;
}

.modal-tutorial-header i {
  background: rgba(122, 136, 184, 0.2);
  width: 2rem;
  height: 2rem;
  display: inline-block;
  padding: 0.5rem;
  border-radius: 50%;
  color: var(--faded-blue);
  font-size: var(--m);
}

.modal-tutorial-header a:hover i {
  background: rgba(122, 136, 184, 0.3);
}

.modal-tutorial .top-bg {
  margin-top: 0.6rem;
  background-image: url("/img/tutorials/bg-red.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  width: 100%;
  height: 146px;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.modal-tutorial .top-bg.yellow {
  background-image: url("/img/tutorials/bg-yellow.png");
}

.modal-tutorial .top-bg.green {
  background-image: url("/img/tutorials/bg-green.png");
}

.modal-tutorial .top-bg.blue {
  background-image: url("/img/tutorials/bg-blue.png");
}

.modal-tutorial .top-bg.lightblue {
  background-image: url("/img/tutorials/bg-lightblue.png");
}

.modal-tutorial .top-bg.red {
  background-image: url("/img/tutorials/bg-red.png");
}

.modal-tutorial .content {
  padding: 20px;
  background-color: white;
  color: var(--faded-blue);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.modal-tutorial .steps-container {
  position: absolute;
  top: 0;
  right: 0;
}

.modal-tutorial .steps .step {
  height: 6px;
  width: 6px;
  border-radius: 50%;
  margin-left: 1rem;
  background-color: #f1f3f7;
  display: inline-block;
}

.modal-tutorial .steps .step.completed {
  background-color: var(--sky-blue);
}

.steps {
  position: relative;
  color: var(--sky-blue);
  font-weight: 500;
  margin-bottom: 18px;
  font-size: 10px;
}

.content p {
  min-height: 96px;
}

.content-item {
  display: block;
  font-size: 12px;
}

.affiliate-link {
  display: block;
  margin-top: 12px;
}

.final-step {
  transform: rotate(-45deg);
}
</style>
