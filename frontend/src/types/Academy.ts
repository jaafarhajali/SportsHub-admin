
export interface Academy {
  _id: string;
  ownerId: string;
  name: string;
  description?: string;
  location: string;
  photos: string[];
  phoneNumber: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademyFormData {
  name: string;
  description?: string;
  location: string;
  photos: File[];
  phoneNumber: string;
  email: string;
}
