import './App.css'

import { useState, useEffect, useRef } from 'react';
import { thumbHashToDataURL } from 'thumbhash';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import ImageModal from './components/imageModal';
import fetchGalleryData from './lib/dataIO.jsx';

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

          <>
          <div key={`${i}-gutter`} className="gallery-gutter"></div>
          <div key={i} className="gallery-tile">
            {meta.title && meta.title.length > 0 && <h3 className="gallery-tile-title">{meta.title}</h3>}
            <div className="gallery-tile-content" onClick={() => setImageModalMeta(() => {console.log(meta); return meta;})}>
              <div className="gallery-tile-description">
                <p>{meta.description}</p>
              </div>
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
    <ImageModal meta={imageModalMeta} photosPrefix={photosPrefix} onClose={() => setImageModalMeta(null)} />
    <div className="gallery" ref={galleryRef}>
      {galleryPreviews}
    </div>
    </>
  );
}

export default App;
