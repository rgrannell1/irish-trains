
const parseXML = require('xml2json')
const request = require('request-promise-native')
const constants = require('./constants')

const api = {}

/**
 * list the status and position of IrishRail trains
 *
 * @param  {object} config
 * @param  {string} config.status the status of a train. Either running or not_running. Optional.
 * @param  {string} config.code the code of a train. Optional.
 *
 *  @return {Promise} a result promise yielding a list of results.
 */
api.getTrains = async ({status, code}) => {

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

    if (code) {
      shouldInclude = shouldInclude && train.code === code
    }

    return shouldInclude

  })

}
