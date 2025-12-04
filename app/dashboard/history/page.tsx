"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Droplets,
  Download,
  Search,
  BarChart3,
  TrendingUp,
  FileText,
  Thermometer,
  Cloud,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  format,
  subDays,
  subMonths,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isWithinInterval,
  parseISO
} from "date-fns";
import { id } from "date-fns/locale";

// Type definitions
interface IrrigationEvent {
  id: string;
  date: Date;
  duration: number;
  waterUsage: number; // in liters
  zones: string[];
  mode: "auto" | "manual" | "schedule";
  status: "completed" | "failed" | "cancelled";
  moistureBefore: number;
  moistureAfter: number;
  temperature: number;
  humidity: number;
  notes?: string;
}

interface SensorHistory {
  id: string;
  timestamp: Date;
  moisture: number;
  temperature: number;
  humidity: number;
  phLevel?: number;
  lightIntensity?: number;
  location: string;
}

interface SystemLog {
  id: string;
  timestamp: Date;
  type: "info" | "warning" | "error" | "success";
  category: string;
  message: string;
  user?: string;
  details?: SystemLogDetails;
}

interface SystemLogDetails {
  zone?: string;
  duration?: number;
  moisture?: number;
  temperature?: number;
  humidity?: number;
  errorCode?: string;
  ipAddress?: string;
  deviceId?: string;
  sensorId?: string;
  // Tambahkan properti lain yang mungkin
  [key: string]: string | number | boolean | undefined;
}

interface ZoneStats {
  id: string;
  name: string;
  count: number;
}


export default function HistoryPage() {
  // Date range state
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "custom">("week");
  const [customStartDate, setCustomStartDate] = useState<string>(
    format(subDays(new Date(), 7), "yyyy-MM-dd")
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  // Filter states
  const [filterZone, setFilterZone] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTab, setSelectedTab] = useState("irrigation");

  // Generate mock irrigation events
  const generateIrrigationEvents = (): IrrigationEvent[] => {
    const events: IrrigationEvent[] = [];
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = subDays(now, i);
      const eventCount = Math.floor(Math.random() * 3) + 1; // 1-3 events per day

      for (let j = 0; j < eventCount; j++) {
        const duration = [5, 10, 15, 20, 30][Math.floor(Math.random() * 5)];
        const waterUsage = duration * 2; // 2L per minute
        const zones = ["zone_1", "zone_2", "zone_3", "zone_4"]
          .slice(0, Math.floor(Math.random() * 3) + 1);

        events.push({
          id: `event_${i}_${j}`,
          date: new Date(date.getTime() + j * 4 * 60 * 60 * 1000), // Spread throughout day
          duration,
          waterUsage,
          zones,
          mode: ["auto", "manual", "schedule"][Math.floor(Math.random() * 3)] as "auto" | "manual" | "schedule",
          status: Math.random() > 0.1 ? "completed" : (Math.random() > 0.5 ? "failed" : "cancelled"),
          moistureBefore: Math.floor(Math.random() * 30) + 30,
          moistureAfter: Math.floor(Math.random() * 30) + 60,
          temperature: Math.floor(Math.random() * 10) + 25,
          humidity: Math.floor(Math.random() * 30) + 50,
          notes: Math.random() > 0.7 ? "Catatan tambahan untuk event ini" : undefined
        });
      }
    }

    return events;
  };

  // Generate mock sensor history
  const generateSensorHistory = (): SensorHistory[] => {
    const history: SensorHistory[] = [];
    const now = new Date();
    const locations = ["Taman Depan", "Taman Belakang", "Green House"];

    for (let i = 720; i >= 0; i--) { // 30 days * 24 hours = 720 data points
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

      locations.forEach(location => {
        const baseMoisture = location === "Green House" ? 60 : 50;
        const moistureVariation = Math.sin(i * Math.PI / 12) * 20;

        history.push({
          id: `sensor_${i}_${location}`,
          timestamp,
          moisture: Math.max(20, Math.min(90, baseMoisture + moistureVariation + (Math.random() * 5 - 2.5))),
          temperature: Math.max(20, Math.min(35, 25 + Math.sin(i * Math.PI / 24) * 8 + (Math.random() * 2 - 1))),
          humidity: Math.max(40, Math.min(90, 60 + Math.sin(i * Math.PI / 6) * 20 + (Math.random() * 5 - 2.5))),
          phLevel: location === "Green House" ? 6.5 + (Math.random() * 1 - 0.5) : undefined,
          lightIntensity: Math.floor(Math.random() * 1000) + 500,
          location
        });
      });
    }

    return history;
  };

  // Generate mock system logs
  const generateSystemLogs = (): SystemLog[] => {
    const logs: SystemLog[] = [];
    const now = new Date();
    const users = ["Admin", "System", "Auto", "User"];
    const categories = ["irrigation", "sensor", "system", "maintenance", "alert"];
    const messages = [
      "Sistem penyiraman diaktifkan",
      "Sensor kelembaban membaca data",
      "Penyiraman otomatis dimulai",
      "Penyiraman manual dihentikan",
      "Alert: Kelembaban tanah rendah",
      "Sensor baterai rendah",
      "Jadwal penyiraman dieksekusi",
      "Sistem reboot",
      "Update konfigurasi",
      "Error: Valve tidak merespons"
    ];

    for (let i = 500; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000); // Every 30 minutes
      const type = Math.random() > 0.7 ? "warning" :
        Math.random() > 0.8 ? "error" :
          Math.random() > 0.9 ? "success" : "info";

      logs.push({
        id: `log_${i}`,
        timestamp,
        type: type as "info" | "warning" | "error" | "success",
        category: categories[Math.floor(Math.random() * categories.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        user: Math.random() > 0.3 ? users[Math.floor(Math.random() * users.length)] : undefined,
        details: Math.random() > 0.5 ? {
          zone: `zone_${Math.floor(Math.random() * 4) + 1}`,
          duration: Math.floor(Math.random() * 30) + 5,
          moisture: Math.floor(Math.random() * 50) + 30
        } : undefined
      });
    }

    return logs;
  };

  // Initialize data
  const irrigationEvents = useMemo(() => generateIrrigationEvents(), []);
  const sensorHistory = useMemo(() => generateSensorHistory(), []);
  const systemLogs = useMemo(() => generateSystemLogs(), []);

  // Zones for filtering
  const zones = [
    { id: "all", name: "Semua Zona" },
    { id: "zone_1", name: "Taman Depan" },
    { id: "zone_2", name: "Taman Belakang" },
    { id: "zone_3", name: "Green House" },
    { id: "zone_4", name: "Kebun Sayur" }
  ];

  // Calculate date range based on selection
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);

    switch (dateRange) {
      case "today":
        start = startOfDay(now);
        break;
      case "week":
        start = subDays(startOfDay(now), 7);
        break;
      case "month":
        start = subMonths(startOfDay(now), 1);
        break;
      case "custom":
        start = startOfDay(parseISO(customStartDate));
        end = endOfDay(parseISO(customEndDate));
        break;
      default:
        start = subDays(startOfDay(now), 7);
    }

    return { startDate: start, endDate: end };
  }, [dateRange, customStartDate, customEndDate]);

  // Filter irrigation events
  const filteredIrrigationEvents = useMemo(() => {
    return irrigationEvents.filter(event => {
      // Date range filter
      if (!isWithinInterval(event.date, { start: startDate, end: endDate })) {
        return false;
      }

      // Zone filter
      if (filterZone !== "all" && !event.zones.includes(filterZone)) {
        return false;
      }

      // Mode filter
      if (filterMode !== "all" && event.mode !== filterMode) {
        return false;
      }

      // Status filter
      if (filterStatus !== "all" && event.status !== filterStatus) {
        return false;
      }

      // Search query
      if (searchQuery && !JSON.stringify(event).toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest first
  }, [irrigationEvents, startDate, endDate, filterZone, filterMode, filterStatus, searchQuery]);

  // Filter sensor history
  const filteredSensorHistory = useMemo(() => {
    return sensorHistory.filter(record =>
      isWithinInterval(record.timestamp, { start: startDate, end: endDate })
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [sensorHistory, startDate, endDate]);

  // Filter system logs
  const filteredSystemLogs = useMemo(() => {
    return systemLogs.filter(log =>
      isWithinInterval(log.timestamp, { start: startDate, end: endDate })
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [systemLogs, startDate, endDate]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const eventsInRange = filteredIrrigationEvents;

    // Hitung stats per zona
    const zoneStats: ZoneStats[] = zones.slice(1).map(zone => ({
      id: zone.id,
      name: zone.name,
      count: eventsInRange.filter(e => e.zones.includes(zone.id)).length
    }));

    const mostActiveZone = zoneStats.reduce((most, current) =>
      current.count > most.count ? current : most
      , { id: "", name: "Tidak ada", count: 0 });

    return {
      totalEvents: eventsInRange.length,
      totalWaterUsage: eventsInRange.reduce((sum, event) => sum + event.waterUsage, 0),
      totalDuration: eventsInRange.reduce((sum, event) => sum + event.duration, 0),
      averageMoistureBefore: eventsInRange.length > 0
        ? eventsInRange.reduce((sum, event) => sum + event.moistureBefore, 0) / eventsInRange.length
        : 0,
      averageMoistureAfter: eventsInRange.length > 0
        ? eventsInRange.reduce((sum, event) => sum + event.moistureAfter, 0) / eventsInRange.length
        : 0,
      successRate: eventsInRange.length > 0
        ? (eventsInRange.filter(e => e.status === "completed").length / eventsInRange.length) * 100
        : 0,
      mostActiveZone // Sekarang properti count sudah ada
    };
  }, [filteredIrrigationEvents, zones]);

  // Pagination
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredIrrigationEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIrrigationEvents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredIrrigationEvents.length / itemsPerPage);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      case "cancelled": return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "auto": return "bg-blue-100 text-blue-800";
      case "manual": return "bg-purple-100 text-purple-800";
      case "schedule": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "info": return "bg-blue-100 text-blue-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "error": return "bg-red-100 text-red-800";
      case "success": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case "info": return <Eye className="h-4 w-4" />;
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      case "error": return <XCircle className="h-4 w-4" />;
      case "success": return <CheckCircle2 className="h-4 w-4" />;
      default: return null;
    }
  };

  // Event handlers
const handleExportData = useCallback((type: "irrigation" | "sensor" | "logs") => {
  let data: Array<Record<string, string | number | boolean | undefined>> = [];
  let filename = "";

  switch (type) {
    case "irrigation":
      data = filteredIrrigationEvents.map(event => ({
        ...event,
        date: format(event.date, "yyyy-MM-dd HH:mm:ss"),
        zones: event.zones.join(", "),
        status: event.status,
        mode: event.mode
      }));
      filename = `irrigation-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
      break;
    case "sensor":
      data = filteredSensorHistory.map(record => ({
        ...record,
        timestamp: format(record.timestamp, "yyyy-MM-dd HH:mm:ss"),
        location: record.location
      }));
      filename = `sensor-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
      break;
    case "logs":
      data = filteredSystemLogs.map(log => ({
        ...log,
        timestamp: format(log.timestamp, "yyyy-MM-dd HH:mm:ss"),
        user: log.user || "System",
        details: log.details ? JSON.stringify(log.details) : ""
      }));
      filename = `system-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      break;
    default:
      data = [];
      filename = "export.csv";
  }

  // Convert to CSV
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        if (value === undefined || value === null) {
          return "";
        }
        if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma
          const escaped = value.replace(/"/g, '""');
          return value.includes(',') || value.includes('"') || value.includes('\n') 
            ? `"${escaped}"` 
            : value;
        }
        return String(value);
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}, [filteredIrrigationEvents, filteredSensorHistory, filteredSystemLogs]);

  const handleResetFilters = useCallback(() => {
    setDateRange("week");
    setFilterZone("all");
    setFilterMode("all");
    setFilterStatus("all");
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  // Generate daily water usage for chart
  const dailyWaterUsage = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.map(day => {
      const events = filteredIrrigationEvents.filter(event =>
        format(event.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      );
      return {
        date: format(day, "dd MMM"),
        usage: events.reduce((sum, event) => sum + event.waterUsage, 0),
        count: events.length
      };
    });
  }, [filteredIrrigationEvents, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Sistem</h1>
          <p className="text-gray-600">
            Data historis penyiraman, sensor, dan log sistem
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleResetFilters}
          >
            <RefreshCw className="h-4 w-4" />
            Reset Filter
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleExportData("irrigation")}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Date Range Selection */}
            <div className="flex-1">
              <Label className="mb-2 block">Rentang Waktu</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={dateRange === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange("today")}
                >
                  Hari Ini
                </Button>
                <Button
                  variant={dateRange === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange("week")}
                >
                  7 Hari Terakhir
                </Button>
                <Button
                  variant={dateRange === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange("month")}
                >
                  30 Hari Terakhir
                </Button>
                <Button
                  variant={dateRange === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange("custom")}
                >
                  Custom
                </Button>
              </div>

              {/* Custom Date Range */}
              {dateRange === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Dari Tanggal</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Sampai Tanggal</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="flex-1">
              <Label htmlFor="search" className="mb-2 block">Cari</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Cari dalam riwayat..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Penyiraman</p>
                <p className="text-2xl font-bold">{statistics.totalEvents}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {format(startDate, "dd MMM", { locale: id })} - {format(endDate, "dd MMM", { locale: id })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Penggunaan Air</p>
                <p className="text-2xl font-bold">{statistics.totalWaterUsage}L</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Rata-rata:</span>
                <span className="font-medium">
                  {statistics.totalEvents > 0
                    ? (statistics.totalWaterUsage / statistics.totalEvents).toFixed(1)
                    : 0}L/penyiraman
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Keberhasilan</p>
                <p className="text-2xl font-bold">{statistics.successRate.toFixed(1)}%</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${statistics.successRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zona Teraktif</p>
                <p className="text-2xl font-bold">{statistics.mostActiveZone.name}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {statistics.mostActiveZone.count} kali penyiraman
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="irrigation" className="gap-2">
            <Droplets className="h-4 w-4" />
            Penyiraman
          </TabsTrigger>
          <TabsTrigger value="sensor" className="gap-2">
            <Thermometer className="h-4 w-4" />
            Sensor
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="h-4 w-4" />
            Log Sistem
          </TabsTrigger>
        </TabsList>

        {/* Irrigation History Tab */}
        <TabsContent value="irrigation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Riwayat Penyiraman</CardTitle>
                  <CardDescription>
                    {format(startDate, "dd MMM yyyy", { locale: id })} - {format(endDate, "dd MMM yyyy", { locale: id })}
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Zone Filter */}
                  <Select value={filterZone} onValueChange={setFilterZone}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map(zone => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Mode Filter */}
                  <Select value={filterMode} onValueChange={setFilterMode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Mode</SelectItem>
                      <SelectItem value="auto">Otomatis</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="schedule">Jadwal</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="failed">Gagal</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Daily Usage Chart */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Penggunaan Air Harian (Liter)</h3>
                  <Badge variant="outline">
                    Total: {statistics.totalWaterUsage}L
                  </Badge>
                </div>
                <div className="h-32 flex items-end gap-1">
                  {dailyWaterUsage.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-10 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                        style={{ height: `${Math.min(100, (day.usage / 100) * 100)}%` }}
                      />
                      <div className="text-xs text-gray-500 mt-2">{day.date}</div>
                      <div className="text-xs font-medium">{day.usage}L</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Events Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tanggal & Waktu</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Durasi</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Air</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Zona</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Mode</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Kelembaban</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEvents.map(event => (
                      <tr key={event.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">
                              {format(event.date, "HH:mm", { locale: id })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(event.date, "dd/MM/yyyy", { locale: id })}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{event.duration} menit</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{event.waterUsage}L</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {event.zones.map(zoneId => {
                              const zone = zones.find(z => z.id === zoneId);
                              return zone ? (
                                <Badge key={zoneId} variant="outline" className="text-xs">
                                  {zone.name.substring(0, 3)}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getModeColor(event.mode)}>
                            {event.mode === "auto" ? "Otomatis" :
                              event.mode === "manual" ? "Manual" : "Jadwal"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(event.status)}>
                            {getStatusIcon(event.status)}
                            <span className="ml-1">
                              {event.status === "completed" ? "Selesai" :
                                event.status === "failed" ? "Gagal" : "Batal"}
                            </span>
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm">
                              {event.moistureBefore}% → {event.moistureAfter}%
                            </div>
                            <div className={`h-2 w-6 rounded ${event.moistureAfter - event.moistureBefore > 10 ? "bg-green-500" :
                              event.moistureAfter - event.moistureBefore > 5 ? "bg-yellow-500" :
                                "bg-red-500"
                              }`} />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="ghost">
                            Detail
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {filteredIrrigationEvents.length > 0 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredIrrigationEvents.length)} dari {filteredIrrigationEvents.length} data
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => setItemsPerPage(parseInt(value))}
                      >
                        <SelectTrigger className="w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="text-sm">
                        Halaman {currentPage} dari {totalPages}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {filteredIrrigationEvents.length === 0 && (
                  <div className="text-center py-12">
                    <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Tidak ada data penyiraman</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Coba ubah filter atau rentang waktu
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sensor History Tab */}
        <TabsContent value="sensor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Data Sensor</CardTitle>
              <CardDescription>
                Data historis dari semua sensor sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Waktu</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Lokasi</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Kelembaban</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Suhu</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Kelembaban Udara</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">pH</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cahaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSensorHistory.slice(0, 20).map(record => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">
                              {format(record.timestamp, "HH:mm", { locale: id })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(record.timestamp, "dd/MM/yyyy", { locale: id })}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{record.location}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span className={`font-medium ${record.moisture < 30 ? "text-red-600" :
                              record.moisture < 50 ? "text-yellow-600" :
                                "text-green-600"
                              }`}>
                              {record.moisture.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-red-500" />
                            <span className="font-medium">
                              {record.temperature.toFixed(1)}°C
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {record.humidity.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {record.phLevel ? (
                            <div className="font-medium">
                              {record.phLevel.toFixed(1)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {record.lightIntensity ? (
                            <div className="font-medium">
                              {record.lightIntensity} lux
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredSensorHistory.length === 0 && (
                <div className="text-center py-12">
                  <Thermometer className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Tidak ada data sensor</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Log Sistem</CardTitle>
                  <CardDescription>
                    Catatan aktivitas dan event sistem
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportData("logs")}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredSystemLogs.slice(0, 50).map(log => (
                  <div key={log.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-1 rounded ${log.type === "info" ? "bg-blue-200" :
                        log.type === "warning" ? "bg-yellow-200" :
                          log.type === "error" ? "bg-red-200" :
                            "bg-green-200"
                        }`}>
                        {getLogTypeIcon(log.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.message}</span>
                          <Badge className={getLogTypeColor(log.type)}>
                            {log.type === "info" ? "Info" :
                              log.type === "warning" ? "Warning" :
                                log.type === "error" ? "Error" : "Success"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{format(log.timestamp, "dd MMM HH:mm:ss", { locale: id })}</span>
                          <span>•</span>
                          <span className="capitalize">{log.category}</span>
                          {log.user && (
                            <>
                              <span>•</span>
                              <span>User: {log.user}</span>
                            </>
                          )}
                        </div>
                        {log.details && (
                          <div className="text-sm text-gray-600 mt-2">
                            {JSON.stringify(log.details)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredSystemLogs.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Tidak ada log sistem</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Footer */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Ringkasan Periode</h3>
              <p className="text-sm text-gray-600">
                {format(startDate, "dd MMMM yyyy", { locale: id })} - {format(endDate, "dd MMMM yyyy", { locale: id })}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.totalEvents}</div>
                <div className="text-sm text-gray-600">Penyiraman</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.totalWaterUsage}L</div>
                <div className="text-sm text-gray-600">Air Digunakan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.successRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Keberhasilan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(statistics.totalDuration / 60)}
                </div>
                <div className="text-sm text-gray-600">Jam Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}