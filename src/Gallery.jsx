import './Gallery.css'

import { useState, useEffect, useRef } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import ImageModal from './components/imageModal.jsx';
import fetchGalleryData from './lib/dataIO.jsx';
import GalleryTile from './components/galleryTile.jsx';

function Gallery({
  apiPrefix,
  photosPrefix
}) {
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const galleryRef = useRef(null);
  const masonryRef = useRef(null);
  const [imageModalMeta, setImageModalMeta] = useState(null);

  useEffect(() => {
    async function buildGallery() {
      try {

        const photosMetas = await fetchGalleryData(apiPrefix);

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
    if (!galleryRef.current || galleryPreviews.length === 0) return;

    imagesLoaded(galleryRef.current, function() {
      masonryRef.current = new Masonry(galleryRef.current, {
        itemSelector: '.gallery-tile',
        columnWidth: '.gallery-tile',
        percentPosition: false,
        fitWidth: true,
        horizontalOrder: true,
        gutter: '.gallery-gutter',
        transitionDuration: '0.15s',
      });
    });

    const ro = new ResizeObserver(() => {
      masonryRef.current?.layout();
    });
    ro.observe(galleryRef.current);

    return () => ro.disconnect();
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

export default Gallery;
