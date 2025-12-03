"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusCard from "@/components/dashboard/status-card";
import SensorChart from "@/components/dashboard/sensor-chart";
import ControlPanel from "@/components/dashboard/control-panel";
import { 
  Droplets, 
  Thermometer, 
  Cloud, 
  Power,
  AlertCircle,
  Clock,
  Zap,
  Sun,
  CloudRain
} from "lucide-react";

// Mock data untuk development
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

const mockWeatherData = {
  condition: "Cerah Berawan",
  temperature: 30,
  humidity: 65,
  rainChance: 20,
  icon: "partly-cloudy"
};

export default function DashboardPage() {
  const [sensorData, setSensorData] = useState(mockSensorData);
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState("normal");

  // Simulasi real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update data secara acak untuk simulasi
      setSensorData(prev => ({
        ...prev,
        soilMoisture: Math.max(20, Math.min(80, prev.soilMoisture + (Math.random() * 2 - 1))),
        temperature: Math.max(22, Math.min(35, prev.temperature + (Math.random() * 0.5 - 0.25))),
        humidity: Math.max(40, Math.min(90, prev.humidity + (Math.random() * 2 - 1))),
        timestamp: new Date(),
      }));
    }, 5000);

    return () => clearInterval(interval);
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

  const getStatusColor = (moisture: number) => {
    if (moisture < 30) return "text-red-600";
    if (moisture < 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusText = (moisture: number) => {
    if (moisture < 30) return "Kering";
    if (moisture < 50) return "Normal";
    return "Basah";
  };

  return (
    <div className="space-y-6">
      {/* Header dengan Weather Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Monitoring dan kontrol sistem penyiraman otomatis
          </p>
        </div>
        
        {/* Weather Card */}
        <Card className="md:w-auto w-full">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {mockWeatherData.icon === "partly-cloudy" ? (
                    <Cloud className="h-5 w-5 text-blue-600" />
                  ) : mockWeatherData.icon === "sunny" ? (
                    <Sun className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <CloudRain className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cuaca Sekarang</p>
                  <p className="font-semibold">{mockWeatherData.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{mockWeatherData.temperature}°C</p>
                <p className="text-sm text-gray-500">{mockWeatherData.humidity}% kelembaban</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <AlertCircle className="h-4 w-4" />
              <span>Kemungkinan hujan: {mockWeatherData.rainChance}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Kelembaban Tanah"
          value={`${sensorData.soilMoisture.toFixed(1)}%`}
          icon={<Droplets className="h-6 w-6" />}
          status={
            sensorData.soilMoisture < 30 
              ? "critical" 
              : sensorData.soilMoisture < 50 
              ? "warning" 
              : "normal"
          }
          description={
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(sensorData.soilMoisture)}`} />
              <span className="text-xs">{getStatusText(sensorData.soilMoisture)}</span>
            </div>
          }
        />

        <StatusCard
          title="Suhu Udara"
          value={`${sensorData.temperature.toFixed(1)}°C`}
          icon={<Thermometer className="h-6 w-6" />}
          status={
            sensorData.temperature > 35 
              ? "critical" 
              : sensorData.temperature > 30 
              ? "warning" 
              : "normal"
          }
        />

        <StatusCard
          title="Kelembaban Udara"
          value={`${sensorData.humidity.toFixed(1)}%`}
          icon={<Cloud className="h-6 w-6" />}
          status={
            sensorData.humidity > 80 
              ? "warning" 
              : sensorData.humidity < 40 
              ? "warning" 
              : "normal"
          }
        />

        <StatusCard
          title="Status Pompa"
          value={sensorData.pumpStatus ? "Menyala" : "Mati"}
          icon={<Power className="h-6 w-6" />}
          status={sensorData.pumpStatus ? "active" : "inactive"}
          variant={sensorData.pumpStatus ? "destructive" : "default"}
          description={
            sensorData.pumpStatus 
              ? "Sedang menyiram..." 
              : "Siap digunakan"
          }
        />
      </div>

      {/* Additional Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Level Air
              </CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{sensorData.waterLevel}%</span>
                <span className={`text-sm font-medium ${
                  sensorData.waterLevel < 30 ? 'text-red-600' : 
                  sensorData.waterLevel < 50 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {sensorData.waterLevel < 30 ? 'Rendah' : 
                   sensorData.waterLevel < 50 ? 'Cukup' : 
                   'Penuh'}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    sensorData.waterLevel < 30 ? 'bg-red-500' : 
                    sensorData.waterLevel < 50 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${sensorData.waterLevel}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Baterai
              </CardTitle>
              <Zap className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{sensorData.batteryLevel}%</span>
                <span className="text-sm font-medium text-green-600">
                  {sensorData.batteryLevel > 80 ? 'Penuh' : 
                   sensorData.batteryLevel > 30 ? 'Normal' : 
                   'Rendah'}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    sensorData.batteryLevel < 30 ? 'bg-red-500' : 
                    sensorData.batteryLevel < 80 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${sensorData.batteryLevel}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Status Sistem
              </CardTitle>
              <div className={`h-2 w-2 rounded-full ${
                systemStatus === 'normal' ? 'bg-green-500' :
                systemStatus === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              } animate-pulse`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {systemStatus === 'normal' ? 'Semua Normal' :
                   systemStatus === 'warning' ? 'Perhatian' :
                   'Ada Masalah'}
                </span>
                <span className={`text-sm px-2 py-1 rounded ${
                  systemStatus === 'normal' ? 'bg-green-100 text-green-800' :
                  systemStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {systemStatus === 'normal' ? 'Aktif' :
                   systemStatus === 'warning' ? 'Warning' :
                   'Error'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {systemStatus === 'normal' ? 'Semua sensor berfungsi normal' :
                 systemStatus === 'warning' ? 'Ada sensor yang perlu perhatian' :
                 'Terdeteksi masalah pada sistem'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
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
                      <div className={`mt-1 h-2 w-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-500' :
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
                    <span className={`text-xs px-2 py-1 rounded ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800' :
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

      {/* Quick Actions & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant={sensorData.pumpStatus ? "destructive" : "default"}
              className="w-full justify-start gap-2"
              onClick={() => handleManualControl(sensorData.pumpStatus ? "OFF" : "ON")}
              disabled={isLoading}
            >
              <Power className="h-4 w-4" />
              {sensorData.pumpStatus ? "Matikan Pompa" : "Nyalakan Pompa"}
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleManualControl("ON")}
              disabled={isLoading}
            >
              <Droplets className="h-4 w-4" />
              Siram 5 Menit
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => window.location.href = '/dashboard/schedule'}
            >
              <Clock className="h-4 w-4" />
              Atur Jadwal
            </Button>
            
            <Button 
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => window.location.href = '/dashboard/settings'}
            >
              <Zap className="h-4 w-4" />
              Pengaturan Sistem
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Statistik Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Penyiraman</p>
                <p className="text-3xl font-bold text-blue-900">3x</p>
                <p className="text-xs text-blue-700">Selesai</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Durasi Total</p>
                <p className="text-3xl font-bold text-green-900">15m</p>
                <p className="text-xs text-green-700">Rata-rata 5m/penyiraman</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Air Digunakan</p>
                <p className="text-3xl font-bold text-purple-900">45L</p>
                <p className="text-xs text-purple-700">±15L/penyiraman</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">Peringatan</p>
                <p className="text-3xl font-bold text-yellow-900">1x</p>
                <p className="text-xs text-yellow-700">Kelembaban rendah</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Konsumsi Air Mingguan</p>
                <p className="text-sm text-gray-500">Minggu ini vs minggu lalu</p>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-blue-500 to-green-500" style={{ width: '65%' }} />
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Senin</span>
                <span>Minggu</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {sensorData.soilMoisture < 35 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Perhatian: Kelembaban Tanah Rendah</p>
              <p className="text-sm text-yellow-700 mt-1">
                Kelembaban tanah saat ini {sensorData.soilMoisture.toFixed(1)}%. 
                Sistem akan menyiram otomatis jika mencapai 30%. 
                <Button variant="link" className="h-auto p-0 text-yellow-800 ml-1">
                  Atur threshold
                </Button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <p>
          Sistem terakhir diperbarui: {sensorData.timestamp.toLocaleTimeString('id-ID')} • 
          Status: <span className="text-green-600 font-medium">Online</span> • 
          Koneksi: <span className="text-green-600 font-medium">Stabil</span>
        </p>
      </div>
    </div>
  );
}