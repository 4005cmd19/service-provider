# Service provider for live bus information

This is an AWS Lambda function scheduled to run periodically and listen to messages on specific MQTT topics and respond
accordingly.

It uses the [mqtt.js](https://github.com/mqttjs/MQTT.js) library to connect to
our [HiveMQ](https://www.hivemq.com/products/mqtt-cloud-broker/) cloud broker.

## The `handler` function

This function is called by the AWS Lambda service whenever the service is triggered by the AWS EventBridge Scheduler.

The function takes an `event` argument - a JSON object containing configuration parameters. The EventBridge Scheduler
passes this object when triggering the handler function.

Currently, the object contains the following parameters:

```
{
"ttl": 10000,
"debug": true,
"mqtt_connect_timeout": 10000,
"mqtt_host": "61af2c55ce064492b81b2877be486551.s2.eu.hivemq.cloud",
"mqtt_port": 8883,
"mqtt_app_id": <hive-mq-username>,
"mqtt_app_key": <hive-mq-password>,
"mqtt_protocol": "ssl"
}
```

`ttl` - Time, is ms, for Lambda function to run for

`debug` - If true, debug messages are logged to AWS CloudWatch

`mqtt_connect_timeout` - Time, in ms, to wait for MQTT client to connect to broker

`mqtt_host` - MQTT broker address

`mqtt_port` - MQTT broker port

`mqtt_app_id` - HiveMQ username for this app, used to establish connection with broker

`mqtt_app_key` - HiveMQ password for this app, used to establish connection with broker

`mqtt_protocol` - Protocol to use when establishing connection with broker

## Make changes

To make changes to this code clone the `dev` branch using:

`git clone -b dev --single-branch https://github.com/4005cmd19/service-provider.git`

The cloned `event.json` file from GitHub will not have the HiveMQ username and password (for security reasons). These
can be found on our Discord server.

When changes are finalised and working, commit and push to `dev` and create a pull request into `main`.

Make sure to remove any sensitive information from `event.json` before committing changes.

After the pull request is submitted update AWS Lambda with the new code. Only the code needs to be updated, `event.json`
doesn't.

## Test changes

Test new `handler` function behaviour in `index_test.mjs`

## MQTT protocol topics

### `buses/lines/{line_id}`

This topic should return information about the bus line with the given ID in the following format:

```
{
  id: string,
  name: string,
  operators: BusLineOperator[],
  stops: string[],
  routes: string[]
}

// types
BusLineOperator: {
    id: string,
    name: string,
    code: string
}
```

### `buses/lines/{line_id}/routes`

This topic should return all the routes for the given line in the following format:

```
{
    lineId: string,
    routes: BusLineRoute[]
}

// types
BusLineRoute: {
    id: string,
    name: string,
    
    startId: string,
    startName: string,
    
    destinationId: string,
    destinationName: string,
    
    direction: string,
    path: string[]
}
```

### `buses/stops/{stop_id}`

This topic should return information about the given bus stop in the following format:

```
{
    id: string,
    code: string,
    name: string,
    location: LatLngPoint,
    lines: string[]
}

// types
LatLngPoint: {
    lat: number,
    lng: number
}
```

### `buses/stops/{stop_id}/arrivals`

This topic should return bus arrival times for the given bus stop in the following format:

```
{
    stopId: string,
    lineId: string,
    
    destinationId: string,
    destinationName: string,
    
    direction: string,
    
    scheduledTime: number,
    expectedTime: number
}
```

## TFWM API

We can use the TFWM API to get all the bus lines and stops on the TFWM network and publish their information to the MQTT
broker.

The following endpoints are particularly useful:

### `/Line/Mode/{modes}/Route`

Use `/Line/Mode/bus%2Ccoach%2Cbus_or_coach/Route` to get all bus lines and their routes (start, destination, etc.)

### `/Line/{id}/StopPoints`

Use this endpoint to get all the bus stops on a given bus line.

### `/Line/{id}/Route/Sequence/{direction}`

Call this endpoint twice, with direction set to `inbound` and `outbound` to get an ordered list of bus stop for each of
the line's routes

```
Pseudocode

busLines := []
busStops := []
busRoutes := []
busArrivals := []

linesResponse := fetch ("/Line/Mode/bus%2Ccoach%2Cbus_or_coach/Route") // json object

lines := linesResponse.ArrayOfLines.Line // json array
lines.forEach (line) {
    operatorsArray := []

    operators := line.Operators.Operator // json array
    operators.forEach (operator) {
        operatorsArray.add ({
            id := operator.Id,
            name := operator.Name,
            code := operator.Code
        })
    }
    
    routes := line.RouteSections.MatchedRoute // json array
    routeIds := []
    routeObjects := []
    
    routes.forEach (route) {
        routeIds.add(route.RouteCode)
    
        routeObjects.add({
            id := route.RouteCode,
            name := route.Name,
            startId := route.Originator,
            startName := route.OriginationName,
            destinationId := route.Destination,
            destinationName := route.DestinationName,
            direction := route.Direction,
            path := [] // fill later
        })
    }
    
    busRoutes.add({
        lineId := line.Id,
        routes := routeObjects
    })
    
    busLines.add({
        id := line.Id,
        name := line.Name,
        operators := operators,
        stops := [] // fill later,
        routes := routeIds
    })
}

for (line in busLines) {
    stopsResponse := fetch("/Line/${line.id}/StopPoints")
    
    val stops := stopsResponse.ArrayOfStopPoint.StopPoint // json array
    stops.forEach (stop) {
        busStops.add({
            id := stop.Id,
            code := stop.HubNaptanCode,
            name := stop.CommonName,
            
            location := {
                lat := stop.Lat,
                lng := stop.Lon
            },
            
            lines := [] // fill later
        })
    }
    
    for (busStop in busStops) {
        busStop.lines.add(line.id)
        line.stops.add (busStop.id)
    }
    
    inboundResponse := fetch("/Line/${line.id}/Route/Sequence/inbound")
    outboundResponse := fetch("/Line/${line.id}/Route/Sequence/outbound")
    
    inboundPath := inboundResponse.RouteSequence.OrderedLineRoutes.OrderedRoute
    outboundPath := outboundResponse.RouteSequence.OrderedLineRoutes.OrderedRoute
    
    inboundPath.forEach (r) {
        _id := r.RouteId
        _name := r.Name
        codes := r.NaptanIds.string
        
        // add to route
        
        route := busRoutes.find { busRoute -> busRoute.name == _name }
        
        if (route != null) {
            route.path.addAll(codes)
        }
    }
    
    outboundPath.forEach (r) {
        _id := r.RouteId
        _name := r.Name
        codes := r.NaptanIds.string
        
        // add to route
        
        route := busRoutes.find { busRoute -> busRoute.name == _name }
        
        if (route != null) {
            route.path.addAll(codes)
        }
    }
}

for (line of busLines) {
    MqttClient.publish ("buses/lines/{line.id}", Json.stringify(line))
    
    for (route of busRoutes) {
        MqttClient.publish ("buses/lines/{route.lineId}/routes", Json.stringify(route))
    }
}

for (stop of busStops) {
    MqttClient.publish ("buses/stops/{stop.id}", Json.stringify(stop))
}

```

#### Cost of this algorithm
The TFWM API has a daily 10000 hit limit. The call to `/Line/Mode/bus%2Ccoach%2Cbus_or_coach/Route` returns around 420 bus lines.
This results in around 420 calls to the `/Line/${line_id}/StopPoints` endpoint. Then there are two sets of around 420 calls to the `/Line/${line_id}/Route/Sequence/{direction}` endpoint

This totals around 1261 API calls, meaning if this process is done every time the Lambda function is triggered. This means that the API hit limit would be reached
after about 8 times the function is triggered.

However, bus line and stop information is unlikely to change during the course of a day so this process could only be run once per day.
This would be often enough to account for things like stop closures or bus line changes.

## GTFS Realtime
Since there are about 420 lines, using the TFWM API for bus arrival times often would be impossible.
This would require 420 calls to the `/Line/{line_id}/Arrivals` endpoint every 30s for the data to be up-to-date.

For this, we can use the [General Transit Feed Specification Realtime API](https://gtfs.org/realtime/language-bindings/nodejs/).

### Limits

Keep in mind the following limits for the HiveMQ cloud broker:

- Max message size: 268,435,456 bytes