<template>
  <TmPage data-title="Security" hide-header>
    <div class="card">
      <h1>Security</h1>
      <h2 class="c5">Coordinated Vulnerability Disclosure Policy</h2>
      <p>
        To protect our users and reduce harm to the community, we ask security
        researchers to keep vulnerabilities and communications around
        vulnerability submissions private and confidential until a patch is
        developed. In addition to this, we ask that you:
      </p>
      <ul>
        <li class="c6 c7">
          Allow us a reasonable amount of time to correct or address security
          vulnerabilities.
        </li>
        <li class="c6 c7">
          Avoid exploiting any vulnerabilities that you discover.
        </li>
        <li class="c6 c7">
          <span class="c1"
            >Demonstrate good faith by not disrupting or degrading Lunie&rsquo;s
            data or services.</span
          >
        </li>
      </ul>
      <p class="c6">
        <span class="c1"
          >At present, we are most interested in bugs in our source code. Any
          bugs in services that we use (i.e. Github, Google Apps, or Mailchimp)
          should be reported directly to those services, and do not fall within
          the scope of our coordinated disclosure policy.</span
        >
      </p>
    </div>
    <div class="card">
      <h2 class="c5">Vulnerability Disclosure Process</h2>
      <p>
        Once we receive a vulnerability report, the Lunie will take these steps
        to address it:
      </p>
      <ol class="c10 lst-kix_ufr4rr5dyt1a-0 start" start="1">
        <li class="c6 c7">
          <span class="c1"
            >Lunie will confirm receipt of the vulnerability report within 3
            business days. The timing of our response may depend on when a
            report is submitted. Our daily operations are distributed in time
            zones across the globe, and response times may vary. If you have not
            received a response to a vulnerability report from us within 3
            business days, we encourage you to follow up with us again for a
            response. Our core team comprises two engineers, and we may not be
            able to meet the same response times of larger teams with more
            resources. &nbsp;</span
          >
        </li>
        <li class="c6 c7">
          <span class="c1"
            >Lunie will investigate and validate the security issue submitted to
            us as quickly as we can, usually within 7 business days of receipt.
            Submitting a thorough report with clear steps to recreate the
            vulnerability and/or a proof-of-concept will move the process along
            in a timely manner.</span
          >
        </li>
        <li class="c6 c7">
          <span class="c1"
            >If valid, Lunie will acknowledge the bug, and make the necessary
            code changes to patch it. Some issues may require more time than
            others to patch, but we will strive to patch each vulnerability as
            quickly as our resources and development process allows.</span
          >
        </li>
        <li class="c6 c7">
          <span class="c1"
            >Lunie will publicly release the security patch for the
            vulnerability, and acknowledge the security fix in the release
            notes. Public release notes may reference the person or people who
            reported the vulnerability, unless the reporters choose to be
            anonymous.</span
          >
        </li>
      </ol>
    </div>
    <div class="card">
      <h2 class="c5">Contact Us</h2>
      <p>
        You can contact our team directly at security@lunie.io which is
        monitored by our core team of two engineers. Please avoid filing
        security issues in our public repositories as this method of contact
        fully discloses security bugs to friends and adversaries alike, and
        makes it difficult for us to reduce harm for our users and community.
      </p>
    </div>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"

export default {
  name: `page-security`,
  components: {
    TmPage
  }
}
</script>

<style scoped src="../../styles/content-page.css"></style>
