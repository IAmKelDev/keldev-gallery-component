import './Gallery.css'

import { useState, useEffect, useRef } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import ImageModal from './components/imageModal.jsx';
import fetchGalleryData, { fetchPhotoById } from './lib/dataIO.jsx';
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
  const skipUrlSync = useRef(true);
  const [pageCursor, setPageCursor] = useState(1);
  const [moreToLoad, setMoreToLoad] = useState(true);

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

        const selectedId = new URLSearchParams(window.location.search).get('photo');
        if (selectedId) {
          const match = photosMetas.find(m => m.id === selectedId);
          if (match) {
            setImageModalMeta(match);
          } else {
            const fetched = await fetchPhotoById(apiPrefix, selectedId);
            if (fetched) setImageModalMeta(fetched);
            else history.replaceState(null, '', window.location.pathname);
          }
        }
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
    async function loadNewPage() {
      try {
        const newPhotosMetas = await fetchGalleryData(apiPrefix, pageCursor);
        const newPreviews = newPhotosMetas.map((meta, i) => (
          <GalleryTile
            photoMeta = {meta}
            idx = {i}
            onClickContent = {() => setImageModalMeta(meta)}
            photosPrefix = {photosPrefix}
          />
        ));

        if(newPreviews.length > 0) {
          setGalleryPreviews((prev) => [...prev, ...newPreviews]);
        }
        else {
          setMoreToLoad(false);
        }
        
      } catch (err) {
        console.log("Error adding page to gallery", err);
      }
    }

    if (pageCursor > 1) loadNewPage();
  }, [pageCursor])

  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    if (imageModalMeta) {
      history.replaceState(null, '', `${window.location.pathname}?photo=${imageModalMeta.id}`);
    } else {
      history.replaceState(null, '', window.location.pathname);
    }
  }, [imageModalMeta]);

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
    {moreToLoad && <button className="button button--primary" onClick={() => setPageCursor((prev) => prev + 1)}>Load More</button>}
    </>
  );
}

export default Gallery;
