
// A list of colors that will be used for the event background and border colors. These are
// chosen such that they show well with black text on top.
let userBackgroundColors = {}

const backgroundColors = [
    "Aquamarine",
    "Azure",
    "Chocolate",
    "PaleTurquoise",
    "Plum",
    "Salmon",
    "Coral",
    "CornflowerBlue",
    "DarkKhaki",
    "GoldenRod",
    "IndianRed",
    "LightSeaGreen",
    "LightGreen",
    "LightSteelBlue",
    "LightSlateGray",
    "MediumPurple",
    "Moccasin",
    "PaleVioletRed",
    "Turquoise",
    "Thistle",
    "Tan",
    "LightBlue",
    "LightCyan",
    "LightPink",
    "LightSalmon",
    "Linen",
    "Orange",
    "Orchid",
    "PowderBlue",
    "RosyBrown",
    "YellowGreen",
    '#69DDFF',
    '#96CDFF',
    '#D8E1FF',
    '#DBBADD',
    '#99EDCC',
    '#EBF5EE',
    '#FBBE7C',
    '#FF8F8F',
    '#F9B9B7',
    '#9BFCFF'
]

// A list of colors for the border. Darker than the background colors.
const borderColors = [
    '#0B273E',
    '#2F3330',
    '#000000',
    '#BFACAA',
    '#0A2398',
    '#6B0E13',
    '#147900',
    '#020924',
    '#212422',
    '#8B7877',
    '#6B0E13',
    '#52070A',
    '#0E5C00',
]

function getHash (str) {
    var hash = 0;
    if (str == null || str.length == 0) return hash;
    else {
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            hash = ((hash<<5)-hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
}

/**
 * Returns a CSS color from the string.
 * @param string A string
 */
function getColor(string, colors) {
    const hashCode = getHash(string);
    const index = Math.abs(hashCode % colors.length);
    return colors[index];
}

/**
 * Returns an appropriate background color based on the given string.
 * @param {string} string 
 */
export function getBackgroundColor(string) {
    string = string.replace(/\s/g, "");
    if (string in userBackgroundColors) {
        return userBackgroundColors[string];
    }
    return getColor(string, backgroundColors);
}

/**
 * Returns an appropriate border color based on the given string.
 * @param {string} string 
 */
export function getBorderColor(string) {
    return getColor(string, borderColors);
}

/**
 * Stores a background color identified by the given string.
 * @param {string} string 
 * @param {string} color
 */
export function setBackgroundColor(string, color) {
    userBackgroundColors[string] = color;
}