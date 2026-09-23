(function () {
  'use strict';
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
  document.addEventListener('DOMContentLoaded', initNav);
})();
