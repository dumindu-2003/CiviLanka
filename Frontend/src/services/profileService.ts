import { API_BASE_URL, apiClient } from './apiClient';
import { tokenStorage } from './tokenStorage';

// Used by: MyProfileScreen (Profile tab)

// ── MY PROFILE ─────────────────────────────────────────────────────────────
// GET /api/profile/Get
// returns : name / phone / unit / role of the logged-in officer.
// NOTE: the DB has NO nic / dateOfBirth / gender / email / address / employeeId for officers,
//       so those rows of MyProfileScreen stay "-" until the backend adds them.
export interface OfficerProfile {
  officer_id: number;
  username: string;
  service_number: string;
  officer_name: string | null;
  officer_phone: string | null;
  unit_name: string | null; // district / division / service area / department
  role_code: string;
  role_name: string;
  last_login_at: string | null;
}
export const getMyProfile = () => apiClient.get<OfficerProfile>('/api/profile/Get');

// ── EDIT CONTACT (pencil icon) ─────────────────────────────────────────────
// POST /api/profile/UpdateContact
// body : { officer_name, officer_phone }
export const updateMyContact = (officerName: string, officerPhone: string) =>
  apiClient.post<{ officer_id: number }>('/api/profile/UpdateContact', {
    officer_name: officerName,
    officer_phone: officerPhone,
  });

// ── PROFILE PHOTO ("CHANGE PHOTO") ─────────────────────────────────────────
// POST /api/profile/PhotoUpload      multipart, field "file", JPG / PNG / WEBP, max 2 MB
// file = { uri, name, type } straight from expo-image-picker
export const uploadProfilePhoto = (file: { uri: string; name: string; type: string }) =>
  apiClient.upload<{ photo_id: number; file_name: string; url: string }>('/api/profile/PhotoUpload', file);

// GET /api/profile/PhotoGet          -> details of the current photo (null = no photo)
export const getProfilePhotoInfo = () =>
  apiClient.get<{ photo_id: number; original_file_name: string; content_type: string; file_size_bytes: number } | null>(
    '/api/profile/PhotoGet',
  );

// GET /api/profile/PhotoFile         -> the image itself (needs the token, so the header is added here)
// usage : const source = await getProfilePhotoSource();   <Image source={source} />
export const getProfilePhotoSource = async () => {
  const token = await tokenStorage.get();
  return {
    uri: `${API_BASE_URL}/api/profile/PhotoFile?t=${Date.now()}`, // t = skip the image cache after a new upload
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

// POST /api/profile/PhotoDelete
export const deleteProfilePhoto = () => apiClient.post<{ message: string }>('/api/profile/PhotoDelete');