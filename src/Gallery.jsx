import './Gallery.css'

import { useState, useEffect, useRef } from 'react';
import Masonry from 'masonry-layout';
import ImageModal from './components/imageModal.jsx';
import fetchGalleryPage from './lib/dataIO.jsx';
import GalleryTile from './components/galleryTile.jsx';

function Gallery({
  apiPrefix,
  photosPrefix,
  localPageSize = 20
}) {

  const [galleryMetas, setGalleryMetas] = useState([]);
  const [minDBPageNum, setMinDBPageNum] = useState(0); //Lowest page number that has been fetched
  const [maxDBPageNum, setMaxDBPageNum] = useState(0); //Highest page number that has been fetched
  const [dbHasMore, setDbHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const galleryRef = useRef(null);
  const masonryRef = useRef(null);
  const [imageModalMeta, setImageModalMeta] = useState(null);
  const skipUrlSync = useRef(true);
  const [localPageUpperBound, setLocalPageUpperBound] = useState(null);
  const [localPageLowerBound, setLocalPageLowerBound] = useState(null);
  const masonryKnownGalleryTiles = useRef([]);
  const resizeObserverRef = useRef(null);

  useEffect(() => {

    async function openPhotoFromUrl() {
      try {
        const selectedId = new URLSearchParams(window.location.search).get('photo');
        if (selectedId) {
          const match = galleryMetas.find(m => m.id === selectedId);
          if (match) {
            setImageModalMeta(match);
          } else {
            const fetchResults = await fetchGalleryPage(apiPrefix, 0, selectedId);
            // console.log(fetchResults);
            if(fetchResults.photos.length > 0) {
              const indexOfSelected = fetchResults.photos.findIndex(m => m.id === selectedId);
              setImageModalMeta(fetchResults.photos[indexOfSelected]);
              setGalleryMetas([...fetchResults.photos]);
              setMaxDBPageNum(fetchResults.pageNum);
              setMinDBPageNum(fetchResults.pageNum);
              const lowerBound = Math.min(indexOfSelected, Math.max(0, fetchResults.photos.length - localPageSize));
              setLocalPageLowerBound(lowerBound);
              setLocalPageUpperBound(lowerBound + localPageSize);
              setDbHasMore(fetchResults.hasMore);

              return true; //Indicate that a page was fetched
            } else {
              history.replaceState(null, '', window.location.pathname);
            }
          }
        }
      } catch (err) {
        console.log("Error opening photo from URL: ", err.message);
      } finally {
        setLoading(false);
      }

      return false; //Indicate that no page was fetched
    }

    openPhotoFromUrl().then((pageWasFetched) => {
      if(!pageWasFetched) {
        //Trigger the fetchPageFromDb effect to fetch the first page of data
        setLocalPageLowerBound(0);
        setLocalPageUpperBound(localPageSize);
      }
    })


  }, []);
  
  useEffect(() => {
    async function fetchPageFromDb(nextPage = true) {
      try {

        if(nextPage) {
          const fetchResults = await fetchGalleryPage(apiPrefix, maxDBPageNum + 1);
          if(fetchResults.pageNum > maxDBPageNum) setMaxDBPageNum(fetchResults.pageNum);
          setDbHasMore(fetchResults.hasMore);
          setGalleryMetas((prev) => [...prev, ...fetchResults.photos]);
        }
        else {
          const fetchResults = await fetchGalleryPage(apiPrefix, minDBPageNum - 1);
          if(fetchResults.pageNum < minDBPageNum) setMinDBPageNum(fetchResults.pageNum);
          setGalleryMetas((prev) => [...fetchResults.photos, ...prev]);
          setLocalPageLowerBound((prev) => prev + fetchResults.photos.length);
          setLocalPageUpperBound((prev) => prev + fetchResults.photos.length);
        }

      } catch (err) {
        console.log("Error fetching gallery data: ", err);
        setError("Error fetching gallery data: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    if(localPageLowerBound !== null && localPageUpperBound !== null) {
      if(galleryMetas.length <= localPageUpperBound && dbHasMore) {
        fetchPageFromDb();
      }
      if(localPageLowerBound < 0 && minDBPageNum > 1) {
        fetchPageFromDb(false);
      }
    }
      
  }, [localPageLowerBound, localPageUpperBound])

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
    if (!galleryRef.current || galleryMetas.length === 0) return;

    const galleryTiles = Array.from(galleryRef.current.querySelectorAll('.gallery-tile'));
    const tilesAddedCount = galleryTiles.length - masonryKnownGalleryTiles.current.length;
    const firstKnownTile = masonryKnownGalleryTiles.current[0]; //For scroll adjustment on prepend

    if (masonryKnownGalleryTiles.current.length === 0) {
      //Init. Set up masonry ref object and the resize observer.

      masonryRef.current?.destroy();
      resizeObserverRef.current?.disconnect();
      masonryRef.current = new Masonry(galleryRef.current, {
        itemSelector: '.gallery-tile',
        columnWidth: '.gallery-tile',
        percentPosition: false,
        fitWidth: true,
        horizontalOrder: true,
        gutter: '.gallery-gutter',
        transitionDuration: '0.15s',
      });
      resizeObserverRef.current = new ResizeObserver(() => {
        masonryRef.current?.layout();
      });
      resizeObserverRef.current.observe(galleryRef.current);

      //On init, if there's a selected image scroll it into view.
      //This is here because it needs to wait for images to load and layout to finish.
      const selectedId = new URLSearchParams(window.location.search).get('photo');
      if (selectedId) {
        document.querySelector(`[data-photo-id="${selectedId}"`)?.scrollIntoView({block: 'center', behavior: 'instant'});
      }
    }
    else if (tilesAddedCount > 0) {

      const tilesPrepended = galleryTiles[0] !== masonryKnownGalleryTiles.current[0];
      const newTiles = tilesPrepended ? galleryTiles.slice(0, tilesAddedCount) : galleryTiles.slice(-tilesAddedCount);

      if (tilesPrepended) {
        //Prepend pushes current items down. Compensate by scrolling the first pre-existing item back to where it was
        const firstKnownMasonryItem = masonryRef.current?.items?.find(i => i.element === firstKnownTile);
        const prevY = firstKnownMasonryItem?.position?.y;
        
        //Make the prepend instant so that animations don't clash with scroll adjustment
        const oldTransition = masonryRef.current?.options?.transitionDuration;
        masonryRef.current.options.transitionDuration = 0;

        masonryRef.current?.prepended(newTiles);
        masonryRef.current?.layout();

        masonryRef.current.options.transitionDuration = oldTransition;

        const newY = firstKnownMasonryItem?.position?.y;
        if(prevY != null && newY != null) {
          window.scrollBy({top: newY - prevY, behavior: 'instant'});
        }
      } else {
        masonryRef.current?.appended(newTiles);
        masonryRef.current?.layout();
      }
    }

    masonryKnownGalleryTiles.current = [...galleryTiles];

  }, [galleryMetas, localPageLowerBound, localPageUpperBound]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
    <ImageModal photoMeta={imageModalMeta} photosPrefix={photosPrefix} onClose={() => setImageModalMeta(null)} />
    {(minDBPageNum > 1 || localPageLowerBound > 0) && <button className="button button--primary" onClick={() => setLocalPageLowerBound((prev) => prev - localPageSize)}>More Pics</button>}
    <div className="gallery" ref={galleryRef}>
      {galleryMetas.slice(Math.max(0, localPageLowerBound), localPageUpperBound).map((meta, i) => (
        <GalleryTile
            key={meta.id}
            photoMeta = {meta}
            onClickContent = {() => setImageModalMeta(meta)}
            photosPrefix = {photosPrefix}
          />
        ))}
    </div>
    {(dbHasMore || localPageUpperBound < galleryMetas.length) && <button className="button button--primary" onClick={() => setLocalPageUpperBound((prev) => prev + localPageSize)}>More Pics</button>}
    </>
  );
}

export default Gallery;
