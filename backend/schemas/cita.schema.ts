import { z } from 'zod';

export const createCitaSchema = z.object({
  professionalId: z.number({ required_error: 'El profesional es requerido' }),
  date: z.string().datetime({ message: 'Fecha inválida (ISO 8601 requerido)' }),
  type: z.string().min(1).optional().default('Consulta General'),
  mode: z.enum(['Presencial', 'Virtual']).optional().default('Presencial'),
  location: z.string().optional(),
  notes: z.string().optional(),
  studentPhone: z.string().regex(/^\+57\s?\d{3}\s?\d{3}\s?\d{4}$|^\+57\d{10}$/, {
    message: 'Número de teléfono inválido. Formato requerido: +57XXXXXXXXXX',
  }),
});

export const updateCitaSchema = z.object({
  status: z.enum(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA']).optional(),
  date: z.string().datetime().optional(),
  type: z.string().optional(),
  mode: z.enum(['Presencial', 'Virtual']).optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  faculty: z.string().optional(),
  semester: z.number().int().min(1).max(12).optional(),
});

export type CreateCitaInput = z.infer<typeof createCitaSchema>;
export type UpdateCitaInput = z.infer<typeof updateCitaSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
