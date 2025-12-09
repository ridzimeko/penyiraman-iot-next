"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SensorChart from "@/components/dashboard/sensor-chart";

export default function MonitoringPage() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Charts */}
          <SensorChart />
        </TabsContent>
      </Tabs>

    </div>
  );
}