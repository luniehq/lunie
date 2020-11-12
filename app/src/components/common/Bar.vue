<template>
  <div v-if="showMessage" class="bar-container">
    <div :class="`bar ${barType}`">
      <div class="left">
        <p>
          <slot />
        </p>
        <TmBtn
          v-if="linkCaption"
          class="button small"
          :value="linkCaption"
          type="button"
          @click.native="goToLink(link)"
        />
      </div>
      <div v-if="!hideClose" class="right">
        <i class="material-icons notranslate close-icon" @click="close()"
          >close</i
        >
      </div>
    </div>
  </div>
</template>

<script>
import TmBtn from "src/components/common/TmBtn"

export default {
  name: `bar`,
  components: {
    TmBtn,
  },
  props: {
    barType: {
      type: String,
      default: "primary",
    },
    show: Boolean,
    hideClose: Boolean,
    link: {
      type: String,
      default: "",
    },
    linkCaption: {
      type: String,
      default: "",
    },
  },
  data: function () {
    return {
      showMessage: this.show,
    }
  },
  methods: {
    close() {
      this.showMessage = false
      this.$emit(`close`)
    },
    goToLink(link) {
      // first check if link is internal or external
      if (link && link.startsWith(`http`)) {
        // make safe and independent from API
        window.open(link, "_blank")
      } else if (link) {
        // it is an internal link
        this.$router.push(link)
      }
    },
  },
}
</script>

<style scoped>
.bar-container {
  margin: 0.5rem;
}

.bar {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: var(--sans);
  background-color: transparent;
  font-size: 14px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--menu-bright);
}

.bar.primary {
  background-color: var(--primary);
}

.bar.success {
  background-color: var(--success);
}

.bar.warning {
  background-color: var(--warning);
}

.bar.danger {
  background-color: var(--danger);
}

.bar.info {
  background-color: var(--info);
}

.bar .link {
  text-decoration: underline;
  color: var(--menu-bright);
  cursor: pointer;
}

.bar .button {
  background-color: transparent;
  color: var(--menu-bright);
  border-radius: 5px;
  padding: 0.1rem 0.5rem;
  cursor: pointer;
}

.right {
  display: flex;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.close-icon {
  cursor: pointer;
  font-size: 18px;
  padding-left: 1rem;
}

@media screen and (max-width: 667px) {
  .bar {
    align-items: baseline;
  }

  .left {
    flex-direction: column;
    align-items: baseline;
  }

  .left p {
    padding-bottom: 1rem;
  }
}
</style>
