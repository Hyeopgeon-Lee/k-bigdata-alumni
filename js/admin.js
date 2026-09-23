(function () {
  'use strict';
  const U = AlumniUI;
  let token = '', view = 'alumni', data = [];
  const st = () => U.qs('#admin-status');
  const statusBadge = value => `<span class="admin-badge admin-badge--${U.esc(String(value || '').toLowerCase())}">${U.esc(value)}</span>`;
  const contactLinks = item => {
    const email = String(item.email || ''), phone = String(item.phone || ''), parts = [];
    if (email) parts.push(`<a href="mailto:${encodeURIComponent(email)}">${U.esc(email)}</a>`);
    if (phone) parts.push(`<a href="tel:${U.esc(phone.replace(/[^0-9+]/g, ''))}">${U.esc(phone)}</a>`);
    return parts.join('<br>') || '-';
  };

  async function load() {
    U.status(st(), '관리 데이터를 불러오는 중입니다.');
    try {
      const response = await AlumniAPI.request('adminList', { method: 'POST', data: { admin_token: token, view } });
      data = response.data || [];
      U.qs('#admin-app').hidden = false;
      render();
      st().hidden = true;
    } catch (error) { U.status(st(), error.message, 'error'); }
  }

  function requestTable(rows) {
    return `<table class="admin-table admin-table--requests"><thead><tr><th>일시</th><th>대상 ID</th><th>요청자</th><th>분야/제목</th><th>상태</th></tr></thead><tbody>${rows.map(item => `<tr><td data-label="일시">${U.esc(item.created_at)}</td><td data-label="대상 ID"><small>${U.esc(item.alumni_id)}</small></td><td data-label="요청자">${U.esc(item.requester_name)} (${U.esc(item.requester_type)})</td><td data-label="분야/제목"><strong>${U.esc(item.category)}</strong><br>${U.esc(item.subject)}</td><td data-label="상태">${statusBadge(item.status)}</td></tr>`).join('')}</tbody></table>`;
  }

  function alumniTable(rows) {
    return `<table class="admin-table admin-table--alumni"><thead><tr><th>이름/ID</th><th>연락처</th><th>졸업</th><th>회사</th><th>대학원</th><th>상태</th><th>관리</th></tr></thead><tbody>${rows.map(item => `<tr><td data-label="이름/ID"><strong>${U.esc(item.name)}</strong><br><small>${U.esc(item.alumni_id)}</small></td><td data-label="연락처" class="admin-contact">${contactLinks(item)}</td><td data-label="졸업">${U.esc(item.graduation_year)}</td><td data-label="회사">${U.esc(item.company) || '-'}</td><td data-label="대학원">${U.esc(item.graduate_school) || U.esc(item.graduate_status) || '-'}</td><td data-label="상태">${statusBadge(item.status)}</td><td data-label="관리"><div class="admin-actions"><button data-id="${U.esc(item.alumni_id)}" data-action="adminApprove">승인</button><button class="button--danger" data-id="${U.esc(item.alumni_id)}" data-action="adminReject">반려</button><button class="button--ghost" data-id="${U.esc(item.alumni_id)}" data-action="adminHide">비공개</button></div></td></tr>`).join('')}</tbody></table>`;
  }

  function render() {
    const query = U.qs('#admin-query').value.toLowerCase(), status = U.qs('#admin-status-filter').value, year = U.qs('#admin-year').value;
    const rows = data.filter(item => (!query || JSON.stringify(item).toLowerCase().includes(query)) && (!status || item.status === status) && (!year || String(item.graduation_year) === year));
    U.qs('#admin-table').innerHTML = rows.length ? (view === 'requests' ? requestTable(rows) : alumniTable(rows)) : '<p class="empty">조건에 맞는 데이터가 없습니다.</p>';
  }

  document.addEventListener('DOMContentLoaded', () => {
    U.yearOptions(U.qs('#admin-year'), true);
    const client = (window.ALUMNI_CONFIG || {}).GOOGLE_CLIENT_ID;
    if (client && !client.startsWith('PASTE_')) {
      const wait = setInterval(() => {
        if (!window.google) return;
        clearInterval(wait);
        google.accounts.id.initialize({ client_id: client, callback: response => { token = response.credential; load(); } });
        google.accounts.id.renderButton(U.qs('#google-signin'), { theme: 'outline', size: 'large', text: 'signin_with', locale: 'ko' });
      }, 100);
    } else U.status(st(), 'Google OAuth Client ID가 아직 설정되지 않았습니다.', 'warning');
    U.qs('#admin-load').onclick = () => { token = U.qs('#admin-token').value.trim(); if (!token) return U.status(st(), '관리자 토큰을 입력해 주세요.', 'error'); load(); };
    U.qs('#admin-refresh').onclick = load;
    ['#admin-query', '#admin-status-filter', '#admin-year'].forEach(selector => U.qs(selector).addEventListener(selector === '#admin-query' ? 'input' : 'change', render));
    U.qsa('[data-view]').forEach(button => button.onclick = () => { view = button.dataset.view; U.qsa('[data-view]').forEach(item => item.setAttribute('aria-selected', String(item === button))); load(); });
    U.qs('#admin-table').onclick = async event => {
      const button = event.target.closest('button[data-action]');
      if (!button || !confirm('이 상태로 변경하시겠습니까?')) return;
      U.busy(button, true);
      try { await AlumniAPI.request(button.dataset.action, { method: 'POST', data: { admin_token: token, alumni_id: button.dataset.id } }); await load(); }
      catch (error) { U.status(st(), error.message, 'error'); }
      finally { U.busy(button, false); }
    };
  });
})();
