// This will take an object and for each (k,v) will return
// v rounded such that the sum of all v is 100.

// Used the following as a reference:
// https://stackoverflow.com/questions/13483430/how-to-make-rounded-percentages-add-up-to-100
// Note: We pass an object, and want to keep the (key, value) association.

export const roundObjectPercentages = dataMap => {
  // This algorithm workson integers and we want 2 decimal places.
  // So round up first.
  const scale = 100
  let asArray = Object.entries(dataMap).map(([key, value]) => {
    return [key, value * scale]
  })

  const sumRounded = (acc, x) => {
    return acc + Math.round(x[1])
  }

  // The leftOver is the difference beween 100 and
  // the sum of the rounded values.
  var leftOver = scale * 100 - asArray.reduce(sumRounded, 0)

  //
  const cmpNumberValue = (a, b) => {
    return b[1] - Math.round(a[1]) - a[1]
  }

  // Here we distribute the leftOver as evenly as possible amongst the rounded values.
  // The values are sorted first.
  asArray.sort(cmpNumberValue)
  const result = asArray.map(function(x, i) {
    // Note: leftOver can be negative.
    const rounded = [
      x[0],
      (Math.round(x[1]) + (leftOver > i) - (i >= asArray.length + leftOver)) /
        100.0
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
