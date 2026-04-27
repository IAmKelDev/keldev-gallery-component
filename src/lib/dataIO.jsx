export default async function fetchGalleryData(
    manifestsPrefix,
    manifestPath = "photos/photos-manifest.json",
    headerPath = "photos/photos_header.json"
)
{
    try {

        const photosManifestResponse = await fetch(`${manifestsPrefix}${manifestPath}`);
        const photosManifest = JSON.parse(await photosManifestResponse.text());

        let fetched = 0;
        let photosMetas = [];

        const photosHeaderResponse = await fetch(`${manifestsPrefix}${headerPath}`);
        const photosHeader = JSON.parse(await photosHeaderResponse.text());
        photosMetas = [...photosMetas, ...photosHeader.metas];

        fetched += photosManifest.header.count;

        let pageIdx = 0;
        while (pageIdx < photosManifest.pages.length) {
          const pagePhotosResponse = await fetch(`${manifestsPrefix}photos/photos_page_${pageIdx}.json`);
          const pagePhotos = JSON.parse(await pagePhotosResponse.text());
          photosMetas = [...photosMetas, ...pagePhotos.metas];
          fetched += pagePhotos.metas.length;
          pageIdx++;
        }

        return photosMetas;

      } catch (err) {
        throw err;
      }
}