/**
 * Advanced Calculator with Memory Functions, History, Themes, and Sound Effects
 * Features: Memory operations, calculation history, theme toggle, sound effects,
 * percentage calculations, square root, improved error handling, and more
 */

// Global variables
let currentInput = '';
let operator = '';
let previousInput = '';
let shouldResetDisplay = false;
let memoryValue = 0;
let calculationHistory = [];
let isDarkTheme = false;
let currentColorIndex = 0;

// Audio context for sound effects
let audioContext;
let soundEnabled = true;

// Background color options
const backgroundColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Original purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Orange
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Soft pink
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Warm
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // Lavender
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'  // Coral
];

/**
 * Initialize the calculator
 */
function init() {
    // Load saved theme
    const savedTheme = localStorage.getItem('calculatorTheme');
    if (savedTheme === 'dark') {
        toggleTheme();
    }
    
    // Load saved color
    const savedColor = localStorage.getItem('calculatorColor');
    if (savedColor) {
        currentColorIndex = parseInt(savedColor);
        applyBackgroundColor();
    }
    
    // Load saved history
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        calculationHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
    
    // Initialize audio context
    initAudio();
    
    updateDisplay();
    updateMemoryIndicator();
}

/**
 * Initialize audio context for sound effects
 */
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Audio not supported');
        soundEnabled = false;
    }
}

/**
 * Play button click sound
 */
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

/**
 * Add visual feedback to button press
 */
function addButtonFeedback(button) {
    if (button) {
        button.classList.add('playing');
        setTimeout(() => button.classList.remove('playing'), 100);
    }
}

/**
 * Update the main display
 */
function updateDisplay() {
    const display = document.getElementById('result');
    display.value = currentInput || '0';
}

/**
 * Show calculation expression in the calculation display
 */
function showCalculation(expression) {
    const calcDisplay = document.getElementById('calculationDisplay');
    calcDisplay.textContent = expression;
}

/**
 * Clear calculation display
 */
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

/**
 * Calculate result with enhanced error handling
 */
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
        
        // Handle special cases
        if (!isFinite(result)) {
            showError('Result is not a number');
            return;
        }
        
        if (Math.abs(result) > 1e15) {
            showError('Result too large');
            return;
        }
        
        // Round to avoid floating point precision issues
        result = Math.round(result * 100000000) / 100000000;
        
        // Show calculation in display
        showCalculation(expression + ' = ' + result);
        
        // Add to history
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

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}



