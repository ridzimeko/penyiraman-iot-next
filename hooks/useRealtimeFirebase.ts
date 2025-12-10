"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export default function useRealtimeFirebase<T = any>(paths: string[]) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (!paths.length) return;

    const unsubscribers: any[] = [];

    paths.forEach((path) => {
      const r = ref(database, path);

      const unsub = onValue(r, (snapshot) => {
        setData((prev: any) => ({
          ...prev,
          [path]: snapshot.val(),
        }));
      });

      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach((u) => u());
  }, [paths]);

  return data;
}
