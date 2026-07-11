export default async function fetchGalleryPage(
    apiPrefix,
    pageNumber = 0,
    photoId = null //Optional, fetch page containing the photo with this ID (if given pageCursor is ignored)
)
{
    try {
        // console.log("Fetching page. Number = ", pageNumber, " Photo ID = ", photoId);
        const requestUrl = photoId ? `${apiPrefix}images?pageof=${photoId}` : `${apiPrefix}images?page=${pageNumber}`;
        const photosManifestResponse = await fetch(requestUrl);
        const responseJSON = await photosManifestResponse.json();

        const photosMetas = responseJSON?.images || [];
        const pageNum = responseJSON?.pageNum ?? -1;
        const hasMore = responseJSON?.hasMore ?? false;

        if (photoId && photosMetas.length === 0) {
            throw new Error(`Photo with ID ${photoId} not found.`);
        }

        return { photos: photosMetas, pageNum, hasMore };

      } catch (err) {
        throw err;
      }
}