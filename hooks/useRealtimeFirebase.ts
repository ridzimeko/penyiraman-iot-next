/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export default function useRealtimeFirebase<T = any>(paths: string[]) {
  const [data, setData] = useState<Record<string, T>>({});
  const dataRef = useRef<Record<string, T>>({});

  useEffect(() => {
    if (!paths || paths.length === 0) return;

    const listeners: (() => void)[] = [];

    paths.forEach((path) => {
      const r = ref(database, path);

      const unsubscribe = onValue(r, (snapshot) => {
        const newValue = snapshot.val();

        // ⛔ stop update kalau data sama
        if (dataRef.current[path] === newValue) return;

        dataRef.current = {
          ...dataRef.current,
          [path]: newValue,
        };

        setData(dataRef.current);
      });

      listeners.push(unsubscribe);
    });

    return () => {
      listeners.forEach((unsub) => unsub());
    };
  }, [paths]); // 🔥 penting

  return data;
}
