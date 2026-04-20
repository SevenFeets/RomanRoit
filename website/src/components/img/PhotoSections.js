import Image from "next/image";

export default function PhotoSections({ sections, fallbackPhotos }) {
  if (!sections.length) {
    return (
      <section>
        <h2 className="text-2xl font-bold md:text-3xl">Photo Gallery</h2>
        <p className="mt-2 text-slate-600">
          Real moments from rescue operations, treatment days, and foster care.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {fallbackPhotos.map((photo) => (
            <div
              key={photo.src}
              className="relative h-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold md:text-3xl">Photo Sections</h2>
        <p className="mt-2 text-slate-600">
          Images are grouped by folder-style sections managed from the admin
          panel.
        </p>
      </div>

      {sections.map((folder) => (
        <article key={folder.id} className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">{folder.name}</h3>
          {folder.description ? (
            <p className="mt-2 text-sm text-slate-600">{folder.description}</p>
          ) : null}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folder.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative h-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              >
                <Image
                  src={photo.public_url}
                  alt={photo.alt_text || folder.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
