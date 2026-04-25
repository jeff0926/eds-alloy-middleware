// alloy-init.js
// Loads Adobe Alloy from CDN and points it at our local capture middleware
// instead of the Adobe Edge Network. This is the AEP-less pattern: no Datastream,
// no Org ID, no real Adobe credentials. Our middleware accepts XDM payloads
// directly and returns the minimal Edge Network response shape Alloy expects.

(function (n, o) {
  o.forEach(function (m) { n[m] = function () { (n.__alloyNS = n.__alloyNS || []).push({ m: m, args: arguments }); }; });
})(window, ["alloy"]);

// Standard Alloy configure call — points at our middleware.
// In production (live *.aem.page), replace edgeDomain with the public middleware URL.
window.alloy("configure", {
  datastreamId: "local-dev-stream",   // placeholder; middleware does not validate
  edgeDomain: "localhost:3000",       // points Alloy at our capture middleware
  edgeBasePath: "collect",            // POSTs to /collect
  orgId: "00000000000000000000000@AdobeOrg", // placeholder
  defaultConsent: "in",
  debugEnabled: true
});

// Fire a pageView event on load
window.alloy("sendEvent", {
  xdm: {
    eventType: "web.webpagedetails.pageViews",
    web: {
      webPageDetails: {
        name: document.title,
        URL: location.href
      }
    }
  }
});
