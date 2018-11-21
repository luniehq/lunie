<template>
  <tm-btn
    class="btn-receive"
    @click.native.stop="openModal"
    value="Receive"
    icon="file_download"
    icon-pos="right"
    color="primary"
  ></tm-btn>
</template>

<script>
import { TmBtn } from "@tendermint/ui"
export default {
  components: { TmBtn },
  methods: {
    openModal() {
      this.$store.commit(`setModalReceive`, true)
    }
  }
}
</script>
