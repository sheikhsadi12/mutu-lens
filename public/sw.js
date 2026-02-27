const CACHE_NAME = 'mutulens-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Handle Web Share Target POST requests
  if (event.request.method === 'POST' && event.request.url.endsWith('/')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        const imageFile = formData.get('image');
        
        if (imageFile) {
          // Open IndexedDB to store the shared image temporarily
          const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('mutulens-share', 1);
            request.onupgradeneeded = (e) => {
              e.target.result.createObjectStore('shared-files');
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });

          // Store the file
          await new Promise((resolve, reject) => {
            const tx = db.transaction('shared-files', 'readwrite');
            const store = tx.objectStore('shared-files');
            store.put(imageFile, 'latest-shared-image');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
          });
        }
        
        // Redirect to the app with a query parameter
        return Response.redirect('/?shared=true', 303);
      } catch (error) {
        console.error('Error handling share target:', error);
        return Response.redirect('/', 303);
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
