export interface Conference {
  id: number;
  title: string;
  category: string;
  description: string;
  date: Date;
  place: string;
  maxParticipants: number;
  nbParticipants: number;
}



export const CATEGORIES = ['Web', 'IA', 'Cloud', 'Sécurité', 'Mobile', 'DevOps'];
