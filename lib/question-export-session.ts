export function selectionKey(bank: string | null, ids: readonly string[]) {
  return JSON.stringify([bank, ids]);
}

// A selection edit cancels every UI side effect of an older export, even when
// the user later returns to exactly the same questions or bank.
export function createQuestionExportSession() {
  let key = selectionKey(null, []);
  let version = 0;
  return {
    select(bank: string | null, ids: readonly string[]) {
      const next = selectionKey(bank, ids);
      if (next === key) return false;
      key = next;
      version++;
      return true;
    },
    start(bank: string, ids: readonly string[]) {
      key = selectionKey(bank, ids);
      const request = ++version;
      return { key, isCurrent: () => request === version };
    },
    cancel() { version++; },
  };
}
