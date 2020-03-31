"use strict"

export const sleep = function(amount) {
  return new Promise(resolve => {
    setTimeout(resolve, amount)
  })
}

export function toMicroDenom(denom) {
  const lookup = {
    ATOM: "uatom",
    MUON: "umuon",
    LUNA: "uluna",
    TREE: "seed",
    NGM: "ungm",
    KRT: "ukrw",
    MNT: "umnt",
    UST: "uusd",
    SDT: "usdr"
  }
  return lookup[denom] ? lookup[denom] : denom.toLowerCase()
}
