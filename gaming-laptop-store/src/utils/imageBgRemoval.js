/**
 * Replaces near-white pixels with transparency, returning a data URL.
 *
 * The trick: load the image into a hidden canvas at native resolution, walk
 * the ImageData pixel buffer, and zero the alpha channel of any pixel whose
 * minimum RGB channel is above `threshold` (fully transparent). Pixels in
 * `[threshold - feather, threshold)` get a smooth alpha falloff so edges
 * don't look jagged.
 *
 * Why min-channel and not luminance? Pure-white studio backgrounds always
 * have all three channels close to 255, so min(r,g,b) is the most robust
 * "is this pixel white?" signal. A bright yellow pixel has high R,G but
 * low B, so its min stays well under 230 and is preserved.
 *
 * Falls back to the original URL on CORS taint or load error so callers
 * never have to special-case failure paths.
 */
export async function removeWhiteBackground(imageUrl, { threshold = 240, feather = 30 } = {}) {
  if (!imageUrl) return imageUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const lower = threshold - feather;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const minChannel = r < g ? (r < b ? r : b) : (g < b ? g : b);

          if (minChannel >= threshold) {
            data[i + 3] = 0;
          } else if (minChannel >= lower) {
            const ratio = (minChannel - lower) / feather;
            data[i + 3] = Math.round(data[i + 3] * (1 - ratio));
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        // Tainted canvas (CORS) or other failure — keep original.
        resolve(imageUrl);
      }
    };

    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}
