export default async function fetchGalleryData(
    manifestsPrefix,
    pageCursor = 0,
    pagesToRetrieve = 1,
    manifestPath = "photos/photos-manifest.json",
    headerPath = "photos/photos_header.json"
)
{
    try {

        const photosManifestResponse = await fetch(`${manifestsPrefix}${manifestPath}`);
        const photosManifest = JSON.parse(await photosManifestResponse.text());

        let photosMetas = [];
        let pageIdx = pageCursor;
        let pagesRetrieved = 0;

        // Start with the header
        if(pageCursor === 0 && pagesToRetrieve > 0) {
          const photosHeaderResponse = await fetch(`${manifestsPrefix}${headerPath}`);
          const photosHeader = JSON.parse(await photosHeaderResponse.text());
          photosMetas = [...photosMetas, ...photosHeader.metas];
          pageIdx++;
          pagesRetrieved++;
        }

        // Then retrieve pages
        while (pagesRetrieved < pagesToRetrieve && pageIdx < photosManifest.pages.length) {
          const pagePhotosResponse = await fetch(`${manifestsPrefix}photos/photos_page_${pageIdx}.json`);
          const pagePhotos = JSON.parse(await pagePhotosResponse.text());
          photosMetas = [...photosMetas, ...pagePhotos.metas];
          pageIdx++;
          pagesRetrieved++;
        }

        return photosMetas;

      } catch (err) {
        throw err;
      }
}