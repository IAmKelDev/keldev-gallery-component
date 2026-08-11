import './imageModal.css';

import { useEffect, useRef, useState } from 'react';
import imagesLoaded from 'imagesloaded';

export default function ImageModal({ photoMeta, photosPrefix, onClose }) {
  if (!photoMeta) return null;

  const fullSizeFilename = photoMeta.derivatives?.[photoMeta.derivatives.length - 1]?.filename;
  const fullSizeUrl = fullSizeFilename ? `${photosPrefix}${fullSizeFilename}` : null;

  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
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

  const copyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?photo=${photoMeta.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };

  return (
    <div className="image-modal" onClick={onClose}>
      <div className="image-modal-content">
        <div className="image-modal-main-content" onClick={catchClick}>
            {isLoading && <p>Loading…</p>}
            {fullSizeUrl && <img ref={imgRef} src={fullSizeUrl} alt="Image Modal" />}
        </div>
        {!isLoading && <div className="image-modal-info-card" onClick={catchClick}>
          <h3 className="image-modal-info-card-title">{photoMeta.title}</h3>
          <p className="image-modal-info-card-description">{photoMeta.description}</p>
          <p className="image-modal-info-card-description">{new Date(photoMeta.taken_at).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
          <p className="image-modal-info-card-description">{`Score: ${photoMeta.score}`}</p>
          <div className="image-modal-info-card-tags">
            {photoMeta.tags?.map((tag) => (
              <span key={tag} className="gallery-tile-tag">
                {' '}
                {tag}{' '}
              </span>
            ))}
          </div>
          <div className="image-modal-info-card-options">
            <a onClick={onClose}>Close</a>
            <a onClick={copyLink}>{copied ? 'Copied!' : 'Copy Link'}</a>
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
