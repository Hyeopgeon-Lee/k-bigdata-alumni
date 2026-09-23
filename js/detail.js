(function () {
  'use strict';
  const U = AlumniUI;
  function row(label, value) { return value ? `<dt>${U.esc(label)}</dt><dd>${U.esc(value)}</dd>` : ''; }
  function section(title, rows) { return `<section class="form-section"><h2>${title}</h2><dl class="detail-list">${rows}</dl></section>`; }
  function webUrl(value) { try { const url = new URL(String(value || '')); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch (_) { return ''; } }
  function companyRow(company, companyUrl) {
    if (!company) return '';
    const url = webUrl(companyUrl);
    const value = url ? `<a class="detail-company-link" href="${U.esc(url)}" target="_blank" rel="noopener noreferrer">${U.esc(company)} <span aria-hidden="true">↗</span><span class="sr-only"> 새 창</span></a>` : U.esc(company);
    return `<dt>회사</dt><dd>${value}</dd>`;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const id = U.params().get('id'), st = U.qs('#detail-status'), root = U.qs('#detail');
    if (!id) return U.status(st, '잘못된 접근입니다.', 'error');
    try {
      const response = await AlumniAPI.request('detail', { params: { id } }), alumni = response.data, companyUrl = webUrl(response.data.company_url);
      let html = `<header class="panel detail-head"><h1>${U.esc(alumni.name)}</h1><p>${U.esc(alumni.graduation_year)}년 졸업</p><p>${U.esc(alumni.introduction || '')}</p></header><div class="detail-grid">`;
      html += section('취업 정보', row('현재 상태', alumni.employment_status) + companyRow(alumni.company, alumni.company_url) + row('직무', alumni.job) + row('입사연도', alumni.employment_year) + row('주요 업무', alumni.job_description) + row('주요 기술', alumni.skills));
      html += section('학사학위', row('상태', alumni.bachelor_status) + row('대학', alumni.bachelor_school) + row('전공', alumni.bachelor_major) + row('연도', alumni.bachelor_year));
      html += section('대학원', row('상태', alumni.graduate_status) + row('구분', alumni.graduate_school_type) + row('대학원', alumni.graduate_school) + row('전공', alumni.graduate_major) + row('학위과정', alumni.graduate_degree) + row('입학연도', alumni.graduate_entry_year) + row('졸업연도', alumni.graduate_graduation_year) + row('연구분야', alumni.research_fields));
      html += section('후배 상담', row('상담 가능 분야', alumni.mentoring_topics) + row('후배에게 한마디', alumni.message_to_juniors));
      html += '</div><div class="actions">';
      if (companyUrl) html += `<a class="button button--secondary" href="${U.esc(companyUrl)}" target="_blank" rel="noopener noreferrer">회사 홈페이지</a>`;
      html += alumni.contact_allowed ? `<a class="button" href="contact.html?id=${encodeURIComponent(alumni.alumni_id)}">선배에게 연락 요청</a>` : '<p>현재 연락 요청을 받지 않는 졸업생입니다.</p>';
      html += '</div>';
      root.innerHTML = html; root.hidden = false; st.hidden = true;
    } catch (error) { U.status(st, error.message, 'error'); }
  });
})();
