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