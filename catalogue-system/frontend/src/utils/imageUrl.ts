/// <reference types="vite/client" />

export const getImageUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  const s3Url = import.meta.env.VITE_S3_BUCKET_URL;
  if (s3Url && (import.meta.env.PROD || import.meta.env.MODE === 'staging')) {
    const baseUrl = s3Url.endsWith('/') ? s3Url.slice(0, -1) : s3Url;
    const pathUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${pathUrl}`;
  }
  
  return url;
};
