import { useState, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

export const useNativeFeatures = () => {
  const [isNative, setIsNative] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<any>(null);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    
    if (Capacitor.isNativePlatform()) {
      initializeNativeFeatures();
    }
  }, []);

  const initializeNativeFeatures = async () => {
    try {
      // Set status bar style
      await StatusBar.setStyle({ style: Style.Light });
      
      // Get network status
      const status = await Network.getStatus();
      setNetworkStatus(status);
      
      // Listen for network changes
      Network.addListener('networkStatusChange', (status) => {
        setNetworkStatus(status);
      });

      // Request notification permissions
      await LocalNotifications.requestPermissions();
      
    } catch (error) {
      console.error('Error initializing native features:', error);
    }
  };

  const takePicture = async (source: CameraSource = CameraSource.Camera) => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source
      });
      
      return image.dataUrl;
    } catch (error) {
      console.error('Error taking picture:', error);
      throw error;
    }
  };

  const saveFile = async (data: string, fileName: string, directory: Directory = Directory.Documents) => {
    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: directory,
        encoding: Encoding.UTF8
      });
      
      return result.uri;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  };

  const readFile = async (fileName: string, directory: Directory = Directory.Documents) => {
    try {
      const result = await Filesystem.readFile({
        path: fileName,
        directory: directory,
        encoding: Encoding.UTF8
      });
      
      return result.data;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  };

  const scheduleNotification = async (title: string, body: string, scheduleAt: Date) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: Date.now(),
            schedule: { at: scheduleAt },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  };

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      if (isNative) {
        await Haptics.impact({ style });
      }
    } catch (error) {
      console.error('Error triggering haptic:', error);
    }
  };

  const hideKeyboard = async () => {
    try {
      if (isNative) {
        await Keyboard.hide();
      }
    } catch (error) {
      console.error('Error hiding keyboard:', error);
    }
  };

  return {
    isNative,
    networkStatus,
    takePicture,
    saveFile,
    readFile,
    scheduleNotification,
    triggerHaptic,
    hideKeyboard
  };
};