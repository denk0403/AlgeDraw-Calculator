// @ts-chec
import { peerSocket } from "messaging";
import { settingsStorage } from "settings";
import { data as neighbors } from "./neighbors.js";

/**
 * Represents a path as a sequence of angles, where each angle is an
 * integer between -179 and 180.
 * @typedef {Array<Number>} Path
 */

/**
 * Represents a message to be sent to the Fitbit device.
 * @typedef Message
 * @property {"restoreSetting" | "match"} messageType
 * @property {{key: String, value: String}=} setting
 * @property {String=} value
 */

/**
 * Restores app settings on opening the app.
 */
peerSocket.onopen = () => {
    restoreSettings();
};

/**
 * Detects changes to app settings and updates them on the device.
 */
settingsStorage.onchange = (evt) => {
    let data = {
        messageType: "restoreSetting",
        setting: { key: evt.key, value: evt.newValue },
    };
    sendMessage(data);
};

/**
 * Retrieves previously saved app settings and sends them to the device.
 */
function restoreSettings() {
    for (let index = 0; index < settingsStorage.length; index++) {
        let key = settingsStorage.key(index);
        if (key) {
            let data = {
                messageType: "restoreSetting",
                setting: { key: key, value: settingsStorage.getItem(key) },
            };
            //console.log(data)
            sendMessage(data);
        }
    }
}

/**
 * Sends the given message to the app.
 * @param {Message} data
 */
function sendMessage(data) {
    if (peerSocket.readyState === peerSocket.OPEN) {
        peerSocket.send(data);
    }
}

//////////////////////////
// Nearest-Neighbor Code
//////////////////////////
const ERROR_PERCENT = 0.1; // Permitted error percent from perfect match
const MAX_ERROR_DISTANCE = 4860000; // equal to: max_angle_difference^2 * number_of_points = (180^2 * 150)
const ERROR_THRESHOLD = MAX_ERROR_DISTANCE * ERROR_PERCENT;

/**
 * Returns the element from the given array the minimizes the value
 * of the given function.
 * @template T
 * @param {Array<T>} array An array of elements
 * @param {(element: T) => Number} toValue A function that returns some value
 * @returns {{ minElement: T, minValue: Number }}
 */
function minimize(array, toValue) {
    return array.reduce(
        (partialMin, currentElement) => {
            const { minValue } = partialMin;
            const currentValue = toValue(currentElement);
            if (currentValue < minValue) {
                return { minElement: currentElement, minValue: currentValue };
            }
            return partialMin;
        },
        { minValue: Infinity },
    );
}

/**
 * Finds squared Euclidean distance between two paths.
 * @param {Path} testArr The array of values to test
 * @param {Path} trainArr An array of training data
 */
function distance(testArr, trainArr) {
    return testArr.reduce((partialSum, testNum, index) => {
        const trainNum = trainArr[index];
        const diff = Math.abs(testNum - trainNum);
        return partialSum + Math.pow(Math.min(diff, 360 - diff), 2);
    }, 0);
}

/**
 * Determines the nearest match to a given path from training data.
 * @param {Path} angles
 */
function getClosestNeighbor(angles) {
    const nearestResult = minimize(neighbors, (neighbor) => distance(angles, neighbor.input));
    return nearestResult.minValue < ERROR_THRESHOLD ? nearestResult.minElement.output : "Bad Input"; // enforces 85% match
}

/**
 * Upon receiving a message event with data containing an array angles,
 * the companion sends back a message containing the closest matching value.
 * @param {Event} evt
 */
peerSocket.onmessage = (evt) => {
    if (evt.data.angles) {
        sendMessage({
            messageType: "match",
            value: getClosestNeighbor(evt.data.angles),
        });
    }
};
