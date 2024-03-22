import {buildConnectionProfile} from './index.mjs';
import {fetchGTFSData, TfwmUrlProvider } from './tfwmFetch.mjs';
import readline from 'readline';
import fs from 'fs/promises';

//using readline library to create a command line to neatly organise for testing
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fetching data from event.json for mqtt to use and login
async function fetchEventData(eventConfig){
    const eventData = await fs.readFile('./event.json', {encoding: 'utf8'});
    return JSON.parse(eventData);
}

//initialise command line
async function init(){
    try{
        const eventConfig = await fetchEventData();
        console.log('Connecting to MQTT broker...');
        await buildConnectionProfile(eventConfig);
        console.log('Connected to MQTT Broker!!!');   
    }
    catch(error){
        console.error('failed to connect to mqtt broker ', error);
    }

    // command line for testing 
    rl.on('line', async (input) => {
        switch (input.trim()){
            case 'fetch gtfs':
                console.log('Fetching tfwm GTFS api...');
                const data = await fetchGTFSData();
            break
            case 'fetch stops':
                //fetch parameters from tfwmFetch
                const urlProvider = new TfwmUrlProvider("bdb89e2f", "ab6050821a1b294ce61fd8a010815456");
                console.log('Fetching tfwm bus stops')
                const lineId = urlProvider.linesWithRoutes();
                console.log(lineId)
                const busStops = urlProvider.lineBusStops(lineId);
            break
            default: 
                console.log('unknown command, please try again. ');
        }
    });

    console.log('Type "fetch tfwm" to fetch data for tfwm api');
    
}

init();
