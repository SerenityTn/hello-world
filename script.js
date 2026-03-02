const expressionElement = document.querySelector("[data-expression]");
const valueElement = document.querySelector("[data-value]");
const keypad = document.querySelector(".keypad");

const state = {
  currentValue: "0",
  previousValue: null,
  operator: null,
  overwrite: false,
};

function formatNumber(value) {
  if (value === "Error") {
    return value;
  }

  const [integerPart, decimalPart] = value.split(".");
  const integerDisplay = Number(integerPart).toLocaleString("en-US");

  return decimalPart === undefined
    ? integerDisplay
    : `${integerDisplay}.${decimalPart}`;
}

function updateDisplay() {
  valueElement.textContent = formatNumber(state.currentValue);

  if (!state.operator || state.previousValue === null) {
    expressionElement.textContent = "0";
    return;
  }

  const operatorSymbol = {
    "/": "÷",
    "*": "×",
    "-": "−",
    "+": "+",
  }[state.operator];

  expressionElement.textContent = `${formatNumber(state.previousValue)} ${operatorSymbol}`;
}

function clearState() {
  state.currentValue = "0";
  state.previousValue = null;
  state.operator = null;
  state.overwrite = false;
}

function inputDigit(digit) {
  if (state.currentValue === "Error") {
    clearState();
  }

  if (state.overwrite) {
    state.currentValue = digit;
    state.overwrite = false;
    return;
  }

  if (state.currentValue === "0") {
    state.currentValue = digit;
    return;
  }

  state.currentValue += digit;
}

function inputDecimal() {
  if (state.currentValue === "Error") {
    clearState();
  }

  if (state.overwrite) {
    state.currentValue = "0.";
    state.overwrite = false;
    return;
  }

  if (!state.currentValue.includes(".")) {
    state.currentValue += ".";
  }
}

function toggleSign() {
  if (state.currentValue === "0" || state.currentValue === "Error") {
    return;
  }

  state.currentValue = state.currentValue.startsWith("-")
    ? state.currentValue.slice(1)
    : `-${state.currentValue}`;
}

function applyPercent() {
  if (state.currentValue === "Error") {
    return;
  }

  state.currentValue = String(Number(state.currentValue) / 100);
}

function deleteLast() {
  if (state.overwrite || state.currentValue === "Error") {
    state.currentValue = "0";
    state.overwrite = false;
    return;
  }

  if (state.currentValue.length === 1 || (state.currentValue.length === 2 && state.currentValue.startsWith("-"))) {
    state.currentValue = "0";
    return;
  }

  state.currentValue = state.currentValue.slice(0, -1);
}

function compute() {
  if (!state.operator || state.previousValue === null) {
    return;
  }

  const previous = Number(state.previousValue);
  const current = Number(state.currentValue);
  let result;

  switch (state.operator) {
    case "+":
      result = previous + current;
      break;
    case "-":
      result = previous - current;
      break;
    case "*":
      result = previous * current;
      break;
    case "/":
      result = current === 0 ? "Error" : previous / current;
      break;
    default:
      return;
  }

  state.currentValue = String(result);
  state.previousValue = result === "Error" ? null : state.currentValue;
  state.operator = null;
  state.overwrite = true;
}

function chooseOperator(nextOperator) {
  if (state.currentValue === "Error") {
    return;
  }

  if (state.operator && !state.overwrite) {
    compute();
  }

  state.previousValue = state.currentValue;
  state.operator = nextOperator;
  state.overwrite = true;
}

function handleAction(action, value) {
  switch (action) {
    case "digit":
      inputDigit(value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      chooseOperator(value);
      break;
    case "equals":
      compute();
      break;
    case "clear":
      clearState();
      break;
    case "delete":
      deleteLast();
      break;
    case "toggle-sign":
      toggleSign();
      break;
    case "percent":
      applyPercent();
      break;
    default:
      return;
  }

  updateDisplay();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  handleAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/\d/.test(key)) {
    handleAction("digit", key);
    return;
  }

  if (["+", "-", "*", "/"].includes(key)) {
    event.preventDefault();
    handleAction("operator", key);
    return;
  }

  if (key === ".") {
    handleAction("decimal");
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    handleAction("equals");
    return;
  }

  if (key === "Backspace") {
    handleAction("delete");
    return;
  }

  if (key === "Escape") {
    handleAction("clear");
  }
});

updateDisplay();
