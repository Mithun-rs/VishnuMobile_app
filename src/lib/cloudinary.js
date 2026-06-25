/**
 * src/lib/cloudinary.js
 * ─────────────────────────────────────────────
 * Cloudinary image upload helper for Vishnu Mobile Shop
 * Uses unsigned upload preset (no backend signature needed)
 * Credentials loaded from .env via react-native-config
 * ─────────────────────────────────────────────
 */

// See `src/lib/supabase.js` for why this is defensive.
let Config = null;
let configLoadError = null;
try {
  // eslint-disable-next-line global-require
  const mod = require('react-native-config');
  Config = mod?.default ?? mod;
} catch (e) {
  configLoadError = e;
}

// ─── 🔑 CLOUDINARY CREDENTIALS (loaded from .env) ─────────────────────────────
const CLOUD_NAME    = Config?.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = Config?.CLOUDINARY_UPLOAD_PRESET;
const FOLDER        = Config?.CLOUDINARY_FOLDER;
const UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Warn in development if .env is missing or incomplete
if (__DEV__ && (configLoadError || !CLOUD_NAME || !UPLOAD_PRESET)) {
  console.error(
    (configLoadError
      ? '❌ Failed to load react-native-config (native module missing).\n' +
        'Do a clean rebuild:\n' +
        '  cd android && gradlew clean && cd ..\n' +
        '  npx react-native run-android\n\n'
      : '❌ Missing Cloudinary credentials in .env!\n') +
    'Make sure your .env file has:\n' +
    '  CLOUDINARY_CLOUD_NAME=your-cloud-name\n' +
    '  CLOUDINARY_UPLOAD_PRESET=your-upload-preset\n' +
    '  CLOUDINARY_FOLDER=your-folder-name\n' +
    'Then rebuild the app: npx react-native run-android'
  );
}

/**
 * Upload an image to Cloudinary
 * @param {string} uri - local image URI from react-native-image-picker
 * @param {function} onProgress - optional callback(percent: number)
 * @returns {Promise<string>} secure_url of the uploaded image
 */
export async function uploadToCloudinary(uri, onProgress) {
  const formData = new FormData();

  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: `product_${Date.now()}.jpg`,
  });
  formData.append('upload_preset', UPLOAD_PRESET);
  if (FOLDER) formData.append('folder', FOLDER);

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
      // ⚠️ Do NOT set Content-Type manually — fetch must auto-generate
      // the multipart boundary, otherwise Cloudinary rejects the upload.
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Upload failed');
    }

    const data = await response.json();
    console.log('☁️ Cloudinary upload success:', data.secure_url);
    return data.secure_url;

  } catch (error) {
    console.error('❌ Cloudinary upload error:', error.message);
    throw error;
  }
}
