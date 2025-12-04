"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Droplets, 
  Zap,
  Clock,
  Settings,
  Play,
  Pause,
  StopCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Timer,
  CloudRain,
  Wind,
  Thermometer,
  Gauge,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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

export default function ControlPage() {
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

  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [systemMode, setSystemMode] = useState<"auto" | "manual" | "schedule">("auto");
  const [wateringDuration, setWateringDuration] = useState(10);
  const [isWatering, setIsWatering] = useState(false);
  const [selectedZones, setSelectedZones] = useState<string[]>(["zone_3"]);
  const [currentTime] = useState(new Date());

  // Filtered zones based on selection
  const filteredZones = selectedZone === "all" 
    ? zones 
    : zones.filter(zone => zone.id === selectedZone);

  // Pure helper functions
  const getZoneStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "inactive": return "bg-gray-100 text-gray-800 border-gray-200";
      case "error": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getZoneStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle2 className="h-4 w-4" />;
      case "inactive": return <Pause className="h-4 w-4" />;
      case "error": return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  // Event handlers
  const toggleZoneValve = useCallback((zoneId: string) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId 
        ? { 
            ...zone, 
            valveStatus: !zone.valveStatus,
            lastWatered: zone.valveStatus ? zone.lastWatered : new Date()
          } 
        : zone
    ));

    // Add log entry
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      setLogs(prev => [{
        id: `log_${Date.now()}`,
        action: zone.valveStatus ? "Manual Stop" : "Manual Start",
        user: "Admin",
        timestamp: new Date(),
        details: `${zone.name}, Durasi: ${zone.duration} menit`
      }, ...prev.slice(0, 9)]);
    }

    // If starting watering, set global watering state
    if (!zone?.valveStatus) {
      setIsWatering(true);
    }
  }, [zones]);

  const startWatering = useCallback((zoneIds: string[], duration: number) => {
    setZones(prev => prev.map(zone => 
      zoneIds.includes(zone.id) 
        ? { 
            ...zone, 
            valveStatus: true,
            duration: duration,
            lastWatered: new Date()
          } 
        : zone
    ));

    setIsWatering(true);
    setSelectedZones(zoneIds);

    // Add log entry
    const zoneNames = zones.filter(z => zoneIds.includes(z.id)).map(z => z.name).join(", ");
    setLogs(prev => [{
      id: `log_${Date.now()}`,
      action: "Manual Start",
      user: "Admin",
      timestamp: new Date(),
      details: `${zoneNames}, Durasi: ${duration} menit`
    }, ...prev.slice(0, 9)]);
  }, [zones]);

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

  const toggleSchedule = useCallback((scheduleId: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, enabled: !schedule.enabled }
        : schedule
    ));

    // Add log entry
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      setLogs(prev => [{
        id: `log_${Date.now()}`,
        action: schedule.enabled ? "Schedule Disabled" : "Schedule Enabled",
        user: "Admin",
        timestamp: new Date(),
        details: schedule.name
      }, ...prev.slice(0, 9)]);
    }
  }, [schedules]);

  const handleQuickWater = useCallback((duration: number) => {
    const activeZones = zones.filter(z => z.status === "active").map(z => z.id);
    if (activeZones.length > 0) {
      startWatering(activeZones, duration);
    }
  }, [zones, startWatering]);

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

  // Calculate statistics
  const activeZonesCount = zones.filter(z => z.valveStatus).length;
  const totalWaterUsage = zones.reduce((acc, zone) => 
    acc + (zone.valveStatus ? zone.duration * 2 : 0), 0
  ); // Assuming 2L per minute
  const nextSchedule = schedules.find(s => s.enabled);

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

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mode Sistem</p>
                <p className="text-xl font-bold capitalize">{systemMode}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant={isWatering ? "destructive" : "outline"}>
                  {isWatering ? "Menyiram" : "Standby"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zona Aktif</p>
                <p className="text-xl font-bold">
                  {activeZonesCount} / {zones.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Droplets className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Penggunaan Air</span>
                <span className="font-medium">{totalWaterUsage}L/hari</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jadwal Aktif</p>
                <p className="text-xl font-bold">
                  {schedules.filter(s => s.enabled).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">Jadwal Berikutnya</div>
              <div className="font-medium truncate">
                {nextSchedule ? `${nextSchedule.name} - ${nextSchedule.time}` : "Tidak ada"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Durasi Saat Ini</p>
                <p className="text-xl font-bold">{wateringDuration} menit</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Timer className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <Slider
                value={[wateringDuration]}
                onValueChange={(value) => setWateringDuration(value[0])}
                min={1}
                max={60}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Control Tabs */}
      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="manual" className="gap-2">
            <Settings className="h-4 w-4" />
            Kontrol Manual
          </TabsTrigger>
          <TabsTrigger value="zones" className="gap-2">
            <Droplets className="h-4 w-4" />
            Manajemen Zona
          </TabsTrigger>
          <TabsTrigger value="schedules" className="gap-2">
            <Clock className="h-4 w-4" />
            Jadwal
          </TabsTrigger>
        </TabsList>

        {/* Manual Control Tab */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kontrol Manual</CardTitle>
              <CardDescription>
                Nyalakan/matikan penyiraman secara manual untuk zona tertentu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Aksi Cepat</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleQuickWater(5)}
                      className="h-20 flex flex-col gap-2"
                    >
                      <CloudRain className="h-6 w-6" />
                      <span>Siram 5 Menit</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleQuickWater(10)}
                      className="h-20 flex flex-col gap-2"
                    >
                      <CloudRain className="h-6 w-6" />
                      <span>Siram 10 Menit</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleQuickWater(15)}
                      className="h-20 flex flex-col gap-2"
                    >
                      <CloudRain className="h-6 w-6" />
                      <span>Siram 15 Menit</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleQuickWater(30)}
                      className="h-20 flex flex-col gap-2"
                    >
                      <CloudRain className="h-6 w-6" />
                      <span>Siram 30 Menit</span>
                    </Button>
                  </div>
                </div>

                {/* Zone Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Pilih Zona</h3>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih zona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Zona</SelectItem>
                      {zones.map(zone => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Zone Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredZones.map(zone => (
                    <Card key={zone.id} className={`border-2 ${
                      zone.valveStatus ? "border-green-200" : "border-gray-200"
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                            <Badge className={`mt-1 ${getZoneStatusColor(zone.status)}`}>
                              {getZoneStatusIcon(zone.status)}
                              <span className="ml-1 capitalize">{zone.status}</span>
                            </Badge>
                          </div>
                          <Switch
                            checked={zone.valveStatus}
                            onCheckedChange={() => toggleZoneValve(zone.id)}
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <Droplets className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-gray-600">Kelembaban</span>
                              </div>
                              <div className="text-lg font-bold mt-1">
                                {zone.moisture}%
                              </div>
                            </div>
                            
                            <div className="p-3 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <Thermometer className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-gray-600">Suhu</span>
                              </div>
                              <div className="text-lg font-bold mt-1">
                                {zone.temperature}°C
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            Terakhir disiram: {format(zone.lastWatered, "dd/MM HH:mm", { locale: id })}
                          </div>
                          
                          <Button
                            variant={zone.valveStatus ? "destructive" : "default"}
                            onClick={() => toggleZoneValve(zone.id)}
                            className="w-full"
                          >
                            {zone.valveStatus ? (
                              <>
                                <StopCircle className="h-4 w-4 mr-2" />
                                Matikan Penyiraman
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Nyalakan Penyiraman
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zones Management Tab */}
        <TabsContent value="zones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Zona</CardTitle>
              <CardDescription>
                Kelola semua zona penyiraman dan pengaturannya
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Zones Overview */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Zona</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Kelembaban</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Valve</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zones.map(zone => (
                        <tr key={zone.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{zone.name}</div>
                              <div className="text-sm text-gray-500">
                                Durasi: {zone.duration} menit
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getZoneStatusColor(zone.status)}>
                              {zone.status === "active" ? "Aktif" :
                               zone.status === "inactive" ? "Nonaktif" : "Error"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${
                                zone.moisture < 30 ? "bg-red-500" :
                                zone.moisture < 50 ? "bg-yellow-500" :
                                "bg-green-500"
                              }`} />
                              <span className="font-medium">{zone.moisture}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${
                                zone.valveStatus ? "bg-green-500 animate-pulse" : "bg-gray-300"
                              }`} />
                              <span>{zone.valveStatus ? "Terbuka" : "Tertutup"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleZoneValve(zone.id)}
                              >
                                {zone.valveStatus ? "Stop" : "Start"}
                              </Button>
                              <Button size="sm" variant="ghost">
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Zone Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pengaturan Durasi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {zones.map(zone => (
                        <div key={zone.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`duration-${zone.id}`}>{zone.name}</Label>
                            <span className="text-sm font-medium">{zone.duration} menit</span>
                          </div>
                          <Slider
                            id={`duration-${zone.id}`}
                            value={[zone.duration]}
                            onValueChange={(value) => {
                              setZones(prev => prev.map(z => 
                                z.id === zone.id ? { ...z, duration: value[0] } : z
                              ));
                            }}
                            min={1}
                            max={60}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Status Sistem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Gauge className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-blue-900">Sistem Pressure</h4>
                              <p className="text-sm text-blue-700">Normal (2.5 bar)</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Wind className="h-5 w-5 text-green-600" />
                            <div>
                              <h4 className="font-medium text-green-900">Flow Rate</h4>
                              <p className="text-sm text-green-700">
                                {activeZonesCount * 2} L/menit
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <div>
                              <h4 className="font-medium text-yellow-900">Peringatan</h4>
                              <p className="text-sm text-yellow-700">
                                {zones.filter(z => z.status === "error").length} zona mengalami error
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manajemen Jadwal</CardTitle>
                  <CardDescription>
                    Atur jadwal penyiraman otomatis
                  </CardDescription>
                </div>
                <Button>
                  <Clock className="h-4 w-4 mr-2" />
                  Tambah Jadwal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Schedules List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {schedules.map(schedule => (
                    <Card key={schedule.id} className={`border-2 ${
                      schedule.enabled ? "border-green-200" : "border-gray-200"
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{schedule.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={schedule.enabled ? "default" : "outline"}>
                                {schedule.enabled ? "Aktif" : "Nonaktif"}
                              </Badge>
                              <span className="text-sm text-gray-500">{schedule.time}</span>
                            </div>
                          </div>
                          <Switch
                            checked={schedule.enabled}
                            onCheckedChange={() => toggleSchedule(schedule.id)}
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-gray-600">Durasi</div>
                            <div className="font-medium">{schedule.duration} menit</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-600">Hari</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {schedule.days.map(day => (
                                <Badge key={day} variant="outline" className="text-xs">
                                  {day.substring(0, 3)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-600">Zona</div>
                            <div className="text-sm">
                              {schedule.zones.length} zona terpilih
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              Edit
                            </Button>
                            <Button size="sm" variant="ghost" className="flex-1">
                              Duplicate
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Next Scheduled Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Jadwal Berikutnya</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {schedules
                        .filter(s => s.enabled)
                        .map(schedule => (
                          <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="font-medium">{schedule.name}</p>
                                <p className="text-sm text-gray-500">
                                  {schedule.time} • {schedule.duration} menit • {schedule.zones.length} zona
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {schedule.days.join(", ")}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Log Aktivitas Kontrol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    log.action.includes("Start") ? "bg-green-500" :
                    log.action.includes("Stop") ? "bg-red-500" :
                    "bg-yellow-500"
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{log.action}</p>
                      <Badge variant="outline" className="text-xs">
                        {log.user}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{log.details}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {format(log.timestamp, "dd/MM HH:mm", { locale: id })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Controls Footer */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setSystemMode("auto")}
        >
          <Zap className="h-4 w-4 mr-2" />
          Mode Otomatis
        </Button>
        
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setSystemMode("manual")}
        >
          <Settings className="h-4 w-4 mr-2" />
          Mode Manual
        </Button>
        
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setSystemMode("schedule")}
        >
          <Clock className="h-4 w-4 mr-2" />
          Mode Jadwal
        </Button>
      </div>
    </div>
  );
}