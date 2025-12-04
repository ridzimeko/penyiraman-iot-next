'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Clock, Calendar } from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
  days: string[];
  isActive: boolean;
  duration?: number;
}

const DAYS_OF_WEEK = [
  { id: 'senin', label: 'Senin' },
  { id: 'selasa', label: 'Selasa' },
  { id: 'rabu', label: 'Rabu' },
  { id: 'kamis', label: 'Kamis' },
  { id: 'jumat', label: 'Jumat' },
  { id: 'sabtu', label: 'Sabtu' },
  { id: 'minggu', label: 'Minggu' }
];

interface ScheduleFormProps {
  schedule?: Schedule;
  onSave: (schedule: any) => void;
  onCancel: () => void;
}

const ScheduleForm = ({ schedule, onSave, onCancel }: ScheduleFormProps) => {
  const [formData, setFormData] = useState({
    name: schedule?.name || '',
    startTime: schedule?.startTime || '',
    endTime: schedule?.endTime || '',
    duration: schedule?.duration || 30,
    days: schedule?.days || [],
    isActive: schedule?.isActive ?? true
  });

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Jadwal</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Contoh: Penyiraman Pagi"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Waktu Mulai</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">Waktu Selesai (opsional)</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Durasi (menit)</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          max="120"
          value={formData.duration}
          onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Hari Pengulangan</Label>
        <div className="grid grid-cols-2 gap-2">
          {DAYS_OF_WEEK.map(day => (
            <div key={day.id} className="flex items-center space-x-2">
              <Checkbox
                id={day.id}
                checked={formData.days.includes(day.id)}
                onCheckedChange={() => handleDayToggle(day.id)}
              />
              <Label htmlFor={day.id} className="text-sm">{day.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive">Aktif</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">
          {schedule ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
};

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules');
      const result = await response.json();
      if (result.success) {
        setSchedules(result.data.map((s: any) => ({
          ...s,
          days: JSON.parse(s.days)
        })));
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async (scheduleData: any) => {
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        await fetchSchedules();
        setIsDialogOpen(false);
        setEditingSchedule(null);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleUpdateSchedule = async (scheduleData: any) => {
    if (!editingSchedule) return;

    try {
      const response = await fetch('/api/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scheduleData, id: editingSchedule.id })
      });

      if (response.ok) {
        await fetchSchedules();
        setIsDialogOpen(false);
        setEditingSchedule(null);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      const response = await fetch(`/api/schedules?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSchedules();
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsDialogOpen(true);
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsDialogOpen(true);
  };

  const formatDays = (days: string[]) => {
    if (days.length === 7) return 'Setiap Hari';
    if (days.length === 5 && !days.includes('sabtu') && !days.includes('minggu')) return 'Hari Kerja';
    if (days.length === 2 && days.includes('sabtu') && days.includes('minggu')) return 'Akhir Pekan';
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Penjadwalan Penyiraman</h1>
          <p className="text-muted-foreground">
            Kelola jadwal otomatis penyiraman tanaman
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddSchedule}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jadwal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
              </DialogTitle>
            </DialogHeader>
            <ScheduleForm
              schedule={editingSchedule || undefined}
              onSave={editingSchedule ? handleUpdateSchedule : handleSaveSchedule}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingSchedule(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Jadwal</h3>
              <p className="text-muted-foreground text-center mb-4">
                Buat jadwal penyiraman otomatis untuk memudahkan perawatan tanaman Anda
              </p>
              <Button onClick={handleAddSchedule}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Jadwal Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{schedule.name}</CardTitle>
                    <Badge variant={schedule.isActive ? "default" : "secondary"}>
                      {schedule.isActive ? "Aktif" : "Non-aktif"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Waktu</div>
                      <div className="text-sm text-muted-foreground">
                        {schedule.startTime} {schedule.endTime && `- ${schedule.endTime}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Pengulangan</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDays(schedule.days)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Durasi</div>
                    <div className="text-sm text-muted-foreground">
                      {schedule.duration} menit
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}