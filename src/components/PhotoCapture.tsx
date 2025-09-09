import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Camera } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoCapture: (photoUri: string) => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoDataUrl);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    startCamera();
  }, [startCamera]);

  const usePhoto = useCallback(() => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto);
      setCapturedPhoto(null);
    }
  }, [capturedPhoto, onPhotoCapture]);

  const cancelCapture = useCallback(() => {
    stopCamera();
    setCapturedPhoto(null);
    setError(null);
  }, [stopCamera]);

  if (error) {
    return (
      <div className="border border-red-300 rounded p-4 bg-red-50">
        <p className="text-red-600 mb-2">{error}</p>
        <Button onClick={() => setError(null)} variant="outline">
          Dismiss
        </Button>
      </div>
    );
  }

  if (capturedPhoto) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <img 
            src={capturedPhoto} 
            alt="Captured photo" 
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={retakePhoto} variant="outline">
            Retake
          </Button>
          <Button onClick={usePhoto}>
            Use Photo
          </Button>
        </div>
      </div>
    );
  }

  if (isCapturing) {
    return (
      <div className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="w-full"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="flex gap-2">
          <Button onClick={cancelCapture} variant="outline">
            Cancel
          </Button>
          <Button onClick={capturePhoto}>
            <Camera className="mr-2 h-4 w-4" />
            Capture Photo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button onClick={startCamera} variant="outline">
        <Camera className="mr-2 h-4 w-4" />
        Take Photo
      </Button>
    </div>
  );
};