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
        this.neofuraService.getClaimableGas(this.address());
      }
    });
  }

  claimableGas = computed<string>(() => {
    return (
      this.neofuraService
        .responseSignal()
        ?.result?.stack[0]?.value.padStart(9, '0')
        .slice(0, 1) +
        '.' +
        this.neofuraService
          .responseSignal()
          ?.result?.stack[0]?.value.padStart(9, '0')
          .slice(1) || 'error fetching claimable gas'
    );
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
