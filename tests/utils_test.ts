/**
 * Tests for utility functions
 */

import { assertEquals, assertExists, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  formatTimestamp,
  generateOutTradeNo,
  formatAmount,
  snakeCaseKeys,
  camelCaseKeys,
  decamelize,
  camelize,
  removeEmptyValues,
  validateRequiredParams,
} from '../src/utils.ts';

Deno.test('formatTimestamp', () => {
  const timestamp = formatTimestamp();
  assertEquals(typeof timestamp, 'string');
  assertEquals(timestamp.length, 19);
  assertEquals(timestamp.charAt(10), ' ');
});

Deno.test('generateOutTradeNo', () => {
  const orderNo = generateOutTradeNo('TEST');
  assertEquals(typeof orderNo, 'string');
  assertEquals(orderNo.startsWith('TEST_'), true);
});

Deno.test('formatAmount', () => {
  assertEquals(formatAmount(10), '10.00');
  assertEquals(formatAmount('5.5'), '5.50');
  assertEquals(formatAmount(0.1), '0.10');
});

Deno.test('decamelize', () => {
  assertEquals(decamelize('outTradeNo'), 'out_trade_no');
  assertEquals(decamelize('userId'), 'user_id');
  assertEquals(decamelize('simple'), 'simple');
});

Deno.test('camelize', () => {
  assertEquals(camelize('out_trade_no'), 'outTradeNo');
  assertEquals(camelize('user_id'), 'userId');
  assertEquals(camelize('simple'), 'simple');
});

Deno.test('snakeCaseKeys', () => {
  const input = {
    outTradeNo: 'test',
    totalAmount: '10.00',
    nested: {
      userName: 'john',
    },
  };
  
  const result = snakeCaseKeys(input);
  assertEquals(result.out_trade_no, 'test');
  assertEquals(result.total_amount, '10.00');
  assertEquals(result.nested.user_name, 'john');
});

Deno.test('camelCaseKeys', () => {
  const input = {
    out_trade_no: 'test',
    total_amount: '10.00',
    nested: {
      user_name: 'john',
    },
  };
  
  const result = camelCaseKeys(input);
  assertEquals(result.outTradeNo, 'test');
  assertEquals(result.totalAmount, '10.00');
  assertEquals(result.nested.userName, 'john');
});

Deno.test('removeEmptyValues', () => {
  const input = {
    name: 'test',
    value: '',
    count: 0,
    flag: null,
    data: undefined,
    valid: false,
  };
  
  const result = removeEmptyValues(input);
  assertEquals(result.name, 'test');
  assertEquals(result.count, 0);
  assertEquals(result.valid, false);
  assertEquals(result.value, undefined);
  assertEquals(result.flag, undefined);
  assertEquals(result.data, undefined);
});

Deno.test('validateRequiredParams - success', () => {
  const params = { name: 'test', value: 'data' };
  validateRequiredParams(params, ['name', 'value']);
  // Should not throw
});

Deno.test('validateRequiredParams - failure', () => {
  const params = { name: 'test' };
  assertThrows(
    () => validateRequiredParams(params, ['name', 'value']),
    Error,
    '缺少必填参数: value'
  );
});