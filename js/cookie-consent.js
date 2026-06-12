(function () {
  if (localStorage.getItem('vovu_cookies_accepted')) return;

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.style.cssText = [
    'position:fixed',
    'bottom:0',
    'left:0',
    'right:0',
    'background:#013E37',
    'padding:16px 24px',
    'z-index:9998',
    'display:flex',
    'align-items:center',
    'justify-content:space-between',
    'gap:16px',
    'flex-wrap:wrap'
  ].join(';');

  banner.innerHTML =
    '<p style="font-family:system-ui;font-size:13px;color:rgba(255,239,179,0.8);margin:0;flex:1;min-width:200px;">' +
      'Vovu uses essential cookies for authentication only. No tracking. No advertising. ' +
      '<a href="./privacidad.html" style="color:#FFEFB3;text-decoration:underline;">Privacy policy</a>' +
    '</p>' +
    '<button id="cookie-accept-btn" style="background:#FFEFB3;color:#013E37;border:none;padding:10px 20px;border-radius:8px;font-family:system-ui;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;">Got it</button>';

  document.body.appendChild(banner);

  document.getElementById('cookie-accept-btn').addEventListener('click', function () {
    localStorage.setItem('vovu_cookies_accepted', 'true');
    banner.style.display = 'none';
  });
})();
