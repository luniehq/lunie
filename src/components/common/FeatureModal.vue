<template>
  <TmModal :show="show">
    <p>
      Hey there! 👋
    </p>

    <p>
      Are you having a hard time keeping up with everything that's happening in
      staking? We're building something we think you're going to love.
    </p>

    <p>Real-time notifications for everything that matters to you!</p>
    <ol>
      <li>
        <div><span>💸</span>Sikka changed their commission rate from 0%</div>
        <span>→</span>
      </li>
      <li>
        <div><span>🚨</span>Irresponsible Validator was just slashed 5%</div>
        <span>→</span>
      </li>
      <li>
        <div><span>🗳</span>Voting for proposal #24 ends in 1 hour</div>
        <span>→</span>
      </li>
    </ol>

    <form name="notifications-form" netlify>
      <span>Get on the waitlist by sharing your email below.</span>
      <input type="email" name="email" />
      <button type="submit" v-show="false">Send</button>
      <p class="spam">No spam. Just early access to this premium feature.</p>
    </form>
  </TmModal>
</template>

<script>
import TmModal from "common/TmModal"

export default {
  name: `feature-modal`,
  components: {
    TmModal
  },
  data: () => ({
    show: false
  }),
  mounted() {
    if (localStorage.getItem(`featureModal`)) {
      this.show = false
      console.log(`yep it's there`)
    } else {
      this.show = true
      localStorage.setItem(`featureModal`, true)
    }
  }
}
</script>
<style scoped>
p {
  padding: 0 0 1.5rem;
}

input {
  background: var(--input-bg);
  border: 2px solid var(--input-bc);
  border-radius: 0.25rem;
  color: var(--txt);
  display: block;
  font-size: 14px;
  min-width: 0;
  padding: 0.5rem 0.5rem;
  width: 100%;
  -webkit-appearance: none;
  margin: 0.5rem 0;
}

form {
  padding-top: 2rem;
}

form p {
  font-size: 12px;
}

li {
  padding: 0.75rem 1.25rem;
  margin: 0.5rem auto;
  border-radius: 0.5rem;
  background: var(--app-fg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

li div {
  display: flex;
  align-items: center;
}

li span:first-child {
  font-size: 24px;
  padding-right: 1rem;
}

li:hover {
  cursor: pointer;
  background: var(--app-fg-hover);
}

.spam {
  color: var(--dim);
  text-align: center;
}
</style>