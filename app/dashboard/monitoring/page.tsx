"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Droplets,
  Cloud,
  Battery,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Clock,
  History
} from "lucide-react";
import SensorChart from "@/components/dashboard/sensor-chart";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Type definitions
interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  lastUpdate: Date;
  location: string;
  battery: number;
}

interface Alert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  timestamp: Date;
  sensor: string;
  resolved: boolean;
}

export default function MonitoringPage() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showResolvedAlerts, setShowResolvedAlerts] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Initialize data on component mount
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  const locations = ["all", "Taman Depan", "Taman Belakang", "Green House"];
  const timeRanges = [
    { label: "1 Jam", value: "1h" },
    { label: "6 Jam", value: "6h" },
    { label: "12 Jam", value: "12h" },
    { label: "24 Jam", value: "24h" },
    { label: "3 Hari", value: "3d" },
    { label: "7 Hari", value: "7d" },
  ];

  const filteredSensors = selectedLocation === "all"
    ? sensors
    : sensors.filter(sensor => sensor.location === selectedLocation);

  const filteredAlerts = showResolvedAlerts
    ? alerts
    : alerts.filter(alert => !alert.resolved);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setSensors(prev => prev.map(sensor => ({
        ...sensor,
        value: sensor.status === "critical"
          ? Math.min(100, sensor.value + Math.random() * 10)
          : sensor.value + (Math.random() * 2 - 1),
        lastUpdate: new Date(),
        battery: Math.max(0, sensor.battery - 0.5)
      })));
      setIsRefreshing(false);
    }, 1500);
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "normal": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical": return <AlertTriangle className="h-4 w-4" />;
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      case "normal": return <CheckCircle2 className="h-4 w-4" />;
      default: return null;
    }
  };

  const exportData = () => {
    const csvContent = [
      ["Sensor", "Nilai", "Satuan", "Status", "Lokasi", "Baterai", "Update Terakhir"],
      ...filteredSensors.map(sensor => [
        sensor.name,
        sensor.value.toString(),
        sensor.unit,
        sensor.status,
        sensor.location,
        `${sensor.battery}%`,
        format(sensor.lastUpdate, "dd/MM/yyyy HH:mm:ss")
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor-monitoring-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoring Sensor</h1>
          <p className="text-gray-600">
            Pantau data real-time dari semua sensor sistem
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>

          <Button
            variant="outline"
            onClick={exportData}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Filter Lokasi
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location === "all" ? "Semua Lokasi" : location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Rentang Waktu Grafik
              </label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih rentang waktu" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setShowResolvedAlerts(!showResolvedAlerts)}
                className="gap-2"
              >
                {showResolvedAlerts ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Sembunyikan Resolved
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Tampilkan Resolved
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="overview" className="gap-2">
            <Gauge className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sensors" className="gap-2">
            <Droplets className="h-4 w-4" />
            Sensor Detail
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alert & Notifikasi
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sensor</p>
                    <p className="text-2xl font-bold">{sensors.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Droplets className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Aktif</span>
                    <span className="font-medium text-green-600">
                      {sensors.filter(s => s.status === "normal").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Warning</span>
                    <span className="font-medium text-yellow-600">
                      {sensors.filter(s => s.status === "warning").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Critical</span>
                    <span className="font-medium text-red-600">
                      {sensors.filter(s => s.status === "critical").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rata-rata Kelembaban</p>
                    <p className="text-2xl font-bold">
                      {sensors.filter(s => s.name.includes("Kelembaban")).length > 0
                        ? Math.round(sensors.filter(s => s.name.includes("Kelembaban")).reduce((acc, s) => acc + s.value, 0) / sensors.filter(s => s.name.includes("Kelembaban")).length)
                        : 0
                      }%
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Cloud className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600">Status Tanah</div>
                  <div className="mt-1 flex items-center gap-2">
                    {sensors.filter(s => s.status === "critical").length > 0 ? (
                      <Badge variant="destructive">Butuh Perhatian</Badge>
                    ) : sensors.filter(s => s.status === "warning").length > 0 ? (
                      <Badge variant="outline" className="border-yellow-300 text-yellow-800 bg-yellow-50">Perlu Monitoring</Badge>
                    ) : (
                      <Badge variant="outline" className="border-green-300 text-green-800 bg-green-50">Optimal</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rata-rata Baterai</p>
                    <p className="text-2xl font-bold">
                      {sensors.length > 0
                        ? Math.round(sensors.reduce((acc, s) => acc + s.battery, 0) / sensors.length)
                        : 0
                      }%
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Battery className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600">Sensor dengan baterai rendah</div>
                  <div className="mt-1">
                    {sensors.filter(s => s.battery < 30).map(sensor => (
                      <div key={sensor.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{sensor.name}</span>
                        <span className="font-medium text-red-600">{sensor.battery}%</span>
                      </div>
                    ))}
                    {sensors.filter(s => s.battery < 30).length === 0 && (
                      <span className="text-sm text-green-600">Semua normal</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Alert Aktif</p>
                    <p className="text-2xl font-bold">
                      {alerts.filter(a => !a.resolved).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600">Update Terakhir</div>
                  <div className="mt-1 text-sm">
                    {format(currentTime, "dd MMM yyyy HH:mm", { locale: id })}
                  </div>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleRefresh()}
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Refresh Sekarang
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <SensorChart />

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Aktivitas Terkini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sensors.slice(0, 5).map(sensor => (
                  <div key={sensor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${sensor.status === "critical" ? "bg-red-500" :
                          sensor.status === "warning" ? "bg-yellow-500" :
                            "bg-green-500"
                        }`} />
                      <div>
                        <p className="font-medium">{sensor.name}</p>
                        <p className="text-sm text-gray-500">
                          {format(sensor.lastUpdate, "dd MMM yyyy HH:mm", { locale: id })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{sensor.value}{sensor.unit}</p>
                      <Badge className={getStatusColor(sensor.status)}>
                        {sensor.status === "critical" ? "Kritis" :
                          sensor.status === "warning" ? "Warning" : "Normal"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sensors Tab */}
        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Detail Semua Sensor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSensors.map(sensor => (
                  <Card key={sensor.id} className={`border-2 ${sensor.status === "critical" ? "border-red-200" :
                      sensor.status === "warning" ? "border-yellow-200" :
                        "border-green-200"
                    }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{sensor.name}</h3>
                          <p className="text-sm text-gray-500">{sensor.location}</p>
                        </div>
                        <Badge className={getStatusColor(sensor.status)}>
                          {getStatusIcon(sensor.status)}
                          <span className="ml-1">
                            {sensor.status === "critical" ? "Kritis" :
                              sensor.status === "warning" ? "Warning" : "Normal"}
                          </span>
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Nilai Saat Ini</span>
                            <span className="text-2xl font-bold text-gray-900">
                              {sensor.value}{sensor.unit}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${sensor.status === "critical" ? "bg-red-500" :
                                  sensor.status === "warning" ? "bg-yellow-500" :
                                    "bg-green-500"
                                }`}
                              style={{
                                width: `${Math.min(100, sensor.value)}%`
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Baterai</p>
                            <div className="flex items-center gap-2">
                              <Battery className={`h-4 w-4 ${sensor.battery < 30 ? "text-red-500" :
                                  sensor.battery < 60 ? "text-yellow-500" :
                                    "text-green-500"
                                }`} />
                              <span className={`font-medium ${sensor.battery < 30 ? "text-red-600" :
                                  sensor.battery < 60 ? "text-yellow-600" :
                                    "text-green-600"
                                }`}>
                                {sensor.battery}%
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Terakhir Update</p>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-700">
                                {format(sensor.lastUpdate, "HH:mm", { locale: id })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => console.log(`View details for ${sensor.id}`)}
                        >
                          Lihat Detail Sensor
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alert & Notifikasi
                </CardTitle>
                <Badge variant={alerts.filter(a => !a.resolved).length > 0 ? "destructive" : "outline"}>
                  {alerts.filter(a => !a.resolved).length} Alert Aktif
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">Tidak ada alert yang aktif</p>
                    <p className="text-sm text-gray-500 mt-1">Semua sistem berjalan normal</p>
                  </div>
                ) : (
                  filteredAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${alert.resolved
                          ? "bg-gray-50 border-gray-200"
                          : alert.type === "error"
                            ? "bg-red-50 border-red-200"
                            : alert.type === "warning"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-blue-50 border-blue-200"
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 p-1 rounded ${alert.resolved
                              ? "bg-gray-200"
                              : alert.type === "error"
                                ? "bg-red-200"
                                : alert.type === "warning"
                                  ? "bg-yellow-200"
                                  : "bg-blue-200"
                            }`}>
                            <AlertTriangle className={`h-4 w-4 ${alert.resolved
                                ? "text-gray-600"
                                : alert.type === "error"
                                  ? "text-red-600"
                                  : alert.type === "warning"
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                              }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{alert.message}</p>
                              {alert.resolved && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(alert.timestamp, "dd MMM HH:mm", { locale: id })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Droplets className="h-3 w-3" />
                                Sensor: {alert.sensor}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Tandai Selesai
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Alert Statistics */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-4">Statistik Alert</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-700">Total Alert</div>
                    <div className="text-2xl font-bold text-blue-900">{alerts.length}</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-700">Belum Diresolve</div>
                    <div className="text-2xl font-bold text-red-900">
                      {alerts.filter(a => !a.resolved).length}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-700">Telah Diresolve</div>
                    <div className="text-2xl font-bold text-green-900">
                      {alerts.filter(a => a.resolved).length}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Summary */}
      <Card className="bg-linear-to-r from-blue-50 to-green-50 border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Status Sistem Monitoring</h3>
              <p className="text-sm text-gray-600">
                Terakhir diperbarui: {format(currentTime, "dd MMMM yyyy HH:mm:ss", { locale: id })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                Sensor Aktif: {sensors.filter(s => s.status === "normal").length}
              </Badge>
              <Badge variant="outline" className="bg-white">
                <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                Warning: {sensors.filter(s => s.status === "warning").length}
              </Badge>
              <Badge variant="outline" className="bg-white">
                <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                Kritis: {sensors.filter(s => s.status === "critical").length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}