"use client";

import { useState } from "react";
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
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Type definitions
interface SensorDataPoint {
  waktu: string;
  timestamp: number;
  kelembaban: number;
  suhu: number;
  humidity: number;
  pompa: number;
  pumpStatus: boolean;
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

// Mock data generator dengan tipe yang benar
const generateMockData = (hours: number): SensorDataPoint[] => {
  const data: SensorDataPoint[] = [];
  const now = new Date();

  for (let i = hours; i >= 0; i--) {
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

    // Pompa aktif saat kelembaban rendah atau waktu tertentu
    const pumpActive = soilMoisture < 35 || (hour >= 6 && hour <= 8) || (hour >= 16 && hour <= 18);

    data.push({
      waktu: format(time, "HH:mm", { locale: id }),
      timestamp: time.getTime(),
      kelembaban: Math.round(soilMoisture * 10) / 10,
      suhu: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      pompa: pumpActive ? 1 : 0,
      pumpStatus: pumpActive,
    });
  }

  return data;
};

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
              displayName = "Kelembaban Tanah";
              displayValue = `${entry.value}%`;
              break;
            case "suhu":
              displayName = "Suhu";
              displayValue = `${entry.value}°C`;
              break;
            case "humidity":
              displayName = "Kelembaban Udara";
              displayValue = `${entry.value}%`;
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

  const selectedRange = TIME_RANGES.find(range => range.value === timeRange) || TIME_RANGES[3];
  const chartData: SensorDataPoint[] = generateMockData(selectedRange.hours);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const downloadCSV = () => {
    const headers = ["Waktu", "Kelembaban Tanah (%)", "Suhu (°C)", "Kelembaban Udara (%)", "Status Pompa"];
    const csvContent = [
      headers.join(","),
      ...chartData.map(row => [
        row.waktu,
        row.kelembaban,
        row.suhu,
        row.humidity,
        row.pumpStatus ? "Menyala" : "Mati"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor-data-${format(new Date(), "yyyy-MM-dd-HH-mm")}.csv`;
    a.click();
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
      <LineChart {...chartProps}>
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
    );
  };

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
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={downloadCSV}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Chart Container */}
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Sensor Toggles */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={selectedSensors.includes("kelembaban") ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => toggleSensor("kelembaban")}
            >
              <Droplets className="h-4 w-4" />
              Kelembaban Tanah
            </Button>

            <Button
              variant={selectedSensors.includes("suhu") ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => toggleSensor("suhu")}
            >
              <Thermometer className="h-4 w-4" />
              Suhu
            </Button>

            <Button
              variant={selectedSensors.includes("humidity") ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => toggleSensor("humidity")}
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
                    {Math.round(chartData.reduce((sum, d) => sum + d.kelembaban, 0) / chartData.length)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tertinggi</p>
                  <p className="text-xl font-bold">
                    {Math.max(...chartData.map(d => d.kelembaban))}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terendah</p>
                  <p className="text-xl font-bold">
                    {Math.min(...chartData.map(d => d.kelembaban))}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trend</p>
                  <p className="text-xl font-bold text-green-600">
                    {chartData[chartData.length - 1].kelembaban > chartData[0].kelembaban ? "↑" : "↓"}
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
                    {Math.round(chartData.reduce((sum, d) => sum + d.suhu, 0) / chartData.length)}°C
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tertinggi</p>
                  <p className="text-xl font-bold">
                    {Math.max(...chartData.map(d => d.suhu))}°C
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terendah</p>
                  <p className="text-xl font-bold">
                    {Math.min(...chartData.map(d => d.suhu))}°C
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trend</p>
                  <p className="text-xl font-bold text-red-600">
                    {chartData[chartData.length - 1].suhu > chartData[0].suhu ? "↑" : "↓"}
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
                    {chartData[chartData.length - 1].pumpStatus ? "Menyala" : "Mati"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Aktivitas</p>
                  <p className="text-xl font-bold">
                    {chartData.filter(d => d.pumpStatus).length}x
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durasi Total</p>
                  <p className="text-xl font-bold">
                    {Math.round(chartData.filter(d => d.pumpStatus).length * 5)}m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Terakhir</p>
                  <p className="text-xl font-bold">
                    {chartData.filter(d => d.pumpStatus).length > 0 ? "Aktif" : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}