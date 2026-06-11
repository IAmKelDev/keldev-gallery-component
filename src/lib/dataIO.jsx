export default async function fetchGalleryData(
    apiPrefix,
    pageCursor = 0,       //Currently unused
    pagesToRetrieve = 1,  //Currently unused
)
{
    try {
        const photosManifestResponse = await fetch(`${apiPrefix}images`);
        const responseJSON = await photosManifestResponse.json();

        const photosMetas = responseJSON?.images || [];
        console.log(photosMetas);

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