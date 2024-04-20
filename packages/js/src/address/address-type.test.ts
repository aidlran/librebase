import { describe, expect, test } from 'vitest';
import { AddressType } from './address-type';

describe('Address type', () => {
  test('BIP32', () => expect(AddressType.BIP32).toBe(0));
});
