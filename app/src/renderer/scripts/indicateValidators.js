import { orderBy } from "lodash"

export default function(delegates, maxValidators) {
  return orderBy(delegates, "shares", "desc")
    .slice(0, maxValidators)
    .map(d => {
      d.isValidator = true
      return d
    })
}
