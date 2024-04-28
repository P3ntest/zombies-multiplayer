import { useState } from "react";
import { CenteredFullScreen } from "../components/ui/uiUtils";
import { trpc } from "../lib/trpc/trpcClient";
import { useDebounceValue } from "usehooks-ts";
import { useCustomAssetBaseUrl } from "./assets/hooks";
import { backendUrl } from "../lib/trpc/backendUrl";
import { useLogto } from "@logto/react";
import { twMerge } from "tailwind-merge";

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
      <div className="p-3 w-96 bg-base-300 card">
        <div className="flex flex-row gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets"
            className="input input-primary flex-1"
          />
          <button
            className="btn btn-primary"
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
  // const uploadAsset = trpc.maps.assets.uploadAssetFromUrl.useMutation();
  const utils = trpc.useUtils();
  const { getAccessToken } = useLogto();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");

  const onUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`${backendUrl}/createAsset`, {
      method: "POST",
      body: new FormData(e.currentTarget),
      headers: {
        Authorization: `Bearer ${await getAccessToken(
          "https://apocalypse.p3ntest.dev/"
        )}`,
      },
    })
      .then(() => utils.maps.assets.invalidate())
      .finally(() => {
        console.log("done");
        setLoading(false);
      });

    onClose();
  };

  if (!open) return null;

  return (
    <CenteredFullScreen onClose={onClose}>
      <form
        className="card bg-base-100 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          onUpload(e);
        }}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl text-white">Upload</h1>
          <input
            type="file"
            className="file-input file-input-secondary"
            name="file"
          />
          <input
            type="text"
            name="assetName"
            className="input input-secondary"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className={twMerge("btn btn-primary")}
            type="submit"
            disabled={loading || !name}
          >
            {loading && <span className="loading loading-spinner"></span>}
            Upload
          </button>
        </div>
      </form>
    </CenteredFullScreen>
  );
}
