import axios from 'axios';
import qs from 'qs';
import { API_PUBLIC_URL, INDEXER_URL } from '../config';

const classPayloads = new Map();

export const indexerApi = axios.create({
  baseURL: INDEXER_URL,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
});

export function getClass(classId) {
  if (classPayloads.has(classId)) {
    return classPayloads.get(classId);
  }
  classPayloads.set(classId, axios.get(`${API_PUBLIC_URL}/likernft/purchase`, {
    params: { class_id: classId },
  }));
  return classPayloads.get(classId);
}

const metadataPayloads = new Map();

export function getMetadata(classId) {
  if (metadataPayloads.has(classId)) {
    return metadataPayloads.get(classId);
  }
  metadataPayloads.set(classId, axios.get(`${API_PUBLIC_URL}/likernft/metadata`, {
    params: { class_id: classId },
  }));
  return metadataPayloads.get(classId);
}
