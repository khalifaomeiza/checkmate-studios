/** Google Drive raster preview (`sz` caps long edge when possible). Sharing must allow access. */
export const googleDriveThumbnail = (fileId: string, maxEdgePx = 2000): string =>
  `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${maxEdgePx}`;
