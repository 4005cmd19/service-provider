import mqtt from 'mqtt';
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import fetch from 'node-fetch';


// TODO: Need to hide the URL and bearer token once code is working
export async function fetchTfwmData(url){
    const response = await fetch(url, {
    headers: { 
         'Authorization' : 'Bearer ab6050821a1b294ce61fd8a010815456'
        }
    });
    return response.json();
}

    // error: throwing invalid url 
    async function fetchGTFSData(){
        const gtfsRealtimeUrl = 'http://api.tfwm.org.uk/gtfs/tfwm_gtfs.zip?app_id=bdb89e2f&app_key=ab6050821a1b294ce61fd8a010815456';
        try{
            const response = await fetch(gtfsRealtimeUrl, {
                headers: {
                    'x-api=key': '[tfwm_app_id]',
                },
            });

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



    //processedLines.forEach(line => {
   //     client.publish('buses/lines/6ded59e9', JSON.stringify(line));
    //});
