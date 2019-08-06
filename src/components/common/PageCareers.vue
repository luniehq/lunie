<template>
  <TmPage data-title="Careers" hide-header>
    <div class="card">
      <h1>Careers</h1>
      <h2 class="c5">Our Mission</h2>
      <p>
        Starting with Cosmos and the Cosmos Hub, we are on a mission to simplify
        the user experience for new multi-stakeholder participant owned
        networks.
      </p>
      <p>
        By providing simple and secure user experiences we aim to make these
        networks more accessible, engaging, and enjoyable to use.
      </p>
      <p>...And we need your help to make it happen!</p>
    </div>
    <div class="card">
      <h2 class="c5">Open Positions</h2>
      <p>
        The following are full-time roles based in Toronto or Berlin.
      </p>
      <ul class="jobs-list">
        <li>
          <a
            href="https://angel.co/lunie/jobs/553123-senior-software-engineer-api-engineering-blockchain-systems"
            class="job-title"
            target="_blank"
            rel="nofollow noreferrer noopener"
            >Senior Software Engineer</a
          >
          <span>API Engineering, Blockchain Systems</span>
        </li>
        <li>
          <a
            href="https://angel.co/lunie/jobs/553137-senior-software-engineer-javascript-frontend"
            class="job-title"
            target="_blank"
            rel="nofollow noreferrer noopener"
            >Senior Software Engineer</a
          >
          <span>JavaScript, Frontend</span>
        </li>
        <li>
          <a
            href="https://angel.co/lunie/jobs/553139-senior-designer-product-marketing"
            class="job-title"
            target="_blank"
            rel="nofollow noreferrer noopener"
            >Senior Designer</a
          >
          <span>Product, Marketing</span>
        </li>
      </ul>
    </div>
    <div class="card">
      <h2 class="c5">Why You Should Join Us</h2>
      <p>
        We're an experienced and well-funded team, having an impact the future
        of participant owned networks. We measure jokes per meeting and love
        what we do.
      </p>
      <p>
        We're offering significant equity, timeoff, and a flexible work
        schedule. We respect the work week and treat eachother with kindness and
        compassion.
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
<style scoped src="../../styles/content-page.css"></style>
<style scoped>
.jobs-list li {
  padding: 0.5rem 0;
  line-height: 22px;
  font-size: 18px;
}

.jobs-list span {
  font-size: 14px;
  font-weight: 500;
  display: block;
}
</style>
