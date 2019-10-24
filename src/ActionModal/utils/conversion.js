export function toMicroDenom(denom) {
  if (denom === "ATOM") {
    return "uatom"
  }
  return denom.toLowerCase()
}

export function fromMicroDenom(denom) {
  if (denom.toLowerCase() === "uatom") {
    return "ATOM"
  }
  return denom.toUpperCase()
}
