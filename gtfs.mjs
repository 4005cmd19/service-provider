import fetch from "node-fetch"
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

async function main () {
    const url = 'http://api.tfwm.org.uk/gtfs/trip_updates?app_id=bdb89e2f&app_key=ab6050821a1b294ce61fd8a010815456'

    let response = await fetch(url)

    if (!response.ok) {
        console.error(`response !ok - ${response.status}`)
        return
    }

    let buffer = await response.arrayBuffer()

    let feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(buffer)
    )

    feed.entity.forEach((entity) => {
        if (entity.tripUpdate !== undefined) {
            console.log(entity.tripUpdate)
        }
    })

    let count  = feed.entity.length

    console.log(`entities - count=${count}`)
}

main()