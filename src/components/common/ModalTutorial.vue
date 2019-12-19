<template>
  <div v-focus-last class="modal-tutorial" tabindex="0" @keyup.esc="close()">
    <main class="modal-tutorial-main">
      <div class="modal-tutorial-header">
        <a href="#" @click="prevLink">
          <i class="material-icons chevron_left"></i>
        </a>
        <a href="#" @click="nextLink">
          <i class="material-icons chevron_right"></i>
        </a>
        <a href="#" @click="close">
          <i class="material-icons close"></i>
        </a>
        <div class="top-bg"></div>
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
            <h1 :key="`title-${index}`">{{ step.title }}</h1>
            <p :key="`content-${index}`">
              <span
                v-for="(item, contentIndex) in step.content"
                :key="`content-item-${index}-${contentIndex}`"
                class="content-item"
              >
                {{ item }}
              </span>
            </p>
            <button
              :key="`btn-${index}`"
              class="button primary"
              @click="nextLink"
            >
              {{
                currentStep === steps.length
                  ? `Read the full guide`
                  : `Next step`
              }}
              <i class="material-icons arrow_forward"></i>
            </button>
          </template>
        </template>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: `modal-tutorial`,
  props: {
    close: {
      type: Function,
      required: true
    },
    fullguide: {
      type: String,
      required: true
    },
    steps: {
      type: Array,
      required: true
    }
  },
  data: function() {
    return {
      currentStep: 1
    }
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
    }
  }
}
</script>

<style scoped>
.modal-tutorial {
  position: fixed;
  bottom: 0;
  right: 1rem;
  z-index: var(--z-modal);
  width: 24rem;
  height: 38rem;
  display: flex;
  outline: none;
}

.modal-tutorial-main {
  display: flex;
  flex-flow: column;
  padding: 0 0 1.5rem 0;
}

.modal-tutorial h1 {
  font-size: 1.6rem;
  color: #000f50;
  margin-bottom: 2rem;
  font-weight: 400;
}

.modal-tutorial b {
  font-weight: 500;
  color: var(--bright);
}

.modal-tutorial .button {
  width: 100%;
  margin-top: 1rem;
}

.modal-tutorial-header i {
  color: #7a88b8;
  background: #e4e7f1;
  width: 2rem;
  height: 2rem;
  font-size: var(--m);
  display: inline-block;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  padding: 0.5rem;
  margin-right: 1rem;
  border-radius: 50%;
}

.modal-tutorial-header i.close {
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
}

.modal-tutorial .top-bg {
  margin-top: 1rem;
  background-image: url("/img/tutorials/bg1.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  width: 100%;
  height: 186px;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.modal-tutorial .content {
  padding: 2rem;
  background-color: white;
  color: #445381;
}

.button {
  font-family: var(--sans);
  font-size: 1.1rem;
  font-weight: 500;
  padding: 1.2rem;
  min-width: 100px;
  color: #445381;
  margin: 0;
  border-radius: 0.4rem;
  cursor: pointer;
  background: #f1f3f7;
  border: 2px solid #f1f3f7;
  transition: all 0.5s ease;
  white-space: nowrap;
  outline: none;
  text-align: left;
  position: relative;
}

.button:hover {
  background: #445381;
  color: #f1f3f7;
  border-color: #445381;
}

.button i.arrow_forward {
  position: absolute;
  top: 1rem;
  right: 1rem;
  margin: 0;
}

.modal-tutorial .steps-container {
  position: absolute;
  top: 0;
  right: 0;
}

.modal-tutorial .steps .step {
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 50%;
  margin-left: 2rem;
  background-color: #f1f3f7;
  display: inline-block;
}

.modal-tutorial .steps .step.completed {
  background-color: #458dff;
}

.steps {
  position: relative;
  color: #458dff;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.content-item {
  display: block;
}
</style>
