/**
 * Use this file to test changes
 */

import {handler} from "./index.mjs";
import event from "./event.json" with {type: "json"}

// typical test event
// const testEvent = {
//     ttl: 10000,
//     debug: true,
//     mqtt_connect_timeout: 10000,
//     mqtt_host: "61af2c55ce064492b81b2877be486551.s2.eu.hivemq.cloud",
//     mqtt_port: 8883,
//     mqtt_app_id: "mqtt-4005-main",
//     mqtt_app_key: "MQTT-4005-connect",
//     mqtt_protocol: "ssl"
// }


console.log(handler(event).then(it => console.log(`it - ${JSON.stringify(it, null, 2)}`)))