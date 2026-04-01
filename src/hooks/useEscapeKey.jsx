"use client";

import { useEffect } from "react";

export function useEscapeKey(handler) {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        handler();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handler]);
}
