import './imageModal.css';

import { useEffect, useRef, useState } from 'react';
import imagesLoaded from 'imagesloaded';

export default function ImageModal({ meta, photosPrefix, onClose }) {
  if (!meta) return null;

  const fullSizeFilename = meta.derivatives?.[meta.derivatives.length - 1]?.filename;
  const fullSizeUrl = fullSizeFilename ? `${photosPrefix}${fullSizeFilename}` : null;

  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
  }, [fullSizeUrl]);

  useEffect(() => {
    if (!fullSizeUrl) {
      setIsLoading(false);
      return;
    }

    const el = imgRef.current;
    if (!el) return;

    const il = imagesLoaded(el, () => setIsLoading(false));
    return () => {
      try {
        il.off('always');
      } catch {
        // ignore
      }
    };
  }, [fullSizeUrl]);

  const catchClick = (e) => {e.stopPropagation()};

  return (
    <div className="image-modal" onClick={onClose}>
      <div className="image-modal-content">
        <div className="image-modal-main-content" onClick={catchClick}>
            {isLoading && <p>Loading…</p>}
            {fullSizeUrl && <img ref={imgRef} src={fullSizeUrl} alt="Image Modal" />}
        </div>
        {!isLoading && <div className="image-modal-info-card" onClick={catchClick}>
          <h3 className="image-modal-info-card-title">{meta.title}</h3>
          <p className="image-modal-info-card-description">{meta.description}</p>
          <div className="image-modal-info-card-tags">
            {meta.tags?.map((tag) => (
              <span key={tag} className="gallery-tile-tag">
                {' '}
                {tag}{' '}
              </span>
            ))}
          </div>
          <div className="image-modal-info-card-options">
            <a onClick={onClose}>Close</a>
            {fullSizeUrl && (
              <a href={fullSizeUrl} target="_blank" rel="noreferrer">
                Open Full Size
              </a>
            )}
          </div>
        </div>}
      </div>
    </div>
  );
}
