/**
 * Unit Test Suite for CalcEngine (Phase 2)
 * Tests core math operations, operator precedence, advanced ops, floating point precision, and error states.
 */

import { CalcEngine } from '../js/engine.js';

function runTests() {
  console.log('====================================================');
  console.log(' Running CalcEngine Unit Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assertEqual(actual, expected, testName) {
    if (actual === expected) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}: Expected ${expected}, got ${actual}`);
      failed++;
    }
  }

  function assertEval(expr, expectedResult, testName) {
    const res = CalcEngine.evaluate(expr);
    if (res.success && res.result === expectedResult) {
      console.log(`[PASS] ${testName}: "${expr}" = ${res.result}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}: "${expr}". Expected result ${expectedResult}, got ${JSON.stringify(res)}`);
      failed++;
    }
  }

  function assertError(expr, expectedError, testName) {
    const res = CalcEngine.evaluate(expr);
    if (!res.success && res.error === expectedError) {
      console.log(`[PASS] ${testName}: "${expr}" correctly returned ${res.error} ("${res.message}")`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}: "${expr}". Expected error ${expectedError}, got ${JSON.stringify(res)}`);
      failed++;
    }
  }

  // 1. Basic Arithmetic
  assertEval('5 + 3', 8, 'Basic Addition');
  assertEval('10 - 4', 6, 'Basic Subtraction');
  assertEval('6 * 7', 42, 'Basic Multiplication');
  assertEval('20 / 4', 5, 'Basic Division');
  assertEval('-5 + 10', 5, 'Unary Minus');

  // 2. Floating Point Precision
  assertEval('0.1 + 0.2', 0.3, 'Floating Point Precision (0.1 + 0.2 = 0.3)');

  // 3. Precedence & Parentheses
  assertEval('2 + 3 * 4', 14, 'Operator Precedence (* over +)');
  assertEval('(2 + 3) * 4', 20, 'Parentheses Precedence');
  assertEval('10 - 2 * 3 + 4 / 2', 6, 'Mixed Precedence Chaining');

  // 4. Advanced Operations (√, ^, %)
  assertEval('√16', 4, 'Square Root of Positive Number');
  assertEval('2^3', 8, 'Exponentiation');
  assertEval('5^2 + √9', 28, 'Combined Exponent & Square Root');
  assertEval('50%', 0.5, 'Percentage Postfix');
  assertEval('100 * 20%', 20, 'Percentage Multiplication');

  // 5. Error Detection & Edge Cases
  assertError('5 / 0', 'ERR_DIV_ZERO', 'Division by Zero');
  assertError('√(-9)', 'ERR_NEG_SQRT', 'Square Root of Negative Number');
  assertError('5 + * 2', 'ERR_INVALID_SYNTAX', 'Malformed Expression (Trailing/Adjacent operators)');
  assertError('(5 + 3', 'ERR_INVALID_SYNTAX', 'Unmatched Opening Parenthesis');
  assertError('5 + 3)', 'ERR_INVALID_SYNTAX', 'Unmatched Closing Parenthesis');

  console.log('\n----------------------------------------------------');
  console.log(` Test Summary: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------------------');

  return failed === 0;
}

// Execute tests if running in Node.js environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  runTests();
}

export { runTests };
