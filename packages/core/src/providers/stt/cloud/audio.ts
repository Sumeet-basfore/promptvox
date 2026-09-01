export function toBlob(audio: Blob | ArrayBuffer): Blob {
  if (audio instanceof Blob) {
    return audio;
  }
  return new Blob([audio]);
}

export function audioFileName(blob: Blob): string {
  const type = blob.type;
  if (type.includes('wav')) return 'audio.wav';
  if (type.includes('mpeg') || type.includes('mp3')) return 'audio.mp3';
  if (type.includes('ogg')) return 'audio.ogg';
  if (type.includes('flac')) return 'audio.flac';
  if (type.includes('mp4') || type.includes('m4a')) return 'audio.m4a';
  return 'audio.webm';
}
