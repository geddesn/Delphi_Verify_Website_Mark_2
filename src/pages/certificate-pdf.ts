import { PDFDocument, StandardFonts, rgb as pdfRgb, type PDFPage, type PDFFont, type PDFImage } from "pdf-lib";
import QRCode from "qrcode";
import type { Report } from "./Certificate";
import { displayAddress, googleMapsLocationUrl } from "./certificate-location";

type Media = Report["media"][number];
const W = 595;
const H = 842;
const color = (() => {
  const element = document.createElement("span");
  element.dataset.theme = "light";
  document.body.append(element);
  const style = getComputedStyle(element);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  const tokens = new Map<string, ReturnType<typeof pdfRgb>>();
  const read = (token: string) => {
    if (!tokens.has(token)) {
      context.fillStyle = style.getPropertyValue(token).trim();
      context.fillRect(0, 0, 1, 1);
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
      tokens.set(token, pdfRgb(r / 255, g / 255, b / 255));
    }
    return tokens.get(token)!;
  };
  return { read, remove: () => element.remove() };
})();
const blue = color.read("--ink-accent");
const ink = color.read("--ink");
const muted = color.read("--ink-muted");
const line = color.read("--line");
const panel = color.read("--surface-sunken");
const white = color.read("--ink-inverse");
const verified = color.read("--verified");
const verifiedTint = color.read("--verified-tint");
color.remove();

function rect(page: PDFPage, x: number, top: number, width: number, height: number, color: ReturnType<typeof pdfRgb>, border?: ReturnType<typeof pdfRgb>) {
  page.drawRectangle({ x, y: H - top - height, width, height, color, borderColor: border, borderWidth: border ? 0.7 : 0 });
}

function rule(page: PDFPage, x: number, top: number, width: number) {
  rect(page, x, top, width, 0.7, line);
}

function printable(value: string, font: PDFFont) {
  return [...value].map((char) => {
    try { font.encodeText(char); return char; } catch { return "?"; }
  }).join("");
}

function write(page: PDFPage, font: PDFFont, value: string, x: number, top: number, size: number, color = ink, maxWidth = W - x - 33) {
  let text = printable(value, font);
  if (font.widthOfTextAtSize(text, size) > maxWidth) {
    while (text && font.widthOfTextAtSize(`${text}…`, size) > maxWidth) text = text.slice(0, -1);
    text = `${text}…`;
  }
  page.drawText(text, { x, y: H - top - size, size, font, color });
}

async function canvasJpeg(canvas: HTMLCanvasElement) {
  return new Promise<Uint8Array>((resolve, reject) => canvas.toBlob(async (result) => {
    if (!result) { reject(new Error("Image conversion failed")); return; }
    resolve(new Uint8Array(await result.arrayBuffer()));
  }, "image/jpeg", 0.85));
}

async function jpeg(url: string, iconOnly = false) {
  const source = new URL(url, window.location.href);
  const local = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  const requestUrl = local && source.hostname === "firebasestorage.googleapis.com"
    ? `/__certificate-media${source.pathname}${source.search}`
    : source.href;
  const response = await fetch(requestUrl);
  if (!response.ok) throw new Error(`Image request failed: ${response.status}`);
  const blobUrl = URL.createObjectURL(await response.blob());
  try {
    const image = new Image();
    image.src = blobUrl;
    await image.decode();
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = iconOnly ? 320 : Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = iconOnly ? 320 : Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (iconOnly) context.drawImage(image, 0, 0, 80, 80, 0, 0, canvas.width, canvas.height);
    else context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await canvasJpeg(canvas);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

function label(page: PDFPage, bold: PDFFont, value: string, x: number, top: number, width = W - x - 34) {
  write(page, bold, value, x, top, 8, blue, width);
}

function lines(value: string, font: PDFFont, size: number, width: number, limit: number) {
  const result: string[] = [];
  for (const word of printable(value, font).split(/\s+/)) {
    const next = result.length ? `${result[result.length - 1]} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && result.length && result.length < limit) result.push(word);
    else if (result.length) result[result.length - 1] = next;
    else result.push(word);
  }
  return result;
}

function wrap(value: string, font: PDFFont, size: number, width: number) {
  const result: string[] = [];
  let line = "";
  for (const word of printable(value, font).split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width) {
      line = next;
      continue;
    }
    if (line) result.push(line);
    line = "";
    for (const char of word) {
      if (line && font.widthOfTextAtSize(line + char, size) > width) {
        result.push(line);
        line = "";
      }
      line += char;
    }
  }
  if (line) result.push(line);
  return result;
}

function header(page: PDFPage, logo: PDFImage, font: PDFFont) {
  page.drawImage(logo, { x: 34, y: H - 64, width: 132, height: 37 });
  const tagline = "Trusted evidence for the physical world.";
  write(page, font, tagline, 561 - font.widthOfTextAtSize(tagline, 9), 41, 9, muted);
}

function footer(page: PDFPage, font: PDFFont, bold: PDFFont, code: string, number: number, total: number) {
  rule(page, 34, 787, 527);
  write(page, font, "© DELPHI VERIFY 2026", 34, 797, 7, muted);
  write(page, font, `CERTIFICATE ${code}`, 34, 809, 7, muted);
  write(page, font, `Page ${number} of ${total}`, 500, 797, 7, muted, 61);
  write(page, bold, "delphiverify.com", 481, 809, 7, blue, 80);
}

function card(page: PDFPage, image: PDFImage | null, item: Media, position: number, originalCount: number, top: number, x: number, font: PDFFont, height: number) {
  const width = 255;
  const imageHeight = height - 24;
  rect(page, x, top, width, height, white, line);
  rect(page, x + 5, top + 5, width - 10, imageHeight - 5, panel);
  if (image) {
    const fit = Math.min((width - 12) / image.width, (imageHeight - 12) / image.height);
    const imageWidth = image.width * fit;
    const imageFitHeight = image.height * fit;
    page.drawImage(image, { x: x + (width - imageWidth) / 2, y: H - top - (imageHeight + imageFitHeight) / 2, width: imageWidth, height: imageFitHeight });
  } else {
    write(page, font, "VIDEO PREVIEW UNAVAILABLE", x + 26, top + imageHeight / 2, 8, muted, width - 52);
  }
  write(page, font, `${String(position + 1).padStart(2, "0")} / ${item.type === "video" ? "VIDEO CAPTURE" : position < originalCount ? "ORIGINAL CAPTURE" : "ILLUSTRATIVE IMAGE"}`, x + 13, top + imageHeight + 6, 7, muted, width - 20);
}

function location(page: PDFPage, report: Report, qrImage: PDFImage, font: PDFFont, bold: PDFFont, top: number) {
  rect(page, 34, top, 527, 127, white, line);
  label(page, bold, "CERTIFICATE LOCATION", 47, top + 11);
  const gps = report.gps;
  const place = displayAddress(report.address, gps.accuracy) || "Address unavailable";
  write(page, font, "DISCLOSED ADDRESS", 47, top + 40, 7, muted, 174);
  lines(place, bold, 11, 174, 2).forEach((part, index) => write(page, bold, part, 47, top + 53 + index * 13, 11, ink, 174));
  rect(page, 236, top + 35, 0.7, 78, line);
  write(page, font, "LOCATION ACCURACY", 253, top + 40, 7, muted);
  write(page, bold, `± ${gps.accuracy >= 1000 ? `${(gps.accuracy / 1000).toFixed(1)} km` : `${Math.round(gps.accuracy)} m`}`, 253, top + 53, 11);
  write(page, font, "COORDINATES", 253, top + 80, 7, muted);
  write(page, bold, `${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}`, 253, top + 93, 10, ink, 185);
  rect(page, 456, top + 35, 0.7, 78, line);
  page.drawImage(qrImage, { x: 476, y: H - top - 100, width: 64, height: 64 });
  write(page, bold, "GOOGLE MAPS", 477, top + 105, 6, blue, 64);
}

export async function createCertificatePdf(report: Report, media: Media[]) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await pdf.embedJpg(await jpeg("/assets/logo.svg"));
  const watermark = await pdf.embedJpg(await jpeg("/assets/logo.svg", true));
  const images = await Promise.all(media.map(async (item) => {
    const url = item.type === "video" ? item.thumbnailDownloadUrl : item.downloadUrl;
    if (!url) return null;
    return pdf.embedJpg(await jpeg(url));
  }));
  const code = `${report.publicCode.slice(0, 4)}-${report.publicCode.slice(4)}`;
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(report.capturedAt));
  const verifyUrl = `delphiverify.com/v/${report.publicCode}`;
  const verifyQrData = await QRCode.toDataURL(`https://${verifyUrl}`, { margin: 1, width: 256, errorCorrectionLevel: "H" });
  const locationQrData = await QRCode.toDataURL(googleMapsLocationUrl(report.gps), { margin: 1, width: 256 });
  const embedQr = (data: string) => pdf.embedPng(Uint8Array.from(atob(data.split(",")[1]), (char) => char.charCodeAt(0)));
  const [verifyQr, locationQr] = await Promise.all([embedQr(verifyQrData), embedQr(locationQrData)]);
  pdf.setTitle(`Delphi Verify certificate ${code}`);

  const pages: PDFPage[] = [];
  const addPage = () => {
    const page = pdf.addPage([W, H]);
    pages.push(page);
    rect(page, 0, 0, W, H, panel);
    rect(page, 13, 13, W - 26, H - 26, white);
    page.drawImage(watermark, { x: 342, y: H - 226, width: 225, height: 225, opacity: 0.055 });
    header(page, logo, font);
    return page;
  };
  let page = addPage();
  rect(page, 34, 83, 527, 78, white, line);
  page.drawImage(verifyQr, { x: 48, y: H - 151, width: 58, height: 58 });
  rect(page, 121, 96, 0.7, 52, line);
  label(page, bold, "VERIFY THIS CERTIFICATE", 143, 97);
  write(page, font, "Scan the QR code or visit the link below to view the latest", 143, 113, 8, muted, 397);
  write(page, font, "version of this certificate and its associated evidence.", 143, 125, 8, muted, 397);
  write(page, bold, verifyUrl, 143, 141, 9, blue, 397);
  label(page, bold, "CERTIFICATE OF CAPTURE", 34, 186);
  const titleLines = lines(report.title || "Delphi certificate", bold, 28, 326, 2);
  titleLines.forEach((part, index) => write(page, bold, part, 34, 201 + index * 30, 28, ink, 326));
  rect(page, 377, 202, 184, 26, verifiedTint);
  page.drawCircle({ x: 390, y: H - 215, size: 3.5, color: verified });
  write(page, bold, `DELPHI ${report.verificationStatus.toUpperCase()}`, 400, 209, 9, verified, 148);
  write(page, font, report.verificationStatus === "verified" ? "EVIDENCE CAPTURED AND REGISTERED" : "CHECK THE CURRENT VERIFICATION STATUS", 377, 239, 7, muted, 184);
  write(page, font, "ON DELPHI VERIFY.", 377, 250, 7, muted, 184);

  const description = wrap(report.description || "", font, 12, 326);
  let descriptionTop = 210 + titleLines.length * 30;
  let descriptionEnd = descriptionTop;
  let descriptionIndex = 0;
  while (descriptionIndex < description.length) {
    const count = Math.min(description.length - descriptionIndex, Math.floor((770 - descriptionTop) / 15));
    for (let index = 0; index < count; index++) {
      write(page, font, description[descriptionIndex + index], 34, descriptionTop + index * 15, 12, muted, 326);
    }
    descriptionIndex += count;
    descriptionEnd = descriptionTop + count * 15;
    if (descriptionIndex < description.length) {
      page = addPage();
      rule(page, 34, 82, 527);
      label(page, bold, "DESCRIPTION / CONTINUED", 34, 102);
      write(page, bold, report.title || "Delphi certificate", 34, 120, 23, ink, 440);
      descriptionTop = 160;
    }
  }

  let detailsTop = Math.max(page === pages[0] ? 287 : 180, descriptionEnd + 8);
  if (detailsTop + 50 > 770) {
    page = addPage();
    detailsTop = 180;
  }
  rule(page, 34, detailsTop, 527);
  write(page, font, "CERTIFICATE ID", 82, detailsTop + 12, 7, muted);
  write(page, bold, code, 82, detailsTop + 26, 12, ink);
  write(page, font, "CAPTURED ON", 319, detailsTop + 12, 7, muted);
  write(page, bold, `${date} UTC`, 319, detailsTop + 26, 11, ink, 242);
  rule(page, 34, detailsTop + 50, 527);

  const firstCardsTop = detailsTop + 85;
  let nextMedia = 0;
  const firstCardsFit = media.length > 0 && firstCardsTop + 254 <= 770;
  if (firstCardsFit) {
    label(page, bold, "EVIDENCE IMAGES", 34, detailsTop + 64);
    write(page, bold, `${Math.min(media.length, 2)} OF ${media.length}`, 512, detailsTop + 64, 8, muted, 49);
    for (; nextMedia < Math.min(media.length, 2); nextMedia++) {
      card(page, images[nextMedia], media[nextMedia], nextMedia, report.captureVerification.verifiedCaptures, firstCardsTop, 34 + nextMedia * 272, bold, 254);
    }
  } else if (!media.length) {
    write(page, font, "No evidence images are available.", 34, detailsTop + 130, 11, muted);
  }

  const locationTop = firstCardsFit ? firstCardsTop + 271 : detailsTop + 85;
  const locationDeferred = locationTop + 127 > 770;
  if (locationDeferred) page = addPage();
  location(page, report, locationQr, font, bold, locationDeferred ? 100 : locationTop);

  let locationPageAvailable = locationDeferred;
  while (nextMedia < media.length) {
    if (!locationPageAvailable) page = addPage();
    const cardsTop = locationPageAvailable ? 250 : 193;
    if (locationPageAvailable) {
      label(page, bold, "EVIDENCE IMAGES / CONTINUED", 34, 229);
    } else {
      rule(page, 34, 82, 527);
      label(page, bold, "EVIDENCE IMAGES / CONTINUED", 34, 102);
      write(page, bold, report.title || "Delphi certificate", 34, 120, 23, ink, 440);
      write(page, font, `CERTIFICATE ${code}`, 34, 153, 8, muted);
      rule(page, 34, 176, 527);
    }
    const last = Math.min(nextMedia + 2, media.length);
    write(page, bold, `${nextMedia + 1}–${last} OF ${media.length}`, 493, locationPageAvailable ? 229 : 102, 8, muted, 68);
    for (let index = nextMedia; index < last; index++) {
      card(page, images[index], media[index], index, report.captureVerification.verifiedCaptures, cardsTop, 34 + (index - nextMedia) * 272, bold, 254);
    }
    nextMedia = last;
    locationPageAvailable = false;
  }

  pages.forEach((item, index) => {
    footer(item, font, bold, code, index + 1, pages.length);
    rect(item, 0, 0, W, 13, panel);
    rect(item, 0, H - 13, W, 13, panel);
    rect(item, 0, 13, 13, H - 26, panel);
    rect(item, W - 13, 13, 13, H - 26, panel);
    item.drawRectangle({ x: 13, y: 13, width: W - 26, height: H - 26, borderColor: line, borderWidth: 0.7 });
  });
  return pdf.save();
}
