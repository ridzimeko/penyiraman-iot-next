"use client";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  StopCircle, 
  Settings,
  Zap,
  Clock,
  CloudRain,
  Droplets,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ControlPanelProps {
  currentMode: "auto" | "manual" | "schedule";
  pumpStatus: boolean;
  onManualControl: (action: "ON" | "OFF") => void;
  loading?: boolean;
}

export default function ControlPanel({
  currentMode,
  pumpStatus,
  onManualControl,
  loading = false,
}: ControlPanelProps) {
  const [mode, setMode] = useState<"auto" | "manual" | "schedule">(currentMode);
  const [moistureThreshold, setMoistureThreshold] = useState(30);
  const [duration, setDuration] = useState(5);

  const handleModeChange = (value: string) => {
    if (value) {
      setMode(value as "auto" | "manual" | "schedule");
    }
  };

  const handleQuickWater = (minutes: number) => {
    setDuration(minutes);
    // Simulate starting pump for specified duration
    onManualControl("ON");
    setTimeout(() => {
      onManualControl("OFF");
    }, minutes * 60 * 1000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Mode Operasi</h3>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={handleModeChange}
          className="grid grid-cols-3 gap-2"
        >
          <ToggleGroupItem 
            value="auto" 
            className="flex flex-col items-center justify-center h-24 gap-2 data-[state=on]:bg-green-50 data-[state=on]:border-green-200 data-[state=on]:text-green-700"
          >
            <Zap className="h-6 w-6" />
            <div className="text-center">
              <p className="font-medium">Otomatis</p>
              <p className="text-xs text-gray-500">Berdasarkan sensor</p>
            </div>
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="manual" 
            className="flex flex-col items-center justify-center h-24 gap-2 data-[state=on]:bg-blue-50 data-[state=on]:border-blue-200 data-[state=on]:text-blue-700"
          >
            <Settings className="h-6 w-6" />
            <div className="text-center">
              <p className="font-medium">Manual</p>
              <p className="text-xs text-gray-500">Kontrol langsung</p>
            </div>
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="schedule" 
            className="flex flex-col items-center justify-center h-24 gap-2 data-[state=on]:bg-purple-50 data-[state=on]:border-purple-200 data-[state=on]:text-purple-700"
          >
            <Clock className="h-6 w-6" />
            <div className="text-center">
              <p className="font-medium">Jadwal</p>
              <p className="text-xs text-gray-500">Waktu tetap</p>
            </div>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Control Sections based on Mode */}
      {mode === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kontrol Manual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Status Pompa</h4>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  pumpStatus 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {pumpStatus ? "Menyala" : "Mati"}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant={pumpStatus ? "destructive" : "default"}
                  onClick={() => onManualControl(pumpStatus ? "OFF" : "ON")}
                  disabled={loading}
                  className="flex-1 gap-2 h-12"
                >
                  {pumpStatus ? (
                    <>
                      <StopCircle className="h-5 w-5" />
                      Matikan Pompa
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Nyalakan Pompa
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Siram Cepat</h4>
                <CloudRain className="h-5 w-5 text-blue-500" />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleQuickWater(5)}
                  disabled={loading}
                  className="gap-2"
                >
                  <Droplets className="h-4 w-4" />
                  5 Menit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickWater(10)}
                  disabled={loading}
                  className="gap-2"
                >
                  <Droplets className="h-4 w-4" />
                  10 Menit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickWater(15)}
                  disabled={loading}
                  className="gap-2"
                >
                  <Droplets className="h-4 w-4" />
                  15 Menit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "auto" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pengaturan Otomatis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Threshold Kelembaban</h4>
                  <p className="text-sm text-gray-500">
                    Sistem akan menyiram otomatis jika kelembaban di bawah threshold
                  </p>
                </div>
                <div className="text-2xl font-bold text-blue-600">{moistureThreshold}%</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Kering (20%)</span>
                  <span>Basah (80%)</span>
                </div>
                <Slider
                  value={[moistureThreshold]}
                  onValueChange={(value) => setMoistureThreshold(value[0])}
                  min={20}
                  max={80}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Kering</span>
                  <span>Optimal</span>
                  <span>Basah</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Informasi Sistem Otomatis</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Sistem akan memeriksa kelembaban tanah setiap 5 menit.
                    Jika kelembaban di bawah {moistureThreshold}%, penyiraman akan aktif selama 10 menit.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "schedule" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pengaturan Jadwal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Atur jadwal penyiraman tetap sesuai waktu yang diinginkan.
            </p>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => window.location.href = '/dashboard/schedule'}
            >
              <Clock className="h-4 w-4" />
              Kelola Jadwal Penyiraman
            </Button>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Jadwal Aktif</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <p className="font-medium">Pagi Hari</p>
                    <p className="text-sm text-gray-500">06:00 - 10 menit</p>
                  </div>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <p className="font-medium">Sore Hari</p>
                    <p className="text-sm text-gray-500">17:00 - 15 menit</p>
                  </div>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mode Saat Ini</span>
              <span className="font-medium capitalize">{mode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status Pompa</span>
              <span className={`font-medium ${
                pumpStatus ? "text-green-600" : "text-gray-600"
              }`}>
                {pumpStatus ? "Menyala" : "Mati"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Threshold Kelembaban</span>
              <span className="font-medium">{moistureThreshold}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Koneksi Sensor</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium text-green-600">Terhubung</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}