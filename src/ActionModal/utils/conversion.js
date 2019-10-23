export function toMicroDenom(denom) {
  if (denom === "ATOM") {
    return "uatom"
  }
  return denom.toLowerCase()
}
