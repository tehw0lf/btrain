import { addressToScriptHash } from './util';

// Verified round-trip vectors: each address was constructed from the script
// hash below and decoded back through this module, so the expectation is the
// contract's own documented behaviour rather than a snapshot of whatever it
// currently returns.
const BNEO_CONTRACT_ADDRESS = 'NPmdLGJN47EddqYcxixdGMhtkr7Z5w4Aos';
const BNEO_CONTRACT_SCRIPT_HASH = '0x48c40d4666f93408be1bef038b6722404d9a4c2a';

// The NEO burn address decodes to an all-zero script hash. It is a useful
// boundary case precisely because byte order cannot be observed in it.
const BURN_ADDRESS = 'NKuyBkoGdZZSLyPbJEetheRhMjeznFZszf';
const BURN_SCRIPT_HASH = '0x0000000000000000000000000000000000000000';

describe('addressToScriptHash', () => {
  it('converts a valid address to its little-endian script hash', async () => {
    await expect(addressToScriptHash(BNEO_CONTRACT_ADDRESS)).resolves.toBe(
      BNEO_CONTRACT_SCRIPT_HASH
    );
  });

  it('reverses byte order rather than returning the decoded payload', async () => {
    // Guards the little-endian conversion specifically: if `reverse` were
    // dropped, this would come back as the big-endian hash instead.
    const result = await addressToScriptHash(BNEO_CONTRACT_ADDRESS);
    const bigEndian =
      '0x2a4c9a4d402267' + '8b03ef1bbe0834f96646' + '0dc448';
    expect(result).not.toBe(bigEndian);
    expect(result).toBe(BNEO_CONTRACT_SCRIPT_HASH);
  });

  it('handles an all-zero script hash', async () => {
    await expect(addressToScriptHash(BURN_ADDRESS)).resolves.toBe(
      BURN_SCRIPT_HASH
    );
  });

  it('always returns 20 bytes in 0x-prefixed hex', async () => {
    const result = await addressToScriptHash(BNEO_CONTRACT_ADDRESS);
    expect(result).toMatch(/^0x[0-9a-f]{40}$/);
  });

  it('rejects an address whose checksum does not match', async () => {
    // Last character altered: still valid base58, wrong checksum.
    const tampered = BNEO_CONTRACT_ADDRESS.slice(0, -1) + 'p';
    await expect(addressToScriptHash(tampered)).rejects.toThrow(
      /Invalid checksum/
    );
  });

  it('rejects a string too short to carry a checksum', async () => {
    await expect(addressToScriptHash('1')).rejects.toThrow(
      'Invalid base58 string'
    );
  });

  it('rejects a string containing non-base58 characters', async () => {
    // '0', 'O', 'I' and 'l' are excluded from the base58 alphabet.
    await expect(addressToScriptHash('0OIl')).rejects.toThrow();
  });
});
