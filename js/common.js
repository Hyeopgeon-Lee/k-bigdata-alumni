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
  function params() { return new URLSearchParams(location.search); }
  window.AlumniUI = { esc, qs, qsa, status, busy, yearOptions, params };
  document.addEventListener('DOMContentLoaded', initNav);
})();
