if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/setup_pwa/static/src/sw.js').then((reg)=> console.log("Service worker registerd: ",reg)).catch((err)=> console.log("Service Worker not Register: ",err))
}