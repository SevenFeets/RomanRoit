const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;

export function slugifyFolderName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_REGEX, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildPhotoStoragePath(folderSlug, filename) {
  const original = filename?.trim() || "photo.jpg";
  const dotIndex = original.lastIndexOf(".");
  const rawExtension =
    dotIndex > -1 && dotIndex < original.length - 1
      ? original.slice(dotIndex + 1)
      : "jpg";
  const extension = `.${rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  const baseName = dotIndex > -1 ? original.slice(0, dotIndex) : original;
  const safeBaseName = baseName
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_REGEX, "-")
    .replace(/^-+|-+$/g, "");

  const nameWithoutExtension = safeBaseName || "photo";
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  return `${folderSlug}/${nameWithoutExtension}-${uniqueSuffix}${extension}`;
}
