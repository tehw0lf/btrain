import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { webcrypto } from 'node:crypto';

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

// jsdom ships no Web Crypto implementation, so `crypto.subtle` is undefined
// under Jest even though every browser provides it. util.ts hashes with
// crypto.subtle.digest, so without this the SHA-256 path cannot be tested at
// all. Node's webcrypto is the same WebCrypto API, so the code under test runs
// unmodified.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
  });
}
