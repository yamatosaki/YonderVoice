// data.xlsx to data.js converter
// Usage: node build.js
// Reads data/data.xlsx (3 sheets: releases, tracks, shops), writes js/data.js

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const xlsxPath = path.join(__dirname, 'data', 'data.xlsx');

if (!fs.existsSync(xlsxPath)) {
  console.log('ERROR: data/data.xlsx not found!');
  console.log('Make sure the file exists with sheets: releases, tracks, shops');
  process.exit(1);
}

console.log('Reading data.xlsx...');
const wb = XLSX.readFile(xlsxPath);

function sheetToArray(sheetName) {
  if (!wb.SheetNames.includes(sheetName)) {
    console.log('  Sheet not found:', sheetName, '(using empty)');
    return [];
  }
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
  // Convert all values to strings
  return data.map(row => {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = String(v).trim();
    }
    return out;
  });
}

const releases = sheetToArray('releases');
const tracks = sheetToArray('tracks');
const shops = sheetToArray('shops');
const infoLines = sheetToArray('information');

function parseReleaseDate(infoValue) {
  if (!infoValue) return { date: '', year: '', event: '' };
  var firstLine = String(infoValue).split(/\r?\n/)[0].trim();
  var m = firstLine.match(/[（(]?\s*(\d{4})\.(\d{1,2})\.(\d{1,2})(?:[^）)]*)[）)]?\s*(.*)/);
  if (m) {
    return { date: m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0'), year: m[1], event: m[4].trim() };
  }
  return { date: '', year: '', event: '' };
}

const mvPreview = sheetToArray('mv_preview');
const mvMap = {};
mvPreview.forEach(function(row) {
  if (row.catalog) mvMap[row.catalog] = row;
});

const events = sheetToArray('events');

console.log('  Releases:', releases.length);
console.log('  Tracks:', tracks.length);
console.log('  Shops:', shops.length);
console.log('  Info lines:', infoLines.length);
console.log('  MV/Preview:', mvPreview.length);
console.log('  Events:', events.length);

// Build release data
const data = releases.map(r => {
  const catalog = r.catalog;

  const releaseTracks = tracks
    .filter(t => t.catalog === catalog)
    .sort((a, b) => (parseInt(a.index) || 0) - (parseInt(b.index) || 0))
    .map(t => {
      const track = { index: t.index, title: t.title };
      if (t.original) track.original = t.original;
      if (t.compose) track.compose = t.compose;
      if (t.arrange) track.arrange = t.arrange;
      if (t.lyrics) track.lyrics = t.lyrics;
      if (t.vocal) track.vocal = t.vocal;
      if (t.illustration) track.illustration = t.illustration;
      if (t.Guitar) track.guitar = t.Guitar;
      if (t.Drum) track.drum = t.Drum;
      if (t.Bass) track.bass = t.Bass;
      if (t.Piano) track.piano = t.Piano;
      if (t.extra) track.extra = t.extra;
      return track;
    });

    const releaseShops = shops
    .filter(s => s.catalog === catalog)
    .map(s => ({
      name: s.name,
      url: s.url || ''
    }));

  const releaseInfo = infoLines
    .filter(il => il.catalog === catalog)
    .map(il => ({
      label: il.label,
      value: il.value
    }));

  var releaseDateRow = releaseInfo.find(function(il) { return il.label === 'Release'; });
  var parsedDate = parseReleaseDate(releaseDateRow ? releaseDateRow.value : '');

  const mv = mvMap[catalog] || {};

  return {
    id: r.id || catalog.toLowerCase(),
    catalog: catalog,
    title: r.title || '',
    type: r.type || 'Release',
    date: r.date || parsedDate.date,
    year: r.year || parsedDate.year,
    event: r.event || parsedDate.event,
    price: r.price || '',
    emoji: r.emoji || '',
    cardColor: r.cardColor || 'linear-gradient(135deg, #1a1a2e, #16213e)',
    soundcloud: r.soundcloud || mv.preview_soundcloud || '',
    video: r.video || mv.mv_youtube || mv.mv_bilibili || '',
    video_bili: r.video_bili || mv.mv_bilibili || '',
    preview_url: r.preview_url || mv.preview_url || '',
    tagline: r.tagline || '',
    description: r.description || '',
    cover: r.cover || 'images/' + catalog + '.webp',
    credits: r.credits || '',
    shops: releaseShops,
    tracks: releaseTracks,
    info_lines: releaseInfo
  };
});

const output = 'var RELEASES_DATA = ' + JSON.stringify(data, null, 2) + ';\n' +
  'var EVENTS_DATA = ' + JSON.stringify(events, null, 2) + ';\n';

fs.writeFileSync(path.join(__dirname, 'js', 'data.js'), output, 'utf-8');
console.log('\nDone! Written to js/data.js');
console.log('Refresh your browser to see changes.');
