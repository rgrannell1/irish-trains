
const parseXML = require('xml2json')
const request = require('request-promise-native')
const constants = require('./constants')

const api = {}

api.getTrains = async ({status}) => {

  const allowedStatuses = new Set(['running', 'not_running'])

  if (!allowedStatuses.has(status)) {
    throw new Error('invalid status')
  }

  const url = `${constants.sites.irishRail}/${constants.sitePaths.getTrains}`
  const result = await request(url)
  const parsed = JSON.parse(parseXML.toJson(result))

  const unfiltered = parsed.ArrayOfObjTrainPositions.objTrainPositions.map(train => {

    let status = ''
    const searchTime = Date.now()

    if (train.TrainStatus === 'N') {
      status = 'not_running'
    } else if (train.TrainStatus === 'R') {
      status = 'running'
    } else {
      status = train.TrainStatus
    }

    return {
      status,
      code: train.TrainCode,
      position: {
        longitude: train.TrainLongitude,
        latitude: train.TrainLatitude
      },
      searchTime
    }
  })

  return unfiltered.filter(train => {

    let shouldInclude = true

    if (status) {
      shouldInclude = shouldInclude && train.status === status
    }

    return shouldInclude

  })

}
