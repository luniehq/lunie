<template lang="pug">
page(title="Visual Assets" subtitle="An overview of Cosmos-related logos, diagrams, and other media.")
  div(slot="menu")
    btn(icon="chat" value="Community Chat" type="anchor" href="https://riot.im/app/#/group/+cosmos:matrix.org" target="_blank" color="primary")
    btn(icon="apps" value="All Assets" type="anchor" href="https://drive.google.com/open?id=1IjsubJvkUIZ47Bvy4FNv8ggxbxTPXSyr" target="_blank")
  part(title="Cosmos Brand")
    text-container
      p We have an open approach towards the use of the Cosmos branding that is community-friendly and supports the greater Cosmos and crypto ecosystem. All current Cosmos branding is under Creative Commons attribution 3.0. Please read and follow the #[a(href="https://drive.google.com/open?id=1eUyb1mJ5XGFbgoi57ATrbhN9IZVR_Y_s") Visual&nbsp;Identity&nbsp;Guide]. Download the #[a(href="https://drive.google.com/open?id=1cFqcFCtmIKpCFW2a0Y8lexMwmRIoZZ36") Logo&nbsp;Assets] to get access to our logo in vector, alpha, and high resolution formats.
    part(title="Cosmos Assets")
    card-asset(v-for="asset in orderedAssets" :asset="asset" :key="asset.id")
</template>

<script>
import { orderBy } from "lodash"
import moment from "moment"
import CardAsset from "cards/NiCardAsset"
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import Part from "common/NiPart"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-visual-assets",
  metaInfo: { title: "Visual Assets" },
  components: {
    Btn,
    CardAsset,
    Page,
    Part,
    TextContainer
  },
  computed: {
    orderedAssets() {
      return orderBy(
        this.assets,
        [
          function(a) {
            return moment(a.date)
          }
        ],
        "desc"
      )
    }
  },
  data: () => ({
    assets: [
      {
        id: "cosmos-ethereum-peg",
        title: "Cosmos-Ethereum Peg",
        date: "2018-04-20",
        url:
          "https://drive.google.com/open?id=1MSGMum1eepiLDOhfO0wTtiwL0O88T8DI"
      },
      {
        id: "cosmos-overview-jaekwon",
        title: "Cosmos Overview - Jae Kwon Edition",
        date: "2018-03-23",
        url:
          "https://drive.google.com/open?id=1JWuXAVkl42YLEXekcKbmKS6CPAxWt7Cb"
      },
      {
        id: "cosmos-overview-labeled",
        title: "Cosmos Overview - Labeled Edition",
        date: "2018-03-23",
        url:
          "https://drive.google.com/open?id=1ocX3wODvR-NwciMz7osBe5EfvDRKkR8B"
      },
      {
        id: "cosmos-overview-unlabeled",
        title: "Cosmos Overview - Unlabeled Edition",
        date: "2018-03-23",
        url:
          "https://drive.google.com/open?id=1XhU7XbjMuBJdvXamrDurbrefp2lNx5Mc"
      },
      {
        id: "cosmos-tcp-vs-ibc",
        title: "TCP vs IBC",
        date: "2018-03-30",
        url:
          "https://drive.google.com/open?id=1mvY0H9k2OYIfFapDRfAaWGzNgTxYbAlz"
      },
      {
        id: "cosmos-tendermint-stack",
        title: "Tendermint Stack",
        date: "2018-05-07",
        url:
          "https://drive.google.com/open?id=1yR2XpRi9YCY9H9uMfcw8-RMJpvDyvjz9"
      },
      {
        id: "cosmos-zones",
        title: "Cosmos Zones",
        date: "2018-01-03",
        url:
          "https://drive.google.com/open?id=1s1gXL2AJpGyeY1i-33bdMT3cis_eWTg9"
      }
    ]
  })
}
</script>
