(function(){
  'use strict';
  const U=AlumniUI;
  function row(k,v){return v!==''&&v!==undefined?`<dt>${U.esc(k)}</dt><dd>${U.esc(v)}</dd>`:''}
  function shareContent(j){
    const lines=['[BigData Alumni 채용정보]',j.company,j.job_title,`${j.recruit_type} · ${j.employment_type} · ${j.location||'근무지역 협의'}`,j.always_open?'상시채용':`마감 ${j.deadline} (${JobUI.dday(j)})`];
    if((j.skills||[]).length)lines.push(`주요 기술: ${j.skills.join(' · ')}`);
    if(j.referral_available)lines.push('사내추천 가능');
    if(j.alumni_comment)lines.push('',`선배의 한마디: ${j.alumni_comment}`);
    lines.push('',`공식 채용공고: ${j.job_url}`);
    return lines.join('\n');
  }
  function bindShare(root,j){
    const text=shareContent(j),notice=U.qs('#job-share-status');
    U.qs('#job-copy').onclick=async()=>{try{await U.copyText(`${text}\n\n${location.href}`);notice.textContent='게시글 내용과 링크를 복사했습니다.'}catch(e){notice.textContent=e.message}};
    U.qs('#job-share').onclick=async()=>{try{const result=await U.shareText({title:`${j.company} ${j.job_title} 채용정보`,text,url:location.href});notice.textContent=result==='copied'?'공유 기능을 지원하지 않아 게시글 내용을 복사했습니다.':'공유할 앱을 선택해 주세요.'}catch(e){if(e.name!=='AbortError')notice.textContent='공유하지 못했습니다. 내용 복사 버튼을 이용해 주세요.'}};
  }
  document.addEventListener('DOMContentLoaded',async()=>{
    const id=U.params().get('id'),st=U.qs('#job-detail-status'),root=U.qs('#job-detail');
    if(!id)return U.status(st,'잘못된 접근입니다.','error');
    try{
      const j=(await AlumniAPI.request('jobDetail',{params:{id}})).data;
      root.innerHTML=`<header class="panel detail-head"><div class="job-card__flags"><span>${U.esc(j.recruit_type)}</span>${j.referral_available?'<strong>사내추천 가능</strong>':''}</div><h1>${U.esc(j.company)}</h1><p class="job-detail-title">${U.esc(j.job_title)}</p></header><div class="detail-grid"><section class="form-section"><h2>채용 정보</h2><dl class="detail-list">${row('채용 구분',j.recruit_type)}${row('고용 형태',j.employment_type)}${row('근무지역',j.location||'협의')}${row('마감일',j.always_open?'상시채용':`${j.deadline} (${JobUI.dday(j)})`)}${row('필요 기술',(j.skills||[]).join(' · '))}${row('사내추천',j.referral_available?'가능':'일반 채용정보')}</dl><div class="actions"><a class="button" href="${U.esc(j.job_url)}" target="_blank" rel="noopener noreferrer">공식 채용공고 보기 ↗</a></div></section><section class="form-section alumni-quote"><h2>선배의 한마디</h2><blockquote>${U.esc(j.alumni_comment||'지원 전 공식 채용공고의 세부 내용을 확인해 주세요.')}</blockquote></section></div><section class="panel share-panel"><h2>채용정보 공유</h2><p>네이버 밴드 등 원하는 앱으로 공유하거나, 게시글 내용을 복사해 붙여넣을 수 있습니다.</p><div class="actions"><button id="job-share" type="button">공유하기</button><button id="job-copy" class="button--secondary" type="button">내용 복사</button></div><p id="job-share-status" class="hint" role="status" aria-live="polite"></p></section><section class="panel sharer"><h2>이 채용정보를 알려준 선배</h2><h3>${U.esc(j.alumni_name)}</h3><p>${U.esc(j.graduation_year)}년 졸업${j.alumni_job?' · '+U.esc(j.alumni_job):''}</p><div class="actions"><a class="button button--secondary" href="detail.html?id=${encodeURIComponent(j.alumni_id)}">선배 프로필 보기</a>${j.contact_allowed?`<a class="button" href="contact.html?id=${encodeURIComponent(j.alumni_id)}&job_id=${encodeURIComponent(j.job_id)}">이 채용에 대해 선배에게 문의하기</a>`:''}</div></section>`;
      root.hidden=false;st.hidden=true;bindShare(root,j);
    }catch(e){U.status(st,e.message,'error')}
  });
})();
