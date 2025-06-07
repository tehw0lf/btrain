import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

import { addressToScriptHash } from './util';

@Injectable({
  providedIn: 'root',
})
export class NeofuraService {
  private readonly API_URL = 'https://neofura.ngd.network/';
  private readonly HEADERS = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  responseSignal = signal<any | null>(null);
  loadingSignal = signal<boolean>(false);
  errorSignal = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  invokeFunction(address: string | null): void {
    if (!address) {
      console.error('Address is null or undefined');
      return;
    }
    (async () => {
      try {
        const scriptHash = await addressToScriptHash(address);

        this.loadingSignal.set(true);
        this.errorSignal.set(null);
        this.http
          .post<any>(
            this.API_URL,
            {
              params: [
                '0x48c40d4666f93408be1bef038b6722404d9a4c2a',
                'reward',
                [
                  {
                    type: 'Hash160',
                    value: scriptHash,
                  },
                ],
              ],
              method: 'invokefunction',
              jsonrpc: '2.0',
              id: 1,
            },
            {
              headers: this.HEADERS,
            }
          )
          .subscribe({
            next: (data) => {
              this.responseSignal.set(data);
              this.loadingSignal.set(false);
            },
            error: (err) => {
              this.errorSignal.set(err);
              this.loadingSignal.set(false);
            },
          });
      } catch (err) {
        console.error(err);
      }
    })();
  }
}
