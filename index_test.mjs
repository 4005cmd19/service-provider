/**
 * Use this file to test changes
 */

import {handler} from "./index.mjs";
import event from "./event.json" assert {type: "json"}

console.log(handler(event).then(it => console.log(`it - ${JSON.stringify(it, null, 2)}`)))