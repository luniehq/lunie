import { percent } from "../scripts/num.js"

export const percentOrPending = function(value, totalValue, pending) {
  return pending ? `--` : percent(totalValue === 0 ? 0 : value / totalValue)
}
