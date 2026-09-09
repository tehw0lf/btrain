import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ApiService } from './api.service';
import { AppComponent } from './app.component';

// The component's own logic is the computed display layer; the network call
// belongs to ApiService and is covered by replacing it with signals we drive
// directly. That keeps these tests offline and deterministic.
class ApiServiceStub {
  responseSignal = signal<{ bNEO: number; NEO: number } | null>(null);
  loadingSignal = signal<boolean>(false);
  errorSignal = signal<unknown | null>(null);
  getClaimableGasAndBneoGas = jest.fn();
  resolveNeoNS = jest.fn();
}

describe('AppComponent', () => {
  let api: ApiServiceStub;

  const createComponent = () => {
    api = new ApiServiceStub();
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ApiService, useValue: api },
      ],
    });
    return TestBed.createComponent(AppComponent).componentInstance;
  };

  describe('displayableGas', () => {
    it('reports no claimable gas before a response arrives', () => {
      expect(createComponent().displayableGas()).toBe('No claimable gas');
    });

    it('reports no claimable gas when both balances are zero', () => {
      const c = createComponent();
      api.responseSignal.set({ bNEO: 0, NEO: 0 });
      expect(c.displayableGas()).toBe('No claimable gas');
    });

    it('shows only the non-zero balance when one side is zero', () => {
      const c = createComponent();
      api.responseSignal.set({ bNEO: 1.5, NEO: 0 });
      expect(c.displayableGas()).toBe('bNEO: 1.50000000');
    });

    it('adds a total only when both balances are present', () => {
      const c = createComponent();
      api.responseSignal.set({ bNEO: 1.5, NEO: 2.25 });
      expect(c.displayableGas()).toBe(
        'bNEO: 1.50000000, NEO: 2.25000000, Total: 3.75000000'
      );
    });

    it('formats to 8 decimal places, matching GAS precision', () => {
      const c = createComponent();
      api.responseSignal.set({ bNEO: 0.00000001, NEO: 0 });
      expect(c.displayableGas()).toBe('bNEO: 0.00000001');
    });
  });

  describe('hasClaimableGas', () => {
    it('is false with no response', () => {
      expect(createComponent().hasClaimableGas()).toBe(false);
    });

    it('is false when both balances are zero', () => {
      const c = createComponent();
      api.responseSignal.set({ bNEO: 0, NEO: 0 });
      expect(c.hasClaimableGas()).toBe(false);
    });

    it('is true when either balance is non-zero', () => {
      const c = createComponent();
      api.responseSignal.set({ bNEO: 0, NEO: 0.1 });
      expect(c.hasClaimableGas()).toBe(true);
    });
  });

  describe('maskedAddress', () => {
    it('is empty when no address has been entered', () => {
      expect(createComponent().maskedAddress()).toBe('');
    });

    it('masks the middle of a 34-character address', () => {
      const c = createComponent();
      c.address.set('NPmdLGJN47EddqYcxixdGMhtkr7Z5w4Aos');
      expect(c.maskedAddress()).toBe('NPmdLG...4Aos');
    });

    it('leaves a NeoNS name unmasked', () => {
      const c = createComponent();
      c.address.set('example.neo');
      expect(c.maskedAddress()).toBe('example.neo');
    });
  });

  describe('isLoading', () => {
    it('mirrors the service loading signal', () => {
      const c = createComponent();
      expect(c.isLoading()).toBe(false);
      api.loadingSignal.set(true);
      expect(c.isLoading()).toBe(true);
    });
  });
});
