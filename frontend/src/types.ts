export interface Note {
  id: number;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string; // e.g., "2024-10-23T10:15:00Z"
  updatedAt: string | null; // If null, it hasn't been edited
}
