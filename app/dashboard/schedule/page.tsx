"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Droplets,
  Plus,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  CalendarDays,
  Download,
  Zap,
  Sun,
  CloudRain
} from "lucide-react";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { id } from "date-fns/locale";
import { Slider } from "@/components/ui/slider";

// Type definitions
interface Schedule {
  id: string;
  name: string;
  description?: string;
  time: string;
  duration: number;
  days: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  zones: string[];
  enabled: boolean;
  mode: "fixed" | "smart" | "weather";
  conditions?: {
    minMoisture?: number;
    maxTemperature?: number;
    skipIfRaining?: boolean;
  };
  created: Date;
  nextExecution?: Date;
}

interface ScheduledEvent {
  id: string;
  scheduleId: string;
  time: Date;
  duration: number;
  zones: string[];
  status: "pending" | "running" | "completed" | "skipped" | "failed";
  reason?: string;
}

export default function SchedulePage() {
  // Days of week in Indonesian
  const daysOfWeek = [
    { id: 0, name: "Minggu", short: "Min" },
    { id: 1, name: "Senin", short: "Sen" },
    { id: 2, name: "Selasa", short: "Sel" },
    { id: 3, name: "Selasa", short: "Rab" },
    { id: 4, name: "Kamis", short: "Kam" },
    { id: 5, name: "Jumat", short: "Jum" },
    { id: 6, name: "Sabtu", short: "Sab" },
  ];

  // Zones available
  const availableZones = [
    { id: "zone_1", name: "Taman Depan" },
    { id: "zone_2", name: "Taman Belakang" },
    { id: "zone_3", name: "Green House" },
    { id: "zone_4", name: "Kebun Sayur" },
  ];

  // Initial schedules data
  const initialSchedules: Schedule[] = [
    {
      id: "schedule_1",
      name: "Penyiraman Pagi",
      description: "Penyiraman rutin pagi hari",
      time: "06:00",
      duration: 15,
      days: [1, 2, 3, 4, 5, 6], // Monday to Saturday
      zones: ["zone_1", "zone_2"],
      enabled: true,
      mode: "fixed",
      created: new Date(),
      nextExecution: addDays(new Date(), 1)
    },
    {
      id: "schedule_2",
      name: "Penyiraman Sore",
      description: "Penyiraman saat suhu sudah turun",
      time: "17:30",
      duration: 20,
      days: [1, 2, 3, 4, 5], // Monday to Friday
      zones: ["zone_1", "zone_3"],
      enabled: true,
      mode: "smart",
      conditions: {
        maxTemperature: 35,
        skipIfRaining: true
      },
      created: new Date(),
      nextExecution: addDays(new Date(), 0)
    },
    {
      id: "schedule_3",
      name: "Penyiraman Mingguan",
      description: "Penyiraman intensif akhir minggu",
      time: "09:00",
      duration: 30,
      days: [0, 6], // Sunday and Saturday
      zones: ["zone_1", "zone_2", "zone_3", "zone_4"],
      enabled: true,
      mode: "weather",
      conditions: {
        minMoisture: 40,
        skipIfRaining: true
      },
      created: new Date(),
      nextExecution: addDays(new Date(), 6)
    },
    {
      id: "schedule_4",
      name: "Penyiraman Malam",
      description: "Penyiraman hemat penguapan",
      time: "21:00",
      duration: 10,
      days: [2, 4, 6], // Tuesday, Thursday, Saturday
      zones: ["zone_2", "zone_4"],
      enabled: false,
      mode: "fixed",
      created: new Date()
    }
  ];

  const initialEvents: ScheduledEvent[] = [
    {
      id: "event_1",
      scheduleId: "schedule_1",
      time: new Date(),
      duration: 15,
      zones: ["zone_1", "zone_2"],
      status: "completed"
    },
    {
      id: "event_2",
      scheduleId: "schedule_2",
      time: new Date(),
      duration: 20,
      zones: ["zone_1", "zone_3"],
      status: "completed",
      reason: "Suhu optimal"
    },
    {
      id: "event_3",
      scheduleId: "schedule_3",
      time: new Date(),
      duration: 30,
      zones: ["zone_1", "zone_2", "zone_3", "zone_zone_4"],
      status: "skipped",
      reason: "Hujan turun"
    },
    {
      id: "event_4",
      scheduleId: "schedule_2",
      time: new Date(),
      duration: 20,
      zones: ["zone_1", "zone_3"],
      status: "pending"
    },
    {
      id: "event_5",
      scheduleId: "schedule_1",
      time: new Date(),
      duration: 15,
      zones: ["zone_1", "zone_2"],
      status: "pending"
    }
  ];

  // State management
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [events, setEvents] = useState<ScheduledEvent[]>(initialEvents);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // New schedule form state
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    description: "",
    time: "06:00",
    duration: 15,
    days: [] as number[],
    zones: [] as string[],
    enabled: true,
    mode: "fixed" as "fixed" | "smart" | "weather",
    conditions: {
      minMoisture: 30,
      maxTemperature: 35,
      skipIfRaining: false
    }
  });

  // Pure helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "running": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "skipped": return "bg-gray-100 text-gray-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "fixed": return "bg-blue-100 text-blue-800";
      case "smart": return "bg-purple-100 text-purple-800";
      case "weather": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "fixed": return <Clock className="h-4 w-4" />;
      case "smart": return <Zap className="h-4 w-4" />;
      case "weather": return <CloudRain className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatDays = (dayNumbers: number[]) => {
    if (dayNumbers.length === 7) return "Setiap hari";
    if (dayNumbers.length === 5 &&
      dayNumbers.includes(1) && dayNumbers.includes(2) && dayNumbers.includes(3) &&
      dayNumbers.includes(4) && dayNumbers.includes(5)) return "Weekdays";
    if (dayNumbers.length === 2 &&
      dayNumbers.includes(0) && dayNumbers.includes(6)) return "Weekends";

    return dayNumbers
      .map(day => daysOfWeek.find(d => d.id === day)?.short)
      .filter(Boolean)
      .join(", ");
  };

  const getNextExecutionText = (schedule: Schedule) => {
    if (!schedule.nextExecution) return "Belum dijadwalkan";

    if (isToday(schedule.nextExecution)) return `Hari ini ${schedule.time}`;
    if (isTomorrow(schedule.nextExecution)) return `Besok ${schedule.time}`;

    return format(schedule.nextExecution, "EEE, dd MMM", { locale: id }) + ` ${schedule.time}`;
  };

  // Event handlers
  const toggleSchedule = useCallback((scheduleId: string) => {
    setSchedules(prev => prev.map(schedule =>
      schedule.id === scheduleId
        ? { ...schedule, enabled: !schedule.enabled }
        : schedule
    ));
  }, []);

  const deleteSchedule = useCallback((scheduleId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      setEvents(prev => prev.filter(e => e.scheduleId !== scheduleId));
    }
  }, []);

  const duplicateSchedule = useCallback((schedule: Schedule) => {
    const newSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}`,
      name: `${schedule.name} (Salinan)`,
      created: new Date()
    };
    setSchedules(prev => [...prev, newSchedule]);
  }, []);

  const handleDayToggle = useCallback((dayId: number) => {
    setNewSchedule(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(id => id !== dayId)
        : [...prev.days, dayId]
    }));
  }, []);

  const handleZoneToggle = useCallback((zoneId: string) => {
    setNewSchedule(prev => ({
      ...prev,
      zones: prev.zones.includes(zoneId)
        ? prev.zones.filter(id => id !== zoneId)
        : [...prev.zones, zoneId]
    }));
  }, []);

  const handleCreateSchedule = useCallback(() => {
    if (!newSchedule.name.trim() || newSchedule.days.length === 0 || newSchedule.zones.length === 0) {
      alert("Harap isi nama, pilih hari, dan pilih zona");
      return;
    }

    const calculateNextExecution = (days: number[], time: string): Date => {
      const now = new Date();
      const [hours, minutes] = time.split(":").map(Number);

      // Create date for today at scheduled time
      const scheduledTimeToday = new Date(now);
      scheduledTimeToday.setHours(hours, minutes, 0, 0);

      // If time hasn't passed today and today is a scheduled day
      if (now < scheduledTimeToday && days.includes(now.getDay())) {
        return scheduledTimeToday;
      }

      // Find next scheduled day
      for (let i = 1; i <= 7; i++) {
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + i);
        const dayOfWeek = nextDay.getDay();

        if (days.includes(dayOfWeek)) {
          nextDay.setHours(hours, minutes, 0, 0);
          return nextDay;
        }
      }

      return now; // Fallback
    };

    const schedule: Schedule = {
      id: `schedule_${Date.now()}`,
      name: newSchedule.name,
      description: newSchedule.description,
      time: newSchedule.time,
      duration: newSchedule.duration,
      days: newSchedule.days,
      zones: newSchedule.zones,
      enabled: newSchedule.enabled,
      mode: newSchedule.mode,
      conditions: newSchedule.mode !== "fixed" ? newSchedule.conditions : undefined,
      created: new Date(),
      nextExecution: calculateNextExecution(newSchedule.days, newSchedule.time)
    };

    setSchedules(prev => [...prev, schedule]);
    setNewSchedule({
      name: "",
      description: "",
      time: "06:00",
      duration: 15,
      days: [],
      zones: [],
      enabled: true,
      mode: "fixed",
      conditions: {
        minMoisture: 30,
        maxTemperature: 35,
        skipIfRaining: false
      }
    });
    setShowCreateForm(false);
  }, [newSchedule]);

  const runScheduleNow = useCallback((scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    const event: ScheduledEvent = {
      id: `event_${Date.now()}`,
      scheduleId,
      time: new Date(),
      duration: schedule.duration,
      zones: schedule.zones,
      status: "running"
    };

    setEvents(prev => [event, ...prev]);

    // Simulate completion after duration
    setTimeout(() => {
      setEvents(prev => prev.map(e =>
        e.id === event.id ? { ...e, status: "completed" } : e
      ));
    }, schedule.duration * 1000);
  }, [schedules]);

  const filteredEvents = filterStatus === "all"
    ? events
    : events.filter(event => event.status === filterStatus);

  const activeSchedules = schedules.filter(s => s.enabled);
  const upcomingEvents = events.filter(e => e.status === "pending" || e.status === "running");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Jadwal</h1>
          <p className="text-gray-600">
            Atur jadwal penyiraman otomatis dan pantau eksekusi
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="h-4 w-4" />
            Buat Jadwal Baru
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => console.log("Export schedules")}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jadwal</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-medium">{activeSchedules.length} aktif</span>
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-gray-600">{schedules.length - activeSchedules.length} nonaktif</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eksekusi Hari Ini</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => isToday(e.time)).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {events.filter(e => isToday(e.time) && e.status === "completed").length} selesai
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Akan Datang</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Jadwal berikutnya: {upcomingEvents.length > 0 ?
                format(upcomingEvents[0].time, "HH:mm") : "Tidak ada"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mode Jadwal</p>
                <div className="flex items-center gap-2">
                  <Badge className={getModeColor("fixed")}>
                    <Clock className="h-3 w-3 mr-1" />
                    Fixed
                  </Badge>
                  <Badge className={getModeColor("smart")}>
                    <Zap className="h-3 w-3 mr-1" />
                    Smart
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {schedules.filter(s => s.mode === "smart" || s.mode === "weather").length} jadwal adaptif
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="overview" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="schedules" className="gap-2">
            <Calendar className="h-4 w-4" />
            Semua Jadwal
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Clock className="h-4 w-4" />
            Log Eksekusi
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Hari Ini</CardTitle>
              <CardDescription>
                {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  .filter(event => isToday(event.time))
                  .sort((a, b) => a.time.getTime() - b.time.getTime())
                  .map(event => {
                    const schedule = schedules.find(s => s.id === event.scheduleId);
                    return (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`h-3 w-3 rounded-full ${event.status === "completed" ? "bg-green-500" :
                              event.status === "running" ? "bg-blue-500 animate-pulse" :
                                event.status === "pending" ? "bg-yellow-500" :
                                  "bg-gray-500"
                            }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{schedule?.name}</span>
                              <Badge className={getStatusColor(event.status)}>
                                {event.status === "completed" ? "Selesai" :
                                  event.status === "running" ? "Berjalan" :
                                    event.status === "pending" ? "Menunggu" :
                                      event.status === "skipped" ? "Dilewati" : "Gagal"}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {format(event.time, "HH:mm")} • {event.duration} menit •
                              {event.zones.length} zona • {schedule?.zones.map(z =>
                                availableZones.find(az => az.id === z)?.name
                              ).join(", ")}
                            </div>
                            {event.reason && (
                              <div className="text-sm text-gray-600 mt-1">
                                {event.reason}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {format(event.time, "HH:mm")}
                          </div>
                          {event.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => runScheduleNow(event.scheduleId)}
                            >
                              Jalankan Sekarang
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {events.filter(event => isToday(event.time)).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Tidak ada jadwal untuk hari ini
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Schedules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Jadwal Mendatang</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedules
                    .filter(s => s.enabled && s.nextExecution)
                    .sort((a, b) => a.nextExecution!.getTime() - b.nextExecution!.getTime())
                    .slice(0, 5)
                    .map(schedule => (
                      <div key={schedule.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{schedule.name}</div>
                          <div className="text-sm text-gray-500">
                            {getNextExecutionText(schedule)}
                          </div>
                        </div>
                        <Badge className={getModeColor(schedule.mode)}>
                          {getModeIcon(schedule.mode)}
                          <span className="ml-1 capitalize">{schedule.mode}</span>
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Buat Jadwal Baru
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      // Enable all schedules
                      setSchedules(prev => prev.map(s => ({ ...s, enabled: true })));
                    }}
                  >
                    <Play className="h-4 w-4" />
                    Aktifkan Semua
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      // Disable all schedules
                      setSchedules(prev => prev.map(s => ({ ...s, enabled: false })));
                    }}
                  >
                    <Pause className="h-4 w-4" />
                    Nonaktifkan Semua
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => console.log("View calendar")}
                  >
                    <CalendarDays className="h-4 w-4" />
                    Lihat Kalender
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Semua Jadwal</CardTitle>
                  <CardDescription>
                    Kelola dan konfigurasi jadwal penyiraman
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="enabled">Aktif</SelectItem>
                      <SelectItem value="disabled">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules
                  .filter(schedule =>
                    filterStatus === "all" ||
                    (filterStatus === "enabled" && schedule.enabled) ||
                    (filterStatus === "disabled" && !schedule.enabled)
                  )
                  .map(schedule => (
                    <Card key={schedule.id} className={`border-2 ${schedule.enabled ? "border-green-200" : "border-gray-200"
                      }`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          {/* Schedule Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg">{schedule.name}</h3>
                                  <Badge className={getModeColor(schedule.mode)}>
                                    {getModeIcon(schedule.mode)}
                                    <span className="ml-1 capitalize">{schedule.mode}</span>
                                  </Badge>
                                </div>
                                {schedule.description && (
                                  <p className="text-gray-600 mt-1">{schedule.description}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={schedule.enabled}
                                  onCheckedChange={() => toggleSchedule(schedule.id)}
                                />
                                <span className="text-sm">
                                  {schedule.enabled ? "Aktif" : "Nonaktif"}
                                </span>
                              </div>
                            </div>

                            {/* Schedule Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <div className="text-sm text-gray-600">Waktu</div>
                                <div className="font-medium">{schedule.time}</div>
                              </div>

                              <div>
                                <div className="text-sm text-gray-600">Durasi</div>
                                <div className="font-medium">{schedule.duration} menit</div>
                              </div>

                              <div>
                                <div className="text-sm text-gray-600">Hari</div>
                                <div className="font-medium">{formatDays(schedule.days)}</div>
                              </div>

                              <div>
                                <div className="text-sm text-gray-600">Zona</div>
                                <div className="font-medium">
                                  {schedule.zones.length} zona
                                </div>
                              </div>
                            </div>

                            {/* Conditions */}
                            {schedule.conditions && (
                              <div className="mt-4 p-3 bg-gray-50 rounded">
                                <div className="text-sm font-medium text-gray-700 mb-2">Kondisi:</div>
                                <div className="flex flex-wrap gap-2">
                                  {schedule.conditions.minMoisture && (
                                    <Badge variant="outline">
                                      <Droplets className="h-3 w-3 mr-1" />
                                      Min {schedule.conditions.minMoisture}%
                                    </Badge>
                                  )}
                                  {schedule.conditions.maxTemperature && (
                                    <Badge variant="outline">
                                      <Sun className="h-3 w-3 mr-1" />
                                      Max {schedule.conditions.maxTemperature}°C
                                    </Badge>
                                  )}
                                  {schedule.conditions.skipIfRaining && (
                                    <Badge variant="outline">
                                      <CloudRain className="h-3 w-3 mr-1" />
                                      Skip jika hujan
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => runScheduleNow(schedule.id)}
                              disabled={!schedule.enabled}
                            >
                              <Play className="h-4 w-4" />
                              Jalankan Sekarang
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => duplicateSchedule(schedule)}
                            >
                              <Copy className="h-4 w-4" />
                              Duplicate
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => setEditingSchedule(schedule)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 text-red-600 hover:text-red-700"
                              onClick={() => deleteSchedule(schedule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Log Eksekusi</CardTitle>
                  <CardDescription>
                    Riwayat eksekusi jadwal penyiraman
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="skipped">Dilewati</SelectItem>
                      <SelectItem value="failed">Gagal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Waktu</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Jadwal</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Durasi</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Zona</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map(event => {
                      const schedule = schedules.find(s => s.id === event.scheduleId);
                      return (
                        <tr key={event.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">
                                {format(event.time, "HH:mm", { locale: id })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(event.time, "dd/MM/yy", { locale: id })}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{schedule?.name}</div>
                            <div className="text-sm text-gray-500">
                              {schedule?.time}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{event.duration} menit</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {event.zones.map(zoneId => (
                                <Badge key={zoneId} variant="outline" className="text-xs">
                                  {availableZones.find(z => z.id === zoneId)?.name}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(event.status)}>
                              {event.status === "completed" ? "Selesai" :
                                event.status === "running" ? "Berjalan" :
                                  event.status === "pending" ? "Menunggu" :
                                    event.status === "skipped" ? "Dilewati" : "Gagal"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-600">
                              {event.reason || "-"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Schedule Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Buat Jadwal Baru</CardTitle>
              <CardDescription>
                Konfigurasi jadwal penyiraman otomatis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-name">Nama Jadwal</Label>
                    <Input
                      id="schedule-name"
                      placeholder="Penyiraman Pagi"
                      value={newSchedule.name}
                      onChange={(e) => setNewSchedule(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule-mode">Mode Jadwal</Label>
                    <Select
                      value={newSchedule.mode}
                      onValueChange={(value: "fixed" | "smart" | "weather") =>
                        setNewSchedule(prev => ({ ...prev, mode: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Fixed - Waktu Tetap
                          </div>
                        </SelectItem>
                        <SelectItem value="smart">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Smart - Adaptif Kondisi
                          </div>
                        </SelectItem>
                        <SelectItem value="weather">
                          <div className="flex items-center gap-2">
                            <CloudRain className="h-4 w-4" />
                            Weather - Berdasarkan Cuaca
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-desc">Deskripsi (Opsional)</Label>
                  <Input
                    id="schedule-desc"
                    placeholder="Penyiraman rutin pagi hari untuk taman depan"
                    value={newSchedule.description}
                    onChange={(e) => setNewSchedule(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                  />
                </div>
              </div>

              {/* Time Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-time">Waktu</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule(prev => ({
                        ...prev,
                        time: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule-duration">Durasi (menit)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[newSchedule.duration]}
                        onValueChange={(value) => setNewSchedule(prev => ({
                          ...prev,
                          duration: value[0]
                        }))}
                        min={1}
                        max={60}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-16 text-center font-medium">
                        {newSchedule.duration} m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Days Selection */}
                <div className="space-y-2">
                  <Label>Hari</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {daysOfWeek.map(day => (
                      <Button
                        key={day.id}
                        type="button"
                        variant={newSchedule.days.includes(day.id) ? "default" : "outline"}
                        className="h-10"
                        onClick={() => handleDayToggle(day.id)}
                      >
                        {day.short}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewSchedule(prev => ({
                        ...prev,
                        days: [1, 2, 3, 4, 5]
                      }))}
                    >
                      Weekdays
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewSchedule(prev => ({
                        ...prev,
                        days: [0, 6]
                      }))}
                    >
                      Weekend
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewSchedule(prev => ({
                        ...prev,
                        days: [0, 1, 2, 3, 4, 5, 6]
                      }))}
                    >
                      Setiap Hari
                    </Button>
                  </div>
                </div>
              </div>

              {/* Zones Selection */}
              <div className="space-y-2">
                <Label>Zona Penyiraman</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableZones.map(zone => (
                    <Button
                      key={zone.id}
                      type="button"
                      variant={newSchedule.zones.includes(zone.id) ? "default" : "outline"}
                      className="h-12 flex-col gap-1"
                      onClick={() => handleZoneToggle(zone.id)}
                    >
                      <Droplets className="h-4 w-4" />
                      <span className="text-xs">{zone.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Conditions (for smart/weather modes) */}
              {(newSchedule.mode === "smart" || newSchedule.mode === "weather") && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Kondisi Eksekusi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-moisture">Kelembaban Minimum</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[newSchedule.conditions.minMoisture]}
                          onValueChange={(value) => setNewSchedule(prev => ({
                            ...prev,
                            conditions: { ...prev.conditions, minMoisture: value[0] }
                          }))}
                          min={10}
                          max={80}
                          step={5}
                          className="flex-1"
                        />
                        <span className="w-16 text-center font-medium">
                          {newSchedule.conditions.minMoisture}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-temperature">Suhu Maksimum</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[newSchedule.conditions.maxTemperature]}
                          onValueChange={(value) => setNewSchedule(prev => ({
                            ...prev,
                            conditions: { ...prev.conditions, maxTemperature: value[0] }
                          }))}
                          min={20}
                          max={45}
                          step={1}
                          className="flex-1"
                        />
                        <span className="w-16 text-center font-medium">
                          {newSchedule.conditions.maxTemperature}°C
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="skip-raining"
                      checked={newSchedule.conditions.skipIfRaining}
                      onCheckedChange={(checked) => setNewSchedule(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, skipIfRaining: checked }
                      }))}
                    />
                    <Label htmlFor="skip-raining">
                      Lewati jika hujan
                    </Label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewSchedule({
                      name: "",
                      description: "",
                      time: "06:00",
                      duration: 15,
                      days: [],
                      zones: [],
                      enabled: true,
                      mode: "fixed",
                      conditions: {
                        minMoisture: 30,
                        maxTemperature: 35,
                        skipIfRaining: false
                      }
                    });
                  }}
                >
                  Batal
                </Button>
                <Button onClick={handleCreateSchedule}>
                  Simpan Jadwal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}