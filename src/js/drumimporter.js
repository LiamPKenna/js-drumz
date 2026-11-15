// Vite resolves each sample to its served URL at build time.
const sampleUrls = import.meta.glob('../mp3/sound*.mp3', { eager: true, import: 'default' });

const sampleNumber = (path) => Number(path.match(/sound(\d+)\.mp3$/)[1]);

// Samples are numbered 1-50; kit n uses sounds (n - 1) * 10 + 1 through n * 10.
const samples = Object.entries(sampleUrls)
  .sort(([a], [b]) => sampleNumber(a) - sampleNumber(b))
  .map(([, url]) => url);

const KIT_SIZE = 10;

const getKit = (n) => samples.slice((n - 1) * KIT_SIZE, n * KIT_SIZE);

export default getKit;
