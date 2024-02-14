# Service provider for live bus information

This is an AWS Lambda function scheduled to run periodically and listen to messages on specific MQTT topics and respond accordingly.

It uses the [mqtt.js](https://github.com/mqttjs/MQTT.js) library to connect to our [HiveMQ](https://www.hivemq.com/products/mqtt-cloud-broker/) cloud broker.

## The `handler` function
This function is called by the AWS Lambda service whenever the service is triggered by the AWS EventBridge Scheduler.

The function takes an `event` argument - a JSON object containing configuration parameters. The EventBridge Scheduler passes this object when triggering the handler function.

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

The cloned `event.json` file from GitHub will not have the HiveMQ username and password (for security reasons). These can be found on our Discord server.

When changes are finalised and working, commit and push to `dev` and create a pull request into `main`.

Make sure to remove any sensitive information from `event.json` before committing changes.

After the pull request is submitted update AWS Lambda with the new code. Only the code needs to be updated, `event.json` doesn't.

## Test changes
Test new `handler` function behaviour in `index_test.mjs`

## TFWM API
From testing, I figured out that only 8 `StopTypes` are tagged with `bus_or_coach` as the transport mode:

`NaptanFlexibleZone`
`NaptanHailAndRideSection`
`NaptanCoachAccessArea`
`NaptanMarkedPoint`
`NaptanCoachEntrance`
`NaptanCoachVariableBay`
`NaptanCoachBay`
`NaptanUnmarkedPoint`

This means that we might not have to call the API with all 34 stop types.

We can create a 'validity check' function to reliably get nearby bus stops:

```
Pseudocode

fun getValidStops(){
    validStops := []

    stopTypes := <array_of_stop_types_as_strings>

    for (stopType in stopTypes) {
        response := fetch(stopType)
        stops := response.stop_array
        
        for (stop in stops):
            // if were only using the 8 stop types
            // no need to check for transport mode
            if (stop.transport_mode == "bus_or_coach" && stop.lines_array.length > 0):
                validStops.add(stop)
            }
        }
    }
    
    return validStops
}
```

Each of the stops returned by the API has a `Lines` attribute that contains all the lines serviced by this stop, and a `Modes` tag that specifies the transport mode that this stop services, e.g. `bus_or_coach`, `rail`, etc.

The validity function checks if the transport mode is `bus_or_coach` and that the `Lines` attribute isn't empty, i.e. the bus stop services at least one bus or coach line.

From this point on, the `/Lines/*` endpoints can be used to get arrival, route and route path information.

## MQTT protocol topics 
_!! unfinished_
### `buses/routes`

_!! maybe use `buses/routes/{city}`_

Topic used to get nearby bus routes, including path points to plot on map.

Endpoints used:
- `/StopPoint` - Get nearby stops and lines
- `/Line/{line_id}/StopPoints` - Get all stops for all the lines
- `/Line/{line_id}/Route` - Get routes (line destinations)
- `/Line/{line_id}/Route/Sequence/{direction}` - Get path points to plot bus route on map

Payload JSON format:

```
{
    requestedLocation: LatLngRect, // last requested location
    returnedLocation: LatLngRect, // location for which results are 
    stops: BusStop[],
}

// types

LatLngPoint: {
    lat: number,
    lng: number
}

LatLngRect: {
    southwest: LatLngPoint,
    northeast: LatLngPoint
}

BusStop: {
    id: string,
    display_name: string,
    location: LatLngPoint,
    lines: BusLine[]
}

BusLine: {
    id: string,
    display_name: string,
    stops: {
        inbound: BusStop[],
        outbound: BusStop[]
    }
}
```

-`requestedLocation` - Last requested location for nearby buses

-`returnedLocation` - Last location for which nearby buses were returned

### `buses/arrivals/{line_id}/{stop_point_id}`

Endpoints used `/Line/{line_id}/Arrivals/{stop_point_id}`

Message JSON format:
```
{
    line_id: string,
    stop_id: string,
}
```

### Limits
Keep in mind the following limits for the HiveMQ cloud broker:

- Max message size: 268,435,456 bytes