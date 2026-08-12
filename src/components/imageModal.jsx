import './imageModal.css';

import { useState, useEffect } from 'react';

export default function ImageModal({ photoMeta, photosPrefix, onClose }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setIsLoaded(false), [photoMeta?.id]);
  
  if (!photoMeta) return null;

  const derivative = photoMeta.derivatives?.[photoMeta.derivatives.length - 1]
  const fullSizeFilename = derivative?.filename;
  const fullSizeUrl = fullSizeFilename ? `${photosPrefix}${fullSizeFilename}` : null;

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
            { fullSizeUrl &&
              <img
                onLoad={() => setIsLoaded(true)}
                onError={() => setIsLoaded(true)}
                className={`image-modal-image${isLoaded ?' is-loaded' : ''}`}
                src={fullSizeUrl}
                alt={`Modal: ${photoMeta.title}`}
                />
            }
        </div>
        <div className="image-modal-info-card" onClick={catchClick}>
          <h3 className="image-modal-info-card-title">{photoMeta.title}</h3>
          <p className="image-modal-info-card-description">{photoMeta.description}</p>
          <p className="image-modal-info-card-description">{new Date(photoMeta.taken_at).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
          <p className="image-modal-info-card-description">{`Score: ${photoMeta.score}`}</p>
          <p className="image-modal-info-card-description">{photoMeta.author}</p>
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
        </div>
      </div>
    </div>
  );
}
