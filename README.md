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

When changes are finalised and working, create a pull request into `main`.

Make sure that the event object contains all the parameters that the function needs.

After the pull request is approved I will update AWS Lambda and EventBridge with the new code.

## Test changes
Test new `handler` function behaviour in `index_test.mjs`