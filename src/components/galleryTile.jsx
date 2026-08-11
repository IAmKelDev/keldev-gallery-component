import { thumbHashToDataURL } from 'thumbhash';
import './galleryTile.css';

export default function GalleryTile({ photoMeta, onClickContent, photosPrefix}) {
    const derivative = photoMeta.derivatives?.[1];
    const width = Number.parseFloat(derivative?.width);
    const height = Number.parseFloat(derivative?.height);

    let aspectRatio;
    const ratioWouldBeValid = Number.isFinite(width) && Number.isFinite(height) && height > 0;
    if (ratioWouldBeValid) {
        aspectRatio = width / height;
    } else {
        console.warn(`Missing/invalid derivative dimensions for photo ${photoMeta.id}`, photoMeta);
    }

    return (
        <>
        <div className="gallery-gutter"></div>
        <div className="gallery-tile" data-photo-id={photoMeta.id}>
        {photoMeta.title && photoMeta.title.length > 0 && <h3 className="gallery-tile-title">{photoMeta.title}</h3>}
        <div className="gallery-tile-content" onClick={onClickContent} style={{aspectRatio}}>
            <div className="gallery-tile-description">
                <p>{photoMeta.description}</p>
                <p>{new Date(photoMeta.taken_at).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
                <p>{`Score: ${photoMeta.score}`}</p>
            </div>
            <div className="gallery-tile-image-container">
                <img 
                    className="gallery-tile-image"
                    srcSet={`
                    ${photosPrefix}${derivative?.filename},
                    ${thumbHashToDataURL(Uint8Array.from(atob(photoMeta.thumbhash), c => c.charCodeAt(0)))}
                    `}
                    alt={photoMeta.title}
                />
            </div>
        </div>
        <div className="gallery-tile-tags">
            {photoMeta.tags.map(tag => <span key={tag} className="gallery-tile-tag"> {tag} </span>)}
        </div>
        </div>
        </>
    )
}