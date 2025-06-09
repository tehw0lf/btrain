import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Buffer } from 'buffer';
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs';

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

  getClaimableGas(address: string | null): void {
    if (!address) {
      console.error('Address is null or undefined');
      return;
    }
    (async () => {
      let scriptHash = '';
      try {
        scriptHash = await addressToScriptHash(address);
      } catch (err) {
        try {
          const resolvedAddress = await lastValueFrom(
            this.resolveNeoNS(address)
          );
          scriptHash = await addressToScriptHash(
            Buffer.from(resolvedAddress, 'base64').toString('utf-8')
          );
        } catch (err2) {
          console.error(err2);
        }
      }
      if (scriptHash === '') {
        console.error('Failed to resolve script hash for address:', address);
        return;
      }
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
            this.responseSignal.set(
              parseInt(data?.result?.stack[0]?.value) / 100000000
            );
            this.loadingSignal.set(false);
          },
          error: (err) => {
            this.errorSignal.set(err);
            this.loadingSignal.set(false);
          },
        });
    })();
  }

  resolveNeoNS(address: string | null): Observable<any> {
    if (!address) {
      console.error('Address is null or undefined');
      return of();
    }
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<any>(
        this.API_URL,
        {
          params: [
            '0x50ac1c37690cc2cfc594472833cf57505d5f46de',
            'resolve',
            [
              { type: 'String', value: address },
              { type: 'Integer', value: 16 },
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
      .pipe(
        catchError((err) => {
          this.errorSignal.set(err);
          this.loadingSignal.set(false);
          return of();
        }),
        map((data: any) => data.result?.stack[0]?.value || null)
      );
  }
}
