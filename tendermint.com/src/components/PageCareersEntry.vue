<template lang="pug">
page(:title="career.title" :subtitle="subtitle")
  div(slot="subtitle") Work with us to build the future of the decentralized web with #[a(href='https://cosmos.network') Cosmos]. If your speciality is not listed below, we still encourage you to apply.
  div(slot="menu")
    btn(icon="mail" value="Apply for Job" type="anchor" href="https://tendermint.com/careers" target="_blank" color="primary")

  text-container
    h3 About us:
    p Tendermint is building state-of-the-art consensus and networking protocols to enable internet-scale distributed applications. We’re passionate, self-driven, industry leaders whose mission is to build a better, freer internet. We're also building the <a href="https://cosmos.network" target="_blank">Cosmos Network</a>, a decentralized network of independent parallel blockchains, each powered by classical BFT consensus algorithms like Tendermint Core. We believe the technology we're building will have a major impact on human beings around the world. We’re well funded and growing quickly.

    h3 How we work:
    p Our software development teams are broken up into <a href="https://github.com/tendermint" target="_blank">Tendermint</a>, <a href="https://github.com/cosmos/cosmos-sdk" target="_blank">Cosmos SDK</a>, and <a href="https://github.com/cosmos/voyager" target="_blank">Voyager</a>. Our teams leverage agile methodologies to move quickly and stay focused. Most of us work out of our offices in Berkeley, Toronto, and Berlin, but some of our employees work remotely. Communication is important to us and we rely heavily on Slack, Zoom, and GitHub to help us stay in sync. Everything we build is open source and available on GitHub.

    div(v-html="markdown(career.body)")

    h3 What we offer:
    ul
      li The opportunity to build the future of the internet.
      li An exciting role building open source software.
      li Flexible work schedule.
      li Travel stipend for conferences and in person collaboration.
      li At least 4 weeks of paid vacation.
      li Very competitive salary, including equity.

    h3 About our application process:
    p Qualified candidates can expect to go through a 4 step interview process. The first interview will be a call to assess cultural fit and to make sure our goals are aligned.

    p If we think there is a good fit, you'll have a call with one of our project managers to learn more about your skills and attitudes toward teamwork. If it's clear that you'd be a good addition to the team, we’ll ask you to complete a technical task for which you will be compensated.

    p If your technical task displays a high level of quality and care we will set up a final interview with our CEO or CTO.

    p The process can take up to 3 weeks.

    h3 How to apply:
    p To apply, please fill out this form:
    btn(type="anchor" :href="config.CAREER_APPLICATION_URL" target="_blank" value="Tendermint Application Form" size="lg" theme="tendermint")
</template>

<script>
import MarkdownIt from "markdown-it"
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import Part from "common/NiPart"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-career-entry",
  metaInfo: {
    title() {
      return this.career.title + " - Careers - Tendermint"
    }
  },
  components: {
    Btn,
    Page,
    Part,
    TextContainer
  },
  computed: {
    ...mapGetters(["allCareers", "config"]),
    career() {
      if (this.allCareers) {
        return this.allCareers.find(c => c.slug === this.$route.params.entry)
      }
      return { title: "Loading...", subtitle: "Loading..." }
    },
    subtitle() {
      return this.capitalize(this.career.area) + " Position at Tendermint"
    }
  },
  methods: {
    capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    markdown(text) {
      const md = new MarkdownIt()
      return md.render(text)
    },
    email(address) {
      window.location.href = "mailto:" + address
    }
  }
}
</script>
