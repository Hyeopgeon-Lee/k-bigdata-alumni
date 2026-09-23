(function () {
  'use strict';
  const cfg = window.ALUMNI_CONFIG || {};
  const configured = () => /^https:\/\/script\.google\.com\/macros\/s\//.test(cfg.API_URL || '');
  async function request(action, options = {}) {
    if (!configured()) throw new Error('서비스 API가 아직 설정되지 않았습니다. 관리자에게 문의해 주세요.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.REQUEST_TIMEOUT_MS || 15000);
    try {
      let response;
      if (options.method === 'POST') {
        response = await fetch(cfg.API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, ...options.data }),
          signal: controller.signal,
          redirect: 'follow'
        });
      } else {
        const url = new URL(cfg.API_URL);
        url.searchParams.set('action', action);
        Object.entries(options.params || {}).forEach(([k, v]) => {
          if (v !== '' && v != null) url.searchParams.set(k, v);
        });
        response = await fetch(url, { signal: controller.signal, redirect: 'follow' });
      }
      if (!response.ok) throw new Error(`서버 응답 오류 (${response.status})`);
      const result = await response.json();
      if (!result.success) throw new Error(result.message || '요청을 처리하지 못했습니다.');
      return result;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.');
      throw error;
    } finally { clearTimeout(timer); }
  }
  window.AlumniAPI = { request, configured };
})();
