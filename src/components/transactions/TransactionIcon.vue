<template>
  <div class="tx__icon">
    <img :class="transactionGroup" :src="icon" :alt="transactionType" />
  </div>
</template>

<script>
export default {
  name: `transaction-icon`,
  props: {
    transactionGroup: {
      type: String,
      required: true
    },
    transactionType: {
      type: String,
      required: true
    }
  },
  computed: {
    icon() {
      if (this.transactionType === `Sent`) {
        return `/img/icons/activity/Sent.svg`
      } else if (this.transactionType === `Received`) {
        return `/img/icons/activity/Received.svg`
      } else if (this.transactionType === `Staked`) {
        return `/img/icons/activity/Staked.svg`
      } else if (this.transactionType === `Restaked`) {
        return `/img/icons/activity/Restaked.svg`
      } else if (this.transactionType === `Unstaked`) {
        return `/img/icons/activity/Unstaked.svg`
      } else if (this.transactionType.search(`Withdrawal`) === 0) {
        return `/img/icons/activity/Withdrawal.svg`
      } else if (this.transactionType === `Update withdraw address`) {
        return `/img/icons/activity/Withdrawal.svg`
      } else if (this.transactionType.search(`Voted`) === 0) {
        return `/img/icons/activity/Voted.svg`
      } else if (this.transactionType === `Deposit`) {
        return `/img/icons/activity/Deposit.svg`
      } else if (this.transactionType.search(`Submitted`) === 0) {
        // MISSING ICON!
        return `/img/icons/activity/Submitted.svg`
      } else if (this.transactionType === `Create validator`) {
        // MISSING ICON!
        return `/img/icons/activity/Create.svg`
      } else if (this.transactionType === `Edit validator`) {
        // MISSING ICON!
        return `/img/icons/activity/Edit.svg`
      } else if (this.transactionType.search(`Unjail`) === 0) {
        // MISSING ICON!
        return `/img/icons/activity/Unjail.svg`
      } else {
        return ``
      }
    }
  }
}
</script>

<style>
@import "../../styles/variables.css";

.tx__icon {
  padding: 1rem 0 1rem 1rem;
}

.tx__icon img {
  max-height: 100%;
  max-width: 52px;
  border-radius: 50%;
  border: 2px solid;
  display: block;
  border-color: grey;
}

.tx__icon img.banking {
  border-color: var(--tx-banking);
}

.tx__icon img.staking {
  border-color: var(--tx-staking);
}

.tx__icon img.governance {
  border-color: var(--tx-governance);
}

.tx__icon img.distribution {
  border-color: var(--tx-distribution);
}
</style>
