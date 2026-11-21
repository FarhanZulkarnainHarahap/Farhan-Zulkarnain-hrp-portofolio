"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Modal from "./Modal";
const Context = createContext<(message: string) => Promise<boolean>>(
  async () => false,
);
export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const resolver = useRef<((confirmed: boolean) => void) | null>(null);
  function finish(confirmed: boolean) {
    resolver.current?.(confirmed);
    resolver.current = null;
    setMessage("");
  }
  function confirm(message: string) {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setMessage(message);
    });
  }
  return (
    <Context.Provider value={confirm}>
      {children}
      {message && (
        <Modal label="Confirm deletion" onClose={() => finish(false)}>
          <div className="confirm-content">
            <p className="eyebrow">CONFIRM ACTION</p>
            <h2>Delete this entry?</h2>
            <p>{message}</p>
            <div className="button-row">
              <button
                className="button secondary"
                onClick={() => finish(false)}
                autoFocus
              >
                Keep entry
              </button>
              <button className="button" onClick={() => finish(true)}>
                Delete entry
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Context.Provider>
  );
}
export const useConfirm = () => useContext(Context);
