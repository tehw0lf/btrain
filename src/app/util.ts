import base58 from 'bs58';

// Reverse the order of bytes for little-endian format
const reverse = (src: Uint8Array): Uint8Array => {
  const out = new Uint8Array(src.length);
  for (let i = 0, j = src.length - 1; i <= j; i++, j--) {
    out[i] = src[j];
    out[j] = src[i];
  }
  return out;
};

// SHA-256 hashing using Web Crypto API
async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    data as BufferSource
  );
  return new Uint8Array(hashBuffer);
}

// Double SHA-256 (hash256) function
async function hash256(data: Uint8Array): Promise<Uint8Array> {
  const first = await sha256(data);
  const second = await sha256(first);
  return second;
}

// Calculate the Base58Check checksum (first 4 bytes of double SHA256)
async function base58Checksum(buffer: Uint8Array): Promise<Uint8Array> {
  const hash = await hash256(buffer);
  return hash.slice(0, 4); // The first 4 bytes are the checksum
}

// Base58Check decode function (async)
async function base58CheckDecode(value: string): Promise<Uint8Array> {
  const buffer = Uint8Array.from(base58.decode(value));
  if (buffer.length < 4) {
    throw new Error('Invalid base58 string');
  }
  const payload = buffer.subarray(0, buffer.length - 4);
  const checksum = buffer.subarray(buffer.length - 4);
  const payloadChecksum = await base58Checksum(payload);

  // Check if the checksum is correct
  if (!checksum.every((byte, index) => byte === payloadChecksum[index])) {
    throw new Error('Invalid checksum for base58 string: ' + value);
  }
  return payload;
}

// Convert address back to scriptHash (async)
export async function addressToScriptHash(address: string): Promise<string> {
  const decoded = await base58CheckDecode(address);

  // Extract the script hash (skip the version byte)
  const scriptHashBytes = decoded.subarray(1); // Remove version byte
  const reversedScriptHash = reverse(scriptHashBytes); // Revert bytes to match little-endian

  // Convert to hex format with 0x prefix
  return `0x${Array.from(reversedScriptHash)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`;
}
