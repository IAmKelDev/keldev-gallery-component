import { thumbHashToDataURL } from 'thumbhash';
import './galleryTile.css';


export default function GalleryTile({ photoMeta, idx, onClickContent, photosPrefix}) {
    return (
        <>
        <div key={`${idx}-gutter`} className="gallery-gutter"></div>
        <div key={idx} className="gallery-tile">
        {photoMeta.title && photoMeta.title.length > 0 && <h3 className="gallery-tile-title">{photoMeta.title}</h3>}
        <div className="gallery-tile-content" onClick={onClickContent}>
            <div className="gallery-tile-description">
                <p>{photoMeta.description}</p>
                <p>{new Date(photoMeta.dateTime.year, photoMeta.dateTime.month - 1, photoMeta.dateTime.day, photoMeta.dateTime.hour, photoMeta.dateTime.minute, photoMeta.dateTime.second).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
            </div>
            <div className="gallery-tile-image-container">
                <img 
                    className="gallery-tile-image"
                    srcSet={`
                    ${photosPrefix}${photoMeta.derivatives[1].filename},
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