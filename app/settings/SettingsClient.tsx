'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SOLID_COLORS, GRADIENTS } from '@/constants';
import { Button } from '@/components/ui/Button';
import { Upload, X, Check } from '@/components/ui/Icons';
import { UserSettings } from '@/types';
import { upsertUserSettingsAction } from '@/app/actions/settings';

interface SettingsClientProps {
  initialSettings: UserSettings;
  userId: string;
}

export function SettingsClient({ initialSettings, userId }: SettingsClientProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Update local state only (don't save to DB yet)
  const updateLocalSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    setSaved(false);
  };

  // Save all settings to Supabase
  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    
    try {
      const result = await upsertUserSettingsAction(userId, settings);
      
      if (result.error) {
        console.error('Error saving settings:', result.error);
        alert('Failed to save settings. Please try again.');
      } else {
        setSaved(true);
        // Dispatch custom event to notify Layout to reload settings
        window.dispatchEvent(new CustomEvent('settingsUpdated'));
        // Hide success message after 2 seconds
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUploading(true);

    // Verify user is authenticated
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      alert('You must be logged in to upload images');
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log('Starting upload...', { filePath, fileSize: file.size });

      // Add timeout to prevent hanging
      const uploadPromise = supabase.storage
        .from('backgrounds')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000);
      });

      const { data: uploadData, error: uploadError } = await Promise.race([
        uploadPromise,
        timeoutPromise,
      ]) as any;

      if (uploadError) {
        console.error('Upload error:', uploadError);
        let errorMessage = 'Upload failed. ';
        
        if (uploadError.message?.includes('already exists') || uploadError.error === 'Duplicate') {
          errorMessage += 'This file already exists. Please try a different image.';
        } else if (uploadError.message?.includes('not found') || uploadError.statusCode === '404') {
          errorMessage += 'Storage bucket not found. Please check your Supabase setup.';
        } else if (uploadError.message?.includes('JWT') || uploadError.statusCode === '401') {
          errorMessage += 'Authentication failed. Please log in again.';
        } else if (uploadError.message?.includes('policy') || uploadError.statusCode === '403') {
          errorMessage += 'Permission denied. Please check storage policies.';
        } else {
          errorMessage += uploadError.message || 'Unknown error occurred.';
        }
        
        alert(errorMessage);
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('backgrounds')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      setUploadedImageUrl(publicUrl);
      updateLocalSettings({ 
        backgroundType: 'IMAGE', 
        backgroundValue: publicUrl 
      });
      
      // Don't auto-save, let user click Save Settings button
      // Success message is shown via the uploadedImageUrl state
    } catch (error: any) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to upload image. ';
      
      if (error.message?.includes('timeout')) {
        errorMessage += 'Upload took too long. Please try a smaller image.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async () => {
    if (settings.backgroundType === 'IMAGE' && settings.backgroundValue) {
      try {
        // Extract file path from URL
        const url = new URL(settings.backgroundValue);
        const pathParts = url.pathname.split('/');
        const backgroundsIndex = pathParts.indexOf('backgrounds');
        const filePath = pathParts.slice(backgroundsIndex + 1).join('/');
        
        const { error } = await supabase.storage
          .from('backgrounds')
          .remove([filePath]);

        if (error) {
          console.error('Error removing image:', error);
        }
      } catch (error) {
        console.error('Error parsing image URL:', error);
      }
    }
    
    setUploadedImageUrl(null);
    updateLocalSettings({ 
      backgroundType: 'SOLID', 
      backgroundValue: '#000000' 
    });
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  return (
    <div className="w-full max-w-xl flex flex-col gap-10 animate-fade-in pb-20">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-light text-white tracking-tight">Settings</h1>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          <Button 
            onClick={saveSettings}
            disabled={!hasChanges || saving}
            className="bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Durations */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Durations (Minutes)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400">Focus</label>
            <input 
              type="number" 
              value={settings.focusDuration}
              onChange={(e) => updateLocalSettings({ focusDuration: Number(e.target.value) })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400">Short Break</label>
            <input 
              type="number" 
              value={settings.shortBreakDuration}
              onChange={(e) => updateLocalSettings({ shortBreakDuration: Number(e.target.value) })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400">Long Break</label>
            <input 
              type="number" 
              value={settings.longBreakDuration}
              onChange={(e) => updateLocalSettings({ longBreakDuration: Number(e.target.value) })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-center text-white focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Timer Style */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Visuals</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => updateLocalSettings({ timerStyle: 'NUMERIC' })}
            className={`flex-1 p-4 rounded-lg border transition-all ${settings.timerStyle === 'NUMERIC' ? 'border-white bg-white/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}
          >
            <span className="text-2xl font-light text-zinc-400">25:00</span>
            <p className="text-xs text-zinc-400 mt-2">Minimal Numeric</p>
          </button>
          <button 
            onClick={() => updateLocalSettings({ timerStyle: 'RING' })}
            className={`flex-1 p-4 rounded-lg border transition-all ${settings.timerStyle === 'RING' ? 'border-white bg-white/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}
          >
            <div className="w-8 h-8 rounded-full border-2 border-zinc-400 mx-auto mb-2 opacity-80" />
            <p className="text-xs text-zinc-400">Zen Ring</p>
          </button>
        </div>
      </section>

      {/* Backgrounds */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Atmosphere</h2>
        
        {/* Solid Colors */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-zinc-600 mb-1">Solid Colors</span>
          <div className="flex gap-3 flex-wrap">
            {SOLID_COLORS.map(color => (
              <button
                key={color}
                onClick={() => updateLocalSettings({ backgroundType: 'SOLID', backgroundValue: color })}
                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${settings.backgroundValue === color && settings.backgroundType === 'SOLID' ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Gradients */}
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-xs text-zinc-600 mb-1">Gradients</span>
          <div className="flex gap-3 flex-wrap">
            {GRADIENTS.map(gradient => (
              <button
                key={gradient.name}
                onClick={() => updateLocalSettings({ backgroundType: 'GRADIENT', backgroundValue: gradient.value })}
                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${settings.backgroundValue === gradient.value && settings.backgroundType === 'GRADIENT' ? 'border-white' : 'border-transparent'}`}
                style={{ background: gradient.value, backgroundSize: 'cover', backgroundPosition: 'center' }}
                title={gradient.name}
              />
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="mt-4">
          <span className="text-xs text-zinc-600 mb-2 block">Custom Image</span>
          <div className="flex gap-4 items-center">
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline" 
              size="sm" 
              className="gap-2"
              disabled={uploading}
            >
              <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            {(settings.backgroundType === 'IMAGE' || uploadedImageUrl) && (
              <Button 
                onClick={removeImage} 
                variant="ghost" 
                size="sm"
              >
                <X className="w-4 h-4" /> Remove
              </Button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>
          {uploadedImageUrl && !uploading && (
            <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Image uploaded successfully. Click "Save Settings" to apply.
            </div>
          )}
          {uploading && (
            <div className="mt-2 text-xs text-zinc-400">
              Uploading image... Please wait.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
