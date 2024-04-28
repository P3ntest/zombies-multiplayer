import { useState } from "react";
import { CenteredFullScreen } from "../components/ui/uiUtils";
import { trpc } from "../lib/trpc/trpcClient";
import { useDebounceValue } from "usehooks-ts";
import { useCustomAssetBaseUrl } from "./assets/hooks";

export function AssetLibrary({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const baseUrl = useCustomAssetBaseUrl();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 200);
  const assets = trpc.maps.assets.viewAssetLibrary.useQuery({
    search: debouncedSearch,
  });

  if (!open) {
    if (search) setSearch("");
    return null;
  }

  return (
    <CenteredFullScreen onClose={onClose}>
      <UploadAssetModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
      <div className="bg-slate-700 p-4 rounded-lg w-96">
        <div className="flex flex-row gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets"
            className="bg-slate-600 text-white p-2 rounded-lg w-full mb-4"
          />
          <button
            className="bg-slate-600 text-white p-2 rounded-lg w-full mb-4 flex-1"
            onClick={() => {
              setUploadModalOpen(true);
            }}
          >
            Upload
          </button>
        </div>
        <div className="overflow-y-auto h-96">
          {assets.data?.map((asset) => (
            <div
              key={asset.id}
              onClick={() => onSelect(asset.uploadId)}
              className="flex items-center p-2 cursor-pointer hover:bg-slate-800 rounded-lg"
            >
              <div className="bg-gray-300 rounded-lg mr-2 p-2">
                <img
                  src={`${baseUrl}/asset/${asset.uploadId}`}
                  className="rounded-lg w-16 h-16"
                  alt=""
                />
              </div>
              <div>
                <div className="text-white text-xl">{asset.name}</div>
                <div className="text-gray-500">{asset.tags.join(", ")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CenteredFullScreen>
  );
}

function UploadAssetModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const uploadAsset = trpc.maps.assets.uploadAssetFromUrl.useMutation();
  const utils = trpc.useUtils();

  const onUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    // if there is a file the blob has to be converted to base64
    await uploadAsset.mutateAsync({
      name: e.currentTarget.assetName.value,
      externalUrl: e.currentTarget.url.value,
    });
    await utils.maps.assets.invalidate();
    onClose();
  };

  if (!open) return null;

  return (
    <CenteredFullScreen onClose={onClose}>
      <form
        className="bg-slate-900 p-4 rounded-lg w-96"
        onSubmit={(e) => {
          e.preventDefault();
          onUpload(e);
        }}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl text-white">Upload</h1>
          <input
            placeholder="URL"
            type="text"
            name="url"
            className="bg-slate-600 text-white p-2 rounded-lg w-full"
          />
          <h2 className="text-2xl text-white">Data</h2>
          <input
            type="text"
            name="assetName"
            className="bg-slate-600 text-white p-2 rounded-lg w-full"
            placeholder="Name"
          />
          <button
            className="bg-slate-600 text-white p-2 rounded-lg w-full"
            type="submit"
          >
            Upload
          </button>
        </div>
      </form>
    </CenteredFullScreen>
  );
}
