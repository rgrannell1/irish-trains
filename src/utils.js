
const nestedProperties = require('nested-property')

const utils = {
  array: {}
}

const isObject = obj => {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

const matchesElem = (filters, elem) => {
  return Object.entries(filters).every(([key, val]) => {
    return nestedProperties.get(elem, key) === val
  })
}

utils.array.filterObj = (obj, array) => {
  return array.filter(matchesElem.bind(null, obj))
}

utils.array.findObj = (obj, array) => {
  return array.find(matchesElem.bind(null, obj))
}

module.exports = utils
