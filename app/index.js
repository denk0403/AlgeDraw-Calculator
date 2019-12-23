//////////////////////////
// Calculator Code
//////////////////////////
import document from "document";
import * as messaging from "messaging";
import { vibration } from "haptics";

let numbers = document.getElementsByClassName("number");
let binOps = document.getElementsByClassName("binary operation");
let unOps = document.getElementsByClassName("unary operation");
let operations = document.getElementById("operations");
let opsBtn = document.getElementById("opsBtn");
let inputPanel = document.getElementById("input-output");
let answer = document.getElementById("answer");
let equal = document.getElementById("equal");
let clear = document.getElementById("clear");
let decimal = document.getElementById("decimal");
let VTStack = document.getElementById("stack");
let stackBtn = document.getElementById("stackBtn");
let stackView = document.getElementById("stack-view");
let backBtn = document.getElementById("back_button");
let approximate = document.getElementById("approximate");
let prev = document.getElementById("prev");
let plusMinus = document.getElementById("plus-minus");
let connectPhone = document.getElementById("connect-phone");

let stored = "0"; // for binary operations
let operation = null;
let clearNext = true;
let broken = false;
let decimalSet = false;
let clearBtnColor = "fb-red";
let waitClear = null;
let stack = new Array();
let localStack = new Array(); // loaded memory
let vibrationEnabled = false;

function resetLocalStack() {
  localStack = new Array();
}

function isApproximate() {
  let num1 = parseFloat(stored);
  let num2 = parseFloat(answer.text);
  let bool1 = num1 < -9007199254740991 || num1 > 9007199254740991;
  let bool2 = num2 < -9007199254740991 || num2 > 9007199254740991;
  return bool1 || bool2;
}

function checkApproximate() {
  approximate.style.visibility = isApproximate() ? "visible" : "hidden";
}

function store(numStr) {
  if (!broken) {
    if (numStr != "0") {
      clear.text = "C"
    }
    prev.text = `Prev: ${truncate(numStr)}`
    stored = numStr;
    checkApproximate();
  } else {
    vibrationEnabled && vibration.start("nudge");
  }
  return !broken;
}

function load(numStr, save, nextClear) {
  if (numStr === "Infinity") {
    setToBroken();
  }
  let success = setAnswer(numStr, save, nextClear);
  if (success) {
    backBtn.style.display = "inherit";
    decimalSet = (answer.text.indexOf(".") !== -1);
    checkApproximate();
    clearOperatorLook();
  }
}

function appendDigit(numStr, nextClear) {
  if (answer.text.length > 18) {
    vibrationEnabled && vibration.start("nudge");
  } else {
    load(answer.text + numStr, true, nextClear);
  }
}

function resetToZero() {
  resetLocalStack();
  load("0", false, true);
  decimalSet = false;
  clear.text = "AC";
  backBtn.style.display = "inherit";
}

function setAnswer(numStr, save, nextClear) {
  if (!broken) {
    if (numStr != "0") {
      clear.text = "C"
      let length = localStack.length;
      if (save && (length === 0 || (length > 0 && localStack[length-1] !== answer.text))) {
        localStack.push(answer.text);
      }
    }
    clearNext = nextClear;
    answer.text = numStr;
  } else {
    vibrationEnabled && vibration.start("nudge");
  }
  // console.log(localStack);
  return !broken;
}

function showOperations() { 
  operations.style.display = "inline";
  operations.animate("enable");
  setTimeout(() => {
    inputPanel.style.display = "none";
  }, 250);
}

function hideOperations() {
  inputPanel.style.display = "inline";
  operations.animate("disable");
  setTimeout(() => {
    operations.style.display = "none";
  }, 250);
}

function showStack() { 
  stackView.style.display = "inline";
  stackView.animate("enable");
  setTimeout(() => {
    operations.style.display = "none";
  }, 250);
}

function hideStack() {
  inputPanel.style.display = "inline";
  stackView.animate("disable");
  setTimeout(() => {
    stackView.style.display = "none";
  }, 250);
}

function addToStack(numStr) {
  if (!broken && parseFloat(numStr) != 0) {
    stack.push(numStr);
    VTStack.length = stack.length;
  }
}

function compute() {
  let operator = operation.id;
  let firstNum = parseFloat(stored);
  let secNum = parseFloat(answer.text);
  
  resetLocalStack();
  if (operator === "plus") {
    load(`${(firstNum + secNum)}`, false, true);
  } else if (operator === "minus") {
    load(`${(firstNum - secNum)}`, false, true);
  } else if (operator === "multiply") {
    load(`${(firstNum * secNum)}`, false, true);
  } else if (operator === "divide") {
    if (secNum === 0) {
      setToBroken();
    } else {
      load(`${(firstNum / secNum)}`, false, true);
    }
  } else if (operator === "exponent") {
    if ((firstNum === 0 && secNum === 0) || (firstNum < 0 && Math.round(secNum) != secNum)) {
      setToBroken();
    } else {
      load(`${Math.pow(firstNum, secNum)}`, false, true);
    }
  } else if (operator === "log") {
    if (firstNum === 0 || secNum === 0) {
      setToBroken();
    } else {
      load(`${(Math.log(secNum) / Math.log(firstNum))}`, false, true);
    }
  }
  backBtn.style.display = "none";
  !broken && addToStack(answer.text);
  selectOperator(null);
  store("0");
}

opsBtn.onclick = function(evt) {
  opsBtn.style.fill = "blue";
  setTimeout(() => {
    opsBtn.style.fill = "gray";
  }, 150);
  showOperations();
}

backBtn.onclick = function(evt) {
  if (localStack.length > 0) {
    let prev = localStack.pop();
    // if (prev === answer.text && localStack.length > 0) {
    //   answer.text = localStack.pop()
    // } else {
      answer.text = prev;
    // }
  }
  if (answer.text == "0") {
    resetToZero();
  }
}

equal.onclick = function(evt) {
  if (!broken && operation) {
    compute();
    equal.style.fill = "blue";
    setTimeout(() => {
      equal.style.fill = "green";
    }, 150);
  }
};

plusMinus.onclick = function(evt) {
  if (answer.text != "0") {
    let num = parseFloat(answer.text);
    setAnswer(`${(0-num)}`, false, false);
  }
  plusMinus.style.fill = "blue";
  setTimeout(() => {
    plusMinus.style.fill = "gray";
  }, 150);
  
}

function clearOperatorLook() {
  if (operation) {
    operation.style.fill = "crimson";
  }
}

function selectOperator(operator) {
  clearOperatorLook();
  operation = operator;
}

binOps.forEach(function(operator) {
  operator.onclick = function(evt) {
    if (!broken) {
      if (!clearNext && operation) {
        compute();
      }
      resetLocalStack();
      selectOperator(operator);
      operator.style.fill = "blue";
      store(answer.text);
      clearNext = true;
      operation = operator;
      hideOperations();
    }
  }
});

unOps.forEach(function(operator) {
  let opId = operator.id;
  operator.onclick = function(evt) {
    if (!broken) {
      let num = parseFloat(answer.text);
      if (opId === "reciprocal") {
        if (num === 0) {
          setToBroken();
        } else {
          load(`${(1 / num)}`, false, true);
        }
      } else if (opId === "factorial") {
        if (num >= 0 && Math.round(num) === num && num < 171) {
          let result = 1;
          while (num > 0) {
            result *= num;
            num = num - 1;
          }
          load(`${result}`, false, true);
        } else {
          setToBroken();
        }    
      } else if (opId === "sin") {
        load(`${Math.sin(num)}`, false, true);     
      } else if (opId === "cos") {
        load(`${Math.cos(num)}`, false, true);    
      } else if (opId === "tan") {
        load(`${Math.tan(num)}`, false, true);     
      } else if (opId === "flip") {
        let temp = stored;
        let success = store(`${answer.text}`);
        if (success) {
          load(`${temp}`, false, true);
        }
      }
      resetLocalStack();
      opId !== "flip" && addToStack(answer.text);
    } else {
      vibrationEnabled && vibration.start("nudge");
    }
    
    backBtn.style.display = "none";
    operator.style.fill = "blue";
    setTimeout(() => {
      operator.style.fill = "darkred";
    }, 150);
    hideOperations();
  }
})

function setClearBtnColor(color) {
  clear.style.fill = color
  clearBtnColor = color
}

function toggleClearBtnColor() {
  if (clearBtnColor === "fb-red") {
    setClearBtnColor("goldenrod");
  } else {
    setClearBtnColor("fb-red");
  }
}

function setToBroken() {
  vibrationEnabled && vibration.start("nudge");
  answer.text = "Error"; 
  broken = true;
  approximate.style.visibility = "hidden"
  clear.text = "AC";
  pointsSVG.forEach(element => {
    element.getElementById("line").style.fill = "fb-red";
  })
  waitClear = setInterval(() => {
    toggleClearBtnColor()
  }, 750);
}

decimal.onclick = function(evt) {
  if (!broken && !decimalSet) {
    if (answer.text.length < 17) {
      appendDigit(".", clearNext);
      decimal.style.fill = "blue";
      setTimeout(() => {
        decimal.style.fill = "gray";
      }, 150);
    }
  }
}

clear.onclick = function(evt) {
  if (clear.text === "AC") {
    broken = false;
    selectOperator(null);
    store("0");
  }
  resetScreen();
  resetToZero();
  clearInterval(waitClear);
  setClearBtnColor("blue");
  setTimeout(() => {
    setClearBtnColor("fb-red");
  }, 150);
}

document.onkeypress = function(evt) {
  let isHome = inputPanel.style.display === "inline";
  if (!isHome && evt.key === "back") {
    evt.preventDefault();
    if (operations.style.display === "inline") {
      hideOperations();
    } else {
      hideStack();
    }
  }
}

stackBtn.onclick = function(evt) {
  showStack();
}

function truncate(str) {
  return str.length > 16 ? `${str.substr(0,13)}...` : str;
}

VTStack.delegate = {
  getTileInfo: function(index) {
    return {
      type: "my-pool",
      value: stack[stack.length - index - 1],
      index: stack.length - index - 1
    };
  },
  configureTile: function(tile, info) {
    if (info.type == "my-pool") {
      tile.getElementById("text").text = truncate(info.value);
      let touch = tile.getElementById("touch-me");
      touch.onclick = evt => {
        if (!broken) {
          if (answer.text != info.value) {
            localStack = localStack.length === 0 ? [0] : localStack;
            load(info.value, !clearNext, clearNext);
          }
          hideStack();
        }
      };
    }
  }
};

VTStack.length = stack.length;

//////////////////////////
// Drawing Code
//////////////////////////
let touchPanel = document.getElementById("touchPanel");
let pointsSVG = document.getElementsByClassName("point");
let inkIndicator = document.getElementById("ink_level");
let lines = new Array();
let pathLength = 0;

function hypot2(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function hypot(line) {
  return hypot2(line.x2 - line.x1, line.y2 - line.y1);
}

function resetScreen() {
  lines = new Array();
  pointsSVG.forEach(element => {
    element.style.visibility = "hidden";
    element.getElementById("line").style.fill = "snow";
  })
  pathLength = 0;
  inkIndicator.text = "Ink Level: " + pointsSVG.length; 
}

resetScreen();

function endPath() {
  if (lines.length > 5) {
    askForBestMatch(encodeAsPath(lines));
  }
  resetScreen();
}

touchPanel.onclick = function(evt) {
  if (!broken) {
    endPath();
  }
}

touchPanel.onmousedown = function(evt) {
  let count = lines.length;
  if (count < pointsSVG.length) {
    
    // move line to new starting point
    let newLine = pointsSVG[count].getElementById("line");
    newLine.x1 = evt.screenX;
    newLine.y1 = evt.screenY;
    newLine.x2 = evt.screenX;
    newLine.y2 = evt.screenY;
    lines.push(newLine);
    
    // update view
    pointsSVG[count].style.visibility = "visible";
    inkIndicator.text = "Ink Level: " + (pointsSVG.length - count - 1);
  }
}

touchPanel.onmousemove = function(evt) {
  let count = lines.length;
  if (count > 0 && count < pointsSVG.length) {
    
    // connects a new line to the path
    let newLine = pointsSVG[count].getElementById("line");
    newLine.x1 = pointsSVG[count-1].getElementById("line").x2;
    newLine.y1 = pointsSVG[count-1].getElementById("line").y2;
    newLine.x2 = evt.screenX;
    newLine.y2 = evt.screenY;
    
    // updates path attributes
    pathLength += hypot(newLine);
    lines.push(newLine);
    
    // update view
    pointsSVG[count].style.visibility = "visible";
    inkIndicator.text = "Ink Level: " + (pointsSVG.length - count - 1);
  }
};

function getAngle2(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

function getAngle(line) {
  return Math.round((180*getAngle2(line.x1, line.y1, line.x2, line.y2))/Math.PI);
}

function encodeAsPath(lines) {
  const MAX_POINTS = 150;
  let epsilon = pathLength / MAX_POINTS; // distance between points
  let angles = new Array();
  
  let distance = 0;
  lines.forEach(line => {
    distance += hypot(line);
    let angle = getAngle(line);
    while (distance >= epsilon) { // goes along line until full distance covered
      angles.push(angle);
      distance -= epsilon;
    }
  });
  
  // matches array length to MAX_POINTS
  // by duplicating uniformly several angles
  let arrLength = angles.length;
  if (arrLength < MAX_POINTS) {
    let remaining = MAX_POINTS - arrLength;
    let count = 1;
    while (count < (remaining + 1) ) { //avoids the ends
      let copyIndex = (((count/(remaining + 1)) * arrLength)|0) + count;
      angles.splice(copyIndex, 0, angles[copyIndex]);
      count++;
    }
  }
  return angles;
}

function askForBestMatch(path) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN && path) {
    messaging.peerSocket.send({angles: path});
  }
}

messaging.peerSocket.onopen = evt => {
  inputPanel.style.display = "inline";
  operations.style.display = "none";
  stackView.style.display = "none";
  connectPhone.style.display = "none";
}

messaging.peerSocket.onclose = evt => {
  if (!evt.wasClean) {
    inputPanel.style.display = "none";
    operations.style.display = "none";
    stackView.style.display = "none";
    connectPhone.style.display = "inline";
    vibrationEnabled && vibration.start("nudge");
  }
}

messaging.peerSocket.onmessage = evt => {
  if (evt.data.messageType == "restoreSetting") {
    let setting = evt.data.setting;
    if (setting.key === "toggleVibrations") {
      vibrationEnabled = setting.value === "true";
    }
  } else if (evt.data.messageType == "match") {
    let numStr = evt.data.value;
    if (numStr === "Bad Input") {
      vibrationEnabled && vibration.start("nudge");
    } else if (numStr === "e") {
      if (answer.text != `${Math.E}`) {
        load(`${Math.E}`, true, clearNext);
      }
    } else if (numStr === "pi") {
      if (answer.text != `${Math.PI}`) {
        load(`${Math.PI}`, true, clearNext);
      }
    } else {
      if (clearNext) {
        if (numStr != "0") {
          localStack = localStack.length === 0 ? [0] : [];
          load(numStr, false , false);
        } else {
          resetToZero();
        }
      } else {
        appendDigit(numStr, false);
      }
    }     
  }
}