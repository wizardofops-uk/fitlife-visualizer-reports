if (
  'serviceWorker' in navigator &&
  !(window && (window.process || window.require)) // Not Electron
) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('ServiceWorker unregistered');
    }
  });
} 