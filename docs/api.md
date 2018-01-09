
# IrishRail

*Table of contents*

- Overview
- Requests
  * api.getTrains( )

### Class: TrainStatus

Object summarising the status of a particular train.

```
class TrainStatus {
  status <string>
  code <string>
  position: {
    longitude <number>
    latitude <number>
  }
  searchTime <number>
}
```

#### api.getTrains()

- `options`: <Object>
  - `status` <string> if included, filter a train's status. Statuses include `running` and `not_running`.
  - `code` <string> if included, filter by a train's code. This is a unique identifier for a train.
  - `format` <string> the result format. Options are `raw` or `geojson`.
- returns: <Promise<Array<TrainStatus>>>
 
 #### api.getTrainLocations()
 
 - `options`: <Object>
   - `code` <string> the id of a train. Either running or not_running. Required.
   - `date` <string> the date you want results for. Required.
 - returns: <Promise<Array<TrainLocation>>
