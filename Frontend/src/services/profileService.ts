import { API_BASE_URL, apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';

// Used by: MyProfileScreen (Profile tab)

// GET /api/profile/Get  -> the logged-in officer (officer table + linked citizen row)
export interface OfficerProfile {
  officer_id: number;
  username: string;
  service_number: string;
  employee_id: string;
  officer_name: string | null;
  officer_phone: string | null;
  unit_name: string | null; // office location (district / division / service area)
  department: string | null;
  role_code: string;
  role_name: string;
  last_login_at: string | null;
  citizen_id: number | null;
  nic: string | null;
  date_of_birth: string | null; // YYYY-MM-DD
  gender: string | null;
  email: string | null;
  address: string | null;
  has_photo: boolean;
}
export const getMyProfile = () => apiClient.get<OfficerProfile>('/api/profile/Get');

// POST /api/profile/UpdateContact  (pencil icon). NIC cannot be changed.
export interface ProfileEdit {
  officer_name: string;
  officer_phone: string;
  email: string;
  address: string;
  gender?: string;
  date_of_birth?: string; // YYYY-MM-DD
}
export const updateMyProfile = (p: ProfileEdit) =>
  apiClient.post<{ officer_id: number }>('/api/profile/UpdateContact', p);

// POST /api/profile/PhotoUpload  multipart, field "file"  (JPG / PNG / WEBP, max 2 MB)
export const uploadProfilePhoto = (file: { uri: string; name: string; type: string }) =>
  apiClient.upload<{ photo_id: number; file_name: string; url: string }>('/api/profile/PhotoUpload', file);

// GET /api/profile/PhotoFile -> the image itself (needs the token, so the header is added here)
export const getProfilePhotoSource = async (): Promise<{ uri: string; headers: Record<string, string> }> => {
  const token = await tokenStorage.get();
  return {
    uri: `${API_BASE_URL}/api/profile/PhotoFile?t=${Date.now()}`, // t = skip the image cache after a new upload
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

// POST /api/profile/PhotoDelete
export const deleteProfilePhoto = () => apiClient.post<{ message: string }>('/api/profile/PhotoDelete');