<template lang="pug">
.tm-modal-lcd-approval__wrapper
  .tm-modal-lcd-approval
    .tm-modal-lcd-approval__icon: i.material-icons sync problem
    .tm-modal-lcd-approval__title Node approval required
    .tm-modal-lcd-approval__body
      | Voyager needs to approve the node you're trying to connect to. Please compare the hash below against the hash from a trusted source. If you are 100% sure that the hashes match, click approve to proceed.

      field#node-hash(type="textarea" :value="hash" disabled)

    .tm-modal-lcd-approval__footer

      tm-btn#tm-modal-lcd-approval__btn-approve(
        size="lg"
        icon="check"
        color="primary"
        value="Approve Node"
        @click.native="approve")
      tm-btn#tm-modal-lcd-approval__btn-disapprove(
        size="lg"
        icon="skip_next"
        value="Switch Node"
        @click.native="newNode")
</template>

<script>
import { TmBtn } from "@tendermint/ui"
import Field from "@nylira/vue-field"
export default {
  name: "modal-lcd-approval",
  components: {
    TmBtn,
    Field
  },
  computed: {},
  methods: {
    approve() {
      this.$store.dispatch("approveNodeHash", this.hash)
    },
    newNode() {
      this.$store.dispatch("disapproveNodeHash", this.hash)
    }
  },
  props: ["hash"]
}
</script>

<style lang="stylus">
@import '~variables';

.tm-modal-lcd-approval {
  padding: 1.5rem;
  max-width: 40rem;

  &__wrapper {
    position: absolute;
    top: 0;
    left: 0;
    z-index: z(modalError);
    background: app-bg;
    width: 100vw;
    height: 100vh;
    max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    position: fixed;
    top: 0;
    left: 0;
    z-index: z(below);

    i.material-icons {
      font-size: 25vw + 25vh;
      line-height: 1;
      color: bc-dim;
    }
  }

  &__title {
    font-size: h1;
    font-weight: 500;
    line-height: 1;
    margin-bottom: 1.5rem;
  }

  &__body {
    font-size: lg;
    color: dim;
    margin-bottom: 2.5rem;
  }

  &__footer {
    flex-direction: row;
    justify-content: flex-start;

    .tm-btn {
      width: 100%;
      margin-right: 1.5rem;
      margin-bottom: 1rem;
      max-width: 14rem;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  #node-hash {
    margin-top: 3rem;
  }
}

@media screen and (min-width: 768px) {
  .tm-modal-lcd-approval {
    &__icon i.material-icons {
      font-size: 20vw + 20vh;
    }

    &__footer {
      min-width: 31rem;
    }

    &__footer .tm-btn {
      margin-bottom: 0;
    }
  }
}
</style>
