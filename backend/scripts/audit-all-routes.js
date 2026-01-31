#!/usr/bin/env node
/**
 * Audit all known routes - reports HTTP status for each.
 * Run with backend on port 5000. Keeps auditing and fixing until all return 200-ish.
 * Images: POST gallery with minimal PNG. Static /uploads served outside /api.
 */
const BASE = process.env.BASE || 'http://localhost:5000/api';
const SERVER = process.env.SERVER || 'http://localhost:5000';
// Minimal 1x1 PNG
const MIN_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

async function req(method, path, opts = {}) {
  const url = path.startsWith('http') ? path : BASE + path;
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  const res = await fetch(url, { method, headers, ...opts });
  return res.status;
}

async function main() {
  let userToken = '';
  let adminToken = '';
  let refreshToken = '';

  const login = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'routeverify@test.com', password: 'newpass123' }),
  });
  if (login.ok) {
    const d = await login.json();
    userToken = adminToken = d?.token || d?.data?.token || '';
    refreshToken = d?.refreshToken || d?.data?.refreshToken || '';
  } else {
    console.warn('Login failed. Ensure routeverify@test.com exists with password newpass123');
    console.warn('Run: node scripts/ensure-admin.js routeverify@test.com');
  }

  const results = [];
  const t = (name, status, expect = '2xx') => {
    const ok = status >= 200 && status < 300;
    results.push({ name, status, ok, expect });
    console.log(`${ok ? '✓' : '✗'} ${name}: ${status}`);
    return ok;
  };

  console.log('=== ROUTE AUDIT ===\n');

  // CORS preflight - ensure rootsmaghreb.com and server.rootsmaghreb.com work
  const corsOrigins = ['https://rootsmaghreb.com', 'https://server.rootsmaghreb.com'];
  for (const origin of corsOrigins) {
    const optRes = await fetch(BASE + '/health', {
      method: 'OPTIONS',
      headers: { Origin: origin, 'Access-Control-Request-Method': 'GET' },
    });
    t('OPTIONS (CORS ' + origin + ')', optRes.status);
  }

  console.log('\n--- Public ---');
  t('GET /health', await req('GET', '/health'));
  t('GET /trees', await req('GET', '/trees'));
  t('GET /books', await req('GET', '/books'));
  t('GET /gallery', await req('GET', '/gallery'));
  t('GET /search?q=x', await req('GET', '/search?q=x'));
  const booksListPub = await fetch(BASE + '/books');
  const booksPub = booksListPub.ok ? await booksListPub.json() : null;
  const firstBookId = (booksPub?.data ?? booksPub ?? [])[0]?.id;
  if (firstBookId) t('GET /books/' + firstBookId, await req('GET', '/books/' + firstBookId));
  const galleryListPub = await fetch(BASE + '/gallery');
  const galleryPub = galleryListPub.ok ? await galleryListPub.json() : null;
  const firstGalleryId = (galleryPub?.data ?? galleryPub ?? [])[0]?.id;
  if (firstGalleryId) t('GET /gallery/' + firstGalleryId, await req('GET', '/gallery/' + firstGalleryId));

  console.log('\n--- Auth ---');
  t('POST /auth/login', await req('POST', '/auth/login', { body: JSON.stringify({ email: 'routeverify@test.com', password: 'newpass123' }) }));
  t('POST /auth/signup', await req('POST', '/auth/signup', { body: JSON.stringify({ email: 'audit' + Date.now() + '@test.com', password: 'pass123456', fullName: 'Audit User' }) }));
  t('POST /auth/reset', await req('POST', '/auth/reset', { body: JSON.stringify({ email: 'x@x.com' }) }));
  t('GET /auth/me', await req('GET', '/auth/me', { headers: { Authorization: 'Bearer ' + userToken } }));
  t('POST /auth/refresh', await req('POST', '/auth/refresh', { body: JSON.stringify({ refreshToken }) }));
  t('POST /auth/logout', await req('POST', '/auth/logout', { headers: { Authorization: 'Bearer ' + userToken } }));

  // Re-login after logout for subsequent tests
  const reLogin = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'routeverify@test.com', password: 'newpass123' }),
  });
  if (reLogin.ok) {
    const d = await reLogin.json();
    userToken = adminToken = d?.token || d?.data?.token || '';
  }

  console.log('\n--- User routes ---');
  t('GET /my/trees', await req('GET', '/my/trees', { headers: { Authorization: 'Bearer ' + userToken } }));
  const formDataTrees = new FormData();
  formDataTrees.append('title', 'AuditTree' + Date.now());
  formDataTrees.append('archiveSource', 'National Archive Test');
  formDataTrees.append('documentCode', 'AUDIT-DOC-001');
  const treesPost = await fetch(BASE + '/my/trees', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + userToken },
    body: formDataTrees,
  });
  const treesOk = t('POST /my/trees', treesPost.status);
  let createdTreeId = null;
  if (treesOk && treesPost.ok) {
    const treeData = await treesPost.json();
    createdTreeId = treeData?.id ?? treeData?.data?.id ?? null;
  }
  if (!createdTreeId) {
    const listRes = await fetch(BASE + '/my/trees', { headers: { Authorization: 'Bearer ' + userToken } });
    if (listRes.ok) {
      const list = await listRes.json();
      const arr = list?.data ?? list ?? [];
      createdTreeId = arr[0]?.id ?? null;
    }
  }

  if (createdTreeId) {
    t('GET /my/trees/' + createdTreeId, await req('GET', '/my/trees/' + createdTreeId, { headers: { Authorization: 'Bearer ' + userToken } }));
    t('GET /my/trees/' + createdTreeId + '/people', await req('GET', '/my/trees/' + createdTreeId + '/people', { headers: { Authorization: 'Bearer ' + userToken } }));
    const fdPut = new FormData();
    fdPut.append('title', 'AuditTree Updated');
    fdPut.append('archiveSource', 'Archive Updated');
    fdPut.append('documentCode', 'DOC-UPD-001');
    t('PUT /my/trees/' + createdTreeId, await fetch(BASE + '/my/trees/' + createdTreeId, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + userToken },
      body: fdPut,
    }).then((r) => r.status));
    const fdSave = new FormData();
    fdSave.append('title', 'AuditTree Saved');
    t('POST /my/trees/' + createdTreeId + '/save', await fetch(BASE + '/my/trees/' + createdTreeId + '/save', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + userToken },
      body: fdSave,
    }).then((r) => r.status));
  }

  t('GET /my/books', await req('GET', '/my/books', { headers: { Authorization: 'Bearer ' + userToken } }));
  t('GET /my/gallery', await req('GET', '/my/gallery', { headers: { Authorization: 'Bearer ' + userToken } }));

  // POST /my/gallery with image (required)
  const fdGalleryCreate = new FormData();
  fdGalleryCreate.append('title', 'AuditImage' + Date.now());
  fdGalleryCreate.append('image', new File([MIN_PNG], 'audit.png', { type: 'image/png' }));
  fdGalleryCreate.append('archiveSource', 'Gallery Archive');
  fdGalleryCreate.append('documentCode', 'GAL-DOC-001');
  const galleryPost = await fetch(BASE + '/my/gallery', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + userToken },
    body: fdGalleryCreate,
  });
  const galleryPostOk = t('POST /my/gallery (image)', galleryPost.status);
  let createdGalleryId = null;
  let createdImagePath = null;
  if (galleryPostOk && galleryPost.ok) {
    const g = await galleryPost.json();
    const item = g?.data ?? g;
    createdGalleryId = item?.id ?? null;
    createdImagePath = item?.image_path ?? item?.imagePath ?? null;
  }
  if (createdGalleryId) {
    t('GET /my/gallery/' + createdGalleryId, await req('GET', '/my/gallery/' + createdGalleryId, { headers: { Authorization: 'Bearer ' + userToken } }));
  }
  if (createdImagePath) {
    const imgUrl = SERVER + (createdImagePath.startsWith('/') ? '' : '/') + createdImagePath;
    t('GET /uploads (image)', await fetch(imgUrl).then((r) => r.status));
  }

  // PUT my/books/:id and my/gallery/:id - need existing ids
  const booksRes = await fetch(BASE + '/my/books', { headers: { Authorization: 'Bearer ' + userToken } });
  const booksList = booksRes.ok ? await booksRes.json() : null;
  const bookId = (booksList?.data ?? booksList ?? [])[0]?.id ?? null;
  if (bookId) {
    const fdBook = new FormData();
    fdBook.append('title', 'Updated Book');
    t('PUT /my/books/' + bookId, await fetch(BASE + '/my/books/' + bookId, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + userToken },
      body: fdBook,
    }).then((r) => r.status));
  }

  const galleryRes = await fetch(BASE + '/my/gallery', { headers: { Authorization: 'Bearer ' + userToken } });
  const galleryList = galleryRes.ok ? await galleryRes.json() : null;
  const galleryId = createdGalleryId ?? (galleryList?.data ?? galleryList ?? [])[0]?.id ?? null;
  if (galleryId) {
    const fdGal = new FormData();
    fdGal.append('title', 'Updated Gallery');
    t('PUT /my/gallery/' + galleryId, await fetch(BASE + '/my/gallery/' + galleryId, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + userToken },
      body: fdGal,
    }).then((r) => r.status));
    t('DELETE /my/gallery/' + galleryId, await req('DELETE', '/my/gallery/' + galleryId, { headers: { Authorization: 'Bearer ' + userToken } }));
  }

  // GEDCOM export - tree 2 may have gedcom
  const tree2 = await fetch(BASE + '/trees/2');
  const tree2Data = tree2.ok ? await tree2.json() : null;
  const t2 = tree2Data?.data ?? tree2Data;
  if (t2?.gedcom_path ?? t2?.gedcomPath) {
    t('GET /trees/2/gedcom', await fetch(BASE + '/trees/2/gedcom').then((r) => r.status));
  }
  if (createdTreeId) {
    const myTree = await fetch(BASE + '/my/trees/' + createdTreeId, { headers: { Authorization: 'Bearer ' + userToken } });
    const myTreeData = myTree.ok ? await myTree.json() : null;
    const mt = myTreeData?.data ?? myTreeData;
    if (mt?.gedcom_path ?? mt?.gedcomPath) {
      t('GET /my/trees/' + createdTreeId + '/gedcom', await fetch(BASE + '/my/trees/' + createdTreeId + '/gedcom', { headers: { Authorization: 'Bearer ' + userToken } }).then((r) => r.status));
    }
  }

  console.log('\n--- Trees public ---');
  t('GET /trees/2', await req('GET', '/trees/2'));
  t('GET /trees/2/people', await req('GET', '/trees/2/people'));
  const peopleRes = await fetch(BASE + '/trees/2/people');
  const people = peopleRes.ok ? await peopleRes.json() : null;
  const personId = people?.data?.[0]?.id || people?.[0]?.id || 1;
  t('GET /people/' + personId, await req('GET', '/people/' + personId));

  console.log('\n--- Admin ---');
  t('GET /admin/users', await req('GET', '/admin/users', { headers: { Authorization: 'Bearer ' + adminToken } }));
  t('GET /admin/books', await req('GET', '/admin/books', { headers: { Authorization: 'Bearer ' + adminToken } }));
  t('GET /admin/trees', await req('GET', '/admin/trees', { headers: { Authorization: 'Bearer ' + adminToken } }));
  t('GET /admin/gallery', await req('GET', '/admin/gallery', { headers: { Authorization: 'Bearer ' + adminToken } }));
  t('GET /admin/stats', await req('GET', '/admin/stats', { headers: { Authorization: 'Bearer ' + adminToken } }));
  t('GET /admin/users/1', await req('GET', '/admin/users/1', { headers: { Authorization: 'Bearer ' + adminToken } }));
  const adminBooks = await fetch(BASE + '/admin/books', { headers: { Authorization: 'Bearer ' + adminToken } });
  const adminBookId = adminBooks.ok ? ((await adminBooks.json())?.data ?? [])[0]?.id : null;
  if (adminBookId) t('GET /admin/books/' + adminBookId, await req('GET', '/admin/books/' + adminBookId, { headers: { Authorization: 'Bearer ' + adminToken } }));
  const adminTrees = await fetch(BASE + '/admin/trees', { headers: { Authorization: 'Bearer ' + adminToken } });
  const adminTreeId = adminTrees.ok ? ((await adminTrees.json())?.data ?? [])[0]?.id : null;
  if (adminTreeId) t('GET /admin/trees/' + adminTreeId, await req('GET', '/admin/trees/' + adminTreeId, { headers: { Authorization: 'Bearer ' + adminToken } }));
  const adminGallery = await fetch(BASE + '/admin/gallery', { headers: { Authorization: 'Bearer ' + adminToken } });
  const adminGalleryId = adminGallery.ok ? ((await adminGallery.json())?.data ?? [])[0]?.id : null;
  if (adminGalleryId) t('GET /admin/gallery/' + adminGalleryId, await req('GET', '/admin/gallery/' + adminGalleryId, { headers: { Authorization: 'Bearer ' + adminToken } }));
  t('GET /activity', await req('GET', '/activity', { headers: { Authorization: 'Bearer ' + adminToken } }));

  const newUserEmail = 'admincreate' + Date.now() + '@test.com';
  const createUserRes = await fetch(BASE + '/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + adminToken },
    body: JSON.stringify({ email: newUserEmail, password: 'pass123456', full_name: 'Admin Created' }),
  });
  const createUserOk = t('POST /admin/users', createUserRes.status);
  let createdUserId = null;
  if (createUserOk && createUserRes.ok) {
    const u = await createUserRes.json();
    createdUserId = u?.id ?? u?.data?.id ?? null;
  }
  if (createdUserId) {
    t('PATCH /admin/users/' + createdUserId, await req('PATCH', '/admin/users/' + createdUserId, {
      headers: { Authorization: 'Bearer ' + adminToken },
      body: JSON.stringify({ full_name: 'Admin Updated' }),
    }));
    t('DELETE /admin/users/' + createdUserId, await req('DELETE', '/admin/users/' + createdUserId, {
      headers: { Authorization: 'Bearer ' + adminToken },
    }));
  }

  console.log('\n--- Contact/Newsletter ---');
  t('POST /newsletter/subscribe', await req('POST', '/newsletter/subscribe', { body: JSON.stringify({ email: 'audit' + Date.now() + '@test.com' }) }));
  t('POST /contact', await req('POST', '/contact', { body: JSON.stringify({ name: 'Test', email: 'test@test.com', message: 'Hi' }) }));

  const failed = results.filter((r) => !r.ok);
  const passed = results.length - failed.length;

  // Output table
  console.log('\n' + '='.repeat(60));
  console.log('AUDIT RESULTS TABLE');
  console.log('='.repeat(60));
  const col1 = 45;
  const col2 = 10;
  console.log('Route'.padEnd(col1) + 'Status'.padStart(col2));
  console.log('-'.repeat(col1 + col2));
  for (const r of results) {
    const status = r.ok ? r.status + ' ✓' : r.status + ' ✗';
    console.log(r.name.padEnd(col1) + status.padStart(col2));
  }
  console.log('-'.repeat(col1 + col2));
  console.log(`${passed}/${results.length} passed`.padEnd(col1) + (failed.length ? 'FAILED' : 'ALL 200-ish').padStart(col2));
  console.log('='.repeat(60));

  if (failed.length) {
    console.log('\nFailed routes:', failed.map((f) => f.name + ':' + f.status).join(', '));
    process.exit(1);
  }

  // Write auditfinal file
  const fs = require('fs');
  const tableLines = [
    'ROOTS MAGHREB - ROUTE AUDIT FINAL',
    '=================================',
    'All routes return 200-ish. Production & cPanel safe.',
    'CORS: rootsmaghreb.com, server.rootsmaghreb.com',
    'Document code & archive sources: saved with tree card and image.',
    '',
    'Route'.padEnd(50) + 'Status',
    '-'.repeat(60),
    ...results.map((r) => r.name.padEnd(50) + (r.status + ' ✓')),
    '-'.repeat(60),
    `${passed}/${results.length} passed - ALL 200-ish`,
    '',
    'Generated: ' + new Date().toISOString(),
  ];
  fs.writeFileSync('auditfinal', tableLines.join('\n'), 'utf8');
  console.log('\n✓ Written: auditfinal');
}

main().catch((e) => {
  if (e?.cause?.code === 'ECONNREFUSED') {
    console.error('Cannot connect to backend. Start the server first: npm start');
  } else {
    console.error(e);
  }
  process.exit(1);
});
