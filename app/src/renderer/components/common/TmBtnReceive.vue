<template>
  <tm-btn
    class="btn-receive"
    value="Receive"
    icon="file_download"
    icon-pos="right"
    color="primary"
    @click.native.stop="openModal"
  />
</template>

<script>
import TmBtn from "common/TmBtn"
export default {
  components: { TmBtn },
  methods: {
    openModal() {
      this.$store.commit(`setModalReceive`, true)
    }
  }
}
</script>
