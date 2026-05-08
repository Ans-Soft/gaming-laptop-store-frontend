import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import api from "./Api";
import urls from "./Urls";
import PromoCard from "../components/admin/promo/PromoCard";
import PromoCover from "../components/admin/promo/PromoCover";
import { removeWhiteBackground } from "../utils/imageBgRemoval";

/**
 * Orchestrates the whole "descargar imágenes" flow:
 *   1. Fetches the promo card payload from the backend.
 *   2. Mounts each <PromoCard /> off-screen, waits for images to load,
 *      captures it with html2canvas, then unmounts.
 *   3. Same for <PromoCover />.
 *   4. Bundles all PNGs in a ZIP via JSZip and triggers the download.
 *
 * Critical detail for html2canvas:
 *   - Image elements (product photos, logo, icons) MUST have
 *     crossOrigin="anonymous" set BEFORE the `src` is assigned, otherwise
 *     the captured canvas is "tainted" and exporting yields a blank PNG.
 *     React sets attributes in declaration order, so the JSX ordering
 *     in the components matters — keep `crossOrigin` before `src`.
 *   - Cloudflare R2 is already configured with permissive CORS for the
 *     admin origin in production.
 */

async function fetchPromoData() {
  const { data } = await api.get(urls.promoCardsData);

  // Pre-process every product photo to strip its white background. We do
  // this once up-front (not inside PromoCard) so html2canvas captures the
  // already-transparent dataURL on its first pass and we don't have to
  // race a useEffect against the off-screen render.
  await Promise.all(
    (data.unidades || []).map(async (u) => {
      if (u.imagen_principal_url) {
        u.imagen_principal_url = await removeWhiteBackground(u.imagen_principal_url);
      }
    })
  );

  // The cover template (portada.jpg) already contains a fixed product
  // mosaic baked in, so we no longer process portada.fotos_mosaico.

  return data;
}

/**
 * Wait for every <img> inside `node` to finish loading (or fail). We
 * resolve on `error` too because the components themselves handle missing
 * images gracefully — we just don't want html2canvas to fire while a
 * <img> is still pending.
 */
function waitForImages(node) {
  const imgs = Array.from(node.querySelectorAll("img"));
  if (imgs.length === 0) return Promise.resolve();
  return Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    })
  );
}

/**
 * Render `element` into an off-screen container, wait for images, capture
 * with html2canvas, return the resulting Blob. Always cleans up.
 */
/**
 * Wait until React has actually committed the rendered tree to the DOM.
 * `root.render()` is asynchronous in React 18+, so two requestAnimationFrames
 * are usually enough — but not always. If we call html2canvas before the
 * root container has any children, it throws "Invalid element provided as
 * first argument". Poll for `host.firstElementChild` and bail after a
 * generous timeout instead of racing the scheduler.
 */
function waitForReactCommit(host, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const check = () => {
      if (host.firstElementChild) {
        resolve(host.firstElementChild);
        return;
      }
      if (performance.now() - start > timeoutMs) {
        reject(new Error("React did not commit the promo card within timeout"));
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

async function renderToBlob(element) {
  const host = document.createElement("div");
  host.style.cssText = `
    position: fixed;
    left: -20000px;
    top: 0;
    width: 2160px;
    height: 2160px;
    pointer-events: none;
    opacity: 1;
    z-index: -1;
  `;
  document.body.appendChild(host);

  const root = createRoot(host);
  try {
    root.render(element);
    const target = await waitForReactCommit(host);

    await waitForImages(host);

    if (!target || !target.isConnected) {
      throw new Error("Promo card root element is not connected to the DOM");
    }

    const canvas = await html2canvas(target, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: 2160,
      height: 2160,
      windowWidth: 2160,
      windowHeight: 2160,
    });

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    return blob;
  } finally {
    root.unmount();
    host.remove();
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Public entry point. Fires `onProgress({step, total, label})` after each
 * successfully captured image so the UI can show a counter.
 */
export async function descargarPromoZip({ onProgress } = {}) {
  const data = await fetchPromoData();
  const unidades = data.unidades || [];
  const total = unidades.length + 1; // +1 for the cover
  let step = 0;

  const zip = new JSZip();

  // 1. Cover
  const coverBlob = await renderToBlob(<PromoCover portada={data.portada} />);
  if (coverBlob) zip.file("00-portada.png", coverBlob);
  step++;
  if (onProgress) onProgress({ step, total, label: "Portada" });

  // 2. Each unit. Numbered with leading zeros so file order matches the
  // queryset order when the user opens the ZIP.
  const pad = String(unidades.length).length;
  for (let i = 0; i < unidades.length; i++) {
    const u = unidades[i];
    const blob = await renderToBlob(<PromoCard unidad={u} mes={data.mes} />);
    if (blob) {
      const idx = String(i + 1).padStart(pad, "0");
      zip.file(`${idx}.png`, blob);
    }
    step++;
    if (onProgress) onProgress({ step, total, label: u.producto_nombre });
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const dateLabel = new Date().toISOString().slice(0, 10);
  downloadBlob(zipBlob, `patecnologicos-promo-${dateLabel}.zip`);

  return { total: unidades.length };
}
