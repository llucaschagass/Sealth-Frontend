/** Consulta como devolvida pela API (data no formato yyyy-MM-dd). */
export interface Appointment {
  id: number;
  date: string;
  doctor: string;
  specialty: string;
  location: string | null;
  extraInfo: string | null;
}

export type AppointmentRequest = Omit<Appointment, 'id'>;
