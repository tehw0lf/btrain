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
      if (this.address()) {
        this.neofuraService.invokeFunction(this.address());
      }
    });
  }

  claimableGas = computed<string>(() => {
    if (this.address() !== null) {
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
    } else {
      return 'error fetching claimable gas';
    }
  });

  maskedAddress = computed<string>(() => {
    const addr = this.address();
    if (addr && addr.length > 8) {
      return addr.slice(0, 6) + '...' + addr.slice(-4);
    }
    return addr || '';
  });

  updateAddress(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.address.set(input.value);
  }
}
