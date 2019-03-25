<template>
  <div v-if="session.cookiesAccepted !== true" class="cookieBar">
    <p>
      We use cookies and remote error collection to give you the best
      experience and to help improve our website. Please read our
      <a href="/tos">Terms of Service</a>
      for more information. By clicking “Accept Cookies”, you agree to
      the storing of cookies on your device to
      enhance site navigation and analyze site usage. If you select
      "Error Collection" you also allow for collection of errors.
    </p>
    <div class="cb-settings">
      <span class="cb-options">
        <div class="checkbox">
          <input
            id="cb-1"
            name="neccesary"
            type="checkbox"
            disabled="disabled"
            checked=""
          >
          <label for="cb-1">Necessary</label>
        </div>
        <div class="checkbox">
          <input
            id="cb-2"
            v-model="analytics"
            name="analytics"
            type="checkbox"
            checked=""
          >
          <label for="cb-2">Analytics</label>
        </div>
        <div class="checkbox">
          <input
            id="cb-3"
            v-model="errorCollection"
            name="error"
            type="checkbox"
            checked=""
          >
          <label for="cb-3">Error Collection</label>
        </div>
        <a href="/cookies">Details</a>
      </span>
      <tm-btn
        id="cb-button-accept"
        class="cb-button accept"
        value="Accept Cookies"
        @click.native="accept"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TmBtn from "common/TmBtn"
export default {
  name: `cookie-bar`,
  components: {
    TmBtn
  },
  data: () => ({
    analytics: false,
    errorCollection: false
  }),
  computed: {
    ...mapGetters([`session`])
  },
  methods: {
    accept() {
      if (this.analytics) {
        this.$store.dispatch(`setAnalyticsCollection`, true)
      }
      if (this.errorCollection) {
        this.$store.dispatch(`setErrorCollection`, true)
      }
      this.$store.dispatch(`storeLocalPreferences`)
    }
  }
}
</script>

<style scoped>
.cookieBar {
  position: fixed;
  width: 100%;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  border: 0;
  justify-content: center;
  background-color: var(--app-fg);
  animation-duration: 0.3s;
  animation-name: float-down;
  animation-timing-function: ease-in-out;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  padding: 0.5em 0;
  box-sizing: border-box;
}

@media only screen and (max-width: 736px) {
  .cookieBar > p {
    max-width: 100%;
    font-size: 0.9em;
    margin: 0 auto;
    text-align: center;
  }
}

@media only screen and (max-width: 736px) {
  .cb-settings {
    flex-wrap: wrap;
    flex-direction: column;
  }
}

.cb-settings {
  display: flex;
  flex-wrap: nowrap;
}

@media only screen and (max-width: 736px) {
  .cb-options {
    padding: 1em 0;
    margin: 0 1em;
  }
}

.cb-options {
  -ms-flex: 1;
  flex: 1;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: nowrap;
  flex-wrap: nowrap;
  border-radius: 3px;
  padding: 0.6em;
  background: #fff;
  font-size: 1.3em;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: center;
  justify-content: center;
  -ms-flex-line-pack: center;
}

.cb-options,
.demo {
  align-content: center;
  color: black;
  font-size: 0.9rem;
}

.checkbox {
  position: relative;
  margin: 4px 8px;
}

.checkbox,
form p,
.cookieBar > p {
  text-align: left;
}

.cookieBar > p {
  color: #fff;
  padding: 1em;
  font-size: 0.9em;
  line-height: 1.3;
  max-width: 470px;
  flex: 1 1 auto;
  margin: 0 auto;
}

.checkbox input[type="checkbox"] {
  outline: 0;
  margin-right: 0.5em;
  visibility: hidden;
}

.accordion .title,
.button,
.buttonExit,
.cb-button,
.checkbox label,
.menu > a,
.radio label {
  cursor: pointer;
}

.checkbox label::before {
  width: 18px;
  height: 18px;
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.54);
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.3s;
}

.checkbox label::after,
.checkbox label::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
}

.checkbox input[type="checkbox"]:disabled + label::before {
  border-color: rgba(0, 0, 0, 0.26);
}

.checkbox input[type="checkbox"]:checked + label::before {
  background: #02ae60;
  border: none;
}

.checkbox input[type="checkbox"]:disabled:checked + label::before {
  background: rgba(0, 0, 0, 0.26);
}

.checkbox input[type="checkbox"]:checked + label::after {
  transform: rotate(-45deg);
  top: 4.7px;
  left: 4px;
  width: 10px;
  height: 5px;
  border: 2px solid #fff;
  border-top-style: none;
  border-right-style: none;
}

.cb-options > a {
  margin: 0 1em 0 2em;
  line-height: 1;
}

.cb-button {
  color: #fff;
  padding: 0.5em 1em;
  text-align: center;
  white-space: nowrap;
  -moz-appearance: none;
  appearance: none;
  border-radius: 4px;
  box-shadow: none;
  display: block;
  border: none;
  height: auto;
  margin: 0;
  font-size: 1.3em;
  line-height: 1;
}

@media only screen and (max-width: 736px) {
  .cb-button {
    width: 100%;
    padding: 0.7em;
  }
}
</style>
