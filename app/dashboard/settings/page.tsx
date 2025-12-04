'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Database, 
  Wifi, 
  Bell, 
  Shield, 
  Smartphone,
  Monitor,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Sistem</h1>
          <p className="text-muted-foreground">
            Konfigurasi sistem IoT dan preferensi pengguna
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Coming Soon
        </Badge>
      </div>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pengaturan Umum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-name">Nama Sistem</Label>
                <Input 
                  id="system-name" 
                  defaultValue="IoT Watering System" 
                  placeholder="Masukkan nama sistem"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Waktu</Label>
                <select 
                  id="timezone" 
                  className="w-full p-2 border rounded-md"
                  defaultValue="Asia/Jakarta"
                >
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                  <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Bahasa</Label>
                <select 
                  id="language" 
                  className="w-full p-2 border rounded-md"
                  defaultValue="id"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode Gelap</Label>
                  <p className="text-sm text-muted-foreground">
                    Aktifkan tema gelap untuk interface
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-refresh Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Update data sensor secara otomatis
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Mainkan suara untuk notifikasi penting
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Pengaturan Perangkat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Koneksi IoT</h4>
              <div className="space-y-2">
                <Label htmlFor="device-ip">IP Address Perangkat</Label>
                <Input 
                  id="device-ip" 
                  defaultValue="192.168.1.100" 
                  placeholder="192.168.1.x"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="device-port">Port</Label>
                <Input 
                  id="device-port" 
                  type="number" 
                  defaultValue="3003" 
                  placeholder="3003"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-connect</Label>
                  <p className="text-sm text-muted-foreground">
                    Sambungkan otomatis ke perangkat
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Sensor Calibration</h4>
              <div className="space-y-2">
                <Label htmlFor="moisture-offset">Kelembapan Offset</Label>
                <Input 
                  id="moisture-offset" 
                  type="number" 
                  defaultValue="0" 
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temp-offset">Suhu Offset</Label>
                <Input 
                  id="temp-offset" 
                  type="number" 
                  defaultValue="0" 
                  placeholder="0"
                />
              </div>

              <Button variant="outline" className="w-full">
                Kalibrasi Ulang Sensor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data & Penyimpanan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Data Retention</h4>
              <div className="space-y-2">
                <Label htmlFor="retention-days">Simpan Data (hari)</Label>
                <Input 
                  id="retention-days" 
                  type="number" 
                  defaultValue="90" 
                  placeholder="90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Frekuensi Backup</Label>
                <select 
                  id="backup-frequency" 
                  className="w-full p-2 border rounded-md"
                  defaultValue="daily"
                >
                  <option value="hourly">Setiap Jam</option>
                  <option value="daily">Setiap Hari</option>
                  <option value="weekly">Setiap Minggu</option>
                  <option value="monthly">Setiap Bulan</option>
                </select>
              </div>

              <Button variant="outline" className="w-full">
                Backup Data Sekarang
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Storage Usage</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Database</span>
                  <span className="font-medium">24.7 MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Logs</span>
                  <span className="font-medium">8.2 MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Backups</span>
                  <span className="font-medium">156.3 MB</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>189.2 MB</span>
                </div>
              </div>

              <Button variant="destructive" className="w-full">
                Hapus Data Lama
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferensi Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Email Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>System Alerts</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Daily Reports</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Weekly Summary</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Push Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Critical Alerts</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Schedule Reminders</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Maintenance Updates</Label>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Keamanan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Authentication</h4>
              <div className="space-y-2">
                <Label htmlFor="current-password">Password Saat Ini</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  placeholder="Masukkan password saat ini"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  placeholder="Masukkan password baru"
                />
              </div>

              <Button className="w-full">
                Update Password
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Access Control</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Auth</Label>
                    <p className="text-sm text-muted-foreground">
                      Tambahkan keamanan ekstra
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Logout otomatis setelah 30 menit
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          Reset to Default
        </Button>
        <Button>
          Save All Settings
        </Button>
      </div>
    </div>
  );
}