'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "31a017fddb1bc36fbef93aa132496191",
"assets/assets/bothArrow.png": "36a0191a2d49398a3c1d0fc891a63723",
"assets/assets/education.png": "004dbcfb5fcdbd18cfd5203ce82b20a7",
"assets/assets/gradian.png": "cceb3eb93604aaebe0bc53b40e8900bc",
"assets/assets/heroLady.png": "ef8f4bfd192f55239f39ab852658cb6d",
"assets/assets/lady1.png": "30a7ec37868ea01cc28424893487bbbd",
"assets/assets/lady2.png": "ac2e8b05ed99d7f05a5956e33ca0ffc4",
"assets/assets/lady3.png": "1ca4184075b2f955a1e59b46b27352f1",
"assets/assets/leftArrow.png": "af8805ca6c555d429e9e4bcf8a1986ac",
"assets/assets/logo.png": "c274349bea34200cfe03e0775a808dc9",
"assets/assets/Mask%2520Group%25202.png": "9c46c787dcfbc20b74bf242e1710609b",
"assets/assets/product1.png": "95f9a58e71196c41f13bf74207cd39bc",
"assets/assets/product2.png": "b41a93c38e9f49a643462fb2a1216102",
"assets/assets/salon.png": "54ed1767eee4bf9555114ff4e7dd4c26",
"assets/assets/service1.png": "383c4444195dc58f0828a4336cc3fc7f",
"assets/assets/service2.png": "01fd40b897f1362ead2e7e17abf3082e",
"assets/assets/service3.png": "38c104b61365562db19466db2fa8fede",
"assets/assets/service4.png": "ef2b9d93dc33b4df6bbdbbb4be63f660",
"assets/assets/serviceHero.png": "317433f0d5b6456cba1dd2f0b815b591",
"assets/assets/spa.png": "257906a7dfdf488a1510aa75e8769542",
"assets/FontManifest.json": "2d21e1730f5ec7435f6c2d1e0885e4a0",
"assets/fonts/AlexBrush-Regular.ttf": "f1b1c5df2c848b6545a22cdd9d5cc167",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/fonts/Optima_Italic.ttf": "f4703e60d127fd9706f3ce95350b4c4b",
"assets/fonts/PTSans-Regular.ttf": "4ea26cd5e7f64894d6c2451446f7dda5",
"assets/NOTICES": "8b5f0b8e497484f7604f333baa4fbc5b",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "49065e38567588b5329b9ff390dc89fe",
"/": "49065e38567588b5329b9ff390dc89fe",
"main.dart.js": "4c5b8102e3af46f8008c4b80fe3106c3",
"manifest.json": "1c09b9c603040ad549f040a44be5d077",
"version.json": "99ee2f3fdfe1ed394e7582cc89704750"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
