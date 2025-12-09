"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Clock,
} from "lucide-react";
import ControlPanel from "@/components/dashboard/control-panel";
import SensorChart from "@/components/dashboard/sensor-chart";

const mockSensorData = {
  soilMoisture: 45.7,
  temperature: 28.5,
  humidity: 65.2,
  pumpStatus: false,
  waterLevel: 85,
  batteryLevel: 92,
  timestamp: new Date(),
  phLevel: 6.8,
  lightIntensity: 850
};

const mockRecentActivities = [
  { id: 1, action: "Penyiraman otomatis", time: "10:30", duration: "5 menit", status: "completed" },
  { id: 2, action: "Sensor membaca data", time: "10:25", value: "Kelembaban: 42%", status: "completed" },
  { id: 3, action: "Mode diubah ke Otomatis", time: "09:45", user: "Admin", status: "completed" },
  { id: 4, action: "Penyiraman jadwal", time: "06:00", duration: "10 menit", status: "completed" },
  { id: 5, action: "Peringatan: Kelembaban rendah", time: "05:30", status: "warning" },
];

export default function ControlPage() {
  const [sensorData, setSensorData] = useState(mockSensorData);
  const [isLoading, setIsLoading] = useState(false);

    const handleManualControl = async (action: "ON" | "OFF") => {
    setIsLoading(true);
    // Simulasi API call delay
    setTimeout(() => {
      setSensorData(prev => ({
        ...prev,
        pumpStatus: action === "ON",
      }));
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">

      {/* Main Control Tabs */}
      <Tabs defaultValue="control" className="space-y-4">

        <TabsContent value="control">
          <Card>
            <CardContent>
              <ControlPanel
                currentMode="auto"
                pumpStatus={sensorData.pumpStatus}
                onManualControl={handleManualControl}
                loading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart">
          <SensorChart />
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terkini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRecentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-2 w-2 rounded-full ${activity.status === 'completed' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`} />
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{activity.time}</span>
                          {activity.duration && (
                            <>
                              <span>•</span>
                              <span>{activity.duration}</span>
                            </>
                          )}
                          {activity.user && (
                            <>
                              <span>•</span>
                              <span>by {activity.user}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                      activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {activity.status === 'completed' ? 'Selesai' :
                        activity.status === 'warning' ? 'Peringatan' :
                          'Berjalan'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}