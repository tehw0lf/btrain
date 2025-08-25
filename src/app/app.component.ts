import { Component, computed, effect, inject, signal } from '@angular/core';

import { NeofuraService } from './neofura.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  neofuraService = inject(NeofuraService);
  address = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.address()?.length === 34 || this.address()?.endsWith('.neo')) {
        this.neofuraService.getClaimableGasAndBneoGas(this.address());
      }
    });
  }

  isLoading = computed<boolean>(() => this.neofuraService.loadingSignal());
  claimableGas = computed<{bNEO: number, NEO: number} | null>(() => this.neofuraService.responseSignal());
  
  hasClaimableGas = computed<boolean>(() => {
    const gas = this.claimableGas();
    return gas ? (gas.bNEO > 0 || gas.NEO > 0) : false;
  });
  
  displayableGas = computed<string>(() => {
    const gas = this.claimableGas();
    if (!gas) return 'No claimable gas';
    
    const parts: string[] = [];
    if (gas.bNEO > 0) parts.push(`bNEO: ${gas.bNEO.toFixed(8)}`);
    if (gas.NEO > 0) parts.push(`NEO: ${gas.NEO.toFixed(8)}`);
    
    return parts.length > 0 ? parts.join(', ') : 'No claimable gas';
  });

  maskedAddress = computed<string>(() => {
    const addr = this.address();
    if (addr?.length === 34) {
      return addr.slice(0, 6) + '...' + addr.slice(-4);
    }
    return addr || '';
  });

  updateAddress(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.address.set(input.value);
  }
}
