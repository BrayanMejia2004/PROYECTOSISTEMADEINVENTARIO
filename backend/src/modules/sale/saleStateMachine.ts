import { ApiError } from '../../shared/utils/apiError/ApiError';

export type SaleStatus = 'completed' | 'cancelled' | 'refunded' | 'pending' | 'partial';

interface SaleState {
  readonly status: SaleStatus;
  canTransitionTo(target: SaleStatus): boolean;
  canRefund(): boolean;
  canCancel(): boolean;
}

class CompletedState implements SaleState {
  readonly status: SaleStatus = 'completed';

  canTransitionTo(target: SaleStatus): boolean {
    return target === 'refunded' || target === 'cancelled';
  }

  canRefund(): boolean {
    return true;
  }

  canCancel(): boolean {
    return true;
  }
}

class CancelledState implements SaleState {
  readonly status: SaleStatus = 'cancelled';

  canTransitionTo(_target: SaleStatus): boolean {
    return false;
  }

  canRefund(): boolean {
    return false;
  }

  canCancel(): boolean {
    return false;
  }
}

class RefundedState implements SaleState {
  readonly status: SaleStatus = 'refunded';

  canTransitionTo(_target: SaleStatus): boolean {
    return false;
  }

  canRefund(): boolean {
    return false;
  }

  canCancel(): boolean {
    return false;
  }
}

class PendingState implements SaleState {
  readonly status: SaleStatus = 'pending';

  canTransitionTo(target: SaleStatus): boolean {
    return target === 'completed' || target === 'cancelled';
  }

  canRefund(): boolean {
    return false;
  }

  canCancel(): boolean {
    return true;
  }
}

class PartialState implements SaleState {
  readonly status: SaleStatus = 'partial';

  canTransitionTo(target: SaleStatus): boolean {
    return target === 'completed' || target === 'cancelled' || target === 'refunded';
  }

  canRefund(): boolean {
    return true;
  }

  canCancel(): boolean {
    return true;
  }
}

class SaleStateMachine {
  private states = new Map<SaleStatus, SaleState>();

  constructor() {
    const allStates: SaleState[] = [
      new CompletedState(),
      new CancelledState(),
      new RefundedState(),
      new PendingState(),
      new PartialState(),
    ];
    for (const s of allStates) {
      this.states.set(s.status, s);
    }
  }

  getState(status: SaleStatus): SaleState {
    const state = this.states.get(status);
    if (!state) {
      throw ApiError.badRequest(`Estado de venta inválido: ${status}`);
    }
    return state;
  }

  transition(from: SaleStatus, to: SaleStatus): void {
    const state = this.getState(from);
    if (!state.canTransitionTo(to)) {
      throw ApiError.badRequest(
        `No se puede cambiar el estado de "${from}" a "${to}". Transición no permitida.`
      );
    }
  }

  canRefund(status: SaleStatus): boolean {
    return this.getState(status).canRefund();
  }

  canCancel(status: SaleStatus): boolean {
    return this.getState(status).canCancel();
  }
}

export const saleStateMachine = new SaleStateMachine();
