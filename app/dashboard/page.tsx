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
  RefreshCw,
} from "lucide-react";

// Import Firebase Realtime Database
import { database } from "@/lib/firebase";
import { ref, onValue, set, update, get } from "firebase/database";
import useRealtimeFirebase from "@/hooks/useRealtimeFirebase";

// Types untuk data sensor
interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  pumpStatus: boolean;
  waterLevel: number;
  batteryLevel: number;
  timestamp: number;
  phLevel?: number;
  lightIntensity?: number;
  [key: string]: unknown;
}

interface Activity {
  id: string;
  action: string;
  time: string;
  duration?: string;
  user?: string;
  status: string;
  value?: string;
  timestamp: number;
}

interface TodayStats {
  wateringCount: number;
  totalDuration: number;
  waterUsed: number;
  warnings: number;
}

export default function DashboardPage() {
  const [sensorData, setSensorData] = useState({
    kelembapan_tanah: 0,
    kelembapan_udara: 0,
    suhu: 0,
    pumpStatus: false,
    waterLevel: 0,
    batteryLevel: 0,
    timestamp: Date.now(),
    phLevel: 0,
    lightIntensity: 0,
  });

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [todayStats, setTodayStats] = useState<TodayStats>({
    wateringCount: 0,
    totalDuration: 0,
    waterUsed: 0,
    warnings: 0,
  });
  const [autoReload, setAutoReload] = useState(true);
  const [lastReloadTime, setLastReloadTime] = useState(Date.now());
  const sensorRef = useRealtimeFirebase(["sensor", "status"]);

  // Helper function untuk mendapatkan mock data
  const getMockData = () => {
    return {
      kelembapan_tanah: 45.5 + Math.random() * 10,
      kelembapan_udara: 65 + Math.random() * 10,
      suhu: 27 + Math.random() * 3,
      pumpStatus: false,
      waterLevel: 75,
      batteryLevel: 85,
      timestamp: Date.now(),
      phLevel: 6.5,
      lightIntensity: 450,
    };
  };

  // Retry mechanism untuk koneksi Firebase
  const connectToFirebase = async (retryCount = 0) => {
    const maxRetries = 3;

    try {
      setConnectionStatus("connecting");
      setError(null);

      // Test koneksi dengan membaca data sekali
      const sensorRef = ref(database, "sensor");
      const snapshot = await get(sensorRef);

      if (snapshot.exists()) {
        const data = snapshot.val() as Partial<SensorData>;
        setSensorData(prev => ({
          ...prev,
          ...data,
          timestamp: data.timestamp || Date.now(),
        }));
        setConnectionStatus("connected");
        setIsLoading(false);
        return true;
      } else {
        // Jika tidak ada data, gunakan mock data
        console.warn("No data in Firebase, using mock data");
        setSensorData(getMockData());
        setConnectionStatus("connected");
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.error("Firebase connection error:", err);

      if (retryCount < maxRetries) {
        console.log(`Retrying connection... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return connectToFirebase(retryCount + 1);
      } else {
        setError("Tidak dapat terhubung ke Firebase. Menggunakan data simulasi.");
        setSensorData(getMockData());
        setConnectionStatus("disconnected");
        setIsLoading(false);
        return false;
      }
    }
  };

  // Real-time listener untuk data sensor
  useEffect(() => {
    if (sensorRef) {
      setSensorData(prev => ({
        ...prev,
        ...sensorRef.sensor,
        pumpStatus: sensorRef.status?.pompa === "ON",
      }));
      setConnectionStatus("connected");
      setIsLoading(false);
    }
  }, [sensorRef]);

  // Update mock data setiap 5 detik jika disconnected
  useEffect(() => {
    if (connectionStatus === "disconnected") {
      const interval = setInterval(() => {
        setSensorData(prev => ({
          ...prev,
          soilMoisture: 45.5 + Math.random() * 10,
          temperature: 27 + Math.random() * 3,
          humidity: 65 + Math.random() * 10,
          timestamp: Date.now(),
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [connectionStatus]);

  // Auto reload data setiap 30 detik
  useEffect(() => {
    if (!autoReload) return;

    const reloadInterval = setInterval(async () => {
      console.log("Auto reloading data...");
      setLastReloadTime(Date.now());

      // Refresh sensor data
      try {
        const sensorRef = ref(database, "sensor_data");
        const snapshot = await get(sensorRef);

        if (snapshot.exists()) {
          const data = snapshot.val() as Partial<SensorData>;
          setSensorData(prev => ({
            ...prev,
            ...data,
            timestamp: data.timestamp || Date.now(),
          }));
          setConnectionStatus("connected");
        }
      } catch (error) {
        console.error("Auto reload error:", error);
      }
    }, 30000); // Reload setiap 30 detik

    return () => clearInterval(reloadInterval);
  }, [autoReload]);

  // Fetch data statistik
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const statsRef = ref(database, `stats/${today}`);

    const unsubscribe = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTodayStats({
          wateringCount: data.wateringCount || 0,
          totalDuration: data.totalDuration || 0,
          waterUsed: data.waterUsed || 0,
          warnings: data.warnings || 0,
        });
      }
    }, (error) => {
      console.error("Error fetching stats:", error);
    });

    return () => unsubscribe();
  }, []);

  // Fetch aktivitas terbaru
  useEffect(() => {
    const activitiesRef = ref(database, "activities");

    const unsubscribe = onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activitiesArray: Activity[] = [];
        Object.entries(data).forEach(([key, value]) => {
          const activity = value as Omit<Activity, 'id'>;
          activitiesArray.push({
            id: key,
            ...activity,
          });
        });

        const sortedActivities = activitiesArray
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);

        setRecentActivities(sortedActivities);
      }
    }, (error) => {
      console.error("Error fetching activities:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleManualControl = async (action: "ON" | "OFF") => {
    if (connectionStatus === "disconnected") {
      alert("Tidak dapat mengontrol pompa. Koneksi terputus.");
      return;
    }

    setIsLoading(true);
    try {
      const pumpRef = ref(database, "controls/pump");
      const statusRef = ref(database, "status")
      await update(pumpRef, {
        status: action === "ON",
        mode: "manual",
        lastUpdated: Date.now(),
        updatedBy: "dashboard",
      });
      await update(statusRef, {
        pompa: action
      })

      const activityId = Date.now().toString();
      const activityRef = ref(database, `activities/${activityId}`);
      await set(activityRef, {
        action: action === "ON" ? "Pompa dinyalakan manual" : "Pompa dimatikan manual",
        time: new Date().toLocaleTimeString('id-ID'),
        user: "Admin",
        status: "completed",
        timestamp: Date.now(),
      });

      setSensorData(prev => ({
        ...prev,
        pumpStatus: action === "ON",
      }));

      if (action === "ON") {
        const today = new Date().toISOString().split('T')[0];
        const statsRef = ref(database, `stats/${today}`);

        const snapshot = await get(statsRef);
        const currentStats = snapshot.val() || {};

        await update(statsRef, {
          wateringCount: (currentStats.wateringCount || 0) + 1,
          lastUpdated: Date.now(),
        });
      }

    } catch (error) {
      console.error("Error updating pump status:", error);
      alert("Gagal mengontrol pompa: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickWater = async () => {
    if (connectionStatus === "disconnected") {
      alert("Tidak dapat memulai penyiraman. Koneksi terputus.");
      return;
    }

    setIsLoading(true);
    try {
      const quickWaterRef = ref(database, "controls/quickWater");
      await set(quickWaterRef, {
        duration: 5,
        startTime: Date.now(),
        status: "active",
      });

      const activityId = `${Date.now()}_quick`;
      const activityRef = ref(database, `activities/${activityId}`);
      await set(activityRef, {
        action: "Penyiraman cepat 5 menit",
        time: new Date().toLocaleTimeString('id-ID'),
        duration: "5 menit",
        user: "Admin",
        status: "completed",
        timestamp: Date.now(),
      });

      const today = new Date().toISOString().split('T')[0];
      const statsRef = ref(database, `stats/${today}`);

      const snapshot = await get(statsRef);
      const currentStats = snapshot.val() || {};

      await update(statsRef, {
        wateringCount: (currentStats.wateringCount || 0) + 1,
        totalDuration: (currentStats.totalDuration || 0) + 5,
        waterUsed: (currentStats.waterUsed || 0) + 15,
        lastUpdated: Date.now(),
      });

    } catch (error) {
      console.error("Error starting quick water:", error);
      alert("Gagal memulai penyiraman: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    connectToFirebase();
  };

  const toggleAutoReload = () => {
    setAutoReload(!autoReload);
  };

  const handleManualReload = async () => {
    setLastReloadTime(Date.now());
    await connectToFirebase();
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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state dengan retry button
  if (isLoading && sensorData.kelembapan_tanah === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Menghubungkan ke Firebase...</p>
          {error && (
            <div className="mt-4">
              <p className="text-red-600 text-sm">{error}</p>
              <Button onClick={handleRetry} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auto Reload Control Banner */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${autoReload ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <div>
              <p className="font-medium text-blue-900">
                Auto Reload: {autoReload ? 'Aktif' : 'Nonaktif'}
              </p>
              <p className="text-xs text-blue-700">
                {autoReload ? 'Data diperbarui otomatis setiap 30 detik' : 'Reload manual diperlukan'}
                {' • Terakhir: '}
                {formatTime(lastReloadTime)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualReload}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Reload Sekarang
            </Button>
            <Button
              variant={autoReload ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoReload}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {autoReload ? 'Auto ON' : 'Auto OFF'}
            </Button>
          </div>
        </div>
      </div> */}

      {/* Connection Status Banner */}
      {connectionStatus === "disconnected" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Mode Offline</p>
              <p className="text-sm text-yellow-700 mt-1">
                Koneksi ke Firebase terputus. Menampilkan data simulasi.
                <Button
                  variant="link"
                  className="h-auto p-0 text-yellow-800 ml-1"
                  onClick={handleRetry}
                >
                  Coba sambungkan kembali
                </Button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Kelembaban Tanah"
          value={`${sensorData.kelembapan_tanah.toFixed(1)}%`}
          icon={<Droplets className="h-6 w-6" />}
          status={
            sensorData.kelembapan_tanah < 30
              ? "critical"
              : sensorData.kelembapan_tanah < 50
                ? "warning"
                : "normal"
          }
          description={
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(sensorData.kelembapan_tanah)}`} />
              <span className="text-xs">{getStatusText(sensorData.kelembapan_tanah)}</span>
            </div>
          }
        />

        <StatusCard
          title="Suhu Udara"
          value={`${sensorData.suhu.toFixed(1)}°C`}
          icon={<Thermometer className="h-6 w-6" />}
          status={
            sensorData.suhu > 35
              ? "critical"
              : sensorData.suhu > 30
                ? "warning"
                : "normal"
          }
        />

        <StatusCard
          title="Kelembaban Udara"
          value={`${sensorData.kelembapan_udara.toFixed(1)}%`}
          icon={<Cloud className="h-6 w-6" />}
          status={
            sensorData.kelembapan_udara > 80
              ? "warning"
              : sensorData.kelembapan_udara < 40
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Grafik</TabsTrigger>
          <TabsTrigger value="control">Kontrol</TabsTrigger>
          <TabsTrigger value="activity">Aktivitas</TabsTrigger>
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
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
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
                            <span>{formatTime(activity.timestamp)}</span>
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
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">Belum ada aktivitas</p>
                )}
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
              disabled={isLoading || connectionStatus === "disconnected"}
            >
              <Power className="h-4 w-4" />
              {sensorData.pumpStatus ? "Matikan Pompa" : "Nyalakan Pompa"}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleQuickWater}
              disabled={isLoading || connectionStatus === "disconnected"}
            >
              <Droplets className="h-4 w-4" />
              Siram 5 Menit
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
                <p className="text-3xl font-bold text-blue-900">{todayStats.wateringCount}x</p>
                <p className="text-xs text-blue-700">Selesai</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Durasi Total</p>
                <p className="text-3xl font-bold text-green-900">{todayStats.totalDuration}m</p>
                <p className="text-xs text-green-700">
                  Rata-rata {todayStats.wateringCount > 0 ?
                    (todayStats.totalDuration / todayStats.wateringCount).toFixed(1) : 0}m/penyiraman
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Air Digunakan</p>
                <p className="text-3xl font-bold text-purple-900">{todayStats.waterUsed}L</p>
                <p className="text-xs text-purple-700">
                  ±{todayStats.wateringCount > 0 ?
                    (todayStats.waterUsed / todayStats.wateringCount).toFixed(1) : 0}L/penyiraman
                </p>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">Peringatan</p>
                <p className="text-3xl font-bold text-yellow-900">{todayStats.warnings}x</p>
                <p className="text-xs text-yellow-700">
                  {sensorData.kelembapan_tanah < 35 ? 'Kelembaban rendah' : 'Tidak ada'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {sensorData.kelembapan_tanah < 35 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Perhatian: Kelembaban Tanah Rendah</p>
              <p className="text-sm text-yellow-700 mt-1">
                Kelembaban tanah saat ini {sensorData.kelembapan_tanah.toFixed(1)}%.
                Sistem akan menyiram otomatis jika mencapai 30%.
                <Button
                  variant="link"
                  className="h-auto p-0 text-yellow-800 ml-1"
                  onClick={() => window.location.href = '/dashboard/settings'}
                >
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
          Sistem terakhir diperbarui: {formatTime(sensorData.timestamp)} •
          Status: <span className={`font-medium ${connectionStatus === "connected" ? "text-green-600" :
              connectionStatus === "connecting" ? "text-yellow-600" :
                "text-red-600"
            }`}>
            {connectionStatus === "connected" ? "Online" :
              connectionStatus === "connecting" ? "Menghubungkan..." :
                "Offline"}
          </span> •
          Koneksi: <span className={`font-medium ${connectionStatus === "connected" ? "text-green-600" : "text-red-600"
            }`}>
            {connectionStatus === "connected" ? "Stabil" : "Terputus"}
          </span>
        </p>
      </div>
    </div>
  );
}