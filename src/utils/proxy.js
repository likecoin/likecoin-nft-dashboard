import { API_PUBLIC } from '../config';
import axios from 'axios';
const classPayloads = new Map();

export function getClass(classId) {
  if (classPayloads.has(classId)) {
    return classPayloads.get(classId);
  }
  classPayloads.set(classId, axios.get(`${API_PUBLIC}/likernft/purchase`, {
    params: { class_id: classId, }
  })
  .then((res) => {
    classPayloads.delete(classId);
    return res;
  }))
  return classPayloads.get(classId);
}

const metadataPayloads = new Map();

export function getMetadata(classId) {
  if (metadataPayloads.has(classId)) {
    return metadataPayloads.get(classId);
  }
  metadataPayloads.set(classId, axios.get(`${API_PUBLIC}/likernft/metadata`, {
    params: { class_id: classId, }
  })
  .then((res) => {
    metadataPayloads.delete(classId);
    return res;
  }))
  return metadataPayloads.get(classId);
}

