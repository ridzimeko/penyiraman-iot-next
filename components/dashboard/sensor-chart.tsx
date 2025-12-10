"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  Brush,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Download,
  RefreshCw,
  Droplets,
  Thermometer,
  Cloud,
  BarChart3,
  LineChart as LineChartIcon,
  TrendingUp
} from "lucide-react";
import { format, subHours } from "date-fns";
import { id } from "date-fns/locale";

// Import Firebase
import { database } from "@/lib/firebase";
import { ref, onValue, get } from "firebase/database";
import useRealtimeFirebase from "@/hooks/useRealtimeFirebase";

// Type definitions
interface SensorDataPoint {
  waktu: string;
  timestamp: number;
  kelembaban: number;
  suhu: number;
  humidity: number;
  pumpStatus: boolean;
  soilMoisture?: number;
  temperature?: number;
  waterLevel?: number;
  batteryLevel?: number;
  phLevel?: number;
  lightIntensity?: number;
}

interface FirebaseSensorData {
  soilMoisture?: number;
  temperature?: number;
  humidity?: number;
  pumpStatus?: boolean;
  kelembaban?: number;
  suhu?: number;
  humidityAir?: number;
  pompa?: boolean;
  waterLevel?: number;
  batteryLevel?: number;
  phLevel?: number;
  lightIntensity?: number;
  light?: number;
  water?: number;
  battery?: number;
  ph?: number;
  timestamp?: number;
  time?: number | string;
  [key: string]: unknown; // Untuk properti lain yang mungkin ada
}

interface TimeRangeOption {
  label: string;
  value: string;
  hours: number;
}

interface ChartTypeOption {
  label: string;
  value: string;
  icon: React.ElementType;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
    name: string;
  }>;
  label?: string;
}

// Time range options
const TIME_RANGES: TimeRangeOption[] = [
  { label: "1 Jam Terakhir", value: "1h", hours: 1 },
  { label: "6 Jam Terakhir", value: "6h", hours: 6 },
  { label: "12 Jam Terakhir", value: "12h", hours: 12 },
  { label: "24 Jam Terakhir", value: "24h", hours: 24 },
  { label: "3 Hari Terakhir", value: "3d", hours: 72 },
];

// Chart type options
const CHART_TYPES: ChartTypeOption[] = [
  { label: "Grafik Garis", value: "line", icon: LineChartIcon },
  { label: "Grafik Area", value: "area", icon: TrendingUp },
  { label: "Grafik Batang", value: "bar", icon: BarChart3 },
];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => {
          let displayName = "";
          let displayValue = "";

          switch (entry.dataKey) {
            case "kelembaban":
            case "soilMoisture":
              displayName = "Kelembaban Tanah";
              displayValue = `${entry.value}%`;
              break;
            case "suhu":
            case "temperature":
              displayName = "Suhu";
              displayValue = `${entry.value}°C`;
              break;
            case "humidity":
              displayName = "Kelembaban Udara";
              displayValue = `${entry.value}%`;
              break;
            case "waterLevel":
              displayName = "Tinggi Air";
              displayValue = `${entry.value}%`;
              break;
            case "batteryLevel":
              displayName = "Baterai";
              displayValue = `${entry.value}%`;
              break;
            case "phLevel":
              displayName = "pH Tanah";
              displayValue = entry.value.toString();
              break;
            case "lightIntensity":
              displayName = "Intensitas Cahaya";
              displayValue = `${entry.value} lux`;
              break;
            default:
              displayName = entry.dataKey;
              displayValue = `${entry.value}`;
          }

          return (
            <div key={`tooltip-${index}`} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{displayName}: </span>
              <span className="font-medium">
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function SensorChart() {
  const [timeRange, setTimeRange] = useState("24h");
  const [chartType, setChartType] = useState("line");
  const [selectedSensors, setSelectedSensors] = useState<string[]>([
    "kelembaban", "suhu", "humidity"
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartData, setChartData] = useState<SensorDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensorData = useRealtimeFirebase(['sensor', 'status'])

  const selectedRange = TIME_RANGES.find(range => range.value === timeRange) || TIME_RANGES[3];

  // Helper function untuk parse timestamp
  const parseTimestamp = (timestamp: unknown): number => {
    if (typeof timestamp === 'number') {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      const parsed = Date.parse(timestamp);
      return isNaN(parsed) ? Date.now() : parsed;
    }
    return Date.now();
  };

  // Helper function untuk get numeric value
  const getNumericValue = (value: unknown, defaultValue: number = 0): number => {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  };

  // Helper function untuk get boolean value
  const getBooleanValue = (value: unknown): boolean => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    return false;
  };

  // Fetch data dari Firebase
  const fetchSensorData = async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      if (sensorData) {
        console.log('data detected')
        const timestamp = parseTimestamp(sensorData?.sensor?.timestamp);
        const date = new Date(timestamp);

        const chartDataArray: SensorDataPoint[] = Array.from({ length: 24 }, (_, i) => {
          const time = subHours(date, i);
          const soilMoisture = getNumericValue(sensorData?.sensor?.kelembapan_tanah, 0);
          const temperature = getNumericValue(sensorData?.sensor?.suhu, 0);
          const humidity = getNumericValue(sensorData?.sensor?.kelembapan_udara, 0);
          const pumpStatus = getBooleanValue(sensorData.status?.pompa === "ON");

          return {
            waktu: format(time, "HH:mm", { locale: id }),
            timestamp: time.getTime(),
            kelembaban: soilMoisture,
            suhu: temperature,
            humidity: humidity,
            pumpStatus: pumpStatus,
            // waterLevel: getNumericValue(data.waterLevel || data.water),
            // batteryLevel: getNumericValue(data.batteryLevel || data.battery),
            // phLevel: getNumericValue(data.phLevel || data.ph),
            // lightIntensity: getNumericValue(data.lightIntensity || data.light),
          };
        }).reverse();

        setChartData(chartDataArray);
      }

    } catch (error) {
      console.error("Error fetching sensor data:", error);
      setError("Gagal memuat data sensor");
      // Fallback ke data mock jika Firebase error
      generateMockData();
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch data real-time jika tidak ada history
  const fetchCurrentData = async () => {
    try {
      if (sensorData) {
        const timestamp = parseTimestamp(sensorData?.sensor?.timestamp);
        const date = new Date(timestamp);

        const chartDataArray: SensorDataPoint[] = Array.from({ length: 24 }, (_, i) => {
          const time = subHours(date, i);
          const soilMoisture = getNumericValue(sensorData?.sensor?.kelembapan_tanah, 0);
          const temperature = getNumericValue(sensorData?.sensor?.suhu, 0);
          const humidity = getNumericValue(sensorData?.sensor?.kelembapan_udara, 0);
          const pumpStatus = getBooleanValue(sensorData.status?.pompa === "ON");

          return {
            waktu: format(time, "HH:mm", { locale: id }),
            timestamp: time.getTime(),
            kelembaban: soilMoisture,
            suhu: temperature,
            humidity: humidity,
            pumpStatus: pumpStatus,
            // waterLevel: getNumericValue(data.waterLevel || data.water),
            // batteryLevel: getNumericValue(data.batteryLevel || data.battery),
            // phLevel: getNumericValue(data.phLevel || data.ph),
            // lightIntensity: getNumericValue(data.lightIntensity || data.light),
          };
        }).reverse();

        setChartData(chartDataArray);
      }
    } catch (error) {
      console.error("Error fetching current data:", error);
      generateMockData();
    }
  };

  // Fallback ke data mock
  const generateMockData = () => {
    const data: SensorDataPoint[] = [];
    const now = new Date();

    for (let i = selectedRange.hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();

      // Simulasi data yang realistis
      const baseMoisture = 50;
      const moistureVariation = Math.sin(hour * Math.PI / 12) * 20;
      const soilMoisture = Math.max(20, Math.min(80, baseMoisture + moistureVariation + (Math.random() * 5 - 2.5)));

      const baseTemp = 25;
      const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 8;
      const temperature = Math.max(20, Math.min(35, baseTemp + tempVariation + (Math.random() * 2 - 1)));

      const humidity = Math.max(40, Math.min(90, 60 + Math.sin(hour * Math.PI / 6) * 20 + (Math.random() * 5 - 2.5)));

      // Pompa aktif saat kelembaban rendah
      const pumpActive = soilMoisture < 35;

      data.push({
        waktu: format(time, "HH:mm", { locale: id }),
        timestamp: time.getTime(),
        kelembaban: Math.round(soilMoisture * 10) / 10,
        suhu: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
        pumpStatus: pumpActive,
      });
    }

    setChartData(data);
  };

  // Fetch data awal dan ketika rentang waktu berubah
  // effect yang mengconvert setiap kali sensorData masuk
  useEffect(() => {
    if (!sensorData) return;

    try {
      const timestamp = parseTimestamp(sensorData?.sensor?.timestamp ?? Date.now());
      const date = new Date(timestamp);

      const chartDataArray: SensorDataPoint[] = Array.from({ length: 24 }, (_, i) => {
        const time = subHours(date, i);
        return {
          waktu: format(time, "HH:mm", { locale: id }),
          timestamp: time.getTime(),
          kelembaban: getNumericValue(sensorData?.sensor?.kelembapan_tanah, 0),
          suhu: getNumericValue(sensorData?.sensor?.suhu, 0),
          humidity: getNumericValue(sensorData?.sensor?.kelembapan_udara, 0),
          pumpStatus: getBooleanValue(sensorData?.status?.pompa === "ON"),
        };
      }).reverse();

      setChartData(chartDataArray);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [sensorData]); // <--- hanya depend ke sensorData


  const handleRefresh = () => {
    fetchSensorData();
  };

  const downloadCSV = () => {
    if (chartData.length === 0) return;

    const headers = [
      "Waktu",
      "Timestamp",
      "Kelembaban Tanah (%)",
      "Suhu (°C)",
      "Kelembaban Udara (%)",
      "Status Pompa",
      "Tinggi Air (%)",
      "Level Baterai (%)",
      "pH Tanah",
      "Intensitas Cahaya (lux)"
    ];

    const csvContent = [
      headers.join(","),
      ...chartData.map(row => [
        row.waktu,
        row.timestamp,
        row.kelembaban,
        row.suhu,
        row.humidity,
        row.pumpStatus ? "Menyala" : "Mati",
        row.waterLevel || "N/A",
        row.batteryLevel || "N/A",
        row.phLevel || "N/A",
        row.lightIntensity || "N/A"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor-data-${format(new Date(), "yyyy-MM-dd-HH-mm")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const toggleSensor = (sensor: string) => {
    setSelectedSensors(prev =>
      prev.includes(sensor)
        ? prev.filter(s => s !== sensor)
        : [...prev, sensor]
    );
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data chart...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.77-.833-2.54 0L4.206 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-700 mb-2">{error}</p>
          <Button variant="outline" onClick={handleRefresh}>
            Coba Lagi
          </Button>
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center">
          <div className="text-gray-400 mb-4">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600">Tidak ada data yang tersedia</p>
          <p className="text-sm text-gray-500 mt-1">Pastikan sensor terhubung dan mengirim data</p>
        </div>
      );
    }


    const chartProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    if (chartType === "area") {
      return (
        <AreaChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="waktu"
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Brush dataKey="waktu" height={30} stroke="#9ca3af" />

          {selectedSensors.includes("kelembaban") && (
            <Area
              type="monotone"
              dataKey="kelembaban"
              name="Kelembaban Tanah"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
            />
          )}

          {selectedSensors.includes("suhu") && (
            <Area
              type="monotone"
              dataKey="suhu"
              name="Suhu"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
            />
          )}

          {selectedSensors.includes("humidity") && (
            <Area
              type="monotone"
              dataKey="humidity"
              name="Kelembaban Udara"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
            />
          )}
        </AreaChart>
      );
    }

    if (chartType === "bar") {
      return (
        <BarChart {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="waktu"
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Brush dataKey="waktu" height={30} stroke="#9ca3af" />

          {selectedSensors.includes("kelembaban") && (
            <Bar
              dataKey="kelembaban"
              name="Kelembaban Tanah"
              fill="#3b82f6"
              fillOpacity={0.7}
            />
          )}

          {selectedSensors.includes("suhu") && (
            <Bar
              dataKey="suhu"
              name="Suhu"
              fill="#ef4444"
              fillOpacity={0.7}
            />
          )}

          {selectedSensors.includes("humidity") && (
            <Bar
              dataKey="humidity"
              name="Kelembaban Udara"
              fill="#10b981"
              fillOpacity={0.7}
            />
          )}
        </BarChart>
      );
    }

    // Default line chart
    return (
     <>
       <LineChart data={chartProps.data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="waktu"
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Brush dataKey="waktu" height={30} stroke="#9ca3af" />

        {selectedSensors.includes("kelembaban") && (
          <Line
            type="monotone"
            dataKey="kelembaban"
            name="Kelembaban Tanah"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        )}

        {selectedSensors.includes("suhu") && (
          <Line
            type="monotone"
            dataKey="suhu"
            name="Suhu"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        )}

        {selectedSensors.includes("humidity") && (
          <Line
            type="monotone"
            dataKey="humidity"
            name="Kelembaban Udara"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        )}
      </LineChart>
     </>
    );
  };

  // Hitung statistik
  const calculateStats = () => {
    if (chartData.length === 0) {
      return {
        avgMoisture: 0,
        maxMoisture: 0,
        minMoisture: 0,
        avgTemp: 0,
        maxTemp: 0,
        minTemp: 0,
        pumpActiveCount: 0,
        pumpStatus: false,
      };
    }

    const moistures = chartData.map(d => d.kelembaban);
    const temps = chartData.map(d => d.suhu);
    const pumpActiveCount = chartData.filter(d => d.pumpStatus).length;

    return {
      avgMoisture: Math.round(moistures.reduce((a, b) => a + b, 0) / moistures.length),
      maxMoisture: Math.max(...moistures),
      minMoisture: Math.min(...moistures),
      avgTemp: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
      maxTemp: Math.max(...temps),
      minTemp: Math.min(...temps),
      pumpActiveCount,
      pumpStatus: chartData[chartData.length - 1]?.pumpStatus || false,
    };
  };

  const stats = calculateStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center">
              <Droplets className="h-3 w-3 text-blue-600" />
            </div>
            Grafik Data Sensor
          </CardTitle>

          <div className="flex flex-wrap gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Rentang Waktu" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipe Grafik" />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon && <type.icon className="h-4 w-4" />}
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={downloadCSV}
              disabled={chartData.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Info Status */}
          {isLoading ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <p className="text-blue-700">Memuat data dari Firebase...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.77-.833-2.54 0L4.206 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-yellow-700">{error} - Menggunakan data simulasi</p>
              </div>
            </div>
          ) : null}

          {/* Chart Container */}
          <div className="h-[400px]">
            {renderChart()}
          </div>

          {/* Sensor Toggles */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={selectedSensors.includes("kelembaban") ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => toggleSensor("kelembaban")}
              disabled={isLoading}
            >
              <Droplets className="h-4 w-4" />
              Kelembaban Tanah
            </Button>

            <Button
              variant={selectedSensors.includes("suhu") ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => toggleSensor("suhu")}
              disabled={isLoading}
            >
              <Thermometer className="h-4 w-4" />
              Suhu
            </Button>

            <Button
              variant={selectedSensors.includes("humidity") ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => toggleSensor("humidity")}
              disabled={isLoading}
            >
              <Cloud className="h-4 w-4" />
              Kelembaban Udara
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Statistik Kelembaban</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Rata-rata</p>
                  <p className="text-xl font-bold">
                    {stats.avgMoisture}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tertinggi</p>
                  <p className="text-xl font-bold">
                    {stats.maxMoisture}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terendah</p>
                  <p className="text-xl font-bold">
                    {stats.minMoisture}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trend</p>
                  <p className={`text-xl font-bold ${chartData.length > 1 &&
                    chartData[chartData.length - 1].kelembaban > chartData[0].kelembaban
                    ? "text-green-600"
                    : "text-red-600"
                    }`}>
                    {chartData.length > 1 &&
                      chartData[chartData.length - 1].kelembaban > chartData[0].kelembaban ? "↑" : "↓"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="h-5 w-5 text-red-600" />
                <h4 className="font-medium">Statistik Suhu</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Rata-rata</p>
                  <p className="text-xl font-bold">
                    {stats.avgTemp}°C
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tertinggi</p>
                  <p className="text-xl font-bold">
                    {stats.maxTemp}°C
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terendah</p>
                  <p className="text-xl font-bold">
                    {stats.minTemp}°C
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trend</p>
                  <p className={`text-xl font-bold ${chartData.length > 1 &&
                    chartData[chartData.length - 1].suhu > chartData[0].suhu
                    ? "text-red-600"
                    : "text-blue-600"
                    }`}>
                    {chartData.length > 1 &&
                      chartData[chartData.length - 1].suhu > chartData[0].suhu ? "↑" : "↓"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Aktivitas Pompa</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-xl font-bold">
                    {stats.pumpStatus ? "Menyala" : "Mati"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Aktivitas</p>
                  <p className="text-xl font-bold">
                    {stats.pumpActiveCount}x
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durasi Total</p>
                  <p className="text-xl font-bold">
                    {Math.round(stats.pumpActiveCount * 5)}m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terakhir</p>
                  <p className="text-xl font-bold">
                    {stats.pumpActiveCount > 0 ? "Aktif" : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Tambahan */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Data terakhir diperbarui: {chartData.length > 0
                ? format(new Date(chartData[chartData.length - 1].timestamp), "dd/MM/yyyy HH:mm")
                : "Tidak tersedia"} •
              Total data: {chartData.length} titik
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}