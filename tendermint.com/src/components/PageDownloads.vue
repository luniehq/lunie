<template lang="pug">
page(title="Downloads" subtitle="Check back periodically for new Tendermint releases.")
  div(slot="menu")
    btn(icon="description" value="Documentation" type="anchor" href="https://tendermint.readthedocs.io/en/master/index.html" color="primary" target="_blank")
    btn(icon="code" value="Source Install" type="anchor" href="https://tendermint.readthedocs.io/en/master/install.html" target="_blank")
  text-container
    download-links
</template>

<script>
import Btn from "@nylira/vue-button"
import DownloadLinks from "comp/DownloadLinks"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-download",
  metaInfo: { title: "Downloads" },
  components: {
    Btn,
    DownloadLinks,
    Page,
    TextContainer
  }
}
</script>
