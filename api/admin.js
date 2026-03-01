import { loadSubmissions, requireAdmin, saveSubmissions } from './_utils.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) {
    res.statusCode = 302;
    res.setHeader('Location', '/login?error=2');
    return res.end();
  }

  const query = req.url.split('?')[1] || '';
  const params = new URLSearchParams(query);
  const sortBy = params.get('sort') || 'recent';
  const view = params.get('view') === 'equipment' ? 'equipment' : 'expense';

  let submissions = [];
  try {
    submissions = await loadSubmissions();
    console.log('Admin page: loaded', submissions.length, 'submissions');
  } catch (err) {
    console.error('Failed to load submissions:', err);
    // Continue with empty array
  }

  submissions = submissions.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'date':
        return new Date(b.date || 0) - new Date(a.date || 0);
      case 'recent':
      default:
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    }
  });

  const expenseSubmissions = submissions.filter((s) => s.type !== 'equipment-loan');
  const equipmentSubmissions = submissions.filter((s) => s.type === 'equipment-loan');

  const totalAmount = expenseSubmissions.reduce((sum, s) => {
    const sTotal = typeof s.total === 'number'
      ? s.total
      : Array.isArray(s.items)
      ? s.items.filter(item => item && typeof item === 'object').reduce((itemSum, item) => {
          const amt = parseFloat(item.amount || 0);
          return itemSum + (isNaN(amt) ? 0 : amt);
        }, 0)
      : 0;
    return sum + sTotal;
  }, 0);

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone; // fallback
  };

  const expenseRowsHtml = expenseSubmissions
    .map((s, idx) => {
      const total =
        typeof s.total === 'number'
          ? s.total
          : Array.isArray(s.items)
          ? s.items.filter(item => item && typeof item === 'object').reduce((sum, item) => {
              const amt = parseFloat(item.amount || 0);
              return sum + (isNaN(amt) ? 0 : amt);
            }, 0)
          : 0;

      return `
        <tr data-bs-toggle="collapse" data-bs-target="#expense-details-${idx}" style="cursor: pointer;">
          <td>${s.date || ''}</td>
          <td>${s.name || ''}</td>
          <td>$${Number(total).toFixed(2)}</td>
        </tr>
        <tr class="collapse" id="expense-details-${idx}">
          <td colspan="3">
            <div class="p-3 bg-light rounded">
              <div class="d-flex justify-content-end mb-3">
                <a href="/api/pdf?id=${s.id || ''}" target="_blank" class="btn btn-outline-primary">Export as PDF</a>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <h3>Basic Information</h3>
                  <p><strong>Name:</strong> ${s.name || 'N/A'}</p>
                  <p><strong>Email:</strong> ${s.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> ${formatPhone(s.phone)}</p>
                  <p><strong>Date:</strong> ${s.date || 'N/A'}</p>
                  <p><strong>Total:</strong> $${Number(total).toFixed(2)}</p>
                  ${s.signature ? (s.signature.startsWith('data:image/') ? `<p><strong>Signature:</strong><br><img src="${s.signature}" alt="Signature" style="max-width: 300px; max-height: 150px; border: 1px solid #ccc; margin-top: 5px;"></p>` : `<p><strong>Signature:</strong> ${s.signature}</p>`) : ''}
                  ${s.signatureDate ? `<p><strong>Signature Date:</strong> ${s.signatureDate}</p>` : ''}
                  <p><strong>Submitted:</strong> ${s.timestamp ? new Date(s.timestamp).toLocaleString('en-US', { timeZone: 'America/Toronto' }) + ' Toronto' : 'N/A'}</p>
                </div>
                <div class="col-md-6">
                  <h3>Expense Items</h3>
                  ${s.items && Array.isArray(s.items) && s.items.length > 0 ? s.items.filter(item => item && typeof item === 'object').map(item => `
                    <div class="mb-2 p-2 border rounded">
                      <p class="mb-1"><strong>Description:</strong> ${item.description || 'N/A'}</p>
                      <p class="mb-1"><strong>Budget:</strong> ${item.officers || 'N/A'}</p>
                      <p class="mb-1"><strong>Budget Line:</strong> ${item.budgetLine || 'N/A'}</p>
                      <p class="mb-1"><strong>Amount:</strong> $${parseFloat(item.amount || 0).toFixed(2)}</p>
                      <p class="mb-0"><strong>Receipts:</strong> ${(item.receipts || []).map(r => `<a class="badge text-bg-secondary text-decoration-none me-1" target="_blank" href="${r.url}">${r.originalName}</a>`).join(' ') || '<span class="text-muted">None</span>'}</p>
                      ${item.notes ? `<p class="mb-0 mt-2"><strong>Notes:</strong> ${item.notes}</p>` : ''}
                    </div>
                  `).join('') : '<p class="text-muted">No items</p>'}
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  const equipmentRowsHtml = equipmentSubmissions
    .map((s, idx) => {
      const equipmentItems = Array.isArray(s.equipmentItems) && s.equipmentItems.length > 0
        ? s.equipmentItems
        : Array.isArray(s.items)
        ? s.items.map((item) => ({
            description: item?.description || 'N/A',
            quantity: Number(item?.quantity || 0)
          }))
        : [];

      const organization = s.organization === 'Other' ? (s.otherOrganization || 'Other') : (s.organization || 'N/A');
      const itemCount = equipmentItems.reduce((sum, item) => sum + (Number(item.quantity || 0) || 0), 0);

      return `
        <tr data-bs-toggle="collapse" data-bs-target="#equipment-details-${idx}" style="cursor: pointer;">
          <td>${s.startDate || s.date || ''}</td>
          <td>${s.fullName || s.name || ''}</td>
          <td>${organization}</td>
          <td>${itemCount}</td>
        </tr>
        <tr class="collapse" id="equipment-details-${idx}">
          <td colspan="4">
            <div class="p-3 bg-light rounded">
              <div class="row">
                <div class="col-md-6">
                  <h3>Borrower Information</h3>
                  <p><strong>Name:</strong> ${s.fullName || s.name || 'N/A'}</p>
                  <p><strong>Email:</strong> ${s.email || 'N/A'}</p>
                  <p><strong>Organization:</strong> ${organization}</p>
                  <p><strong>Start Date:</strong> ${s.startDate || s.date || 'N/A'}</p>
                  <p><strong>End Date:</strong> ${s.endDate || 'N/A'}</p>
                  <p><strong>Pickup Time:</strong> ${s.pickupTime || 'N/A'}</p>
                  <p><strong>Dropoff Time:</strong> ${s.dropoffTime || 'N/A'}</p>
                  <p><strong>On Campus:</strong> ${s.onCampus || 'N/A'}</p>
                  <p><strong>Needs On-Site Assistance:</strong> ${s.needsOnSiteAssistance || 'N/A'}</p>
                  <p><strong>Submitted:</strong> ${s.timestamp ? new Date(s.timestamp).toLocaleString('en-US', { timeZone: 'America/Toronto' }) + ' Toronto' : 'N/A'}</p>
                </div>
                <div class="col-md-6">
                  <h3>Request Details</h3>
                  <p><strong>Usage:</strong> ${s.equipmentUsage || 'N/A'}</p>
                  ${s.bbqPropane ? `<p><strong>BBQ Propane:</strong> ${s.bbqPropane}</p>` : ''}
                  ${s.finalComments ? `<p><strong>Final Comments:</strong> ${s.finalComments}</p>` : ''}
                  ${s.signatureData ? `<p><strong>Signature:</strong><br><img src="${s.signatureData}" alt="Signature" style="max-width: 300px; max-height: 150px; border: 1px solid #ccc; margin-top: 5px;"></p>` : ''}
                  ${s.signatureName ? `<p><strong>Signed Name:</strong> ${s.signatureName}</p>` : ''}
                  ${s.signatureDate ? `<p><strong>Signature Date:</strong> ${s.signatureDate}</p>` : ''}

                  <h4 class="mt-3">Equipment Items</h4>
                  ${equipmentItems.length > 0 ? equipmentItems.map(item => `
                    <div class="mb-2 p-2 border rounded">
                      <p class="mb-1"><strong>Item:</strong> ${item.description || 'N/A'}</p>
                      <p class="mb-0"><strong>Quantity:</strong> ${Number(item.quantity || 0)}</p>
                    </div>
                  `).join('') : '<p class="text-muted">No equipment selected</p>'}
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = 200;
  res.end(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Admin Dashboard</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="icon" href="/ess-logo.png">
    </head>
    <body class="bg-light">
      <nav class="navbar navbar-expand-lg bg-white border-bottom">
        <div class="container-fluid">
          <span class="navbar-brand fw-bold">
            <img src="/ess-logo.png" alt="ESS Logo" class="me-2" style="height: 32px;">
            Admin Dashboard
          </span>
          <div class="d-flex align-items-center gap-2">
            <a href="/" class="btn btn-outline-primary btn-sm me-2">Back to Form</a>
            ${view === 'expense' ? `<span class="text-muted">Total: $${Number(totalAmount).toFixed(2)}</span>` : `<span class="text-muted">Equipment Requests: ${equipmentSubmissions.length}</span>`}
            <a class="btn btn-outline-secondary btn-sm" href="/logout">Logout</a>
          </div>
        </div>
      </nav>

      <main class="container-fluid py-4 px-5">
        <div class="mb-3 d-flex gap-2">
          <a href="/admin?view=expense&sort=${sortBy}" class="btn ${view === 'expense' ? 'btn-primary' : 'btn-outline-primary'}">Expense Reports</a>
          <a href="/admin?view=equipment&sort=${sortBy}" class="btn ${view === 'equipment' ? 'btn-primary' : 'btn-outline-primary'}">Equipment Loans</a>
        </div>
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="row g-3 align-items-center mb-3">
              <div class="col-md-6">
                <h5 class="mb-0">${view === 'expense' ? 'Expense Submissions' : 'Equipment Loan Submissions'}</h5>
                <small class="text-muted">${view === 'expense' ? 'Search by name, email, or budget' : 'Search by name, email, organization, or details'}</small>
              </div>
              <div class="col-md-6">
                <input id="search" class="form-control" placeholder="Search..." />
              </div>
            </div>
            <div class="table-responsive">
              ${view === 'expense' ? `
                <table class="table table-striped align-middle" id="submissionsTable">
                  <thead class="table-light">
                    <tr>
                      <th>Invoice Date</th>
                      <th>Name</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${expenseRowsHtml || '<tr><td colspan="3" class="text-center text-muted">No expense submissions yet</td></tr>'}
                  </tbody>
                </table>
              ` : `
                <table class="table table-striped align-middle" id="submissionsTable">
                  <thead class="table-light">
                    <tr>
                      <th>Start Date</th>
                      <th>Name</th>
                      <th>Organization</th>
                      <th>Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${equipmentRowsHtml || '<tr><td colspan="4" class="text-center text-muted">No equipment loan submissions yet</td></tr>'}
                  </tbody>
                </table>
              `}
            </div>
          </div>
        </div>
      </main>

      <script>
        const search = document.getElementById('search');
        const table = document.getElementById('submissionsTable');
        if (search && table) {
          search.addEventListener('input', () => {
            const q = search.value.toLowerCase();
            const rows = table.tBodies[0].rows;
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              if (!row.querySelector('[data-bs-toggle="collapse"]')) continue;
              const detailRow = rows[i + 1];
              const match = row.textContent.toLowerCase().includes(q) || (detailRow && detailRow.textContent.toLowerCase().includes(q));
              row.style.display = match ? '' : 'none';
              if (detailRow && detailRow.classList.contains('collapse')) {
                detailRow.style.display = match ? '' : 'none';
              }
            }
          });
        }
      </script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `);
}
