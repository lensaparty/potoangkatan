import { Card } from "@/components/ui/card";
import Image from "next/image";

type Photo = {
  id: string;
  file_name: string | null;
  public_url: string;
};

export function GalleryGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="p-2">
          <Image
            src={photo.public_url}
            alt={photo.file_name ?? "Event photo"}
            width={600}
            height={600}
            unoptimized
            className="aspect-square w-full rounded-xl object-cover"
          />
          <a
            href={photo.public_url}
            download
            className="mt-2 block text-center text-xs text-zinc-600 underline"
          >
            Download
          </a>
        </Card>
      ))}
    </div>
  );
}
