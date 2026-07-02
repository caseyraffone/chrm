function getSupportedMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
  ];
  if (typeof MediaRecorder === 'undefined') return '';
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

export async function requestRecordingPermission() {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia ||
    typeof MediaRecorder === 'undefined'
  ) {
    return { granted: false, status: 'unsupported' };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { granted: true, status: 'granted' };
  } catch (error) {
    return { granted: false, status: error?.name || 'denied' };
  }
}

export async function startRecording() {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia ||
    typeof MediaRecorder === 'undefined'
  ) {
    throw new Error('Browser recording is not supported in this browser.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = getSupportedMimeType();
  const chunks = [];
  const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const startedAt = Date.now();

  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data);
  };

  mediaRecorder.start();

  return {
    mediaRecorder,
    stream,
    chunks,
    mimeType: mediaRecorder.mimeType || mimeType || 'audio/webm',
    startedAt,
  };
}

export async function stopRecording(recording) {
  if (!recording?.mediaRecorder) return null;

  const { mediaRecorder, stream, chunks, mimeType, startedAt } = recording;

  if (mediaRecorder.state !== 'inactive') {
    await new Promise((resolve) => {
      mediaRecorder.onstop = resolve;
      mediaRecorder.stop();
    });
  }

  stream?.getTracks?.().forEach((track) => track.stop());

  const type = mimeType || 'audio/webm';
  const blob = new Blob(chunks, { type });
  const uri = URL.createObjectURL(blob);
  const extension = type.includes('mp4') ? 'mp4' : 'webm';

  return {
    uri,
    blob,
    mimeType: type,
    name: `recording.${extension}`,
    duration: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
  };
}

export async function cleanupRecording(recording) {
  if (!recording) return;
  try {
    if (recording.mediaRecorder?.state && recording.mediaRecorder.state !== 'inactive') {
      recording.mediaRecorder.stop();
    }
  } catch (_) {}
  recording.stream?.getTracks?.().forEach((track) => track.stop());
}
