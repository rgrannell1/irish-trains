
const parseXML = require('xml2json')
const request = require('request-promise-native')
const constants = require('./constants')


Object.matches = (target, filter) => {
  return Object.entries(filter).every(([key, val]) => {
    if (typeof val === 'undefined') {
      return true
    }
    if (typeof val === 'object' && val !== null) {
      return Object.matches(target[key], val)
    } else {
      return target[key] === val
    }
  })
}


const api = {geoJSON: {}}

const irishRailRequest = (path, params = {}) => {
  return request({
    uri: `${constants.sites.irishRail}/${path}`,
    qs: Object.assign({}, params)
  })
  .then(result => {
    return JSON.parse(parseXML.toJson(result))
  })
}

/**
 * list the status and position of IrishRail trains
 *
 * @param  {object} config
 * @param  {string} config.status the status of a train. Either running or not_running. Optional.
 * @param  {string} config.code the code of a train. Optional.
 *
 *  @return {Promise} a result promise yielding a list of results.
 */
api.getTrains = async ({status, code, format = 'raw'}) => {

  const allowedStatuses = new Set(['running', 'not_running'])

  if (status && !allowedStatuses.has(status)) {
    throw new Error('invalid status')
  }

  const response = await irishRailRequest('realtime/realtime.asmx/getCurrentTrainsXML')
  const unfiltered = response.ArrayOfObjTrainPositions.objTrainPositions.map(train => {

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
      location: {
        longitude: train.TrainLongitude,
        latitude: train.TrainLatitude
      },
      searchTime
    }
  })

  const filtered = unfiltered.filter(train => Object.matches(train, {status, code}))

  if (format === 'raw') {
    return filtered
  } else if (format === 'geojson') {
    const features = filtered.map(data => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [data.location.longitude, data.location.latitude]
        },
        properties: {
          name: data.code
        }
      }
    })

    return {type: 'FeatureCollection', features}
  }
}

/**
 * list all recorded positions for an irish-rail train on a given date.
 *
 * @param  {object} config
 * @param  {string} config.code the id of a train. Either running or not_running. Required.
 * @param  {string} config.date the date you want results for. Required.
 *
 *  @return {Promise} a result promise yielding a list of results.
 */
api.getTrainLocations = async ({code, date}) => {
  const response = await irishRailRequest('realtime/realtime.asmx/getTrainMovementsXML', {
    TrainId: code,
    TrainDate: date
  })

  const unfiltered = response.ArrayOfObjTrainMovements.objTrainMovements.map(movement => {
    let locationType = ''

    if (movement.LocationType === 'O') {
      locationType = 'origin'
    } else if (movement.LocationType === 'S') {
      locationType = 'stop'
    } else if (movement.LocationType === 'T') {
      locationType = 'timing-point'
    } else if (movement.LocationType === 'D') {
      locationType = 'destination'
    }

    return {
      code: movement.TrainCode,
      date: movement.TrainDate,
      terminii: {
        from: movement.TrainOrigin,
        to: movement.TrainDestination
      },
      schedule: {
        arrival: movement.ScheduledArrival,
        departure: movement.ScheduledDeparture
      },
      expected: {
        arrival: movement.ExpectedArrival,
        departure: movement.ExpectedDeparture
      },
      location: {
        code: movement.LocationCode,
        name: movement.LocationFullName,
        type: locationType
      }
    }
  })

  return unfiltered
}

/**
 *
 */
api.getStations = async ({format = 'raw'}) => {
  const response = await irishRailRequest('realtime/realtime.asmx/getAllStationsXML', {})

  const unfiltered = response.ArrayOfObjStation.objStation.map(station => {
    return {
      name: station.StationDesc,
      code: station.StationCode,
      location: {
        latitude: station.StationLatitude,
        longitude: station.StationLongitude,
      }
    }
  })

  if (format === 'raw') {
    return unfiltered
  } else if (format === 'geojson') {
    const features = unfiltered.map(data => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [data.location.longitude, data.location.latitude]
        },
        properties: {
          name: data.code
        }
      }
    })

    return {type: 'FeatureCollection', features}
  }

  return unfiltered
}

module.exports = api
api.getStations({format: 'geojson'})
.then(x => {
  console.log(JSON.stringify(x))
})