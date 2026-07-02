import { Audio } from 'expo-av';

export async function requestRecordingPermission() {
  const { status } = await Audio.requestPermissionsAsync();
  return { granted: status === 'granted', status };
}

export async function startRecording() {
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  return recording;
}

export async function stopRecording(recording) {
  if (!recording) return null;
  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  return {
    uri: recording.getURI(),
    mimeType: 'audio/m4a',
    name: 'recording.m4a',
  };
}

export async function cleanupRecording(recording) {
  if (!recording) return;
  try {
    await recording.stopAndUnloadAsync();
  } catch (_) {}
  try {
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  } catch (_) {}
}
