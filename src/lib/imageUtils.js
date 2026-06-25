/**
 * src/lib/imageUtils.js
 * ─────────────────────────────────────────────
 * Image optimisation helpers for Vishnu Mobile Shop
 *
 * getOptimizedImageUrl — appends Cloudinary transformation params to URLs
 *   so the device downloads a small, web-friendly image instead of the
 *   original full-resolution upload.
 *
 * CachedImage — drop-in <Image> replacement with:
 *   • skeleton placeholder while loading
 *   • graceful fallback on error
 * ─────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { Image, View, ActivityIndicator, StyleSheet } from 'react-native';

// ─── Cloudinary URL transformer ───────────────────────────────────────────────

/**
 * Injects Cloudinary transformation params into any Cloudinary URL.
 *
 * Example output:
 *   https://res.cloudinary.com/dgktgo729/image/upload/w_400,h_400,c_limit,q_auto,f_auto/vishnu_mobile_shop/abc123.jpg
 *
 * @param {string|null} url - The raw Cloudinary URL stored in the DB
 * @param {object} opts
 * @param {number} opts.width   - Max width  (default 400)
 * @param {number} opts.height  - Max height (default 400)
 * @param {string} opts.quality - Cloudinary quality token (default 'auto:low')
 * @returns {string|null} Optimized URL, or original if not a Cloudinary URL
 */
export function getOptimizedImageUrl(url, { width = 400, height = 400, quality = 'auto:low' } = {}) {
  if (!url || typeof url !== 'string') return null;

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  // Build transformation string: resize, auto quality, auto format (WebP on Android)
  const transforms = `w_${width},h_${height},c_limit,q_${quality},f_auto`;

  // Insert transforms after "/upload/" — works for both versioned and non-versioned URLs
  return url.replace('/upload/', `/upload/${transforms}/`);
}

// ─── CachedImage component ────────────────────────────────────────────────────

/**
 * Drop-in replacement for <Image source={{ uri }} />.
 * Shows a skeleton shimmer while loading and a fallback view on error.
 *
 * Usage:
 *   <CachedImage uri={product.image} style={styles.productImage} resizeMode="cover" />
 *
 * @param {string|null}  uri         - Raw image URL (will be auto-optimised)
 * @param {object}       style       - Style for the image/container
 * @param {string}       resizeMode  - 'cover' | 'contain' | 'stretch' (default 'cover')
 * @param {number}       thumbWidth  - Cloudinary resize width (default 400)
 * @param {number}       thumbHeight - Cloudinary resize height (default 400)
 * @param {ReactNode}    fallback    - Rendered when there's no image / on error
 */
export function CachedImage({
  uri,
  style,
  resizeMode = 'cover',
  thumbWidth = 400,
  thumbHeight = 400,
  fallback = null,
}) {
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  const optimizedUri = getOptimizedImageUrl(uri, { width: thumbWidth, height: thumbHeight });

  if (!optimizedUri || errored) {
    // No URL or load failed — render fallback (caller supplies it)
    return fallback ? (
      <View style={[ci.placeholder, style]}>{fallback}</View>
    ) : (
      <View style={[ci.placeholder, style]} />
    );
  }

  return (
    <View style={[style, { overflow: 'hidden' }]}>
      {/* Skeleton shimmer sits behind the image */}
      {loading && <View style={[StyleSheet.absoluteFill, ci.skeleton]} />}

      <Image
        source={{ uri: optimizedUri }}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setErrored(true); }}
      />
    </View>
  );
}

const ci = StyleSheet.create({
  placeholder: {
    backgroundColor: '#E8ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeleton: {
    backgroundColor: '#E8ECFF',
    // Simple static skeleton — no animation dep needed
  },
});
