/** Consulta como devolvida pela API (data yyyy-MM-dd; horário HH:mm; lembrete em minutos de antecedência). */
export interface Appointment {
  id: number;
  date: string;
  time: string | null;
  doctor: string;
  specialty: string;
  location: string | null;
  extraInfo: string | null;
  reminderMinutes: number | null;
  /** Momento em que o lembrete passa a valer (yyyy-MM-ddTHH:mm:ss); nulo sem horário ou sem lembrete. */
  reminderAt: string | null;
}

export type AppointmentRequest = Omit<Appointment, 'id' | 'reminderAt'>;
