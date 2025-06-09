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

  isLoading = computed<boolean>(() => this.neofuraService.loadingSignal());
  claimableGas = computed<string>(() => this.neofuraService.responseSignal());

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
