import { useState } from "react";

export function useLocalStorage<T>(cle: string, valeurInitiale: T): [T, (v: T) => void] {
  const [valeur, setValeurState] = useState<T>(() => {
    const stocke = window.localStorage.getItem(cle);
    if (stocke === null) {
      return valeurInitiale;
    }
    try {
      return JSON.parse(stocke) as T;
    } catch {
      return valeurInitiale;
    }
  });

  function setValeur(v: T): void {
    setValeurState(v);
    window.localStorage.setItem(cle, JSON.stringify(v));
  }

  return [valeur, setValeur];
}