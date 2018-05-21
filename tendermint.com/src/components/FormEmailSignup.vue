<template>
  <form action="//tendermint.us8.list-manage.com/subscribe/post?u=89d5a312be95ee3f0c9cf7ecd&amp;id=4af1217bca" method="post" name="mc-embedded-subscribe-form" class="form-email-signup validate form" target="_blank" novalidate>

    <div class="input-group">
      <field
        id="mce-EMAIL"
        name="EMAIL"
        type="email"
        size="lg"
        placeholder="name@example.com">
      </field>
      <btn
        type="submit"
        value="Subscribe"
        size="lg"
        id="mc-embedded-subscribe">
      </btn>
    </div>

    <!-- anti-bot signups-->
    <div style="position: absolute; left: -5000px;">
      <input type="text" name="b_89d5a312be95ee3f0c9cf7ecd_4af1217bca" tabindex="-1" value="">
    </div>
  </form>
</template>

<script>
import Field from "@nylira/vue-field"
import Btn from "@nylira/vue-button"
export default {
  name: "form-email-signup",
  components: {
    Btn,
    Field
  }
}
</script>

<style lang="stylus">
form.form-email-signup
  .input-group
    display flex
    .ni-field
      border-right none
    .ni-btn__container
      border-radius 0 0.25rem 0.25rem 0
</style>
