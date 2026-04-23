import './App.css'

import { useState, useEffect, useRef } from 'react';
import { thumbHashToDataURL } from 'thumbhash';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

function App() {
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    async function fetchGalleryData() {
      try {

        const manifestsPrefix = 'https://gallery.keldev.net/manifests/';
        const photosPrefix = 'https://gallery.keldev.net/';

        let maxFetch = 20;

        const photosManifestResponse = await fetch(`${manifestsPrefix}photos/photos-manifest.json`);
        const photosManifest = JSON.parse(await photosManifestResponse.text());

        let fetched = 0;
        let photosMetas = [];

        const photosHeaderResponse = await fetch(`${manifestsPrefix}photos/photos_header.json`);
        const photosHeader = JSON.parse(await photosHeaderResponse.text());
        photosMetas = [...photosMetas, ...photosHeader.metas];

        console.log(photosMetas);

        fetched += photosManifest.header.count;

        let pageIdx = 0;
        while (fetched < maxFetch && pageIdx < photosManifest.pages.length) {
          const pagePhotosResponse = await fetch(`${manifestsPrefix}photos/photos_page_${pageIdx}.json`);
          const pagePhotos = JSON.parse(await pagePhotosResponse.text());
          photosMetas = [...photosMetas, ...pagePhotos.metas];
          fetched += pagePhotos.metas.length;
          pageIdx++;
        }

        const previews = photosMetas.slice(0, maxFetch).map((meta, i) => (

          <>
          <div key={`${i}-gutter`} className="gallery-gutter"></div>
          <div key={i} className="gallery-tile">
            <h2>{meta.title}</h2>
            <div className="gallery-tile-content">
              {meta.description && meta.description.length > 0 && <div className="gallery-tile-description">
                <p>{meta.description}</p>
              </div>}
              <div className="gallery-tile-image-container">
                <img 
                  className="gallery-tile-image"
                  srcSet={`
                    ${photosPrefix}${meta.derivatives[1].filename},
                    ${thumbHashToDataURL(Uint8Array.from(atob(meta.thumbhash), c => c.charCodeAt(0)))}
                    `}
                  alt={meta.title}
                />
              </div>
            </div>
            <div className="gallery-tile-tags">
              {meta.tags.map(tag => <span key={tag} className="gallery-tile-tag"> {tag} </span>)}
            </div>
          </div>
          </>
        ));

        setGalleryPreviews(previews);
      } catch (err) {
        setError(err.message);
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryData();
  }, []);

  useEffect(() => {
    if (galleryRef.current && galleryPreviews.length > 0) {
      imagesLoaded(galleryRef.current, function() {
        const masonry = new Masonry(galleryRef.current, {
          itemSelector: '.gallery-tile',
          columnWidth: '.gallery-tile',
          percentPosition: true,
          horizontalOrder: true,
          gutter: '.gallery-gutter',
          transitionDuration: '0.15s',
        });
      });
    }
  }, [galleryPreviews]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
    <div className="gallery" ref={galleryRef}>
      {galleryPreviews}
    </div>
    <div>test!</div>
    </>
  );
}

export default App;
