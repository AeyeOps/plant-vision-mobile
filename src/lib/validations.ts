import { z } from 'zod'

export const inspectionSchema = z.object({
  tagId: z.string().min(1, 'Tag is required'),
  tagName: z.string().min(1, 'Tag name is required'),
  readings: z.object({
    temperature: z.number().optional(),
    pressure: z.number().optional(),
    flowRate: z.number().optional(),
    vibration: z.number().optional()
  }),
  notes: z.string().max(500, 'Notes too long'),
  photos: z.array(z.string()).max(5, 'Maximum 5 photos')
})

export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  defaultView: z.enum(['dashboard', '3d', 'inspections']),
  temperatureUnit: z.enum(['celsius', 'fahrenheit']),
  pressureUnit: z.enum(['bar', 'psi', 'kpa']),
  flowUnit: z.enum(['m3h', 'gpm', 'lpm'])
})

export type InspectionFormData = z.infer<typeof inspectionSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>