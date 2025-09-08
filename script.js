// Math & Science Toolkit - Comprehensive calculator suite
// Features: Basic calc, Scientific calc, Unit converter, Graphing, Percentage, Loan, Compound interest

let currentInput = '';
let operator = '';
let previousInput = '';
let shouldResetDisplay = false;
let memoryValue = 0;
let calculationHistory = [];
let isDarkTheme = false;
let currentColorIndex = 0;

// Scientific calculator variables
let sciCurrentInput = '';
let sciOperator = '';
let sciPreviousInput = '';
let sciShouldResetDisplay = false;

// Graphing calculator variables
let graphScale = 1;
let graphOffsetX = 0;
let graphOffsetY = 0;
let graphFunctions = [];

// sound stuff
let audioContext;
let soundEnabled = true;

// colors for the background - found these online
const backgroundColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // default purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', 
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'  
];

function init() {
    // check if user had dark mode on
    const savedTheme = localStorage.getItem('calculatorTheme');
    if (savedTheme === 'dark') {
        toggleTheme();
    }
    
    // load their color choice
    const savedColor = localStorage.getItem('calculatorColor');
    if (savedColor) {
        currentColorIndex = parseInt(savedColor);
        applyBackgroundColor();
    }
    
    // get history from storage
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        calculationHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
    
    initAudio();
    updateDisplay();
    updateMemoryIndicator();
}

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Audio not supported');
        soundEnabled = false;
    }
}

function playSound(frequency = 800, duration = 100) {
    if (!soundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
        console.log('Sound playback failed');
    }
}

function addButtonFeedback(button) {
    if (button) {
        button.classList.add('playing');
        setTimeout(() => button.classList.remove('playing'), 100);
    }
}

function updateDisplay() {
    const display = document.getElementById('result');
    display.value = currentInput || '0';
}

function showCalculation(expression) {
    const calcDisplay = document.getElementById('calculationDisplay');
    calcDisplay.textContent = expression;
}

function clearCalculationDisplay() {
    const calcDisplay = document.getElementById('calculationDisplay');
    calcDisplay.textContent = '';
}

/**
 * Update the history display (shows last calculation)
 */
function updateHistoryDisplay() {
    const historyDisplay = document.getElementById('historyDisplay');
    if (calculationHistory.length > 0) {
        const lastCalculation = calculationHistory[calculationHistory.length - 1];
        historyDisplay.textContent = lastCalculation.expression + ' = ' + lastCalculation.result;
    } else {
        historyDisplay.textContent = '';
    }
}

/**
 * Update memory indicator
 */
function updateMemoryIndicator() {
    const indicator = document.getElementById('memoryIndicator');
    if (memoryValue !== 0) {
        indicator.textContent = 'M: ' + memoryValue;
        indicator.classList.add('active');
    } else {
        indicator.classList.remove('active');
    }
}

/**
 * Add calculation to history
 */
function addToHistory(expression, result) {
    const historyItem = {
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleTimeString()
    };
    
    calculationHistory.push(historyItem);
    
    // Keep only last 50 calculations
    if (calculationHistory.length > 50) {
        calculationHistory = calculationHistory.slice(-50);
    }
    
    // Save to localStorage
    localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
    
    updateHistoryDisplay();
    updateHistoryPanel();
}

/**
 * Update the history panel
 */
function updateHistoryPanel() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    calculationHistory.slice().reverse().forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div>${item.expression} = ${item.result}</div>
            <div style="font-size: 12px; opacity: 0.7;">${item.timestamp}</div>
        `;
        
        historyItem.addEventListener('click', () => {
            currentInput = item.result;
            updateDisplay();
            playSound(600, 80);
        });
        
        historyList.appendChild(historyItem);
    });
}

/**
 * Show/hide history panel
 */
function toggleHistory() {
    const historyPanel = document.getElementById('historyPanel');
    historyPanel.classList.toggle('show');
}

/**
 * Clear calculation history
 */
function clearHistory() {
    calculationHistory = [];
    localStorage.removeItem('calculatorHistory');
    updateHistoryDisplay();
    updateHistoryPanel();
    playSound(400, 100);
}

/**
 * Append value to display with validation
 */
function appendToDisplay(value) {
    playSound(800, 50);
    
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }
    
    // Input validation
    if (value === '.' && currentInput.includes('.')) {
        return; // Prevent multiple decimal points
    }
    
    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else {
        currentInput += value;
    }
    
    // Limit input length
    if (currentInput.length > 15) {
        currentInput = currentInput.slice(0, 15);
        showError('Input too long');
        return;
    }
    
    updateDisplay();
}

/**
 * Set operator with improved logic
 */
function setOperator(op) {
    playSound(1000, 60);
    
    if (currentInput === '') return;
    
    if (operator !== '' && previousInput !== '') {
        calculateResult();
    }
    
    operator = op;
    previousInput = currentInput;
    showCalculation(previousInput + ' ' + operator);
    currentInput = '';
}

function calculateResult() {
    if (operator === '' || previousInput === '' || currentInput === '') {
        return;
    }
    
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result;
    let expression = `${previousInput} ${operator} ${currentInput}`;
    
    try {
        switch (operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    showError('Cannot divide by zero');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }
        
        // check for weird numbers
        if (!isFinite(result)) {
            showError('Result is not a number');
            return;
        }
        
        if (Math.abs(result) > 1e15) {
            showError('Result too large');
            return;
        }
        
        // fix floating point weirdness
        result = Math.round(result * 100000000) / 100000000;
        
        showCalculation(expression + ' = ' + result);
        addToHistory(expression, result);
        
        currentInput = result.toString();
        operator = '';
        previousInput = '';
        shouldResetDisplay = true;
        updateDisplay();
        
        playSound(1200, 100);
        
    } catch (error) {
        showError('Calculation error');
        console.error('Calculation error:', error);
    }
}

/**
 * Calculate percentage
 */
function calculatePercentage() {
    playSound(900, 70);
    
    if (currentInput === '') return;
    
    const value = parseFloat(currentInput);
    const result = value / 100;
    
    addToHistory(`${value}%`, result);
    currentInput = result.toString();
    shouldResetDisplay = true;
    updateDisplay();
}

/**
 * Calculate square root
 */
function calculateSquareRoot() {
    playSound(900, 70);
    
    if (currentInput === '') return;
    
    const value = parseFloat(currentInput);
    
    if (value < 0) {
        showError('Cannot calculate square root of negative number');
        return;
    }
    
    const result = Math.sqrt(value);
    
    addToHistory(`√${value}`, result);
    currentInput = result.toString();
    shouldResetDisplay = true;
    updateDisplay();
}

/**
 * Clear all (C button)
 */
function clearAll() {
    playSound(400, 100);
    currentInput = '';
    operator = '';
    previousInput = '';
    shouldResetDisplay = false;
    clearCalculationDisplay();
    updateDisplay();
}

/**
 * Clear entry (CE button)
 */
function clearEntry() {
    playSound(500, 80);
    currentInput = '';
    updateDisplay();
}

/**
 * Delete last character
 */
function deleteLast() {
    playSound(600, 60);
    if (currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
    }
}

/**
 * Memory functions
 */
function memoryClear() {
    playSound(700, 80);
    memoryValue = 0;
    updateMemoryIndicator();
}

function memoryRecall() {
    playSound(700, 80);
    if (memoryValue !== 0) {
        currentInput = memoryValue.toString();
        shouldResetDisplay = true;
        updateDisplay();
    }
}

function memoryAdd() {
    playSound(700, 80);
    if (currentInput !== '') {
        memoryValue += parseFloat(currentInput) || 0;
        updateMemoryIndicator();
    }
}

function memorySubtract() {
    playSound(700, 80);
    if (currentInput !== '') {
        memoryValue -= parseFloat(currentInput) || 0;
        updateMemoryIndicator();
    }
}

/**
 * Toggle theme
 */
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    const body = document.body;
    const themeBtn = document.getElementById('themeBtn');
    
    if (isDarkTheme) {
        body.setAttribute('data-theme', 'dark');
        themeBtn.textContent = '☀️';
        localStorage.setItem('calculatorTheme', 'dark');
    } else {
        body.removeAttribute('data-theme');
        themeBtn.textContent = '🌙';
        localStorage.setItem('calculatorTheme', 'light');
    }
    
    playSound(1000, 100);
}

/**
 * Cycle through background colors
 */
function cycleBackgroundColor() {
    currentColorIndex = (currentColorIndex + 1) % backgroundColors.length;
    applyBackgroundColor();
    localStorage.setItem('calculatorColor', currentColorIndex.toString());
    playSound(1200, 80);
}

/**
 * Apply the current background color
 */
function applyBackgroundColor() {
    const body = document.body;
    body.style.background = backgroundColors[currentColorIndex];
}

/**
 * Show error message
 */
function showError(message) {
    const display = document.getElementById('result');
    const originalValue = display.value;
    
    display.value = 'Error: ' + message;
    display.style.color = '#ff6b6b';
    
    setTimeout(() => {
        display.value = originalValue;
        display.style.color = '';
    }, 2000);
    
    playSound(300, 200);
}

/**
 * Enhanced keyboard support
 */
document.addEventListener('keydown', function(event) {
    const key = event.key;
    const button = event.target;
    
    // Prevent default for calculator keys
    if ('0123456789+-*/.=EnterEscapeBackspace'.includes(key)) {
        event.preventDefault();
    }
    
    if (key >= '0' && key <= '9' || key === '.') {
        appendToDisplay(key);
        addButtonFeedback(button);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        setOperator(key);
        addButtonFeedback(button);
    } else if (key === 'Enter' || key === '=') {
        calculateResult();
        addButtonFeedback(button);
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearAll();
        addButtonFeedback(button);
    } else if (key === 'Backspace') {
        deleteLast();
        addButtonFeedback(button);
    } else if (key.toLowerCase() === 'h') {
        toggleHistory();
    } else if (key.toLowerCase() === 't') {
        toggleTheme();
    } else if (key === '%') {
        calculatePercentage();
        addButtonFeedback(button);
    } else if (key === 's' || key === 'S') {
        calculateSquareRoot();
        addButtonFeedback(button);
    }
});

/**
 * Add click event listeners with sound feedback
 */
document.addEventListener('DOMContentLoaded', function() {
    // Add click listeners to all buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            addButtonFeedback(this);
        });
    });
    
    // Initialize calculator
    init();
    
    // Show history panel on double-click display
    const display = document.getElementById('result');
    display.addEventListener('dblclick', toggleHistory);
});

/**
 * Handle window resize for mobile optimization
 */
window.addEventListener('resize', function() {
    // Adjust layout for mobile if needed
    const calculator = document.querySelector('.calculator');
    if (window.innerWidth < 480) {
        calculator.style.maxWidth = '320px';
    } else {
        calculator.style.maxWidth = '350px';
    }
});

/**
 * Tool switching functionality
 */
function switchTool(toolName) {
    // Hide all tool containers
    const containers = document.querySelectorAll('.tool-container');
    containers.forEach(container => container.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tool and activate its tab
    const selectedTool = document.getElementById(toolName);
    const selectedTab = document.querySelector(`[data-tool="${toolName}"]`);
    
    if (selectedTool && selectedTab) {
        selectedTool.classList.add('active');
        selectedTab.classList.add('active');
        playSound(1000, 100);
    }
    
    // Initialize specific tool if needed
    if (toolName === 'unit-converter') {
        updateConverterUnits();
    } else if (toolName === 'graphing') {
        initGraphing();
    }
}

/**
 * Scientific Calculator Functions
 */
function sciAppendToDisplay(value) {
    playSound(800, 50);
    
    if (sciShouldResetDisplay) {
        sciCurrentInput = '';
        sciShouldResetDisplay = false;
    }
    
    if (value === '.' && sciCurrentInput.includes('.')) {
        return;
    }
    
    if (sciCurrentInput === '0' && value !== '.') {
        sciCurrentInput = value;
    } else {
        sciCurrentInput += value;
    }
    
    if (sciCurrentInput.length > 15) {
        sciCurrentInput = sciCurrentInput.slice(0, 15);
        showError('Input too long');
        return;
    }
    
    updateSciDisplay();
}

function updateSciDisplay() {
    const display = document.getElementById('sciResult');
    display.value = sciCurrentInput || '0';
}

function sciSetOperator(op) {
    playSound(1000, 60);
    
    if (sciCurrentInput === '') return;
    
    if (sciOperator !== '' && sciPreviousInput !== '') {
        sciCalculate();
    }
    
    sciOperator = op;
    sciPreviousInput = sciCurrentInput;
    showSciCalculation(sciPreviousInput + ' ' + sciOperator);
    sciCurrentInput = '';
}

function sciCalculate() {
    if (sciOperator === '' || sciPreviousInput === '' || sciCurrentInput === '') {
        return;
    }
    
    const prev = parseFloat(sciPreviousInput);
    const current = parseFloat(sciCurrentInput);
    let result;
    let expression = `${sciPreviousInput} ${sciOperator} ${sciCurrentInput}`;
    
    try {
        switch (sciOperator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    showError('Cannot divide by zero');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }
        
        if (!isFinite(result)) {
            showError('Result is not a number');
            return;
        }
        
        if (Math.abs(result) > 1e15) {
            showError('Result too large');
            return;
        }
        
        result = Math.round(result * 100000000) / 100000000;
        
        showSciCalculation(expression + ' = ' + result);
        sciCurrentInput = result.toString();
        sciOperator = '';
        sciPreviousInput = '';
        sciShouldResetDisplay = true;
        updateSciDisplay();
        
        playSound(1200, 100);
        
    } catch (error) {
        showError('Calculation error');
        console.error('Calculation error:', error);
    }
}

function sciFunction(func) {
    playSound(900, 70);
    
    if (sciCurrentInput === '') return;
    
    const value = parseFloat(sciCurrentInput);
    let result;
    let expression;
    
    try {
        switch (func) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180);
                expression = `sin(${value}°)`;
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                expression = `cos(${value}°)`;
                break;
            case 'tan':
                result = Math.tan(value * Math.PI / 180);
                expression = `tan(${value}°)`;
                break;
            case 'log':
                if (value <= 0) {
                    showError('Log of non-positive number');
                    return;
                }
                result = Math.log10(value);
                expression = `log(${value})`;
                break;
            case 'ln':
                if (value <= 0) {
                    showError('Log of non-positive number');
                    return;
                }
                result = Math.log(value);
                expression = `ln(${value})`;
                break;
            case 'sqrt':
                if (value < 0) {
                    showError('Square root of negative number');
                    return;
                }
                result = Math.sqrt(value);
                expression = `√${value}`;
                break;
            case 'pow':
                result = Math.pow(value, 2);
                expression = `${value}²`;
                break;
            case 'pow3':
                result = Math.pow(value, 3);
                expression = `${value}³`;
                break;
            case 'exp':
                result = Math.exp(value);
                expression = `e^${value}`;
                break;
            case 'pi':
                result = Math.PI;
                expression = 'π';
                break;
            case 'e':
                result = Math.E;
                expression = 'e';
                break;
            case 'factorial':
                if (value < 0 || value !== Math.floor(value)) {
                    showError('Factorial of non-integer or negative number');
                    return;
                }
                if (value > 170) {
                    showError('Number too large for factorial');
                    return;
                }
                result = factorial(value);
                expression = `${value}!`;
                break;
            default:
                return;
        }
        
        if (!isFinite(result)) {
            showError('Result is not a number');
            return;
        }
        
        result = Math.round(result * 100000000) / 100000000;
        
        showSciCalculation(expression + ' = ' + result);
        sciCurrentInput = result.toString();
        sciShouldResetDisplay = true;
        updateSciDisplay();
        
    } catch (error) {
        showError('Function error');
        console.error('Function error:', error);
    }
}

function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

function showSciCalculation(expression) {
    const calcDisplay = document.getElementById('sciCalculationDisplay');
    calcDisplay.textContent = expression;
}

function sciClear() {
    playSound(400, 100);
    sciCurrentInput = '';
    sciOperator = '';
    sciPreviousInput = '';
    sciShouldResetDisplay = false;
    showSciCalculation('');
    updateSciDisplay();
}

function sciClearEntry() {
    playSound(500, 80);
    sciCurrentInput = '';
    updateSciDisplay();
}

function sciDeleteLast() {
    playSound(600, 60);
    if (sciCurrentInput.length > 0) {
        sciCurrentInput = sciCurrentInput.slice(0, -1);
        updateSciDisplay();
    }
}

/**
 * Unit Converter Functions
 */
const unitConversions = {
    length: {
        'mm': 0.001,
        'cm': 0.01,
        'm': 1,
        'km': 1000,
        'in': 0.0254,
        'ft': 0.3048,
        'yd': 0.9144,
        'mi': 1609.34
    },
    weight: {
        'mg': 0.001,
        'g': 1,
        'kg': 1000,
        'oz': 28.3495,
        'lb': 453.592,
        'ton': 1000000
    },
    temperature: {
        'c': 'celsius',
        'f': 'fahrenheit',
        'k': 'kelvin'
    },
    area: {
        'mm²': 0.000001,
        'cm²': 0.0001,
        'm²': 1,
        'km²': 1000000,
        'in²': 0.00064516,
        'ft²': 0.092903,
        'yd²': 0.836127,
        'ac': 4046.86
    },
    volume: {
        'ml': 0.001,
        'l': 1,
        'cm³': 0.001,
        'm³': 1000,
        'in³': 0.0163871,
        'ft³': 28.3168,
        'gal': 3.78541
    }
};

function updateConverterUnits() {
    const category = document.getElementById('converterCategory').value;
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');
    
    // Clear existing options
    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';
    
    // Add units for selected category
    const units = Object.keys(unitConversions[category]);
    units.forEach(unit => {
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');
        option1.value = unit;
        option1.textContent = unit;
        option2.value = unit;
        option2.textContent = unit;
        fromUnit.appendChild(option1);
        toUnit.appendChild(option2);
    });
    
    // Set default selections
    if (units.length > 1) {
        toUnit.selectedIndex = 1;
    }
}

function convertUnits() {
    const category = document.getElementById('converterCategory').value;
    const fromValue = parseFloat(document.getElementById('fromValue').value);
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;
    
    if (isNaN(fromValue) || !fromUnit || !toUnit) {
        document.getElementById('toValue').value = '';
        return;
    }
    
    let result;
    
    if (category === 'temperature') {
        result = convertTemperature(fromValue, fromUnit, toUnit);
    } else {
        const fromFactor = unitConversions[category][fromUnit];
        const toFactor = unitConversions[category][toUnit];
        result = (fromValue * fromFactor) / toFactor;
    }
    
    document.getElementById('toValue').value = result.toFixed(6);
}

function convertTemperature(value, from, to) {
    let celsius;
    
    // Convert to Celsius first
    switch (from) {
        case 'c':
            celsius = value;
            break;
        case 'f':
            celsius = (value - 32) * 5 / 9;
            break;
        case 'k':
            celsius = value - 273.15;
            break;
    }
    
    // Convert from Celsius to target
    switch (to) {
        case 'c':
            return celsius;
        case 'f':
            return celsius * 9 / 5 + 32;
        case 'k':
            return celsius + 273.15;
    }
}

/**
 * Graphing Calculator Functions
 */
function initGraphing() {
    const canvas = document.getElementById('graphCanvas');
    if (canvas) {
        drawGraph();
    }
}

function plotFunction() {
    const input = document.getElementById('functionInput').value.trim();
    if (!input) return;
    
    try {
        const func = parseFunction(input);
        graphFunctions.push({ expression: input, func: func, color: getRandomColor() });
        drawGraph();
        playSound(1000, 100);
    } catch (error) {
        showError('Invalid function');
    }
}

function parseFunction(expression) {
    // Simple function parser - converts x^2 to Math.pow(x,2), etc.
    expression = expression.replace(/x\^(\d+)/g, 'Math.pow(x,$1)');
    expression = expression.replace(/sin\(/g, 'Math.sin(');
    expression = expression.replace(/cos\(/g, 'Math.cos(');
    expression = expression.replace(/tan\(/g, 'Math.tan(');
    expression = expression.replace(/log\(/g, 'Math.log10(');
    expression = expression.replace(/ln\(/g, 'Math.log(');
    expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');
    expression = expression.replace(/exp\(/g, 'Math.exp(');
    
    return new Function('x', `return ${expression}`);
}

function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawGraph() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width/2, 0);
    ctx.lineTo(width/2, height);
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.stroke();
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }
    
    // Draw functions
    graphFunctions.forEach(({ func, color }) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        let firstPoint = true;
        for (let x = -width/2; x < width/2; x += 0.5) {
            try {
                const y = func(x / 20) * 20; // Scale
                const screenX = x + width/2;
                const screenY = height/2 - y;
                
                if (screenY >= 0 && screenY <= height) {
                    if (firstPoint) {
                        ctx.moveTo(screenX, screenY);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(screenX, screenY);
                    }
                }
            } catch (e) {
                // Skip invalid points
            }
        }
        ctx.stroke();
    });
}

function clearGraph() {
    graphFunctions = [];
    drawGraph();
    playSound(400, 100);
}

function zoomIn() {
    graphScale *= 1.2;
    drawGraph();
    playSound(800, 50);
}

function zoomOut() {
    graphScale /= 1.2;
    drawGraph();
    playSound(600, 50);
}

function resetView() {
    graphScale = 1;
    graphOffsetX = 0;
    graphOffsetY = 0;
    drawGraph();
    playSound(1000, 100);
}

/**
 * Percentage Calculator Functions
 */
function calculatePercentageOf() {
    const percent = parseFloat(document.getElementById('percentValue').value);
    const of = parseFloat(document.getElementById('percentOf').value);
    
    if (isNaN(percent) || isNaN(of)) {
        document.getElementById('percentageResult').textContent = 'Please enter valid numbers';
        return;
    }
    
    const result = (percent / 100) * of;
    document.getElementById('percentageResult').textContent = `${percent}% of ${of} = ${result}`;
    playSound(1000, 100);
}

function calculateWhatPercent() {
    const is = parseFloat(document.getElementById('isValue').value);
    const of = parseFloat(document.getElementById('ofValue').value);
    
    if (isNaN(is) || isNaN(of) || of === 0) {
        document.getElementById('whatPercentResult').textContent = 'Please enter valid numbers';
        return;
    }
    
    const result = (is / of) * 100;
    document.getElementById('whatPercentResult').textContent = `${is} is ${result.toFixed(2)}% of ${of}`;
    playSound(1000, 100);
}

function calculateTip() {
    const bill = parseFloat(document.getElementById('billAmount').value);
    const tipPercent = parseFloat(document.getElementById('tipPercent').value);
    const people = parseFloat(document.getElementById('people').value);
    
    if (isNaN(bill) || isNaN(tipPercent) || isNaN(people) || people <= 0) {
        document.getElementById('tipResult').textContent = 'Please enter valid numbers';
        return;
    }
    
    const tipAmount = (bill * tipPercent) / 100;
    const total = bill + tipAmount;
    const perPerson = total / people;
    
    document.getElementById('tipResult').innerHTML = `
        <div>Tip Amount: $${tipAmount.toFixed(2)}</div>
        <div>Total Bill: $${total.toFixed(2)}</div>
        <div>Per Person: $${perPerson.toFixed(2)}</div>
    `;
    playSound(1000, 100);
}

/**
 * Loan Calculator Functions
 */
function calculateLoan() {
    const principal = parseFloat(document.getElementById('loanAmount').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value);
    const years = parseFloat(document.getElementById('loanTerm').value);
    
    if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || principal <= 0 || annualRate < 0 || years <= 0) {
        document.getElementById('loanResults').innerHTML = '<p>Please enter valid numbers</p>';
        return;
    }
    
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    
    let monthlyPayment;
    if (monthlyRate === 0) {
        monthlyPayment = principal / numPayments;
    } else {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    
    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - principal;
    
    document.getElementById('loanResults').innerHTML = `
        <h4>Loan Calculation Results</h4>
        <p><strong>Monthly Payment:</strong> $${monthlyPayment.toFixed(2)}</p>
        <p><strong>Total Payment:</strong> $${totalPayment.toFixed(2)}</p>
        <p><strong>Total Interest:</strong> $${totalInterest.toFixed(2)}</p>
        <p><strong>Interest Rate:</strong> ${annualRate}% APR</p>
    `;
    playSound(1000, 100);
}

/**
 * Compound Interest Calculator Functions
 */
function calculateCompound() {
    const principal = parseFloat(document.getElementById('principal').value);
    const annualRate = parseFloat(document.getElementById('annualRate').value);
    const time = parseFloat(document.getElementById('timePeriod').value);
    const frequency = parseInt(document.getElementById('compoundingFreq').value);
    
    if (isNaN(principal) || isNaN(annualRate) || isNaN(time) || principal <= 0 || annualRate < 0 || time <= 0) {
        document.getElementById('compoundResults').innerHTML = '<p>Please enter valid numbers</p>';
        return;
    }
    
    const rate = annualRate / 100;
    const amount = principal * Math.pow(1 + rate / frequency, frequency * time);
    const interest = amount - principal;
    
    const frequencyText = ['Annually', 'Semi-annually', 'Quarterly', 'Monthly', 'Daily'][frequency - 1] || 'Custom';
    
    document.getElementById('compoundResults').innerHTML = `
        <h4>Compound Interest Results</h4>
        <p><strong>Principal Amount:</strong> $${principal.toFixed(2)}</p>
        <p><strong>Interest Rate:</strong> ${annualRate}% per year</p>
        <p><strong>Compounding:</strong> ${frequencyText}</p>
        <p><strong>Time Period:</strong> ${time} years</p>
        <p><strong>Final Amount:</strong> $${amount.toFixed(2)}</p>
        <p><strong>Interest Earned:</strong> $${interest.toFixed(2)}</p>
    `;
    playSound(1000, 100);
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}



