import api from './api';

export async function uploadImage(file: File, folder = 'ecom'): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);
  if (folder) fd.append('folder', folder);
  const res = await api.post('/upload/single', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data?.url;
}

export async function uploadImages(files: File[], folder = 'ecom', limit = 10): Promise<string[]> {
  const fd = new FormData();
  files.slice(0, limit).forEach(f => fd.append('images', f));
  fd.append('folder', folder);
  const res = await api.post('/upload/multiple', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data?.map((r: any) => r.url) || [];
}

export async function deleteImage(publicId: string): Promise<void> {
  await api.post('/upload/delete', { publicId });
}