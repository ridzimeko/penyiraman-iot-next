'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Bell, Mail, MessageSquare, Settings, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'telegram' | 'email';
  isActive: boolean;
  config: {
    token?: string;
    chatId?: string;
    email?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
  };
  soilMoistureThreshold?: number;
  pumpStatusAlert: boolean;
}

interface NotificationFormProps {
  notification?: Notification;
  onSave: (notification: any) => void;
  onCancel: () => void;
}

const NotificationForm = ({ notification, onSave, onCancel }: NotificationFormProps) => {
  const [formData, setFormData] = useState({
    type: notification?.type || 'telegram',
    isActive: notification?.isActive ?? true,
    config: {
      token: notification?.config.token || '',
      chatId: notification?.config.chatId || '',
      email: notification?.config.email || '',
      smtpHost: notification?.config.smtpHost || '',
      smtpPort: notification?.config.smtpPort || 587,
      smtpUser: notification?.config.smtpUser || '',
      smtpPassword: notification?.config.smtpPassword || ''
    },
    soilMoistureThreshold: notification?.soilMoistureThreshold || 30,
    pumpStatusAlert: notification?.pumpStatusAlert ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Jenis Notifikasi</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value: 'telegram' | 'email') => 
            setFormData(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="telegram">Telegram Bot</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'telegram' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="token">Bot Token</Label>
            <Input
              id="token"
              value={formData.config.token}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                config: { ...prev.config, token: e.target.value }
              }))}
              placeholder="Masukkan Telegram Bot Token"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatId">Chat ID</Label>
            <Input
              id="chatId"
              value={formData.config.chatId}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                config: { ...prev.config, chatId: e.target.value }
              }))}
              placeholder="Masukkan Chat ID"
              required
            />
          </div>
        </>
      )}

      {formData.type === 'email' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email Penerima</Label>
            <Input
              id="email"
              type="email"
              value={formData.config.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                config: { ...prev.config, email: e.target.value }
              }))}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input
              id="smtpHost"
              value={formData.config.smtpHost}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                config: { ...prev.config, smtpHost: e.target.value }
              }))}
              placeholder="smtp.gmail.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={formData.config.smtpPort}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, smtpPort: parseInt(e.target.value) }
                }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP User</Label>
              <Input
                id="smtpUser"
                value={formData.config.smtpUser}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, smtpUser: e.target.value }
                }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtpPassword">SMTP Password</Label>
            <Input
              id="smtpPassword"
              type="password"
              value={formData.config.smtpPassword}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                config: { ...prev.config, smtpPassword: e.target.value }
              }))}
              required
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="soilMoistureThreshold">
          Threshold Kelembapan Tanah (%)
        </Label>
        <Input
          id="soilMoistureThreshold"
          type="number"
          min="0"
          max="100"
          value={formData.soilMoistureThreshold}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            soilMoistureThreshold: parseInt(e.target.value)
          }))}
          placeholder="30"
        />
        <p className="text-xs text-muted-foreground">
          Notifikasi akan dikirim jika kelembapan tanah di bawah nilai ini
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="pumpStatusAlert"
          checked={formData.pumpStatusAlert}
          onCheckedChange={(checked) => setFormData(prev => ({ 
            ...prev, 
            pumpStatusAlert: checked 
          }))}
        />
        <Label htmlFor="pumpStatusAlert">
          Notifikasi saat pompa ON/OFF
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ 
            ...prev, 
            isActive: checked 
          }))}
        />
        <Label htmlFor="isActive">Aktif</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">
          {notification ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data.map((n: any) => ({
          ...n,
          config: JSON.parse(n.config)
        })));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotification = async (notificationData: any) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        await fetchNotifications();
        setIsDialogOpen(false);
        setEditingNotification(null);
      }
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const handleUpdateNotification = async (notificationData: any) => {
    if (!editingNotification) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...notificationData, id: editingNotification.id })
      });

      if (response.ok) {
        await fetchNotifications();
        setIsDialogOpen(false);
        setEditingNotification(null);
      }
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) return;

    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleEditNotification = (notification: Notification) => {
    setEditingNotification(notification);
    setIsDialogOpen(true);
  };

  const handleAddNotification = () => {
    setEditingNotification(null);
    setIsDialogOpen(true);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'telegram':
        return <MessageSquare className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'telegram':
        return 'Telegram Bot';
      case 'email':
        return 'Email';
      default:
        return type;
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Notifikasi</h1>
          <p className="text-muted-foreground">
            Kelola notifikasi untuk sistem penyiraman otomatis
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNotification}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Notifikasi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNotification ? 'Edit Notifikasi' : 'Tambah Notifikasi Baru'}
              </DialogTitle>
            </DialogHeader>
            <NotificationForm
              notification={editingNotification || undefined}
              onSave={editingNotification ? handleUpdateNotification : handleSaveNotification}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingNotification(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifikasi</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-aktif</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => !n.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Notifikasi</h3>
              <p className="text-muted-foreground text-center mb-4">
                Atur notifikasi untuk mendapatkan update tentang kondisi sistem penyiraman
              </p>
              <Button onClick={handleAddNotification}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Notifikasi Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <CardTitle className="text-lg">
                      {getNotificationLabel(notification.type)}
                    </CardTitle>
                    <Badge variant={notification.isActive ? "default" : "secondary"}>
                      {notification.isActive ? "Aktif" : "Non-aktif"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditNotification(notification)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Konfigurasi</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {notification.type === 'telegram' ? (
                        <>
                          <div>Chat ID: {notification.config.chatId}</div>
                          <div>Token: {'*'.repeat(20)}{notification.config.token?.slice(-4)}</div>
                        </>
                      ) : (
                        <>
                          <div>Email: {notification.config.email}</div>
                          <div>SMTP: {notification.config.smtpHost}:{notification.config.smtpPort}</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Pengaturan Alert</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        Threshold Kelembapan: {notification.soilMoistureThreshold}%
                      </div>
                      <div>
                        Alert Status Pompa: {notification.pumpStatusAlert ? 'Aktif' : 'Non-aktif'}
                      </div>
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