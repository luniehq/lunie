<template>
  <TmPage data-title="About" hide-header>
    <div class="card">
      <h1>About</h1>
      <p>
        🎉
        <router-link to="careers">
          We're Hiring!
        </router-link>
      </p>
      <h2 class="c5">
        What is Lunie?
      </h2>
      <p>
        Lunie is a user interface for sending and receiving Cosmos tokens,
        viewing your transaction history, delegating your ATOMs, and
        participating in governance on the Cosmos Hub.
      </p>
      <p>
        Over the coming months we will be announcing a number of new products
        and services to make interacting with participant owned networks easier
        and more enjoyable.
      </p>
      <p>
        This software is developed by the team at Lunie International Software
        Systems Inc. We're
        <a
          href="https://github.com/luniehq/lunie"
          target="_blank"
          rel="noopener norefferer"
        >
          open source
        </a>
        and independent.
      </p>
    </div>

    <div class="card">
      <h2 class="c5">
        Security
      </h2>
      <p>
        Lunie is non-custodial. We believe that maintaining ownership over your
        keys is an important part of participating in these networks.
      </p>
      <p>
        <b>
          For your safety and security, Lunie will not ask for or store your
          private keys or seed phrases.</b
        >
      </p>
      <p>
        To send transactions with Lunie, you'll have to sign them with your
        Ledger Nano. If you don't have a Ledger Nano, you can
        <a
          href="https://shop.ledger.com/?r=3dd204ef7508&ref=lunie"
          target="_blank"
          rel="noopener norefferer"
          >buy one here</a
        >.
      </p>
      <p>
        To learn more about our security policies on Lunie.io, please visit our
        <router-link to="security"> security page </router-link>.
      </p>
    </div>

    <div class="card">
      <h2 class="c5">
        Team
      </h2>
      <div class="flex-row">
        <div class="profile">
          <img
            src="~assets/images/team/fabo.jpg"
            alt="Profile photo for Fabian Weber"
          />
          <div class="profile-info">
            <span>Fabian Weber</span>
            <span class="flag">🇩🇪</span>
          </div>
        </div>
        <div class="profile">
          <img
            src="~assets/images/team/jordan.jpg"
            alt="Profile photo for Jordan Bibla"
            @click="setEnthropyCounter()"
          />
          <div class="profile-info">
            <span>Jordan Bibla</span>
            <span class="flag">🇨🇦</span>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="c5">
        Contact
      </h2>
      <p>
        Please let us know what you think! You can find us on
        <a
          href="https://github.com/cosmos/lunie"
          target="_blank"
          rel="noopener norefferer"
        >
          GitHub</a
        >
        and
        <a
          href="https://twitter.com/luniehq"
          target="_blank"
          rel="noopener norefferer"
          >Twitter</a
        >, email us at contact@lunie.io, or click the <i>feedback</i> button on
        the left.
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
  },
  data: () => {
    return {
      enthropyCounter: 0,
      reggaeMusic: new Audio("/enthropies/The Maytals - Do The Reggay.mp3"),
      partyIsOff: new Audio("record_scratch.mp3")
    }
  },
  watch: {
    enthropyCounter: {
      handler() {
        if (this.enthropyCounter === 5) {
          this.enthropyCounter = 0
          this.startEnthropy()
        }
      }
    }
  },
  methods: {
    setEnthropyCounter() {
      console.log(this.enthropyCounter)
      this.enthropyCounter += 1
    },
    startEnthropy() {
      console.log("HIIII")
      this.reggaeMusic.play()
      this.createGandalf()
      const sunglasses = this.createSunglasses()
      let joint
      setTimeout(() => {
        joint = this.createJoint()
      }, 5000)
      setTimeout(() => {
        this.enterBalrog(sunglasses, joint)
      }, 15000)
    },
    createGandalf() {
      const gandalf = document.createElement("img")
      gandalf.src = "/enthropies/gandalf.jpg"
      gandalf.style.position = "absolute"
      document.body.appendChild(gandalf)
    },
    createSunglasses() {
      const sunglasses = document.createElement("img")
      sunglasses.src = "/enthropies/sunglasses.png"
      sunglasses.style.position = "absolute"
      sunglasses.style.top = "0px"
      sunglasses.style.left = "100px"
      sunglasses.style.visibility = "visible"
      document.body.appendChild(sunglasses)
      let top = 0

      let interval = setInterval(frame, 5)

      function frame() {
        if (top >= 130) {
          clearInterval(interval)
        } else {
          top++
          sunglasses.style.top = top + "px"
        }
      }

      return sunglasses
    },
    createJoint() {
      const joint = document.createElement("img")
      joint.src = "/enthropies/joint.png"
      joint.style.width = "30%"
      joint.style.height = "60%"
      joint.style.position = "absolute"
      joint.style.top = "357px"
      joint.style.left = "310px"
      joint.style.visibility = "visible"
      document.body.appendChild(joint)

      return joint
    },
    enterBalrog() {
      this.reggaeMusic.pause()
      this.reggaeMusic.currentTime = 0
      this.partyIsOff.play()
      // joint.style.visibility = "hidden"
      // sunglasses.style.visibility = "hidden"
    }
  }
}
</script>

<style scoped src="../../styles/content-page.css"></style>
