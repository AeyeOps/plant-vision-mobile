import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { PhotoCapture } from './PhotoCapture';
import { db } from '../lib/db';
import { inspectionSchema, type InspectionFormData } from '../lib/validations';
import type { Inspection } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface InspectionFormProps {
  onInspectionCreated?: (inspection: Inspection) => void;
}

export const InspectionForm: React.FC<InspectionFormProps> = ({ onInspectionCreated }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  
  const form = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      tagId: '',
      tagName: '',
      readings: {
        temperature: undefined,
        pressure: undefined,
        flowRate: undefined,
        vibration: undefined
      },
      notes: '',
      photos: []
    }
  });

  const handlePhotoCapture = (photoUri: string) => {
    const newPhotos = [...photos, photoUri];
    setPhotos(newPhotos);
    form.setValue('photos', newPhotos);
  };

  const onSubmit = async (data: InspectionFormData) => {
    const newInspection: Inspection = {
      uuid: uuidv4(),
      tagId: data.tagId,
      tagName: data.tagName,
      timestamp: new Date(),
      readings: data.readings,
      notes: data.notes,
      photos: photos,
      status: 'draft',
      createdBy: 'current_user', // TODO: Replace with actual user
      updatedAt: new Date()
    };

    try {
      const id = await db.addInspection(newInspection);
      
      // Reset form
      form.reset();
      setPhotos([]);
      
      // Close dialog
      setOpen(false);

      // Call callback if provided
      onInspectionCreated?.({ ...newInspection, id });
    } catch (error) {
      console.error('Failed to save inspection', error);
      alert('Failed to save inspection');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="new-inspection">New Inspection</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Inspection</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tagId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Tag ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tagName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Tag Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="readings.temperature"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Temperature" 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="readings.pressure"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Pressure</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Pressure" 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="readings.flowRate"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Flow Rate</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Flow Rate" 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="readings.vibration"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Vibration</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Vibration" 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Inspection Notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <PhotoCapture onPhotoCapture={handlePhotoCapture} />
            
            <div className="flex gap-2 flex-wrap">
              {photos.map((photo, index) => (
                <img 
                  key={index} 
                  src={photo} 
                  alt={`Captured photo ${index + 1}`}
                  className="w-24 h-24 object-cover rounded" 
                />
              ))}
            </div>
            
            <Button type="submit">Save Inspection</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};