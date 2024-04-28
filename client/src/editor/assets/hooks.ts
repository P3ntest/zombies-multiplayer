import { trpc } from "../../lib/trpc/trpcClient";

export function useCustomAssetBaseUrl() {
  return trpc.maps.assets.assetsEndpoint.useQuery().data;
}

export function useCustomAsset(uploadId: string) {
  const baseUrl = useCustomAssetBaseUrl();
  return `${baseUrl}/asset/${uploadId}.png`;
}
