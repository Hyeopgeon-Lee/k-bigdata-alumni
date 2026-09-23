(function () {
  'use strict';
  if (!document.querySelector('link[href="css/jobs.css"]')) { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'css/jobs.css'; document.head.appendChild(link); }
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];
  function status(el, message, type = 'info') {
    if (!el) return;
    el.className = `status status--${type}`;
    el.textContent = message;
    el.hidden = false;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  }
  function busy(button, on, text) {
    if (!button) return;
    if (on) { button.dataset.label = button.textContent; button.textContent = text || '처리 중…'; }
    else if (button.dataset.label) button.textContent = button.dataset.label;
    button.disabled = on;
  }
  function initNav() {
    const toggle = qs('.nav-toggle'); const nav = qs('.site-nav');
    if (nav && !nav.querySelector('a[href="jobs.html"]')) {
      const link = document.createElement('a'); link.href = 'jobs.html'; link.textContent = '채용정보';
      const alumniLink = nav.querySelector('a[href="alumni.html"]'); nav.insertBefore(link, alumniLink || null);
    }
    if (nav && !nav.querySelector('a[href="news.html"]')) {
      const link = document.createElement('a'); link.href = 'news.html'; link.textContent = '동문소식';
      const alumniLink = nav.querySelector('a[href="alumni.html"]'); nav.insertBefore(link, alumniLink || null);
    }
    const consent = qs('.consent-box');
    if (consent && !qs('[name="career_mail_enabled"]')) {
      const note = consent.querySelector('.hint');
      note?.insertAdjacentHTML('beforebegin', '<label class="check"><input name="career_mail_enabled" type="checkbox">취업·채용정보 이메일 수신에 동의합니다.</label><p class="hint">취업·채용정보 이메일 수신에 동의한 경우, 승인된 신규 채용정보가 있을 때 이메일로 안내합니다. 채용정보가 없는 날에는 발송하지 않습니다.</p>');
    }
    if (consent && !qs('[name="alumni_news_mail_enabled"]')) {
      const note = consent.querySelector('.hint');
      note?.insertAdjacentHTML('beforebegin', '<label class="check"><input name="alumni_news_mail_enabled" type="checkbox">동문 경조사 및 주요 동문소식 이메일 수신에 동의합니다.</label><p class="hint">동의한 경우 결혼·득남·득녀·부고 등 경조사와 주요 동문소식을 이메일로 받아볼 수 있으며, 내 정보 수정에서 언제든지 변경할 수 있습니다.</p>');
    }
    toggle?.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open)); nav?.classList.toggle('is-open', !open);
    });
  }
  function yearOptions(select, includeAll = false) {
    if (!select) return;
    const now = new Date().getFullYear();
    const first = includeAll ? '<option value="">전체</option>' : '<option value="">선택</option>';
    select.innerHTML = first + Array.from({length: 31}, (_, i) => `<option value="${now + 1 - i}">${now + 1 - i}년</option>`).join('');
  }
  const options = Object.freeze({
    employmentStatus: ['취업 중','대학원 준비중','대학원 연구실(석사과정)','대학원 연구실(박사과정)','구직 중','미취업','기타'],
    bachelorStatus: ['재학','취득','취득 예정','미취득'],
    graduateStatus: ['진학하지 않음','진학 예정(준비중)','재학','휴학','수료','졸업'],
    graduateSchoolType: ['일반대학원','전문대학원','특수대학원'],
    graduateDegree: ['석사','박사','석박사통합']
  });
  function selectOptions(select, values, { all = false, selected = '' } = {}) {
    if (!select) return;
    const first = all ? '전체' : '선택';
    select.innerHTML = `<option value="">${first}</option>` + values.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join('');
    select.value = selected;
    if (selected) Array.from(select.options).forEach(option => { option.defaultSelected = option.value === selected; });
  }
  function params() { return new URLSearchParams(location.search); }
  window.AlumniUI = { esc, qs, qsa, status, busy, yearOptions, selectOptions, options, params };
  window.JobUI = window.JobUI || {
    dday(job) { if (job.always_open) return '상시채용'; if (!job.deadline) return '마감일 미정'; const today = new Date(); today.setHours(0,0,0,0); const days = Math.ceil((new Date(job.deadline + 'T00:00:00') - today) / 86400000); return days === 0 ? '오늘 마감' : days > 0 ? `D-${days}` : '마감'; },
    card(job) { const skills = (job.skills || []).slice(0,4).map(x => `<span class="chip">${esc(x)}</span>`).join(''); return `<article class="card job-card"><div class="job-card__flags"><span>${esc(job.recruit_type)}</span>${job.referral_available?'<strong>사내추천 가능</strong>':''}</div><h3>${esc(job.company)}</h3><p class="job-title">${esc(job.job_title)}</p><p class="meta">${esc(job.employment_type)} · ${esc(job.location||'근무지역 협의')}</p><div class="chips">${skills}</div><div class="job-card__foot"><span>${esc(this.dday(job))}</span><span>${esc(job.graduation_year)}년 졸업생 공유</span></div><a class="button" href="job-detail.html?id=${encodeURIComponent(job.job_id)}">자세히 보기</a></article>`; }
  };
  document.addEventListener('DOMContentLoaded', initNav);
})();
