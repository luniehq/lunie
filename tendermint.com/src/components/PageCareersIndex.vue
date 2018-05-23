<template lang="pug">
page(title="Careers" )
  div(slot="subtitle") Work with us to build the future of the decentralized web with #[a(href='https://cosmos.network') Cosmos]. If your speciality is not listed below, we still encourage you to apply.
  div(slot="menu")
    btn(icon="mail" value="Apply to Tendermint" type="anchor" href="https://tendermint.com/careers" target="_blank" color="primary")

  part(title='Technical Positions' v-if='technical.length > 0')
    div(slot='title') Technical Positions
    card-career(v-for='c in technical', :key='c.id', :career='c')

  part(title='Design Positions' v-if='design.length > 0')
    div(slot='title') Design Positions
    card-career(v-for='c in design', :key='c.id', :career='c')

  part(title='Operations Positions' v-if='operations.length > 0')
    div(slot='title') Operations Positions
    card-career(v-for='c in operations', :key='c.id', :career='c')

  part(title='Community Positions' v-if='community.length > 0')
    div(slot='title') Community Positions
    card-career(v-for='c in community', :key='c.id', :career='c')
</template>

<script>
import { mapGetters } from "vuex"
import { orderBy } from "lodash"
import Btn from "@nylira/vue-button"
import CardCareer from "./CardCareer"
import Page from "common/NiPage"
import Part from "common/NiPart"
export default {
  name: "page-careers-index",
  metaInfo: { title: "Careers" },
  components: {
    Btn,
    CardCareer,
    Page,
    Part
  },
  computed: {
    technical() {
      return this.careers.filter(c => c.area === "technical")
    },
    design() {
      return this.careers.filter(c => c.area === "design")
    },
    operations() {
      return this.careers.filter(c => c.area === "operations")
    },
    community() {
      return this.careers.filter(c => c.area === "community")
    },
    careers() {
      let orderedCareers = orderBy(this.allCareers, ["title"], ["asc"])
      return orderedCareers
    },
    ...mapGetters(["allCareers"])
  }
}
</script>
