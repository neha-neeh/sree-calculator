/**
 * Smart Calculator - Decoupled Calculation Engine (Phase 2)
 * Handles tokenization, parsing (Shunting-Yard algorithm), math evaluation, and error detection.
 */

export class CalcEngine {
  /**
   * Tokenizes an input math expression string into structural tokens.
   * @param {string} expr 
   * @returns {Array<{type: string, value: string|number}>}
   */
  static tokenize(expr) {
    const tokens = [];
    let i = 0;
    const len = expr.length;

    while (i < len) {
      const char = expr[i];

      // Skip whitespace
      if (/\s/.test(char)) {
        i++;
        aria_continue: continue;
      }

      // Digits & Decimals
      if (/[0-9.]/.test(char)) {
        let numStr = '';
        let decimalCount = 0;

        while (i < len && /[0-9.]/.test(expr[i])) {
          if (expr[i] === '.') {
            decimalCount++;
            if (decimalCount > 1) {
              // Ignore extra decimals within the same token
              i++;
              continue;
            }
          }
          numStr += expr[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
        continue;
      }

      // Square Root symbol (√)
      if (char === '√') {
        tokens.push({ type: 'OPERATOR', value: '√', precedence: 4, assoc: 'RIGHT', unary: true });
        i++;
        continue;
      }

      // Exponent (^)
      if (char === '^') {
        tokens.push({ type: 'OPERATOR', value: '^', precedence: 3, assoc: 'RIGHT' });
        i++;
        continue;
      }

      // Multiplication (* or ×)
      if (char === '*' || char === '×') {
        tokens.push({ type: 'OPERATOR', value: '*', precedence: 2, assoc: 'LEFT' });
        i++;
        continue;
      }

      // Division (/ or ÷)
      if (char === '/' || char === '÷') {
        tokens.push({ type: 'OPERATOR', value: '/', precedence: 2, assoc: 'LEFT' });
        i++;
        continue;
      }

      // Percent (%)
      if (char === '%') {
        tokens.push({ type: 'OPERATOR', value: '%', precedence: 2, assoc: 'LEFT', postfix: true });
        i++;
        continue;
      }

      // Addition (+) or Subtraction (-)
      if (char === '+' || char === '-' || char === '−') {
        const opVal = (char === '−' || char === '-') ? '-' : '+';
        
        // Determine if unary minus/plus
        const prevToken = tokens[tokens.length - 1];
        const isUnary = !prevToken || 
                        (prevToken.type === 'OPERATOR' && !prevToken.postfix) || 
                        (prevToken.type === 'LPAREN');

        if (isUnary && opVal === '-') {
          tokens.push({ type: 'OPERATOR', value: 'u-', precedence: 4, assoc: 'RIGHT', unary: true });
        } else if (isUnary && opVal === '+') {
          // Unary plus is a no-op, ignore
        } else {
          tokens.push({ type: 'OPERATOR', value: opVal, precedence: 1, assoc: 'LEFT' });
        }
        i++;
        continue;
      }

      // Parentheses
      if (char === '(') {
        tokens.push({ type: 'LPAREN', value: '(' });
        i++;
        continue;
      }
      if (char === ')') {
        tokens.push({ type: 'RPAREN', value: ')' });
        i++;
        continue;
      }

      // Unknown character -> Syntax error token
      tokens.push({ type: 'UNKNOWN', value: char });
      i++;
    }

    return tokens;
  }

  /**
   * Converts infix tokens into Reverse Polish Notation (RPN) using Shunting-Yard.
   * @param {Array} tokens 
   * @returns {Array} RPN queue
   */
  static shuntingYard(tokens) {
    const outputQueue = [];
    const operatorStack = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'NUMBER') {
        outputQueue.push(token);
      } else if (token.type === 'OPERATOR') {
        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type !== 'OPERATOR') break;

          const isLeftAndEqual = token.assoc === 'LEFT' && token.precedence <= top.precedence;
          const isRightAndLess = token.assoc === 'RIGHT' && token.precedence < top.precedence;

          if (isLeftAndEqual || isRightAndLess) {
            outputQueue.push(operatorStack.pop());
          } else {
            break;
          }
        }
        operatorStack.push(token);
      } else if (token.type === 'LPAREN') {
        operatorStack.push(token);
      } else if (token.type === 'RPAREN') {
        let foundLParen = false;
        while (operatorStack.length > 0) {
          const top = operatorStack.pop();
          if (top.type === 'LPAREN') {
            foundLParen = true;
            break;
          }
          outputQueue.push(top);
        }
        if (!foundLParen) {
          throw new Error('ERR_INVALID_SYNTAX');
        }
      } else if (token.type === 'UNKNOWN') {
        throw new Error('ERR_INVALID_SYNTAX');
      }
    }

    while (operatorStack.length > 0) {
      const top = operatorStack.pop();
      if (top.type === 'LPAREN' || top.type === 'RPAREN') {
        throw new Error('ERR_INVALID_SYNTAX');
      }
      outputQueue.push(top);
    }

    return outputQueue;
  }

  /**
   * Evaluates an RPN token queue.
   * @param {Array} rpn 
   * @returns {number} Calculated result
   */
  static evaluateRPN(rpn) {
    const stack = [];

    for (let i = 0; i < rpn.length; i++) {
      const token = rpn[i];

      if (token.type === 'NUMBER') {
        stack.push(token.value);
      } else if (token.type === 'OPERATOR') {
        if (token.unary) {
          if (stack.length < 1) throw new Error('ERR_INVALID_SYNTAX');
          const operand = stack.pop();

          if (token.value === '√') {
            if (operand < 0) throw new Error('ERR_NEG_SQRT');
            stack.push(Math.sqrt(operand));
          } else if (token.value === 'u-') {
            stack.push(-operand);
          }
        } else if (token.postfix) {
          if (stack.length < 1) throw new Error('ERR_INVALID_SYNTAX');
          const operand = stack.pop();
          if (token.value === '%') {
            stack.push(operand / 100);
          }
        } else {
          if (stack.length < 2) throw new Error('ERR_INVALID_SYNTAX');
          const b = stack.pop();
          const a = stack.pop();

          switch (token.value) {
            case '+':
              stack.push(a + b);
              break;
            case '-':
              stack.push(a - b);
              break;
            case '*':
              stack.push(a * b);
              break;
            case '/':
              if (b === 0) throw new Error('ERR_DIV_ZERO');
              stack.push(a / b);
              break;
            case '^':
              stack.push(Math.pow(a, b));
              break;
            default:
              throw new Error('ERR_INVALID_SYNTAX');
          }
        }
      }
    }

    if (stack.length !== 1) {
      throw new Error('ERR_INVALID_SYNTAX');
    }

    const result = stack[0];
    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('ERR_INVALID_SYNTAX');
    }
    if (!isFinite(result)) {
      throw new Error('ERR_OVERFLOW');
    }

    return this.stripPrecision(result);
  }

  /**
   * Fixes binary floating point inaccuracies (e.g. 0.1 + 0.2 = 0.3).
   * @param {number} num 
   * @returns {number}
   */
  static stripPrecision(num) {
    if (Math.abs(num) > 1e15) {
      return num; // Handled by overflow or exponential display formatting
    }
    return parseFloat(num.toFixed(12));
  }

  /**
   * Main entry point to evaluate a calculation expression string.
   * @param {string} expr 
   * @returns {{ success: boolean, result?: number, error?: string, message?: string }}
   */
  static evaluate(expr) {
    if (!expr || expr.trim() === '') {
      return { success: true, result: 0 };
    }

    try {
      const tokens = this.tokenize(expr);
      if (tokens.length === 0) return { success: true, result: 0 };

      const rpn = this.shuntingYard(tokens);
      const val = this.evaluateRPN(rpn);

      return { success: true, result: val };
    } catch (err) {
      const errCode = err.message || 'ERR_INVALID_SYNTAX';
      const messages = {
        ERR_DIV_ZERO: 'Error: Cannot divide by zero',
        ERR_NEG_SQRT: 'Error: Invalid input for √',
        ERR_INVALID_SYNTAX: 'Invalid expression',
        ERR_OVERFLOW: 'Overflow'
      };

      return {
        success: false,
        error: errCode,
        message: messages[errCode] || 'Invalid expression'
      };
    }
  }
}
