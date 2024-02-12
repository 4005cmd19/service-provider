import mqtt from "mqtt";

// !! Uses the mqtt.js library to connect to hivemq broker

/**
 * Build an object that contains all the connection params required by this app.
 * Passed into mqtt.connectAsync()
 */
function buildConnectionProfile(event) {
    return {
        host: event.mqtt_host,
        port: event.mqtt_port,
        username: event.mqtt_app_id,
        password: event.mqtt_app_key,
        protocol: event.mqtt_protocol,
        connectTimeout: event.mqtt_connect_timeout
    }
}


/**
 * Handler function required by AWS Lambda
 * When the Lambda function is triggered, this is the function that runs
 * 
 * @param event JSON object passed by the EvenBridge scheduler when triggering the function, contains connection configuration params
 */
export const handler = async (event) => {
    function runFor(timeMillis, cleanup) {
        setTimeout(() => {
            // disconnect the mqtt client
            client.end()

            console.warn(`execution finished - disconnecting`)

            // run the cleanup function
            cleanup()
        }, timeMillis)
    }

    // log start of function - for debuggung purposes
    console.log(`triggered - @${Date.now()} event=${JSON.stringify(event, null, 2)}`)

    let connectionProfile = buildConnectionProfile(event)
    console.log(`connecting - profile=${JSON.stringify(connectionProfile, null, 2)}`)

    // start a timeout timer before attempting to connect
    let connectionTimeout = setTimeout(() => {
        if (!client.connected) {
            throw new Error(`connection attempt timed-out - timeout=${event.mqtt_connect_timeout} @${Date.now()}`)
        }
    }, event.mqtt_connect_timeout)

    // try connect
    let client = await mqtt.connectAsync(connectionProfile)
    
    // connected before timer ran out - remove timer
    clearTimeout(connectionTimeout)

    console.log(`client - isConnected=${client.connected}`)


    // subscribe to topics
    await client.subscribeAsync("test/hello/#")

    // subscribe callback
    client.on("message", (topic, message, packet) => {
        console.info(`message - topic=${topic} message=${message.length === 0 ? "CLEAR" : message}`)
        
        
    })

    // ensure Lambda function runs long enough to listen to changes in subscribed topics
    await new Promise((resolve, reject) => runFor(event.ttl, resolve))

    // return success
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda :)'),
    };
    return response;
};