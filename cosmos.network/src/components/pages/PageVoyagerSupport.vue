<template lang="pug">
page(title="Voyager Support" subtitle="Learn how to make a support ticket, so we can best help you with the problem.")
  text-container
    h2 Issue Process
    h3 How to create an issue

    p First, go to the #[a(href="https://github.com/cosmos/voyager/issues") Cosmos Voyager issues page]. Then, click on the green `New issue` button to create an issue.

    p Write an appropriate title for your issue. Describe the issue you are experiencing in full detail. Attach screenshots of the issue. If possible, specify when the error occured exactly. Make sure to attach your Cosmos Voyager logs, which you can find below:

    p #[strong Windows:]
    ul
      li Go to C:\Users\"username"\.Cosmos
      li Copy the `main.log` file

    p #[strong macOS:]
    ul
      li Open the Finder
      li Go to the Menu Bar and open the "Go" menu
      li Select "Go to Folder..."
      li Enter the following path (for the standard installation): ~/.Cosmos
      li Copy the `main.log` file

    p #[strong Linux:]
    ul
      li Go to ~/.Cosmos
      li Copy the `main.log` file

    h3 Resolving the issue

    p The UI team will get back to you as soon as possible. We may ask you for more details. And we'll do our best to help you resolve the issue. Thanks in advance for your patience, and for helping making Cosmos Voyager a better experience for everyone else.

    h2 Warnings
    h3 Sensitive Information
    p Do not write out any sensitive information, such as your fundraiser seed. The Interchain Foundation will never ask you for such information.
    p The issue contents and responses are public to the world, so don't write anything you don't want to pubically share with the rest of humanity.
</template>

<script>
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer.vue"
export default {
  name: "page-voyager-support",
  metaInfo: { title: "Voyager Support" },
  components: {
    Page,
    TextContainer
  }
}
</script>
