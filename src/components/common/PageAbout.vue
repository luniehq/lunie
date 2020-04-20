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
import { setInterval } from "timers"

export default {
  name: `page-about`,
  components: {
    TmPage
  },
  data: () => {
    return {
      enthropyCounter: 0,
      reggaeMusic: new Audio("/enthropies/The Maytals - Do The Reggay.mp3"),
      partyIsOff: new Audio("record_scratch.mp3"),
      textLines: [
        "Hello, welcome to Lunie World",
        "Are you as excited about staking as I am?",
        "Hohoho, just don't mistake it with skating. Very important. Hohoho",
        "But first things first. Let's take it easy. Don't you agree?",
        "Let the party begin!"
      ],
      isLineFinished: false
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
      this.reggaeMusic.play()
      this.createGandalf()
      this.createSunglasses()
      setTimeout(() => {
        this.createTextBubble()
        let index = 0
        let interval = setInterval(() => {
          if (index === 0) {
            this.typingText(this.textLines[index])
            index++
          } else {
            if (index >= this.textLines.length) {
              clearInterval(interval)
            } else {
              const checker = this.isLineFinishedChecker(index)
              if (checker) {
                this.typingText(this.textLines[index])
                index++
              }
            }
          }
        }, 300)
      }, 3000)
      setTimeout(() => {
        this.createJoint()
      }, 10000)
    },
    createGandalf() {
      const gandalf = document.createElement("img")
      gandalf.src = "/enthropies/gandalf.png"
      gandalf.style.position = "absolute"
      gandalf.style.width = "72%"
      gandalf.style.top = "120vh"
      gandalf.style.right = "0"
      document.body.appendChild(gandalf)
    },
    createSunglasses() {
      const sunglasses = document.createElement("img")
      sunglasses.src = "/enthropies/sunglasses.png"
      sunglasses.style.position = "absolute"
      sunglasses.style.width = "30%"
      sunglasses.style.top = "134vh"
      sunglasses.style.right = "25vw"
      document.body.appendChild(sunglasses)
      let top = 70

      let interval = setInterval(frame, 30)

      function frame() {
        if (top >= 134) {
          clearInterval(interval)
        } else {
          top++
          sunglasses.style.top = top + "vh"
        }
      }
    },
    createJoint() {
      const joint = document.createElement("img")
      joint.src = "/enthropies/joint.png"
      joint.style.transform = "scaleX(-1)"
      joint.style.width = "30%"
      joint.style.height = "60%"
      joint.style.position = "absolute"
      joint.style.top = "157vh"
      joint.style.left = "33vw"
      document.body.appendChild(joint)
    },
    enterBalrog() {
      this.reggaeMusic.pause()
      this.reggaeMusic.currentTime = 0
      this.partyIsOff.play()
      // joint.style.visibility = "hidden"
      // sunglasses.style.visibility = "hidden"
    },
    createTextBubble() {
      const textBubble = document.createElement("div")
      textBubble.id = "text-bubble"
      textBubble.style.position = "absolute"
      textBubble.style.width = "25vw"
      textBubble.style.height = "20vh"
      textBubble.style.top = "130vh"
      textBubble.style.left = "21vw"
      textBubble.style.padding = "15px"
      textBubble.style.lineHeight = "1.7em"
      document.body.appendChild(textBubble)

      textBubble.style.backgroundColor = "white"
    },
    typingText(line) {
      const text = document.getElementById("text-bubble")
      let i = 0
      text.innerText = ""

      let interval = setInterval(() => {
        if (i >= line.length) {
          clearInterval(interval)
        } else {
          text.innerHTML += line[i]
          i++
        }
      }, 60)
    },
    isLineFinishedChecker(index) {
      const textBubbleText = document.getElementById("text-bubble")
      if (
        textBubbleText &&
        textBubbleText.innerText.length === this.textLines[index - 1].length
      ) {
        // previous line is already finished
        this.isLineFinished = true
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style scoped src="../../styles/content-page.css"></style>
