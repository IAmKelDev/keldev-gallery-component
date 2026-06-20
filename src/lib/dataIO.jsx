export default async function fetchGalleryData(
    apiPrefix,
    pageCursor = 0,
    pagesToRetrieve = 1,  //Currently unused
)
{
    try {
        const photosManifestResponse = await fetch(`${apiPrefix}images?page=${pageCursor}`);
        const responseJSON = await photosManifestResponse.json();

        const photosMetas = responseJSON?.images || [];

        return photosMetas;

      } catch (err) {
        throw err;
      }
}

export async function fetchPhotoById(apiPrefix, id) {
    const response = await fetch(`${apiPrefix}images?id=${encodeURIComponent(id)}`);
    if (!response.ok) return null;
    const json = await response.json();
    return json?.image ?? null;
}