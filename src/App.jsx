import './App.css'

import { useState, useEffect, useRef } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import ImageModal from './components/imageModal';
import fetchGalleryData from './lib/dataIO.jsx';
import GalleryTile from './components/galleryTile.jsx';

function App() {
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const galleryRef = useRef(null);
  const [imageModalMeta, setImageModalMeta] = useState(null);

  const manifestsPrefix = 'https://gallery.keldev.net/manifests/';
  const photosPrefix = 'https://gallery.keldev.net/';

  useEffect(() => {
    async function buildGallery() {
      try {

        const photosMetas = await fetchGalleryData(manifestsPrefix);

        const previews = photosMetas.map((meta, i) => (
          <GalleryTile
            photoMeta = {meta}
            idx = {i}
            onClickContent = {() => setImageModalMeta(meta)}
            photosPrefix = {photosPrefix}
          />
        ));

        setGalleryPreviews(previews);
      } catch (err) {
        setError("Error fetching gallery data: " + err.message);
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    buildGallery();
  }, []);

  useEffect(() => {
    if (galleryRef.current && galleryPreviews.length > 0) {
      imagesLoaded(galleryRef.current, function() {
        const masonry = new Masonry(galleryRef.current, {
          itemSelector: '.gallery-tile',
          columnWidth: '.gallery-tile',
          percentPosition: true,
          fitWidth: true,
          horizontalOrder: true,
          gutter: '.gallery-gutter',
          transitionDuration: '0.15s',
        });
      });
    }
  }, [galleryPreviews]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
    <ImageModal photoMeta={imageModalMeta} photosPrefix={photosPrefix} onClose={() => setImageModalMeta(null)} />
    <div className="gallery" ref={galleryRef}>
      {galleryPreviews}
    </div>
    </>
  );
}

export default App;
