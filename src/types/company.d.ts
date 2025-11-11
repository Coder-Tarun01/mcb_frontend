export interface Company {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  logo?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyCreate {
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
}

export interface CompanyUpdate {
  name?: string;
  description?: string;
  website?: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
}
