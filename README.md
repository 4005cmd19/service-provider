# Service provider for live bus information

This is an AWS Lambda function scheduled to run periodically and listen to messages on specific MQTT topics and respond accordingly.

It uses the [mqtt.js](https://github.com/mqttjs/MQTT.js) library to connect to our [HiveMQ]() broker.

## 