"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { slugifyFolderName } from "@/lib/photos/helpers";

const EMPTY_FOLDER_FORM = {
  name: "",
  slug: "",
  description: "",
  sortOrder: "0",
  isPublic: true,
};

export default function AdminPhotosManager({ initialFolders }) {
  const [folders, setFolders] = useState(initialFolders);
  const [folderForm, setFolderForm] = useState(EMPTY_FOLDER_FORM);
  const [selectedFolderId, setSelectedFolderId] = useState(
    initialFolders[0]?.id ? String(initialFolders[0].id) : "",
  );
  const [uploadForm, setUploadForm] = useState({
    altText: "",
    sortOrder: "0",
    file: null,
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [busy, setBusy] = useState(false);

  const selectedFolder = useMemo(
    () => folders.find((folder) => String(folder.id) === selectedFolderId),
    [folders, selectedFolderId],
  );

  function setNotice(type, message) {
    setStatus({ type, message });
  }

  async function refreshFolders() {
    const response = await fetch("/api/admin/photos");
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Could not refresh folders.");
    }

    setFolders(payload.folders || []);

    if (!selectedFolderId && payload.folders?.length) {
      setSelectedFolderId(String(payload.folders[0].id));
    }
  }

  async function createFolder(event) {
    event.preventDefault();
    setBusy(true);
    setNotice("idle", "");

    try {
      const data = new FormData();
      data.set("action", "create-folder");
      data.set("name", folderForm.name);
      data.set("slug", folderForm.slug || slugifyFolderName(folderForm.name));
      data.set("description", folderForm.description);
      data.set("sortOrder", folderForm.sortOrder || "0");
      data.set("isPublic", String(folderForm.isPublic));

      const response = await fetch("/api/admin/photos", {
        method: "POST",
        body: data,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not create folder.");
      }

      await refreshFolders();
      setSelectedFolderId(String(payload.folder.id));
      setFolderForm(EMPTY_FOLDER_FORM);
      setNotice("success", "Folder created.");
    } catch (error) {
      setNotice("error", error.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadPhoto(event) {
    event.preventDefault();

    if (!selectedFolderId) {
      setNotice("error", "Choose a folder first.");
      return;
    }

    if (!uploadForm.file) {
      setNotice("error", "Pick an image file first.");
      return;
    }

    setBusy(true);
    setNotice("idle", "");

    try {
      const data = new FormData();
      data.set("action", "upload-photo");
      data.set("folderId", selectedFolderId);
      data.set("altText", uploadForm.altText);
      data.set("sortOrder", uploadForm.sortOrder || "0");
      data.set("file", uploadForm.file);

      const response = await fetch("/api/admin/photos", {
        method: "POST",
        body: data,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not upload photo.");
      }

      await refreshFolders();
      setUploadForm({ altText: "", sortOrder: "0", file: null });
      setNotice("success", "Photo uploaded.");
    } catch (error) {
      setNotice("error", error.message);
    } finally {
      setBusy(false);
    }
  }

  async function updatePhotoOrder(photoId, sortOrder) {
    setBusy(true);
    setNotice("idle", "");

    try {
      const response = await fetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder-photo",
          photoId,
          sortOrder,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not reorder photo.");
      }

      await refreshFolders();
      setNotice("success", "Photo order updated.");
    } catch (error) {
      setNotice("error", error.message);
    } finally {
      setBusy(false);
    }
  }

  async function deletePhoto(photoId) {
    setBusy(true);
    setNotice("idle", "");

    try {
      const response = await fetch("/api/admin/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-photo", photoId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not delete photo.");
      }

      await refreshFolders();
      setNotice("success", "Photo deleted.");
    } catch (error) {
      setNotice("error", error.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteFolder(folderId) {
    const confirmed = window.confirm(
      "Delete this folder and all photos inside it?",
    );
    if (!confirmed) {
      return;
    }

    setBusy(true);
    setNotice("idle", "");

    try {
      const response = await fetch("/api/admin/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-folder", folderId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not delete folder.");
      }

      await refreshFolders();

      const remaining = folders.filter((folder) => folder.id !== folderId);
      setSelectedFolderId(remaining[0] ? String(remaining[0].id) : "");
      setNotice("success", "Folder deleted.");
    } catch (error) {
      setNotice("error", error.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveFolder(folder) {
    setBusy(true);
    setNotice("idle", "");

    try {
      const response = await fetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-folder",
          folderId: folder.id,
          name: folder.name,
          slug: folder.slug,
          description: folder.description || "",
          sortOrder: folder.sort_order,
          isPublic: folder.is_public,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not update folder.");
      }

      await refreshFolders();
      setNotice("success", "Folder updated.");
    } catch (error) {
      setNotice("error", error.message);
    } finally {
      setBusy(false);
    }
  }

  function updateFolderField(folderId, field, value) {
    setFolders((current) =>
      current.map((folder) =>
        folder.id === folderId ? { ...folder, [field]: value } : folder,
      ),
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Create Folder Section</h2>
        <form onSubmit={createFolder} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-700">Folder name</span>
            <input
              type="text"
              required
              value={folderForm.name}
              onChange={(event) =>
                setFolderForm((current) => ({
                  ...current,
                  name: event.target.value,
                  slug: slugifyFolderName(event.target.value),
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:border-emerald-500 focus:ring"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-700">Slug</span>
            <input
              type="text"
              required
              value={folderForm.slug}
              onChange={(event) =>
                setFolderForm((current) => ({ ...current, slug: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:border-emerald-500 focus:ring"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm text-slate-700">Description</span>
            <textarea
              rows={3}
              value={folderForm.description}
              onChange={(event) =>
                setFolderForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:border-emerald-500 focus:ring"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-700">Sort order</span>
            <input
              type="number"
              value={folderForm.sortOrder}
              onChange={(event) =>
                setFolderForm((current) => ({
                  ...current,
                  sortOrder: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:border-emerald-500 focus:ring"
            />
          </label>

          <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={folderForm.isPublic}
              onChange={(event) =>
                setFolderForm((current) => ({
                  ...current,
                  isPublic: event.target.checked,
                }))
              }
            />
            Public section
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-emerald-700 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Create Folder
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Upload Photo</h2>
        <form onSubmit={uploadPhoto} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-700">Folder</span>
            <select
              value={selectedFolderId}
              onChange={(event) => setSelectedFolderId(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:border-emerald-500 focus:ring"
            >
              <option value="">Select folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-700">Sort order</span>
            <input
              type="number"
              value={uploadForm.sortOrder}
              onChange={(event) =>
                setUploadForm((current) => ({
                  ...current,
                  sortOrder: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:border-emerald-500 focus:ring"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm text-slate-700">Alt text</span>
            <input
              type="text"
              value={uploadForm.altText}
              onChange={(event) =>
                setUploadForm((current) => ({
                  ...current,
                  altText: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-emerald-200 focus:border-emerald-500 focus:ring"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm text-slate-700">Image file</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setUploadForm((current) => ({
                  ...current,
                  file: event.target.files?.[0] || null,
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-emerald-700 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Upload Photo
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Manage Existing Folders</h2>
        {folders.length ? (
          <div className="mt-4 space-y-6">
            {folders.map((folder) => (
              <article
                key={folder.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{folder.name}</h3>
                    <p className="text-xs text-slate-500">
                      slug: {folder.slug} | public: {folder.is_public ? "yes" : "no"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteFolder(folder.id)}
                    disabled={busy}
                    className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Delete Folder
                  </button>
                </div>

                <div className="mt-4 overflow-auto">
                  <div className="mb-4 grid gap-3 rounded-xl bg-slate-50 p-3 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-600">Name</span>
                      <input
                        type="text"
                        value={folder.name}
                        onChange={(event) =>
                          updateFolderField(folder.id, "name", event.target.value)
                        }
                        className="w-full rounded border border-slate-300 px-2 py-1.5"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-600">Slug</span>
                      <input
                        type="text"
                        value={folder.slug}
                        onChange={(event) =>
                          updateFolderField(folder.id, "slug", event.target.value)
                        }
                        className="w-full rounded border border-slate-300 px-2 py-1.5"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-xs text-slate-600">
                        Description
                      </span>
                      <input
                        type="text"
                        value={folder.description || ""}
                        onChange={(event) =>
                          updateFolderField(
                            folder.id,
                            "description",
                            event.target.value,
                          )
                        }
                        className="w-full rounded border border-slate-300 px-2 py-1.5"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-600">
                        Sort order
                      </span>
                      <input
                        type="number"
                        value={folder.sort_order}
                        onChange={(event) =>
                          updateFolderField(
                            folder.id,
                            "sort_order",
                            Number(event.target.value),
                          )
                        }
                        className="w-full rounded border border-slate-300 px-2 py-1.5"
                      />
                    </label>
                    <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(folder.is_public)}
                        onChange={(event) =>
                          updateFolderField(
                            folder.id,
                            "is_public",
                            event.target.checked,
                          )
                        }
                      />
                      Public section
                    </label>
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={() => saveFolder(folder)}
                        disabled={busy}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Save Folder
                      </button>
                    </div>
                  </div>

                  <table className="min-w-full text-sm">
                    <thead className="text-left text-slate-600">
                      <tr>
                        <th className="px-2 py-2">Preview</th>
                        <th className="px-2 py-2">Alt text</th>
                        <th className="px-2 py-2">Sort</th>
                        <th className="px-2 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(folder.photos || []).map((photo) => (
                        <tr key={photo.id} className="border-t border-slate-100">
                          <td className="px-2 py-2">
                            <div className="relative h-12 w-16 overflow-hidden rounded">
                              <Image
                                src={photo.public_url}
                                alt={photo.alt_text || folder.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-2">{photo.alt_text || "-"}</td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              defaultValue={photo.sort_order}
                              onBlur={(event) =>
                                updatePhotoOrder(photo.id, Number(event.target.value))
                              }
                              className="w-20 rounded border border-slate-300 px-2 py-1"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <button
                              type="button"
                              onClick={() => deletePhoto(photo.id)}
                              disabled={busy}
                              className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!folder.photos?.length ? (
                    <p className="mt-3 text-sm text-slate-500">No photos yet.</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            No folders yet. Create your first folder above.
          </p>
        )}
      </section>

      {status.message ? (
        <p
          className={`rounded-xl px-4 py-3 text-sm ${
            status.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
