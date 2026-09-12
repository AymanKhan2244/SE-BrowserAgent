/**
 * script.js
 *
 * Handles calculator interactions:
 *  - Captures user input (operands and operation)
 *  - Sends an AJAX request to the Flask API endpoint `/api/calculate`
 *  - Updates the UI with the computed result or error messages
 *
 * This script works with the HTML structure defined in `index.html`:
 *   <input id="operand1" type="number" step="any" required>
 *   <select id="operation" required>
 *       <option value="add">+</option>
 *       <option value="subtract">−</option>
 *       <option value="multiply">×</option>
 *       <option value="divide">÷</option>
 *   </select>
 *   <input id="operand2" type="number" step="any" required>
 *   <form id="calc-form">...</form>
 *   <div id="result"></div>
 *
 * No external libraries are required.
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('calc-form');
    const operand1Input = document.getElementById('operand1');
    const operand2Input = document.getElementById('operand2');
    const operationSelect = document.getElementById('operation');
    const resultEl = document.getElementById('result');

    if (!form || !operand1Input || !operand2Input || !operationSelect || !resultEl) {
        console.error('Calculator UI elements are missing in the DOM.');
        return;
    }

    /**
     * Checks whether a string can be parsed into a finite number.
     *
     * @param {string} value - The string to validate.
     * @returns {boolean} True if the string represents a valid number.
     */
    function isValidNumber(value) {
        const num = Number(value);
        return !Number.isNaN(num) && Number.isFinite(num);
    }

    /**
     * Updates the result element with a message.
     *
     * @param {string} message - The message to display.
     * @param {boolean} [isError=false] - Whether the message represents an error.
     */
    function displayResult(message, isError = false) {
        resultEl.textContent = message;
        resultEl.className = isError ? 'error' : 'success';
    }

    // Map the HTML select values to the operator symbols expected by the backend.
    const operationMap = {
        add: '+',
        subtract: '-',
        multiply: '*',
        divide: '/',
    };

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission behavior.

        const operand1 = operand1Input.value.trim();
        const operand2 = operand2Input.value.trim();
        const operationKey = operationSelect.value;
        const operator = operationMap[operationKey];

        // Client‑side validation.
        if (!isValidNumber(operand1) || !isValidNumber(operand2)) {
            displayResult('Please enter valid numbers for both operands.', true);
            return;
        }

        const payload = {
            operand1: operand1,
            operand2: operand2,
            operator: operator,
        };

        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            if (data.error) {
                displayResult(`Error: ${data.error}`, true);
            } else {
                displayResult(`Result: ${data.result}`);
            }
        } catch (err) {
            console.error('Calculation request failed:', err);
            displayResult('An unexpected error occurred. See console for details.', true);
        }
    });
});