import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Gallery from './Gallery.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Gallery
      manifestsPrefix={'https://gallery.keldev.net/manifests/'}
      photosPrefix={'https://gallery.keldev.net/'}
    />
  </StrictMode>,
)
