import { useEffect, useState } from "react";

export function useDebounce<T>(valeur: T, delai: number): T {
  const [valeurDebattue, setValeurDebattue] = useState<T>(valeur);

  useEffect(() => {
    const timer = setTimeout(() => {
      setValeurDebattue(valeur);
    }, delai);

    return () => clearTimeout(timer);
  }, [valeur, delai]);

  return valeurDebattue;
}