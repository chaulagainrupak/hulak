"use client";

import { useState, useEffect } from "react";

export default function FirstLoadPage() {
  const [isFirstLoad, setIsFirstLoad] = useState<boolean | null>(null);

  useEffect(() => {
    const localState = localStorage.getItem("isFirstLoad");

    if (!localState) {
      localStorage.setItem("isFirstLoad", "true");
      setIsFirstLoad(true);
    } else {
      setIsFirstLoad(false);
    }
  }, []);

  if (isFirstLoad === null) {
    return <>Loading...</>;
  }

  return <>{isFirstLoad ? "First Load" : "Not First Load"}</>;
}
