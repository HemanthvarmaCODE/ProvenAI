export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at?: string;
}

export interface Image {
  id: number;
  user_id: number;
  original_filename: string;
  file_path: string;
  watermarked_path: string;
  image_uuid: string;
  owner_name: string;
  ai_model: string;
  prompt_id: string;
  psnr: number;
  ssim: number;
  embedding_time: number;
  created_at: string;
}

export interface VerificationResult {
  is_authentic: boolean;
  is_tampered: boolean;
  confidence_score: number;
  nc_score: number;
  ber_score: number;
  provenance: {
    owner: string | null;
    model: string | null;
    prompt_id: string | null;
    image_uuid: string | null;
    timestamp: string | null;
  };
}

export interface AttackResult {
  attacked_path: string;
  attacked_filename?: string;
  metrics: {
    nc_after: number;
    ber_after: number;
    psnr_after: number;
    ssim_after: number;
  };
  survived: boolean;
}

export interface DashboardStats {
  total_images: number;
  total_verified?: number;
  tampered_images: number;
  authentic_images?: number;
  verified_images?: number;
  success_rate?: number;
  recent_uploads: Image[];
}

export interface MetricsData {
  stats_by_attack: Record<string, {
    count: number;
    avg_psnr: number;
    avg_ssim: number;
    avg_nc: number;
    avg_ber: number;
    survival_rate: number;
  }>;
}

export interface EmbedResponse {
  image_uuid: string;
  watermarked_path?: string;
  watermarked_filename?: string;
  watermarked_url?: string;
  image_id?: number;
  metadata?: any;
  psnr: number;
  ssim: number;
  embedding_time: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface EmbedForm {
  owner_name: string;
  ai_model: string;
  prompt_id: string;
}

export interface HistoryResponse {
  images: Image[];
  verifications: VerificationLog[];
}

export interface VerificationLog {
  id: number;
  image_id: number;
  is_authentic: boolean;
  is_tampered: boolean;
  confidence_score: number;
  nc_score: number;
  ber_score: number;
  extracted_owner: string | null;
  extracted_model: string | null;
  extracted_prompt_id: string | null;
  extracted_image_id: string | null;
  extracted_timestamp: string | null;
  verified_at: string;
}
