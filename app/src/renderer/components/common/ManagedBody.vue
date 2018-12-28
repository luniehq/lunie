<template>
  <div>
    <modal-search
      v-if="search && search.somethingToSearch"
      :type="search.type"
    />

    <tm-data-connecting v-if="!loaded && !connected" />
    <tm-data-loading v-else-if="!loaded && loading" />
    <tm-data-error v-else-if="error" />
    <slot
      v-else-if="data.length === 0 && this.$slots['no-data']"
      name="no-data"
    />
    <tm-data-empty v-else-if="data.length === 0" />
    <data-empty-search v-else-if="filteredData.length === 0" />
    <slot v-else name="data-body" />
  </div>
</template>

<script>
import { TmDataMsg, TmDataLoading, TmDataEmpty } from "@tendermint/ui"
import DataEmptySearch from "common/TmDataEmptySearch"
import TmDataError from "common/TmDataError"
import ModalSearch from "common/TmModalSearch"
import TmDataConnecting from "common/TmDataConnecting"
export default {
  name: `managed-body`,
  components: {
    TmDataMsg,
    TmDataEmpty,
    TmDataLoading,
    DataEmptySearch,
    TmDataError,
    TmDataConnecting,
    ModalSearch
  },
  props: {
    search: {
      type: Object,
      default: () => undefined
    },
    error: {
      type: Object,
      default: () => undefined
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    connected: {
      type: Boolean,
      default: () => undefined
    },
    loaded: {
      type: Boolean,
      default: () => undefined
    },
    data: {
      type: Array,
      default: () => []
    },
    filteredData: {
      type: Array,
      default: () => []
    }
  }
}
</script>
