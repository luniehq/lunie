<template lang="pug">
.ni-modal-lcd-approval__wrapper
  .ni-modal-lcd-approval
    .ni-modal-lcd-approval__icon: i.material-icons sync problem
    .ni-modal-lcd-approval__title Node approval required
    .ni-modal-lcd-approval__body
      | Voyager needs to approve the connected node. Please check the showing hash against a trusted source. Only approve if you are 100% sure the hash matches.
 
      field#node-hash(type="textarea" :value="hash" disabled)

    .ni-modal-lcd-approval__footer.ni-session-main

      btn#ni-modal-lcd-approval__btn-approve(
        size="lg"
        icon="check"
        color="primary"
        value="Approve Node"
        @click.native="approve")
      btn#ni-modal-lcd-approval__btn-disapprove(
        size="lg"
        icon="skip_next"
        value="Switch Node"
        @click.native="newNode")
</template>

<script>
import Btn from "@nylira/vue-button";
import FormGroup from "common/NiFormGroup";
import Field from "@nylira/vue-field";
export default {
  name: "modal-lcd-approval",
  components: {
    Btn,
    FormGroup,
    Field
  },
  computed: {},
  methods: {
    approve() {
      this.$store.dispatch("approveNodeHash", this.hash);
    },
    newNode() {
      this.$store.dispatch("disapproveNodeHash", this.hash);
    }
  },
  props: ["hash"]
};
</script>

<style lang="stylus">
@import '~variables';

.ni-modal-lcd-approval {
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
    margin-bottom: 3rem;
  }

  &__footer {
    .ni-btn {
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
  .ni-modal-lcd-approval {
    &__icon i.material-icons {
      font-size: 20vw + 20vh;
    }

    &__body {
      margin-bottom: 4.5rem;
    }

    &__footer {
      min-width: 31rem;
      flex-direction: row;
    }

    &__footer .ni-btn {
      margin-bottom: 0;
    }
  }
}
</style>
