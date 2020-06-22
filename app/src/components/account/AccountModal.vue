<template>
  <transition name="component-fade" mode="out-in">
    <div
      v-focus-last
      class="session-frame"
      tabindex="0"
      @keyup.esc="close()"
      @click.self="close()"
    >
      <div class="session-outer-container">
        <div class="session">
          <div class="session-header">
            <a @click="close()">
              <i class="material-icons notranslate circle back">arrow_back</i>
            </a>
            <div v-if="!isExtension" class="session-close">
              <a @click="close()">
                <i class="material-icons notranslate circle back">close</i>
              </a>
            </div>
          </div>
          <slot>
            <h1 class="session-title">Feature Not Available</h1>
            <p>(But coming soon)</p>
            <!-- common form for account modals -->
            <!-- TODO: hide for now -->
            <TmFormGroup
              class="account-modal-form-group"
              field-id="password"
              style="display: none;"
            >
              <TmField
                id="password"
                v-model="password"
                type="password"
                placeholder="Password"
              />
              <div class="account-modal-buttons">
                <TmBtn
                  value="Dismiss"
                  type="secondary"
                  @click.native="close"
                  @click.enter.native="close"
                />
                <TmBtn
                  value="Reveal"
                  type="primary"
                  @click.native="revealSeedPhrase"
                  @click.enter.native="revealSeedPhrase"
                />
              </div>
            </TmFormGroup>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"
import TmBtn from "common/TmBtn"
import config from "src/../config"
import { mapGetters } from "vuex"
export default {
  name: `account-modal`,
  components: {
    TmFormGroup,
    TmField,
    TmBtn,
  },
  data: () => {
    return {
      password: "",
      isExtension: config.isExtension,
    }
  },
  computed: {
    ...mapGetters([`networkSlug`]),
  },
  methods: {
    close() {
      this.$router.push({
        name: "portfolio",
        params: {
          networkId: this.networkSlug,
        },
      })
    },
  },
}
</script>
<style>
@import "../../styles/session.css";

.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.2s ease;
}

.component-fade-enter,
.component-fade-leave-to .component-fade-leave-active {
  opacity: 0;
}
</style>

<style scoped>
.account-modal-buttons {
  display: flex;
}

.session-main p {
  text-align: center;
}
</style>
