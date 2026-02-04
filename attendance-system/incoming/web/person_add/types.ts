
export enum ModalTab {
  BASIC_INFO = 'basic_info',
  FACE_PHOTO = 'face_photo',
  CARD_NUMBER = 'card_number'
}

export interface FormData {
  department: string;
  enableCloudAccount: boolean;
  sendInviteSms: boolean;
  name: string;
  phone: string;
  employeeId: string;
  gender: 'male' | 'female' | 'unknown';
  doorPassword: string;
  validity: string;
  idType: string;
  idNumber: string;
  birthDate: string;
}
