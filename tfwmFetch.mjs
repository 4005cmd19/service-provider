import mqtt from 'mqtt';
import fetch from 'node-fetch';



export async function fetchTfwmData(url){
    const response = await fetch(url);
    headers: { 
         'Authorization: Bearer ab6050821a1b294ce61fd8a010815456'
    }
    
    publishBusLines();
    return response.json
}

//need to put in api end point
async function publishBusLines(){
    const tfwmEndPoint = 'http://api.tfwm.org.uk/gtfs/tfwm_gtfs.zip?app_id=bdb89e2f&app_key=ab6050821a1b294ce61fd8a010815456';
    const linesPrint = await fetchData(tfwmEndPoint);
    const fetchLines = linesPrint(line => ({
    id: line.id,
    name: line.name,
    operators: line.operators.map(operator =>({
        id: operator.id,
        name: operator.name,
        code: operator.code
    })),
    stop: [],
    routes: []

    }))

    processedLines.forEach(line => {
        client.publish('buses/lines/6ded59e9', JSON.stringify(line));
    });
}
