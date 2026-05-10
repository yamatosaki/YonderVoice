// ===== Scroll Reveal Animation =====
var _revealObserver;

function initReveal() {
  if (!_revealObserver) {
    _revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  }

  document.querySelectorAll('.reveal:not([data-reveal-observed])').forEach(el => {
    el.dataset.revealObserved = '1';
    _revealObserver.observe(el);
  });
}

function setAnnounceText(element, html) {
  if (!element) return;
  element.innerHTML = html;
  element.classList.remove('announce-track');
  void element.offsetWidth;
  element.classList.add('announce-track');
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch];
  });
}

function sanitizeUrl(value) {
  var url = String(value == null ? '' : value).trim();
  if (!url) return '';
  try {
    var parsed = new URL(url, window.location.href);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'mailto:') {
      return parsed.href;
    }
  } catch (e) {}
  return '';
}

function safeBackground(value) {
  var bg = String(value == null ? '' : value).trim();
  if (!bg || /[;{}]/.test(bg) || /url\s*\(/i.test(bg)) {
    return 'linear-gradient(135deg, #1a1a2e, #16213e)';
  }
  return bg;
}

function renderSiteChrome() {
  document.querySelectorAll('[data-site-intro]').forEach(function(container) {
    container.outerHTML = '' +
      '<div class="intro-overlay" id="intro-overlay">' +
        '<div class="intro-left">' +
          '<div class="intro-bar" id="intro-bar"></div>' +
          '<div class="intro-percent" id="intro-percent">0%</div>' +
        '</div>' +
        '<div class="intro-right">' +
          '<div class="intro-logo-portal">' +
            '<img src="images/LOGO.webp" alt="Yonder Voice">' +
          '</div>' +
          '<div class="intro-welcome">' +
            '<h2>Welcome to Yonder Voice</h2>' +
          '</div>' +
        '</div>' +
        '<button class="intro-skip" id="intro-skip">SKIP</button>' +
      '</div>';
  });
  document.body.classList.add('ready');

  document.querySelectorAll('[data-site-nav]').forEach(function(container) {
    container.outerHTML = '' +
      '<nav id="navbar">' +
        '<div class="nav-inner">' +
          '<ul class="nav-links">' +
            '<li><a href="index.html" class="nav-logo"><img src="images/LOGO.webp" alt="Yonder Voice" class="nav-logo-img"></a></li>' +
            '<li><a href="index.html">INDEX</a></li>' +
            '<li><a href="works.html?page=discography">DISCOGRAPHY</a></li>' +
            '<li><a href="works.html?page=events">EVENT/LIVE</a></li>' +
            '<li class="nav-hide"><a href="works.html?page=about">ABOUT</a></li>' +
            '<li class="nav-hide"><a href="guidelines.html">GUIDELINES</a></li>' +
            '<li class="nav-hide"><a href="works.html?page=contact">CONTACT</a></li>' +
          '</ul>' +
          '<button class="nav-menu-btn" id="nav-menu-btn">' +
            '☰' +
            '<div class="nav-dropdown" id="nav-dropdown">' +
              '<a href="index.html">INDEX</a>' +
              '<a href="works.html?page=discography">DISCOGRAPHY</a>' +
              '<a href="works.html?page=events">EVENT/LIVE</a>' +
              '<a href="works.html?page=about">ABOUT</a>' +
              '<a href="guidelines.html">GUIDELINES</a>' +
              '<a href="works.html?page=contact">CONTACT</a>' +
            '</div>' +
          '</button>' +
        '</div>' +
      '</nav>';
  });
}

function formatHeroDate(date) {
  return date ? String(date).replace(/-/g, '.') : '';
}

// ===== Navbar Hide/Show on Scroll =====
function initNavbar() {
  let lastScroll = 0;
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 200) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    lastScroll = current;
  });
}

// ===== Parallax Floating Orbs =====
function initParallax() {
  var ticking = false;
  window.addEventListener('mousemove', function(e) {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      var x = (e.clientX / window.innerWidth - 0.5) * 30;
      var y = (e.clientY / window.innerHeight - 0.5) * 30;
      var orb1 = document.querySelector('.orb-1');
      var orb2 = document.querySelector('.orb-2');
      if (orb1) orb1.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      if (orb2) orb2.style.transform = 'translate(' + (-x * 0.6) + 'px, ' + (-y * 0.6) + 'px)';
      ticking = false;
    });
  });
}

// ===== Load Releases =====
function getNonDemoReleases() {
  var releases = typeof RELEASES_DATA !== 'undefined' ? RELEASES_DATA : [];
  return releases.filter(function(r) { return r.type !== 'DEMO'; });
}

function isOtherReleaseType(type) {
  return type !== 'Album' && type !== 'Single';
}

function loadReleases(filterType) {
  var releases = typeof RELEASES_DATA !== 'undefined' ? RELEASES_DATA : [];
  var nonDemo = getNonDemoReleases();

  // Latest Release (skip DEMO)
  var latest = nonDemo.slice(0, 1);
  renderLatestDetail(latest[0]);

  // Past Releases (the rest)
  var past = releases.slice(1);
  if (filterType && filterType !== 'all') {
    past = past.filter(function(r) {
      return filterType === 'Other' ? isOtherReleaseType(r.type) : r.type === filterType;
    });
  }
  renderReleaseCards(past, 'release-grid');
}

function renderReleaseCards(releases, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = releases.map(r => `
    <a href="release.html?id=${encodeURIComponent(r.id || '')}" class="release-card reveal">
      <div class="release-card-image" style="background: ${safeBackground(r.cardColor)};">
        ${r.cover ? `<img src="${escapeHtml(r.cover)}" alt="${escapeHtml(r.title)}" loading="lazy" onerror="this.style.display='none'">` : escapeHtml(r.emoji || '🎵')}
      </div>
      <div class="release-card-body">
        <div class="release-card-tag">${escapeHtml(r.type)}${r.year ? ' · ' + escapeHtml(r.year) : ''}</div>
        <div class="release-card-title">${escapeHtml(r.title)}</div>
      </div>
    </a>
  `).join('');

  // Re-observe new elements
  initReveal();
}

function renderLatestDetail(r) {
  var container = document.getElementById('latest-detail');
  if (!container || !r) return;
  var latestMeta = (r.type || '') + (r.year ? ' · ' + r.year : '');

  var tracksHtml = '';
  if (r.tracks && r.tracks.length > 0) {
    tracksHtml = '<ul class="latest-tracks">' +
      r.tracks.map(function(t) {
        return '<li>' + (t.index ? escapeHtml(t.index) + '. ' : '') + escapeHtml(t.title) + '</li>';
      }).join('') +
    '</ul>';
  }

  var html = '<div class="latest-layout reveal">' +
    '<div class="latest-cover">' +
      (r.cover
        ? '<img src="' + escapeHtml(r.cover) + '" alt="' + escapeHtml(r.title) + '" loading="lazy" onerror="this.style.display=\'none\'">'
        : '<div class="latest-cover-placeholder" style="background:' + safeBackground(r.cardColor) + ';"><span>' + escapeHtml(r.emoji || '🎵') + '</span></div>'
      ) +
    '</div>' +
    '<div class="latest-info">' +
      '<div class="latest-meta">' + escapeHtml(latestMeta) + '</div>' +
      '<h2 class="latest-title">' + escapeHtml(r.title) + '</h2>' +
      (r.tagline ? '<p class="latest-tagline">' + escapeHtml(r.tagline) + '</p>' : '') +
      tracksHtml +
      '<a href="release.html?id=' + encodeURIComponent(r.id || '') + '" class="latest-more">View Details &rarr;</a>' +
    '</div>' +
  '</div>';

  container.innerHTML = html;
  initReveal();
}

// ===== Load Release Detail =====
function loadReleaseDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('release-detail-content');
  if (!id) {
    if (container) container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:4rem;">Release not found.</p>';
    return;
  }

  var releases = typeof RELEASES_DATA !== 'undefined' ? RELEASES_DATA : [];
  var release = releases.find(function(r) { return r.id === id; });
  if (release) renderReleaseDetail(release);
  else if (container) container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:4rem;">Release not found.</p>';
}

function renderReleaseDetail(r) {
  document.title = (r.title || 'Release') + ' - Yonder Voice';

  const container = document.getElementById('release-detail-content');
  if (!container) return;

  let html = '';

  // Title - centered (above cover)
  html += `
    <div style="text-align:center;">
      <h1 class="reveal reveal-delay-1">${escapeHtml(r.title)}</h1>
    </div>
  `;

  // Tagline - centered
  if (r.tagline) {
    html += `<p class="reveal reveal-delay-1" style="text-align:center;font-size:1.35rem;color:var(--text);margin:0.5rem 0 1rem;font-style:italic;">${escapeHtml(r.tagline)}</p>`;
  }

  // Description
  if (r.description) {
    var desc = r.description
      .replace(/\r\n\t/g, ' ')
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ');
    html += `<div class="desc reveal reveal-delay-2">${escapeHtml(desc)}</div>`;
  }

  // Cover
  if (r.cover) {
    html += `<img src="${escapeHtml(r.cover)}" alt="${escapeHtml(r.title)}" class="release-detail-cover reveal" loading="lazy" onerror="this.style.display='none'">`;
  }

  // Video embed
  var videoSources = [];
  if (r.video) {
    var ytMatch = r.video.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    var biMatch = r.video.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
    if (ytMatch) {
      videoSources.push({ label: 'YouTube', html: '<iframe src="https://www.youtube.com/embed/' + ytMatch[1] + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' });
    } else if (biMatch) {
      videoSources.push({ label: 'Bilibili', html: '<iframe src="https://player.bilibili.com/player.html?bvid=' + biMatch[1] + '&autoplay=0" frameborder="0" allowfullscreen></iframe>' });
    }
  }
  if (r.video_bili && r.video_bili !== r.video) {
    var biMatch2 = r.video_bili.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
    if (biMatch2) {
      videoSources.push({ label: 'Bilibili', html: '<iframe src="https://player.bilibili.com/player.html?bvid=' + biMatch2[1] + '" frameborder="0" allowfullscreen></iframe>' });
    }
  }
  if (videoSources.length > 0) {
    html += '<h2 style="margin:2rem 0 0.5rem;font-size:0.75em;" class="reveal reveal-delay-2">MV</h2>';
    html += '<div class="video-embed reveal reveal-delay-2" id="video-container-' + r.id + '">';
    if (videoSources.length > 1) {
      html += '<div class="video-switch">';
      videoSources.forEach(function(vs, i) {
        html += '<button class="video-switch-btn' + (i === 0 ? ' active' : '') + '" data-video-index="' + i + '">' + escapeHtml(vs.label) + '</button>';
      });
      html += '</div>';
    }
    html += '<div class="video-embed-inner" id="video-inner-' + r.id + '">' + videoSources[0].html + '</div>';
    html += '</div>';
  }

  // SoundCloud
  if (r.soundcloud) {
    html += '<h2 style="margin:2rem 0 0.5rem;font-size:0.75em;" class="reveal reveal-delay-3">Preview</h2>';
    html += `
      <div class="soundcloud-embed reveal reveal-delay-3">
        <iframe scrolling="no" frameborder="no"
          src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${encodeURIComponent(r.soundcloud)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false"
          allow="autoplay">
        </iframe>
      </div>
    `;
  }

  // Tracklist
  if (r.tracks && r.tracks.length > 0) {
    html += '<h2 style="margin:3rem 0 1rem;font-size:0.75em;" class="reveal reveal-delay-3">Track &amp; Staff</h2>';
    html += '<ul class="track-list">';
    r.tracks.forEach((track, i) => {
      var staffHtml = '';
      if (track.compose) staffHtml += '<div class="info-row"><div class="info-label">Compose:</div><div class="info-value">' + escapeHtml(track.compose) + '</div></div>';
      if (track.arrange) staffHtml += '<div class="info-row"><div class="info-label">Arrange:</div><div class="info-value">' + escapeHtml(track.arrange) + '</div></div>';
      if (track.lyrics) staffHtml += '<div class="info-row"><div class="info-label">Lyrics:</div><div class="info-value">' + escapeHtml(track.lyrics) + '</div></div>';
      if (track.vocal) staffHtml += '<div class="info-row"><div class="info-label">Vocal:</div><div class="info-value">' + escapeHtml(track.vocal) + '</div></div>';
      if (track.illustration) staffHtml += '<div class="info-row"><div class="info-label">Illustration:</div><div class="info-value">' + escapeHtml(track.illustration) + '</div></div>';
      if (track.guitar) staffHtml += '<div class="info-row"><div class="info-label">Guitar:</div><div class="info-value">' + escapeHtml(track.guitar) + '</div></div>';
      if (track.drum) staffHtml += '<div class="info-row"><div class="info-label">Drum:</div><div class="info-value">' + escapeHtml(track.drum) + '</div></div>';
      if (track.bass) staffHtml += '<div class="info-row"><div class="info-label">Bass:</div><div class="info-value">' + escapeHtml(track.bass) + '</div></div>';
      if (track.piano) staffHtml += '<div class="info-row"><div class="info-label">Piano:</div><div class="info-value">' + escapeHtml(track.piano) + '</div></div>';
      if (track.extra) staffHtml += '<div class="info-row"><div class="info-label">Extra:</div><div class="info-value">' + escapeHtml(track.extra) + '</div></div>';

      html += `
        <li class="track-item reveal reveal-delay-${Math.min(i+3, 4)}">
          <h4>${track.index ? escapeHtml(track.index) + '. ' : ''}${escapeHtml(track.title)}</h4>
          ${track.original ? '<div class="track-original"><div class="info-row"><div class="info-label">Original:</div><div class="info-value">' + escapeHtml(track.original).split('、').join('<br>') + '</div></div></div>' : ''}
          ${staffHtml ? '<div class="track-staff">' + staffHtml + '</div>' : ''}
        </li>
      `;
    });
    // Credits at bottom of tracklist
    if (r.credits) {
      var creditsHtml = r.credits.split(' / ').map(function(line) {
        var m = line.match(/^([^:]+):\s*(.*)/);
        if (m) return '<div class="info-row"><div class="info-label">' + escapeHtml(m[1]) + ':</div><div class="info-value">' + escapeHtml(m[2]) + '</div></div>';
        return '<div class="info-value">' + escapeHtml(line) + '</div>';
      }).join('');
      html += '<li class="track-item reveal reveal-delay-4" style="border-color:rgba(255,107,157,0.15);"><div class="track-staff">' + creditsHtml + '</div></li>';
    }
    html += '</ul>';
  }

  // Information section
  var infoLines = r.info_lines && r.info_lines.length > 0 ? r.info_lines : [];
  if (infoLines.length === 0 && r.title) {
    infoLines = [];
    if (r.title) infoLines.push({ label: 'Name', value: r.title });
    if (r.type) infoLines.push({ label: 'Type', value: r.type });
    infoLines.push({ label: 'Producer', value: 'Yonder Voice' });
    if (r.event) {
      var releaseVal = '';
      if (r.date) releaseVal += '(' + r.date.split('-').join('.') + ') ';
      releaseVal += r.event;
      infoLines.push({ label: 'Release', value: releaseVal });
    }
    if (r.price) infoLines.push({ label: 'Event Price', value: r.price });
    if (r.catalog) infoLines.push({ label: 'Catalog', value: r.catalog });
    if (r.tagline) infoLines.push({ label: 'Tagline', value: r.tagline });
  }
  if (infoLines.length > 0) {
    html += '<h2 style="margin:3rem 0 1rem;font-size:0.75em;" class="reveal reveal-delay-3">Information</h2>';
    html += '<div class="release-info-box reveal reveal-delay-3">';
    infoLines.forEach(function(line) {
      if (line.label === 'Release' && line.value.indexOf('(202') > -1) {
        var parts = line.value.split(/(?=\(\d{4}\.\d{2}\.\d{2}\))/).filter(function(p) { return p.trim(); }).map(function(p) { return p.trim().replace(/\r\n/g, ' ').replace(/\n/g, ' '); });
        html += '<div class="info-row"><div class="info-label">' + escapeHtml(line.label) + ':</div>';
        html += '<div class="info-value">' + parts.map(escapeHtml).join('<br>') + '</div></div>';
      } else {
        html += '<div class="info-row"><div class="info-label">' + (line.label ? escapeHtml(line.label) + ':' : '') + '</div>';
        html += '<div class="info-value">' + escapeHtml(line.value).replace(/\r\n/g, '<br>').replace(/\n/g, '<br>') + '</div></div>';
      }
    });
    html += '</div>';
  }

  // Shop links - only show those with URLs
    var validShops = (r.shops || []).map(function(s) {
      return { name: s.name, url: sanitizeUrl(s.url) };
    }).filter(function(s) { return s.url; });
  if (validShops.length > 0) {
    html += '<h2 style="margin:3rem 0 1rem;font-size:0.75em;" class="reveal reveal-delay-3">Shop</h2>';
    html += '<div class="shop-box reveal reveal-delay-3">';
    validShops.forEach(function(shop) {
      html += `<a href="${escapeHtml(shop.url)}" class="shop-link" target="_blank" rel="noopener">${escapeHtml(shop.name)}</a>`;
    });
    html += '</div>';
  }

  container.innerHTML = html;
  initReveal();
}

// ===== Load Events =====
var _eventsAll = [];
var _eventsPage = 0;
var _eventsPerPage = 20;

function renderEventItem(e, i) {
  var weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var dateFull = '';
  var weekStr = '';
  if (e.date && e.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    var d = new Date(e.date);
    dateFull = d.getFullYear() + '<span>.</span>' + (d.getMonth() + 1) + '<span>.</span>' + d.getDate();
    weekStr = weekDays[d.getDay()];
  } else {
    dateFull = 'TBA';
  }

  return '<div class="timeline-item reveal' + (i === 0 ? ' timeline-first' : '') + '">' +
    '<div class="timeline-dot"></div>' +
    '<div class="timeline-card">' +
      '<div class="timeline-date">' +
        '<div class="timeline-date-big">' + dateFull + '</div>' +
        (weekStr ? '<div class="timeline-week">' + weekStr + '</div>' : '') +
      '</div>' +
      '<div class="timeline-body">' +
        '<h4>' + escapeHtml(e.event_name || '') + '</h4>' +
        '<p>' + escapeHtml((e.location || '') + (e.booth ? ' · ' + e.booth : '')) + '</p>' +
      '</div>' +
      (e.status ? '<span class="timeline-tag">' + escapeHtml(e.status) + '</span>' : '') +
    '</div>' +
  '</div>';
}

function loadEvents() {
  var events = typeof EVENTS_DATA !== 'undefined' ? EVENTS_DATA : [];
  var container = document.getElementById('event-list');
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No upcoming events.</p>';
    return;
  }

  events.sort(function(a, b) {
    if (a.date === 'TBA' && b.date !== 'TBA') return 1;
    if (b.date === 'TBA' && a.date !== 'TBA') return -1;
    if (a.date === 'TBA' && b.date === 'TBA') return 0;
    return b.date.localeCompare(a.date);
  });

  _eventsAll = events;

  // Phase 1: show first 5 + MORE button
  var firstBatch = events.slice(0, 5);
  container.innerHTML = '<div class="timeline">' +
    firstBatch.map(function(e, i) { return renderEventItem(e, i); }).join('') +
  '</div>';

  var moreWrapper = document.getElementById('event-more-wrapper');
  if (moreWrapper) moreWrapper.style.display = 'block';
  var moreBtn = document.getElementById('event-more-btn');
  if (moreBtn && !moreBtn.dataset.bound) {
    moreBtn.dataset.bound = '1';
    moreBtn.addEventListener('click', showFullEvents);
  }

  var paginationEl = document.getElementById('event-pagination');
  if (paginationEl) paginationEl.style.display = 'none';

  // Update announce marquee
  var marquee = document.getElementById('announce-marquee');
  if (marquee && events.length > 0) {
    var e = events[0];
    var dateStr = '';
    if (e.date && e.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      var d = new Date(e.date);
      dateStr = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ';
    }
    setAnnounceText(marquee, 'Upcoming Events / Lives &#9670; ' + escapeHtml(dateStr + (e.event_name || '') + (e.booth ? ' ' + e.booth : '')) + ' &#9670;');
  }

  initReveal();
}

function showFullEvents() {
  var moreWrapper = document.getElementById('event-more-wrapper');
  if (moreWrapper) moreWrapper.style.display = 'none';

  _eventsPage = 0;
  goToPage(0);
}

window.showFullEvents = showFullEvents;

function initMobileNav() {
  var navInner = document.querySelector('.nav-inner');
  if (!navInner) return;

  var btn = document.getElementById('nav-menu-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'nav-menu-btn';
    btn.className = 'nav-menu-btn';
    btn.textContent = '☰';
    navInner.appendChild(btn);
  }

  var dd = document.getElementById('nav-dropdown');
  if (!dd) {
    dd = document.createElement('div');
    dd.id = 'nav-dropdown';
    dd.className = 'nav-dropdown';
    btn.appendChild(dd);
  }

  var links = document.querySelectorAll('.nav-links li:not(:first-child) a');
  dd.innerHTML = '';
  links.forEach(function(a) {
    var clone = document.createElement('a');
    clone.href = a.getAttribute('href');
    clone.textContent = a.textContent;
    dd.appendChild(clone);
  });

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    dd.classList.toggle('open');
  });
}

document.addEventListener('click', function(e) {
  var btn = document.getElementById('nav-menu-btn');
  var dd = document.getElementById('nav-dropdown');
  if (btn && dd && !btn.contains(e.target)) {
    dd.classList.remove('open');
  }
});

function goToPage(page) {
  _eventsPage = page;
  var start = page * _eventsPerPage;
  var batch = _eventsAll.slice(start, start + _eventsPerPage);
  var totalPages = Math.ceil(_eventsAll.length / _eventsPerPage);

  var container = document.getElementById('event-list');
  if (container) {
    container.innerHTML = '<div class="timeline">' +
      batch.map(function(e, i) { return renderEventItem(e, i); }).join('') +
    '</div>';
  }

  renderPagination(page, totalPages);
  initReveal();
}

window.goToPage = goToPage;

function renderPagination(page, totalPages) {
  var paginationEl = document.getElementById('event-pagination');
  if (!paginationEl) return;
  if (totalPages <= 1) {
    paginationEl.style.display = 'none';
    return;
  }

  paginationEl.style.display = 'flex';

  var html = '';

  // Previous
  html += '<button class="page-btn' + (page === 0 ? ' disabled' : '') + '" ' +
    (page === 0 ? 'disabled' : 'data-page="' + (page - 1) + '"') + '>&#10094; Prev</button>';

  // Page numbers
  var startPage = Math.max(0, page - 2);
  var endPage = Math.min(totalPages - 1, startPage + 4);
  if (endPage - startPage < 4) startPage = Math.max(0, endPage - 4);

  if (startPage > 0) html += '<span class="page-dots">...</span>';

  for (var i = startPage; i <= endPage; i++) {
    html += '<button class="page-btn page-num' + (i === page ? ' active' : '') + '" ' +
      'data-page="' + i + '">' + (i + 1) + '</button>';
  }

  if (endPage < totalPages - 1) html += '<span class="page-dots">...</span>';

  // Next
  html += '<button class="page-btn' + (page >= totalPages - 1 ? ' disabled' : '') + '" ' +
    (page >= totalPages - 1 ? 'disabled' : 'data-page="' + (page + 1) + '"') + '>Next &#10095;</button>';

  // Total info
  html += '<span class="page-info">' + _eventsAll.length + ' events</span>';

  paginationEl.innerHTML = html;
  paginationEl.querySelectorAll('[data-page]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      goToPage(parseInt(btn.getAttribute('data-page'), 10));
    });
  });
}

function initFilterTabs() {
  var tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      loadReleases(tab.getAttribute('data-filter'));
    });
  });
}

// ===== Tab Navigation =====
function initTabNavigation() {
  var tabs = document.querySelectorAll('.nav-tab');
  var sections = document.querySelectorAll('.page-section');

  function showPage(page) {
    sections.forEach(function(s) {
      if (s.getAttribute('data-page') === page) {
        s.classList.add('visible');
      } else {
        s.classList.remove('visible');
      }
    });
    tabs.forEach(function(t) {
      if (t.getAttribute('data-page') === page) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
    // Trigger reveal animation for newly visible section
    setTimeout(function() {
      document.querySelectorAll('.page-section.visible .reveal').forEach(function(el) {
        el.classList.add('visible');
      });
    }, 50);
  }

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      var page = tab.getAttribute('data-page');
      showPage(page);
      // Update URL
      if (history.pushState) {
        history.pushState(null, '', '?page=' + page);
      }
    });
  });

  // Check URL param on load
  var params = new URLSearchParams(window.location.search);
  var startPage = params.get('page') || 'discography';
  showPage(startPage);
}

// ===== Video Switcher =====
function switchVideo(releaseId, idx) {
  var release = (typeof RELEASES_DATA !== 'undefined' ? RELEASES_DATA : []).find(function(r) { return r.id === releaseId; });
  if (!release) return;
  var videoSources = [];
  if (release.video) {
    var ytMatch = release.video.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    var biMatch = release.video.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
    if (ytMatch) videoSources.push({ html: '<iframe src="https://www.youtube.com/embed/' + ytMatch[1] + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' });
    else if (biMatch) videoSources.push({ html: '<iframe src="https://player.bilibili.com/player.html?bvid=' + biMatch[1] + '" frameborder="0" allowfullscreen></iframe>' });
  }
  if (release.video_bili && release.video_bili !== release.video) {
    var biMatch2 = release.video_bili.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
    if (biMatch2) videoSources.push({ html: '<iframe src="https://player.bilibili.com/player.html?bvid=' + biMatch2[1] + '" frameborder="0" allowfullscreen></iframe>' });
  }
  if (idx < 0 || idx >= videoSources.length) return;
  var inner = document.getElementById('video-inner-' + releaseId);
  if (inner) inner.innerHTML = videoSources[idx].html;
  var btns = document.querySelectorAll('#video-container-' + releaseId + ' .video-switch-btn');
  btns.forEach(function(b, i) { b.classList.toggle('active', i === idx); });
}
window.switchVideo = switchVideo;

// ===== Intro =====
function initIntro() {
  var overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  var skipBtn = document.getElementById('intro-skip');
  var introBar = document.getElementById('intro-bar');
  var introPct = document.getElementById('intro-percent');

  function getIntroSeen() {
    try {
      return sessionStorage.getItem('yv_intro_seen') === '1';
    } catch (e) {
      return false;
    }
  }

  function setIntroSeen() {
    try {
      sessionStorage.setItem('yv_intro_seen', '1');
    } catch (e) {}
  }

  function hideIntro() {
    if (overlay) {
      overlay.classList.add('hide');
      setTimeout(function() { if (overlay) overlay.style.display = 'none'; }, 600);
    }
    setIntroSeen();
  }

  // Already seen this session
  if (getIntroSeen()) {
    overlay.style.display = 'none';
    return;
  }

  if (skipBtn) skipBtn.addEventListener('click', hideIntro);

  var startTime = 0;
  var duration = 2800;
  var lastPct = -1;

  function frame(now) {
    if (!startTime) startTime = now;
    var elapsed = now - startTime;
    var pct = Math.min(100, Math.round((elapsed / duration) * 100));
    if (pct !== lastPct) {
      lastPct = pct;
      if (introBar) introBar.style.width = pct + '%';
      if (introPct) introPct.textContent = pct + '%';
    }
    if (pct >= 100) {
      if (introPct) introPct.textContent = 'Welcome';
      setTimeout(hideIntro, 500);
      return;
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function applyHeroImage(section, path) {
  section.classList.add('hero-contain-media');
  section.style.backgroundImage = 'url(' + path + ')';
  section.style.backgroundSize = 'cover';
  section.style.backgroundPosition = 'center';
  section.style.setProperty('--hero-mobile-image', 'url(' + getHeroCssImagePath(path) + ')');
  var image = section.querySelector('.hero-image');
  if (image) image.src = path;
}



function getHeroImagePath(catalog) {
  return 'images/hero-video/' + catalog.toLowerCase() + '-INDEX.webp';
}

function getHeroCssImagePath(path) {
  return '../' + path;
}

function getHeroImageCandidates(catalog) {
  var originalPath = 'images/hero-video/' + catalog + '-INDEX.webp';
  var lowerPath = getHeroImagePath(catalog);
  var originalJpgPath = 'images/hero-video/' + catalog + '-INDEX.jpg';
  var lowerJpgPath = 'images/hero-video/' + catalog.toLowerCase() + '-INDEX.jpg';
  var candidates = originalPath === lowerPath ? [lowerPath] : [originalPath, lowerPath];
  candidates.push(originalJpgPath);
  if (originalJpgPath !== lowerJpgPath) candidates.push(lowerJpgPath);
  return candidates;
}

// ===== Hero Media =====
function initImageHero() {
  var section = document.getElementById('hero-section-0');
  if (!section) return;

  var releases = getNonDemoReleases();
  var album = releases.length > 0 ? releases[0] : null;
  if (!album) return;

  tryHeroImage(section, album.catalog, album.cover, album.cardColor);
}

// ===== Dynamic REM Scaling =====
function initDynamicRem() {
  function handleResize() {
    var innerWidth = window.innerWidth;
    var innerHeight = window.innerHeight;
    var baseFontSize = 16;

    if (innerHeight >= innerWidth) {
      var designW = 750, designH = 1334;
      if (innerWidth / innerHeight > designW / designH) {
        baseFontSize *= innerHeight / designH;
      } else {
        baseFontSize *= innerWidth / designW;
      }
    } else {
      var designW = 1920, designH = 1080;
      if (innerWidth / innerHeight > designW / designH) {
        baseFontSize *= innerHeight / designH;
      } else {
        baseFontSize *= innerWidth / designW;
      }
    }

    document.documentElement.style.fontSize = baseFontSize + 'px';
  }

  handleResize();
  var timer;
  window.addEventListener('resize', function() {
    clearTimeout(timer);
    timer = setTimeout(handleResize, 100);
  });
}

// ===== Hero Album Info =====
function initHeroAlbumInfo() {
  var releases = getNonDemoReleases();
  var album = releases.length > 0 ? releases[0] : null;
  if (!album) return;

  var titleEl = document.getElementById('hero-album-title');
  var metaEl = document.getElementById('hero-album-meta');
  var dateEl = document.getElementById('hero-album-date');
  var btnEl = document.getElementById('hero-album-btn');

  if (titleEl) titleEl.textContent = album.title;
  if (metaEl) metaEl.textContent = 'New Releases';

  if (dateEl) dateEl.textContent = formatHeroDate(album.date);
  if (dateEl && !dateEl.textContent) {
    dateEl.style.display = 'none';
  }
  if (btnEl) btnEl.href = 'release.html?id=' + album.id;

  // Action buttons
  var mvBtn = document.getElementById('hero-action-mv');
  var previewBtn = document.getElementById('hero-action-preview');
  if (album.video) {
    var mvUrl = sanitizeUrl(album.video);
    if (mvBtn && mvUrl) mvBtn.href = mvUrl;
    else if (mvBtn) mvBtn.style.display = 'none';
  } else {
    if (mvBtn) mvBtn.style.display = 'none';
  }
  if (album.preview_url) {
    if (previewBtn) previewBtn.href = album.preview_url;
  } else {
    if (previewBtn) previewBtn.style.display = 'none';
  }
  // Shop dropdown
  var shopMenu = document.getElementById('hero-shop-menu');
  if (shopMenu && album.shops) {
    var validShops = album.shops.map(function(s) {
      return { name: s.name, url: sanitizeUrl(s.url) };
    }).filter(function(s) { return s.url; });
    shopMenu.innerHTML = validShops.map(function(s) {
      return '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.name) + '</a>';
    }).join('');
  }
}

// ===== Init Hero Sections 2-4 =====
function initHeroSections() {
  var releases = getNonDemoReleases();
  var latest = releases.slice(1, 4);
  var wrapper = document.getElementById('page-wrapper');
  if (!wrapper || latest.length === 0) return;

  latest.forEach(function(album, idx) {
    var section = document.createElement('section');
    section.className = 'hero-section hero-bg-section';
    section.id = 'hero-section-' + (idx + 1);

    var dateStr = formatHeroDate(album.date);

    var overlayHTML =
      '<div class="hero-overlay">' +
        '<div class="hero-album-info">' +
          '<h1 class="hero-album-title">' + escapeHtml(album.title) + '</h1>' +
          '<div class="hero-album-meta">Past Releases</div>' +
          (dateStr ? '<div class="hero-album-date">' + escapeHtml(dateStr) + '</div>' : '') +
          '<a class="hero-album-btn" href="release.html?id=' + encodeURIComponent(album.id || '') + '">' +
            '<span>View Details</span>' +
            '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M6 3l6 5-6 5V3z" fill="currentColor"/></svg>' +
          '</a>' +
        '</div>' +
      '</div>' +
      '<div class="hero-actions">' +
        (album.video ?
          '<a class="hero-action-btn" href="' + sanitizeUrl(album.video) + '" target="_blank" rel="noopener">' +
            '<svg width="14" height="14" viewBox="0 0 14 14"><polygon points="3,1 13,7 3,13" fill="currentColor"/></svg>' +
            '<span>MV</span>' +
          '</a>' : '') +
        (album.preview_url ?
          '<a class="hero-action-btn" href="' + album.preview_url + '" target="_blank" rel="noopener">' +
            '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="3" width="2" height="8" rx="0.5" fill="currentColor"/><rect x="5.5" y="1" width="2" height="12" rx="0.5" fill="currentColor"/><rect x="9" y="4" width="2" height="6" rx="0.5" fill="currentColor"/></svg>' +
            '<span>Preview</span>' +
          '</a>' : '') +
        '<div class="hero-action-dropdown">' +
          '<span class="hero-action-btn hero-action-trigger">' +
            '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 3l1.5 4h7L12 3H2zm1.5 4L2 10h10l-1.5-3" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="10" cy="12" r="1" fill="currentColor"/></svg>' +
            '<span>Shop</span>' +
          '</span>' +
          '<div class="hero-shop-menu">' +
            (album.shops || []).map(function(s){return { name: s.name, url: sanitizeUrl(s.url) };}).filter(function(s){return s.url;}).map(function(s){
              return '<a href="'+escapeHtml(s.url)+'" target="_blank" rel="noopener">'+escapeHtml(s.name)+'</a>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>';

    wrapper.appendChild(section);
    section.innerHTML = '<img class="hero-image" alt="' + escapeHtml(album.title) + '">' + overlayHTML;
    tryHeroImage(section, album.catalog, album.cover, album.cardColor);
  });

  var hintLeft = document.createElement('div');
  hintLeft.className = 'hero-scroll-hint hero-scroll-left';
  hintLeft.innerHTML = '❮';
  wrapper.appendChild(hintLeft);

  var hintRight = document.createElement('div');
  hintRight.className = 'hero-scroll-hint hero-scroll-right';
  hintRight.innerHTML = '❯';
  wrapper.appendChild(hintRight);

  hintLeft.addEventListener('click', function() {
    if (wrapper.scrollLeft <= 10) {
      wrapper.scrollTo({ left: wrapper.scrollWidth - wrapper.clientWidth, behavior: 'smooth' });
    } else {
      wrapper.scrollBy({ left: -wrapper.clientWidth, behavior: 'smooth' });
    }
  });
  hintRight.addEventListener('click', function() {
    var maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    if (wrapper.scrollLeft >= maxScroll - 10) {
      wrapper.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      wrapper.scrollBy({ left: wrapper.clientWidth, behavior: 'smooth' });
    }
  });

  wrapper.addEventListener('scroll', function() {
    var maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    var left = wrapper.scrollLeft;
    hintLeft.style.opacity = Math.min(1, left / 120);
    hintRight.style.opacity = Math.min(1, (maxScroll - left) / 120);
  });

  document.addEventListener('wheel', function(e) {
    var wrapper = document.getElementById('page-wrapper');
    if (!wrapper) return;
    e.preventDefault();
    var maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    var newLeft = wrapper.scrollLeft + e.deltaY;
    if (newLeft > maxScroll) newLeft = 0;
    if (newLeft < 0) newLeft = maxScroll;
    wrapper.scrollLeft = newLeft;
  }, { passive: false });

  var autoScroll = setInterval(function() {
    var maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    var next = wrapper.scrollLeft + wrapper.clientWidth;
    if (next >= maxScroll) {
      wrapper.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      wrapper.scrollTo({ left: next, behavior: 'smooth' });
    }
  }, 10000);

  wrapper.addEventListener('wheel', function() {
    clearInterval(autoScroll);
  }, { once: true });

  document.addEventListener('click', function(e) {
    var trigger = e.target.closest('.hero-action-trigger');
    if (trigger) {
      e.preventDefault();
      var menu = trigger.parentElement.querySelector('.hero-shop-menu');
      if (menu) menu.classList.toggle('open');
      return;
    }
    var isTrigger = e.target.closest('.hero-action-dropdown');
    if (!isTrigger) {
      document.querySelectorAll('.hero-shop-menu.open').forEach(function(m) {
        m.classList.remove('open');
      });
    }
  });
}

function tryHeroImage(section, catalog, fallbackCover, fallbackColor) {
  var imageCandidates = getHeroImageCandidates(catalog);
  var imageCandidateIndex = 0;

  function tryFallback() {
    if (fallbackCover) {
      applyHeroImage(section, fallbackCover);
    } else if (fallbackColor) {
      section.style.background = fallbackColor;
    }
  }

  function tryNextHeroImage() {
    if (imageCandidateIndex >= imageCandidates.length) {
      tryFallback();
      return;
    }

    var path = imageCandidates[imageCandidateIndex];
    imageCandidateIndex += 1;

    var img = new Image();
    img.onload = function() {
      applyHeroImage(section, path);
    };
    img.onerror = tryNextHeroImage;
    img.src = path;
  }

  tryNextHeroImage();
}

function initHomePage() {
  initImageHero();
  initHeroAlbumInfo();
  initHeroSections();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  renderSiteChrome();
  initDynamicRem();
  initMobileNav();
  initIntro();
  initNavbar();
  initParallax();
  initReveal();
  initTabNavigation();
  loadReleases();
  loadEvents();
  initFilterTabs();
  initHomePage();
});
