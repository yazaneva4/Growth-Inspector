import test from 'node:test';
import assert from 'node:assert/strict';
import { requestText, requestNumber } from '../src/lib/request-input.ts';

test('malformed JSON field values cannot run string or number coercion', () => {
  for (const value of [null, undefined, 42, true, [], {}, { toString: null, valueOf: null }]) {
    assert.equal(requestText(value), '');
  }
  assert.equal(requestText('  Yazan  '), 'Yazan');
  for (const value of [null, undefined, true, [], {}, { toString: null, valueOf: null }]) {
    assert.ok(Number.isNaN(requestNumber(value)));
  }
  assert.equal(requestNumber('2.5'), 2.5);
  assert.equal(requestNumber(3), 3);
});
