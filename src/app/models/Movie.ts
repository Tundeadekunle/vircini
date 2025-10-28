export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  recommendedBy: string[]; // user ids
}
