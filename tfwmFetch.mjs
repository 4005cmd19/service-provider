import mqtt from 'mqtt';
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import fetch from 'node-fetch';

// tfwm url fetch
export class TfwmUrlProvider {
    static URL = "http://api.tfwm.org.uk";

    appId = "bdb89e2f";
    appKey = "ab6050821a1b294ce61fd8a010815456";

    authParams = ""; // the error could be from this

    //error: isn't being passed to the function in main
    constructor(appId, appKey) {
        this.appId = appId;
        this.appKey = appKey;

        console.log(`appId=${this.appId} appKey=${this.appKey}`)

        this.authParams = `?app_id=${this.appId}&app_key=${this.appKey}`;

        console.log(`authParas=${this.authParams}`)
    }

    /**
     * Get all lines and their corresponding bus routes.
     * @returns {string}
     */
    linesWithRoutes() {
        return `${this.URL}/Line/Mode/bus%2Ccoach%2Cbus_or_coach/Route${this.authParams}`
    }

    /**
     * Get all bus stops on a given line.
     * @param lineId
     * @returns {string}
     */
    lineBusStops(lineId) {
        return `${this.URL}/Line/${lineId}/StopPoints${this.authParams}`
    }

    // direction -> "outbound" or "inbound"
    /**
     * Get ordered list of stops for each route in a given line.
     * @param lineId
     * @param direction - 'inbound' or 'outbound'
     * @returns {string}
     */
    lineRouteStopSequence(lineId, direction) {
        return `${this.URL}/Line/${lineId}/Route/Sequence/${direction}${this.authParams}`
    }
}

    // function to fetch GTFS tfwm data
    export async function fetchGTFSData(){
        const gtfsRealtimeUrl = 'http://api.tfwm.org.uk/gtfs/trip_updates?app_id=bdb89e2f&app_key=ab6050821a1b294ce61fd8a010815456';
        try{
            const response = await fetch(gtfsRealtimeUrl,);

        if(!response.ok) throw new Error('Failed to fetch GTFS data');

        const buffer = await response.arrayBuffer();
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer))

        feed.entity.forEach(entity =>{
            if (entity.tripUpdate){
                console.log(entity.tripUpdate);
            }
        });
        } catch(error){
            console.error('Error fetching GTFS data ', error);
        }
}