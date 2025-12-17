"use client";

import { useEffect, useState } from "react";
import useRealtimeFirebase from "@/hooks/useRealtimeFirebase";

export default function AllData() {
  const [data, setData] = useState<any>(null);
  const sensorRef = useRealtimeFirebase(["/"])

  useEffect(() => {
   return setData(sensorRef);

  }, [sensorRef]);

  return (
    <div>
      <h1>All Firebase Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
