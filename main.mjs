import {buildConnectionProfile} from './index.mjs';
import {fetchGTFSData, fetchTfwmData} from './tfwmFetch.mjs';
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

    // command line for testing. Expand this with the google api 
    rl.on('line', async (input) => {
        switch (input.trim()){
            case 'fetch tfwm':
                console.log('Fetching tfwm api...')
                const data = await fetchGTFSData();
        
            default: 
                console.log('unknown command, please try again. ');
        }
    });

    console.log('Type "fetch tfwm" to fetch data for tfwm api');
    
}

init();

