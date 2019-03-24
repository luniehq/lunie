<template>
  <div class="data-view">
    <card-sign-in-required v-if="signInRequired && !session.signedIn" />
    <template v-else>
      <tm-data-connecting v-if="!loaded && !connected" />
      <tm-data-loading v-else-if="!loaded && loading" />
      <tm-data-error v-else-if="error" />
      <slot
        v-else-if="dataEmpty"
        name="no-data"
      >
        <tm-data-empty />
      </slot>
      <slot
        v-else
        name="data"
      />
    </template>
  </div>
</template>

<script>
import TmDataLoading from "common/TmDataLoading"
import TmDataEmpty from "common/TmDataEmpty"
import CardSignInRequired from "common/CardSignInRequired"
import { mapGetters } from "vuex"
import TmDataError from "common/TmDataError"
import TmDataConnecting from "common/TmDataConnecting"

export default {
  name: `tm-page`,
  components: {
    TmDataEmpty,
    TmDataLoading,
    TmDataError,
    TmDataConnecting,
    CardSignInRequired
  },
  props: {
    error: {
      type: Error,
      default: undefined
    },
    tabs: {
      type: Array,
      default: undefined
    },
    loading: {
      type: Boolean,
      default: false
    },
    loaded: {
      type: Boolean,
      default: undefined
    },
    dataEmpty: {
      type: Boolean,
      default: undefined
    },
    signInRequired: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters([`session`, `connected`])
  }
}
</script>
