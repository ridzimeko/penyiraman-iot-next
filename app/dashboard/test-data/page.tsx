"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export default function AllData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const snapshot = await get(ref(database, "/")); // AMBIL SEMUA DATA DI ROOT
      setData(snapshot.val());
    }

    load();
  }, []);

  return (
    <div>
      <h1>All Firebase Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
