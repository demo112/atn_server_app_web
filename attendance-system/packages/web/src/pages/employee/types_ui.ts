export interface Person {
  id: string;
  employeeNo: string;
  name: string;
  contact: string;
  gender: string;
  department: string;
  idType: string;
  idNumber: string;
  status: string;
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
  deptId?: number;
  employeeId?: number;
}

export enum ModalTab {
  BASIC_INFO = 'basic_info',
  FACE_PHOTO = 'face_photo',
  CARD_NUMBER = 'card_number'
}

export interface FormData {
  department: string;
  deptId?: number; // Added for backend integration
  enableCloudAccount: boolean;
  sendInviteSms: boolean;
  name: string;
  phone: string;
  employeeId: string; // Maps to employeeNo
  gender: 'male' | 'female' | 'unknown';
  doorPassword: string;
  validity: string;
  idType: string;
  idNumber: string;
  birthDate: string;
  hireDate?: string; // Added for backend integration
}
