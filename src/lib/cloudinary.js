/**
 * src/lib/cloudinary.js
 * ─────────────────────────────────────────────
 * Cloudinary image upload helper for Vishnu Mobile Shop
 * Uses unsigned upload preset (no backend signature needed)
 * ─────────────────────────────────────────────
 */

const CLOUD_NAME   = 'dgktgo729';
const UPLOAD_PRESET = 'vishnu_mobile_products';
const UPLOAD_URL   = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

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
  formData.append('folder', 'vishnu_mobile_shop');

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
