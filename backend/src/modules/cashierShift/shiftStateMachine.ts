import { ApiError } from '../../shared/utils/apiError/ApiError';

export type ShiftStatus = 'open' | 'closed';

interface ShiftState {
  readonly status: ShiftStatus;
  canTransitionTo(target: ShiftStatus): boolean;
  canRegisterMovement(): boolean;
}

class OpenState implements ShiftState {
  readonly status: ShiftStatus = 'open';

  canTransitionTo(target: ShiftStatus): boolean {
    return target === 'closed';
  }

  canRegisterMovement(): boolean {
    return true;
  }
}

class ClosedState implements ShiftState {
  readonly status: ShiftStatus = 'closed';

  canTransitionTo(_target: ShiftStatus): boolean {
    return false;
  }

  canRegisterMovement(): boolean {
    return false;
  }
}

class ShiftStateMachine {
  private states = new Map<ShiftStatus, ShiftState>();

  constructor() {
    const allStates: ShiftState[] = [new OpenState(), new ClosedState()];
    for (const s of allStates) {
      this.states.set(s.status, s);
    }
  }

  getState(status: ShiftStatus): ShiftState {
    const state = this.states.get(status);
    if (!state) {
      throw ApiError.badRequest(`Estado de turno inválido: ${status}`);
    }
    return state;
  }

  transition(from: ShiftStatus, to: ShiftStatus): void {
    const state = this.getState(from);
    if (!state.canTransitionTo(to)) {
      throw ApiError.badRequest(
        `No se puede cambiar el turno de "${from}" a "${to}". Transición no permitida.`
      );
    }
  }

  canRegisterMovement(status: ShiftStatus): boolean {
    return this.getState(status).canRegisterMovement();
  }
}

export const shiftStateMachine = new ShiftStateMachine();
