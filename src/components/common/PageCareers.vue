<template>
  <TmPage data-title="Careers" hide-header>
    <div class="card">
      <h1>Careers</h1>
      <h2 class="c5">Our Mission</h2>
      <p>
        We believe in the power of participant owned networks. These networks
        have the opportunity be more equitable, democratic, and resilient than
        the systems we interact with today.
      </p>
      <p>
        Starting with Cosmos and the Cosmos Hub, we are on a mission to simplify
        the user experience for these new multi-stakeholder, participant owned
        networks. By providing simple and secure user experiences we aim to make
        these networks more accessible, engaging, and enjoyable to use.
      </p>
      <p>...And we need your help to make it happen!</p>
    </div>
    <div class="card">
      <h2 class="c5">Open Positions</h2>
      <ul>
        <li>Senior Software Engineer - API and Blockchain Systems</li>
        <li>Senior Software Engineer - Frontend</li>
        <li>Senior Designer - Product and Marketing</li>
      </ul>
    </div>

    <div class="card">
      <h2 class="c5">Contact</h2>
      <p>
        To apply, send an email to careers@lunie.io.
      </p>
    </div>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"

export default {
  name: `page-about`,
  components: {
    TmPage
  }
}
</script>

<style scoped>
@import "../../styles/content-page.css";
</style>
