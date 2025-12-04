"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Droplets,
  Clock,
  Settings,
  StopCircle,
  Timer,
  RotateCcw,
  Power
} from "lucide-react";
import ControlPanel from "@/components/dashboard/control-panel";
import SensorChart from "@/components/dashboard/sensor-chart";

// Type definitions
interface Zone {
  id: string;
  name: string;
  status: "active" | "inactive" | "error";
  moisture: number;
  temperature: number;
  duration: number;
  valveStatus: boolean;
  lastWatered: Date;
}

interface Schedule {
  id: string;
  name: string;
  time: string;
  duration: number;
  days: string[];
  zones: string[];
  enabled: boolean;
}

interface ControlLog {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details: string;
}

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

  // Initialize state with mock data
  const [zones, setZones] = useState<Zone[]>([
    {
      id: "zone_1",
      name: "Taman Depan",
      status: "active",
      moisture: 45.7,
      temperature: 28.5,
      duration: 10,
      valveStatus: false,
      lastWatered: new Date()
    },
    {
      id: "zone_2",
      name: "Taman Belakang",
      status: "inactive",
      moisture: 28.3,
      temperature: 27.8,
      duration: 15,
      valveStatus: false,
      lastWatered: new Date()
    },
    {
      id: "zone_3",
      name: "Green House",
      status: "active",
      moisture: 65.2,
      temperature: 30.2,
      duration: 8,
      valveStatus: true,
      lastWatered: new Date()
    },
    {
      id: "zone_4",
      name: "Kebun Sayur",
      status: "error",
      moisture: 0,
      temperature: 25.5,
      duration: 12,
      valveStatus: false,
      lastWatered: new Date()
    }
  ]);

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: "schedule_1",
      name: "Penyiraman Pagi",
      time: "06:00",
      duration: 10,
      days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
      zones: ["zone_1", "zone_2"],
      enabled: true
    },
    {
      id: "schedule_2",
      name: "Penyiraman Sore",
      time: "17:00",
      duration: 15,
      days: ["Senin", "Rabu", "Jumat"],
      zones: ["zone_1", "zone_3"],
      enabled: true
    },
    {
      id: "schedule_3",
      name: "Penyiraman Malam",
      time: "20:00",
      duration: 8,
      days: ["Sabtu", "Minggu"],
      zones: ["zone_2"],
      enabled: false
    }
  ]);

  const [logs, setLogs] = useState<ControlLog[]>([
    {
      id: "log_1",
      action: "Manual Start",
      user: "Admin",
      timestamp: new Date(),
      details: "Zone 3 - Green House, Durasi: 8 menit"
    },
    {
      id: "log_2",
      action: "Schedule Triggered",
      user: "System",
      timestamp: new Date(),
      details: "Penyiraman Pagi, Zone 1 & 2, Durasi: 10 menit"
    },
    {
      id: "log_3",
      action: "Valve Error",
      user: "System",
      timestamp: new Date(),
      details: "Zone 4 - Kebun Sayur, Valve tidak merespons"
    },
    {
      id: "log_4",
      action: "Manual Stop",
      user: "Admin",
      timestamp: new Date(),
      details: "Zone 1 - Taman Depan, Emergency stop"
    }
  ]);

  const [systemMode, setSystemMode] = useState<"auto" | "manual" | "schedule">("auto");
  const [wateringDuration, setWateringDuration] = useState(10);
  const [isWatering, setIsWatering] = useState(false);
  const [currentTime] = useState(new Date());

  const stopAllWatering = useCallback(() => {
    setZones(prev => prev.map(zone => ({ ...zone, valveStatus: false })));
    setIsWatering(false);

    // Add log entry
    setLogs(prev => [{
      id: `log_${Date.now()}`,
      action: "Emergency Stop",
      user: "Admin",
      timestamp: new Date(),
      details: "Semua zona dihentikan"
    }, ...prev.slice(0, 9)]);
  }, []);


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

  const resetSystem = useCallback(() => {
    setZones(prev => prev.map(zone => ({
      ...zone,
      valveStatus: false
    })));
    setIsWatering(false);

    // Add log entry
    setLogs(prev => [{
      id: `log_${Date.now()}`,
      action: "System Reset",
      user: "Admin",
      timestamp: new Date(),
      details: "Semua valve ditutup, sistem direset"
    }, ...prev.slice(0, 9)]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kontrol Sistem</h1>
          <p className="text-gray-600">
            Kontrol manual dan pengaturan sistem penyiraman
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={isWatering ? "destructive" : "default"}
            onClick={stopAllWatering}
            className="gap-2"
            disabled={!isWatering}
          >
            <StopCircle className="h-4 w-4" />
            Stop Semua
          </Button>

          <Button
            variant="outline"
            onClick={resetSystem}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Sistem
          </Button>
        </div>
      </div>

      {/* Main Control Tabs */}
      <Tabs defaultValue="control" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="control" className="flex items-center gap-2">
            <Power className="h-4 w-4" />
            Kontrol
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Grafik
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Aktivitas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="control">
          <Card>
            <CardHeader>
              <CardTitle>Kontrol Sistem</CardTitle>
            </CardHeader>
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