
export interface Person {
  id: string;
  name: string;
  contact: string;
  gender: 'Male' | 'Female' | 'Unknown';
  department: string;
  idType: string;
  idNumber: string;
  status: 'Active' | 'Inactive';
}

export interface Department {
  id: string;
  name: string;
  children?: Department[];
  isOpen?: boolean;
}

export interface FilterParams {
  name: string;
  idNumber: string;
  status: string;
}
