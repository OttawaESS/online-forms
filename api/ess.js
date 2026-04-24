import dotenv from 'dotenv';
import { requireESS, loadProfile, saveProfile, searchProfiles, parseFormBody } from './_utils.js';

dotenv.config();

function renderPortal(searchQuery = '', profiles = [], selectedProfile = null, message = '') {
  const profileList = profiles.map(profile => `
    <tr>
      <td>${profile.name || 'N/A'}</td>
      <td>${profile.email || 'N/A'}</td>
      <td>${profile.rfid || 'N/A'}</td>
      <td>
        <form method="GET" style="display: inline;">
          <input type="hidden" name="view" value="${profile.id}" />
          <button type="submit" class="btn btn-sm btn-outline-primary">View</button>
        </form>
      </td>
    </tr>
  `).join('');

  const profileDetails = selectedProfile ? `
    <div class="card mt-4">
      <div class="card-header">
        <h5>Profile Details</h5>
      </div>
      <div class="card-body">
        <form method="POST" class="mb-4">
          <input type="hidden" name="action" value="update" />
          <input type="hidden" name="profileId" value="${selectedProfile.id}" />
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="name" class="form-label">Name</label>
              <input type="text" class="form-control" id="name" name="name" value="${selectedProfile.name || ''}" />
            </div>
            <div class="col-md-6 mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" id="email" name="email" value="${selectedProfile.email || ''}" />
            </div>
            <div class="col-md-6 mb-3">
              <label for="phone" class="form-label">Phone</label>
              <input type="text" class="form-control" id="phone" name="phone" value="${selectedProfile.phone || ''}" />
            </div>
            <div class="col-md-6 mb-3">
              <label for="rfid" class="form-label">RFID</label>
              <input type="text" class="form-control" id="rfid" name="rfid" value="${selectedProfile.rfid || ''}" />
            </div>
          </div>
          <button type="submit" class="btn btn-secondary">Update Profile</button>
        </form>

        <h6>Notes:</h6>
        <ul>
          ${(selectedProfile.notes || []).map(note => `<li>${note.note} (${new Date(note.date).toLocaleDateString()})</li>`).join('')}
        </ul>
        <form method="POST">
          <input type="hidden" name="action" value="addNote" />
          <input type="hidden" name="profileId" value="${selectedProfile.id}" />
          <div class="mb-3">
            <label for="note" class="form-label">Add Note</label>
            <textarea class="form-control" id="note" name="note" rows="3" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Add Note</button>
        </form>
      </div>
    </div>
  ` : '';

  return `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>ESS Officer Portal</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light">
      <div class="container-fluid p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>ESS Officer Portal</h2>
          <a href="/ess-logout" class="btn btn-outline-danger">Logout</a>
        </div>

        ${message ? `<div class="alert alert-info">${message}</div>` : ''}

        <div class="card">
          <div class="card-header">
            <h5>Search Profiles</h5>
          </div>
          <div class="card-body">
            <form method="GET" class="d-flex">
              <input type="text" name="search" class="form-control me-2" placeholder="Search by name, email, or RFID" value="${searchQuery}" />
              <button type="submit" class="btn btn-primary">Search</button>
            </form>
          </div>
        </div>

        ${profiles.length > 0 ? `
          <div class="card mt-4">
            <div class="card-header">
              <h5>Search Results</h5>
            </div>
            <div class="card-body">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>RFID</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${profileList}
                </tbody>
              </table>
            </div>
          </div>
        ` : searchQuery ? `
          <div class="alert alert-warning mt-4">No profiles found matching "${searchQuery}"</div>
        ` : ''}

        ${profileDetails}
      </div>
    </body>
    </html>
  `;
}

export default async function handler(req, res) {
  if (!requireESS(req, res)) {
    res.statusCode = 302;
    res.setHeader('Location', '/ess-login?error=2');
    return res.end();
  }

  if (req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const searchQuery = url.searchParams.get('search') || '';
    const viewId = url.searchParams.get('view');
    const message = url.searchParams.get('message') || '';

    let profiles = [];
    let selectedProfile = null;

    if (viewId) {
      selectedProfile = await loadProfile(viewId);
    } else if (searchQuery) {
      profiles = await searchProfiles(searchQuery);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    return res.end(renderPortal(searchQuery, profiles, selectedProfile, message));
  }

  if (req.method === 'POST') {
    const body = await parseFormBody(req);
    const profileId = body.profileId;
    const action = body.action || 'addNote';

    if (!profileId) {
      res.statusCode = 400;
      return res.end('Profile ID required');
    }

    let profile = await loadProfile(profileId);
    if (!profile) {
      res.statusCode = 404;
      return res.end('Profile not found');
    }

    if (action === 'update') {
      profile.name = body.name || profile.name;
      profile.email = body.email || profile.email;
      profile.phone = body.phone || profile.phone;
      profile.rfid = body.rfid || profile.rfid;
      await saveProfile(profile);
      res.statusCode = 302;
      res.setHeader('Location', `/ess?view=${profileId}&message=Profile updated successfully`);
      return res.end();
    } else if (action === 'addNote') {
      const note = body.note;
      if (!note) {
        res.statusCode = 400;
        return res.end('Note required');
      }

      if (!profile.notes) profile.notes = [];
      profile.notes.push({
        note: note,
        date: new Date().toISOString()
      });

      await saveProfile(profile);

      // Redirect back to view the profile
      res.statusCode = 302;
      res.setHeader('Location', `/ess?view=${profileId}&message=Note added successfully`);
      return res.end();
    }

    res.statusCode = 400;
    return res.end('Invalid action');
  }

  res.statusCode = 405;
  return res.end('Method Not Allowed');
}