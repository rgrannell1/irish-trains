
# Irish Trains

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
- returns: <Promise<Array<TrainStatus>>>
