import * as messaging from "messaging";
import {data} from "./neighbors.js"
import { settingsStorage } from "settings";
import { me } from "companion";

// Message socket opens
messaging.peerSocket.onopen = () => {
  restoreSettings();
};

// A user changes settings
settingsStorage.onchange = evt => {
  let data = {
    messageType: "restoreSetting",
    setting: {key: evt.key, value: evt.newValue}
  };
  restoreSetting(data);
};

// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key) {
      let data = {
        messageType: "restoreSetting",
        setting: {key: key, value: settingsStorage.getItem(key)}
      };
      //console.log(data)
      restoreSetting(data);
    }
  }
}

// Send data to device using Messaging API
function restoreSetting(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

//////////////////////////
// Nearest-Neighbor Code
//////////////////////////
const PERCENT_MATCH = 0.1;

// given an array and a function which takes in a value from the array,
// returns the element which minimizes the value of the function
function minArgs(arr, toVal) {
  let bestMatch = undefined;
  let val = arr.reduce((min, potentialMatch) => {
    let curVal = toVal(potentialMatch);
    if (curVal < min) {
        bestMatch = potentialMatch;
        return curVal;
    }
    return min;
  }, Infinity);
  return {match: bestMatch, value: val};
}

// computes n mod m
function mod(n, m) {
  return ((n % m) + m) % m;
}

// finds distance between two paths
function distance(testArr, trainArr) {
  let sum = 0;
  testArr.forEach((testComp, i) => {
    let testNum = mod(testComp, 360);
    let trainNum = mod(trainArr[i], 360);
    let diff = Math.abs(testNum-trainNum);
    sum += Math.pow(Math.min(diff, 360-diff), 2);
  })
  return sum;
}

// determines the closest match to the user input path from the training data
function getClosestNeighbor(angles) {
  let minObj = minArgs(data, (neighbor) => distance(angles, neighbor.input));
  // console.log(minObj.value);
  return minObj.value < (4860000 * PERCENT_MATCH) ? minObj.match.output : "Bad Input" // enforces 85% match
}

messaging.peerSocket.onmessage = evt => {
  //console.log(printArray(evt.data.angles));
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN && evt.data.angles) {
    messaging.peerSocket.send({messageType: "match", 
                               value: getClosestNeighbor(evt.data.angles)});
  }
};
