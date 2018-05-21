<template lang="pug">
.page-hackatom
  locale-menu
  header.ha-header
    .image
    .ha-container
      main
        a.alert(href='https://medium.com/cosmos-blockchain/cosmos-hackatom-is-underway-52c6032f6a61', target='_blank')
          span.key 更新：
          span.value CosmosHackAtom正在进行 →
        h1
          strong Hack
          | Atom 2017
        ul
          li 6月9日-7月9日
          li 来自世界各地的参与者
          li 5万美元的奖金等待您的获取
        p
          strong HackAtom
          | 正在全球范围内寻找个人或者团队来参加总奖金高达5万美金的黑客马拉松活动。活动时间从6月9日至7月9日。参与者将创新的想法转化为可运行的应用程序，就能从Cosmos社区赢取奖金。
        p
          | HackAtom大赛为期四周，期间您将创建一个真正的产品。加密和区块链社区会观赛并投票，选出他们满意的项目。说出你创新想法背后的故事，并把它变成一个有用的产品。同时，带动大家一起参与，共同打造超酷的东西。
          a(@click='setModal(true)') 注册!
  section.ha-section.judging
    .ha-container
      header 奖品
      main
        p 活动奖金是价值5万美金的以太币（ETH）。奖金对获奖应用的分配方案如下：
        ul.prizes
          li.grand
            i.material-icons monetization_on
            .key 大奖
            .value 价值2万美金的以太币
          li.second
            i.material-icons monetization_on
            .key 第二名
            .value 价值 1万美金的以太币
          li.third
            i.material-icons monetization_on
            .key 第三名
            .value 价值6000美金的以太币
          li.fourth
            i.material-icons monetization_on
            .key 第四名
            .value 价值4000美金的以太币
        p 还有5份（每份价值2千美金的以太币）奖品，奖励给那些我们认可的在活动期间辛苦工作的志愿者。
  section.ha-section.participate
    .ha-container
      header 从世界各地参与
      main
        p 想要参与黑客马拉松（hackathon），你需做到以下几点：
        ol.participation-steps
          li
            .key 1.
            .value 注册
              a(@click='setModal(true)') 注册
          li
            .key 2.
            .value 构建你的应用
          li
            .key 3.
            .value 于太平洋时间七月九日上午十时前提交
  section.ha-section.meetup
    .ha-container
      header 与Cosmonauts聚会
      main
        p 2017年6月9日当地时间下午7:00，我们将在世界各地举办HackAtom聚会。如果你在附近，请来加入我们！在构建应用时，请与我们联系，以获取免费提示和支持。
        card-location

  section.ha-section.judging
    .ha-container
      header 评审
      main
        p 我们期待的是高水平的专业性和质量，因此从一开始就邀请了经验丰富的黑客和企业家来影响本次竞赛。你将会获得来自社区与评审员的专业评审。
  section.ha-section.ha-section-join
    .ha-container
      header 报名参加
      main
        p 在表单中，填写你的详细信息，并提交，以参与CosmosHackAtom。您将收到关于如何比赛的进一步说明。
        btn(@click.native='setModal(true)', size='lg', icon='clock-o', value='Sign Up for HackAtom')
        p
          | 想要咨询黑客马拉松活动，请通过邮件与我们联系：
          a(:href="'mailto:' + links.cosmos.community.matrix") Developer Chat
          | 。
  modal-agreement(v-if='hackatom.modal')
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
import PageHeader from "@nylira/vue-page-header"
import MenuLocale from "navigation/MenuLocale"
import CardLocation from "cards/CardLocation"
import ModalAgreement from "modals/ModalAgreement"
export default {
  name: "page-hackatom-zh-cn",
  metaInfo: { title: "HackAtom (Chinese) - Developers" },
  components: {
    Btn,
    MenuLocale,
    CardLocation,
    ModalAgreement,
    PageHeader
  },
  computed: {
    ...mapGetters(["allPeople", "hackatom", "links"])
  },
  methods: {
    ppl(tag) {
      return this.allPeople.filter(p => p.tags.includes(tag))
    },
    setModal(value) {
      this.$store.commit("setHackAtomModal", value)
    }
  }
}
</script>
