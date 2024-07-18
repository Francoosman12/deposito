// src/service-worker.js

/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';

const CACHE_NAME = 'product-search-cache-v1';

// Define los recursos a precachear como un array de rutas
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/js/0.chunk.js',
  '/static/js/main.chunk.js',
  '/static/css/main.chunk.css',
  '/productos.json'
];

// Utiliza precacheAndRoute para precachear y enrutar los recursos
precacheAndRoute(urlsToCache);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheWhitelist.indexOf(cacheName) === -1)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});
