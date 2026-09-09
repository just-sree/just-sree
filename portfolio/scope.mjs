import { createHash } from 'node:crypto';

// Owner-excluded topic fingerprints. No project details are stored here.
const excluded = new Set([
  '9f5f0b1886b755bd310ae61dc90f12498af8e72b4678ac69d938f61fa957d2c4',
  '6f851dc660025ec06e880e895c7210798b0ab9df426c8de40d378291775bc317',
  '72455b7bc0af925a980f7a8b160f8f972db9ebf0e03e24eeb3e5c6e4927e23bc',
  '903f8833ab28c4fa6a58cd3aa7486d8f96090b9631530f0713883d5320ea16ce',
]);
export function containsExcludedTopic(text) {
  const words = String(text).normalize('NFKC').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    let phrase = '';
    for (let j = i; j < Math.min(words.length, i + 3); j++) {
      phrase += words[j];
      if (excluded.has(createHash('sha256').update(phrase).digest('hex'))) return true;
    }
  }
  return false;
}
