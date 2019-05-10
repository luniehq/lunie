// This will take an object and for each (k,v) will return
// v rounded such that the sum of all v is 100.
export const roundObjectPercentages = dataMap => {
  // This algorithm workson integers and we want 2 decimal places.
  // So round up first.
  let asArray = Object.entries(dataMap).map(([key, value]) => {
    const newValue = value * 100
    return [key, newValue]
  })

  const sumRounded = (acc, x) => {
    return acc + Math.round(x[1])
  }

  // Calculate difference from 100%
  const scale = 100
  var margin = scale * 100 - asArray.reduce(sumRounded, 0)

  const cmpNumberValue = (a, b) => {
    return b[1] - Math.round(a[1]) - a[1]
  }

  // Sort and distribute difference amongst values
  asArray.sort(cmpNumberValue)
  const result = asArray.map(function(x, i) {
    const rounded = [
      x[0],
      (Math.round(x[1]) + (margin > i) - (i >= asArray.length + margin)) / 100.0
    ]
    return rounded
  })

  // Turn the array back into the original data structure layout
  const resultObject = {}
  result.forEach(x => {
    resultObject[x[0]] = x[1]
  })

  return resultObject
}
