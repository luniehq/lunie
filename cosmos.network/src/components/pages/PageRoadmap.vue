<template lang="pug">
.page
  .overall-progress
    .overall-progress__outer
      .overall-progress__inner(:style="overallProgressStyle")
    .overall-progress__label
      .label__key Roadmap to Launch
      .label__value {{ overallProgressPct }}% #[span.desktop-inline Complete]

  .projects-container: .projects
    .dependency-arrow(
      v-for="a in arrows"
      :class="a.css"
      :style="`left:${a.cx}px; top:${a.cy}px; width:${a.length}px; transform:rotate(${a.angle}deg)`")

    .project.project-hub
      .project-header
        .project-title Cosmos Hub
        a.project-link(href="http://explorer.cosmos.network" target="_blank")
          img.project-logo(
            src="~images/roadmap/cosmos-hub.png"
            alt="Cosmos Hub" @load="imageLoaded")
        .project-progress
          .project-progress__outer
            .project-progress__inner(:style="hubProgressStyle")
          .project-progress__label
            | {{ hubProgressPct }}% #[span.desktop-inline Complete]
      .project-nodes
        card-node(v-for="n in nodes.hub" :key="n.id" :node="n" type="hub")

    .project.project-sdk
      .project-header
        .project-title Cosmos SDK
        a.project-link(href="https://github.com/cosmos/cosmos-sdk" target="_blank")
          img.project-logo(
            src="~images/roadmap/cosmos-sdk.png"
            alt="Cosmos SDK" @load="imageLoaded")
        .project-progress
          .project-progress__outer
            .project-progress__inner(:style="sdkProgressStyle")
          .project-progress__label
            | {{ sdkProgressPct }}% #[span.desktop-inline Complete]
      .project-nodes
        card-node(v-for="n in nodes.sdk" :key="n.id" :node="n" type="sdk")

    .project.project-tmc
      .project-header
        .project-title Tendermint
        a.project-link(href="https://github.com/tendermint/tendermint" target="_blank")
          img.project-logo(
            src="~images/roadmap/tendermint-core.png"
            alt="Tendermint Core" @load="imageLoaded")
        .project-progress
          .project-progress__outer
            .project-progress__inner(:style="tmcProgressStyle")
          .project-progress__label
            | {{ tmcProgressPct }}% #[span.desktop-inline Complete]
      .project-nodes
        card-node(v-for="n in nodes.tmc" :key="n.id" :node="n" type="tmc")

    .project.project-gui
      .project-header
        .project-title Cosmos Voyager
        a.project-link(href="https://github.com/cosmos/voyager" target="_blank")
          img.project-logo(
            src="~images/roadmap/cosmos-voyager.png"
            alt="Cosmos Voyager" @load="imageLoaded")
        .project-progress
          .project-progress__outer
            .project-progress__inner(:style="guiProgressStyle")
          .project-progress__label
            | {{ guiProgressPct }}% #[span.desktop-inline Complete]
      .project-nodes
        card-node(v-for="n in nodes.gui" :key="n.id" :node="n" type="gui")
</template>

<script>
import { mapGetters } from "vuex"
import PageMenu from "common/NiPageMenu"
import CardNode from "cards/CardNode"
export default {
  name: "page-roadmap",
  metaInfo: { title: "Roadmap" },
  components: {
    PageMenu,
    CardNode
  },
  computed: {
    ...mapGetters(["roadmap"]),
    nodes() {
      if (this.roadmap) {
        return this.roadmap.nodes
      } else {
        return { hub: [], sdk: [], tmc: [], gui: [] }
      }
    },
    hubProgressPct() {
      return this.calcProgress(this.nodes.hub)
    },
    hubProgressStyle() {
      return { width: this.hubProgressPct + "%" }
    },
    sdkProgressPct() {
      return this.calcProgress(this.nodes.sdk)
    },
    sdkProgressStyle() {
      return { width: this.sdkProgressPct + "%" }
    },
    tmcProgressPct() {
      return this.calcProgress(this.nodes.tmc)
    },
    tmcProgressStyle() {
      return { width: this.tmcProgressPct + "%" }
    },
    guiProgressPct() {
      return this.calcProgress(this.nodes.gui)
    },
    guiProgressStyle() {
      return { width: this.guiProgressPct + "%" }
    },
    overallProgressPct() {
      if (this.nodes && this.nodes.hub) {
        let totalNodes = this.nodes.hub.concat(this.nodes.sdk)
        totalNodes = totalNodes.concat(this.nodes.tmc)
        totalNodes = totalNodes.concat(this.nodes.gui)
        let doneNodes = totalNodes.filter(n => n.date !== "")
        return Math.round(doneNodes.length / totalNodes.length * 100)
      } else {
        return 0
      }
    },
    overallProgressStyle() {
      return { width: this.overallProgressPct + "%" }
    }
  },
  data: () => ({
    imagesLoaded: 0,
    arrows: []
  }),
  methods: {
    imageLoaded() {
      this.imagesLoaded += 1
    },
    calcProgress(nodes) {
      if (nodes) {
        let totalNodes = nodes.length
        let doneNodes = nodes.filter(n => n.date !== "").length
        return Math.round(doneNodes / totalNodes * 100)
      } else {
        return 0
      }
    },
    getOffset(el) {
      let rect = el.getBoundingClientRect()
      return {
        left: rect.left + window.pageXOffset,
        top: rect.top + window.pageYOffset,
        width: rect.width || el.offsetWidth,
        height: rect.height || el.offsetHeight
      }
    },
    connect(div1, div2) {
      let thickness = 2
      let off1 = this.getOffset(div1)
      let off2 = this.getOffset(div2)

      // line start
      let x1 = off1.left + off1.width / 2
      let y1 = off1.top + off1.height / 2

      // line end
      let x2 = off2.left + off2.width / 2
      let y2 = off2.top + off2.height / 2

      // distance
      let length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))

      // center
      let cx = (x1 + x2) / 2 - length / 2
      let cy = (y1 + y2) / 2 - thickness / 2

      // angle
      let angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI)

      // class
      let from = div1.id.split("-").shift()
      let to = div2.id.split("-").shift()
      let css = `da-${from}-${to}`

      // setup line
      let arrow = {
        length: length,
        cx: cx,
        cy: cy,
        angle: angle,
        css: css
      }
      this.arrows.push(arrow)
    },
    async setDependencies() {
      let $ = el => this.$el.querySelector("#" + el)
      let connect = this.connect
      let nodes = this.nodes

      await this.$nextTick()

      nodes.hub.map(n => n.children.map(to => connect($(n.id), $(to))))
      nodes.sdk.map(n => n.children.map(to => connect($(n.id), $(to))))
      nodes.tmc.map(n => n.children.map(to => connect($(n.id), $(to))))
      nodes.gui.map(n => n.children.map(to => connect($(n.id), $(to))))
    },
    createDepArrows(nodesLoaded) {
      if (this.imagesLoaded === 4 && Object.keys(nodesLoaded).length === 4) {
        this.setDependencies()
      }
    }
  },
  mounted() {
    this.$store.commit("initializeRoadmap")
  },
  watch: {
    imagesLoaded() {
      this.createDepArrows(this.nodes)
    },
    nodes(newNodes) {
      this.createDepArrows(newNodes)
    }
  }
}
</script>

<style scoped lang="stylus">
@import '~variables'

hub = link
sdk = accent
tmc = tmc
gui = mc

.dependency-arrow
  position absolute
  z-index z(default)

  line-height 2*px
  height 2*px
  background bc
  opacity 0.5
  &.da-hub-sdk
    background linear-gradient(to left, hub 33%, sdk 67%)
  &.da-hub-gui
    background linear-gradient(to left, hub 33%, gui 67%)
  &.da-sdk-hub
    background linear-gradient(to left, sdk 33%, hub 67%)
  &.da-sdk-gui
    background linear-gradient(to left, sdk 33%, gui 67%)
  &.da-tmc-hub
    background linear-gradient(to left, tmc 33%, hub 67%)
  &.da-tmc-gui
    background linear-gradient(to left, tmc 33%, gui 67%)

op-height = 2rem
.overall-progress
  height op-height
  position relative

.overall-progress__label
  position absolute
  top 0
  left 0
  width 100%

  height op-height

  display flex
  align-items center
  justify-content space-between
  padding 0 1rem

  font-size x
  text-align center
  line-height op-height
  color bright
  font-weight 500

.overall-progress__outer
.overall-progress__inner
  width 100%
  height op-height
  position absolute
  top 0
  left 0
.overall-progress__outer
  background app-fg
.overall-progress__inner
  background bc

pp-height = 1rem
.project-progress
  height pp-height
  position relative

.project-progress__label
  position absolute
  top 0
  left 50%

  width 3rem
  margin-left -1.5rem

  font-size xs
  font-weight 500
  color bright

  display flex
  align-items center
  justify-content center
  span
    padding-left 0.25rem

.project-progress__outer
.project-progress__inner
  width 100%
  height pp-height
  position absolute
  top 0
  left 0
.project-progress__outer
  background bc
.project-hub .project-progress__inner
  background link
.project-sdk .project-progress__inner
  background accent
.project-tmc .project-progress__inner
  background tmc
.project-gui .project-progress__inner
  background mc

.projects-container
  display flex
  align-items center
  justify-content center

.projects
  display flex
  flex-flow row nowrap
  width 100%
  max-width 1024px
  padding 0.25rem 0.25rem 2rem
  border-bottom 0.25rem solid app-fg

.project
  flex 1
  padding 0.25rem

.project-header
  margin 0 auto 0.5rem
  max-width 12rem

.project-title
  text-align center
  font-size sm
  color bright
  font-weight 500
  line-height 1.5rem
  background app-fg
  display none

.project-link
  display block

.project-logo
  width 100%
  border 1px solid bc-dim
  border-bottom none
  display block

.project-nodes
  display flex
  flex-flow column-reverse nowrap

@media screen and (min-width: 414px)
  .overall-progress
  .overall-progress__inner
  .overall-progress__outer
  .overall-progress__label
    height 2.5rem

@media screen and (min-width: 768px)
  .overall-progress
  .overall-progress__inner
  .overall-progress__outer
  .overall-progress__label
    height 3rem
    font-size lg
    margin-bottom 1rem

  .project-progress
  .project-progress__inner
  .project-progress__outer
  .project-progress__label
    height 1.5rem
  .project-progress__label
    font-size sm

  .projects
    padding 0.5rem 0.5rem 3rem

  .project
    padding 0.5rem

  .project-header
    margin-bottom 2rem

  .project-title
    font-size x
    line-height 3rem

@media all and (-ms-high-contrast:none)
  // ie11 support
  *::-ms-backdrop, .project-nodes
    display block
</style>
