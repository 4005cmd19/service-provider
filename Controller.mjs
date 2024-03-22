import {buildConnectionProfile} from './index.mjs';
import {fetchGTFSData, fetchTfwmData} from './tfwmFetch.mjs';
import readline from 'readline';
import fs from 'fs/promises';

/*
    This is to be run once a day to check 
    
    /routes
*/



export const handler = async (event) => {
    
    // TODO: Need to hide the URL and bearer token once code is working
    async function fetchTfwmData(url){
        const response = await fetch(url, {
        headers: { 
         'Authorization' : 'Bearer ab6050821a1b294ce61fd8a010815456'
        }
        });
    return response.json();
}
    
};