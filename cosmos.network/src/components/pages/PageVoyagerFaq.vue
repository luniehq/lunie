<template lang="pug">
page(title="Voyager FAQ" subtitle="Frequently asked questions and answers about Cosmos Voyager.")
  text-container
    h2 Q&A

    h3 How can I access my Atoms and Photons in Voyager?

    p Voyager is currently in Alpha. That means support for Atoms and Photons are not in place yet. Please do not enter in your fundraiser seed in this version of Voyager. You can view our current launch progress on the Roadmap. You can also get an alert for the launch by adding your email and clicking "Get Launch Alert" #[router-link(:to="{name: 'home'}") on the homepage].

    h3 Where can I get some tokens to test Voyager?
    p You can get Fermions from the unofficial #[a(href="https://cosmosvalidators.com") Cosmos Validators faucet]. Scroll halfway down the page, enter your Cosmos address, solve the captcha, and there you go! Note: you may have to click the Refresh button on the Balances page of Voyager in order to see your updateupdated funds.

    h3 Will we support iOS and Android?
    p We will work on Voyager for iOS and Android after the release of the Cosmos Hub.

    h3 When will there be a network monitor?
    p We will work on the network monitor after the launch of Cosmos Hub. There is already a blockchain explorer in the current release of Voyager.

    h3 Is there a Windows installer or a Mac DMG?
    p No, we don't currently have installers for Windows or macOS X. The reason is because we aim to only release deterministic builds. Deterministic builds are builds that can be recreated on any machine. Replicable builds increase the security of our network. Right now we're attempting to solve the issue of differing timestamps from building a Windows or macOS DMG installer.

    h3 I forgot my Cosmos seed. What can I do?
    p Did you back up your Cosmos seed somewhere? Recover it from that. If you didn't backup your Cosmos seed, unfortunately you're out of luck. There's no way of recovering it from our end. You'll have to create a new account.

    h2 Still stumped?
    h3 Didn't answer your question?
    p View the #[router-link(:to="{name: 'voyager-support'}") support page] to learn how to create an issue on the Voyager repository. Thanks in advance for your patience, and your help in improving the Cosmos Voyager!
</template>

<script>
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer.vue"
export default {
  name: "page-voyager-faq",
  metaInfo: { title: "Voyager FAQ" },
  components: {
    Page,
    TextContainer
  }
}
</script>
