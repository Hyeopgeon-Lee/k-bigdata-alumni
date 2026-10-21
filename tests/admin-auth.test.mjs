import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const source=readFileSync(new URL('../apps-script/Code.gs',import.meta.url),'utf8');
function setupTestContext(){
  const props=new Map([['ADMIN_LOGIN_PASSWORD','temporary-example-only']]);
  const cache=new Map();
  let number=0;
  const context=vm.createContext({
    console,
    LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})},
    CacheService:{getScriptCache:()=>({
      get:key=>cache.has(key)?cache.get(key):null,
      put:(key,val)=>cache.set(key,String(val)),
      remove:key=>cache.delete(key)
    })},
    PropertiesService:{getScriptProperties:()=>({
      getProperty:key=>props.get(key)||null,
      setProperties:items=>{for(const [key,val] of Object.entries(items))props.set(key,String(val))},
      deleteProperty:key=>props.delete(key)
    })},
    Utilities:{
      getUuid:()=>('00000000-0000-4000-8000-'+String(++number).padStart(12,'0')),
      DigestAlgorithm:{SHA_256:'SHA_256'},
      Charset:{UTF_8:'UTF_8'},
      computeDigest:(_method,value)=>[...createHash('sha256').update(value).digest()].map(n=>n>127?n-256:n)
    },
    UrlFetchApp:{fetch:()=>{throw new Error('Google OAuth must not be used for password session')}}
  });
  vm.runInContext(source,context);
  return {context,props,cache};
}
test('password login requires configured username and password and does not accept wrong credentials',()=>{
  const {context}=setupTestContext();
  assert.throws(()=>context.adminPasswordLogin_({adminUsername:'wrong',adminPassword:'temporary-example-only'}),/아이디 또는 비밀번호/);
  assert.throws(()=>context.adminPasswordLogin_({adminUsername:'poly',adminPassword:'wrong'}),/아이디 또는 비밀번호/);
});
test('first login migrates private bootstrap secret to salted digest',()=>{
  const {context,props}=setupTestContext();
  const r=context.routePost_('adminLogin',{adminUsername:'poly',adminPassword:'temporary-example-only'});
  assert.equal(r.success,true);
  assert.match(r.data.adminSessionToken,/^ALM_[0-9a-f]{64}$/);
  assert.equal(r.data.expiresInSeconds,21600);
  assert.equal(props.has('ADMIN_LOGIN_PASSWORD'),false);
  assert.equal(props.get('ADMIN_PASSWORD_HASH').length,64);
  assert.notEqual(props.get('ADMIN_PASSWORD_HASH'),'temporary-example-only');
  assert.ok(props.get('ADMIN_PASSWORD_SALT'));
  assert.ok(props.get('ADMIN_PASSWORD_PEPPER'));
  assert.equal(context.verifyAdmin_(r.data.adminSessionToken),'poly');
  const again=context.adminPasswordLogin_({adminUsername:'poly',adminPassword:'temporary-example-only'});
  assert.equal(context.verifyAdmin_(again.data.adminSessionToken),'poly');
  context.adminSessionLogout_({admin_token:again.data.adminSessionToken});
  assert.throws(()=>context.verifyAdmin_(again.data.adminSessionToken),/만료/);
});
test('missing session or fake token cannot authorize admin endpoints',()=>{
  const {context}=setupTestContext();
  assert.throws(()=>context.verifyAdmin_('ALM_'+'0'.repeat(64)),/만료/);
  assert.throws(()=>context.verifyAdmin_(''),/권한/);
  assert.throws(()=>context.adminList_({admin_token:'ALM_'+'0'.repeat(64),view:'alumni'}),/만료/);
});
test('five failed logins cause temporary lockout',()=>{
  const {context}=setupTestContext();
  for(let i=0;i<5;i++)assert.throws(()=>context.adminPasswordLogin_({adminUsername:'poly',adminPassword:'wrong'}),/비밀번호/);
  assert.throws(()=>context.adminPasswordLogin_({adminUsername:'poly',adminPassword:'temporary-example-only'}),/15분/);
});
test('admin UI and scripts provide password login and keep Google authentication',()=>{
  const html=readFileSync(new URL('../admin.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../js/admin.js',import.meta.url),'utf8');
  const api=readFileSync(new URL('../js/api.js',import.meta.url),'utf8');
  assert.match(html,/name="adminUsername"/);
  assert.match(html,/name="adminPassword"/);
  assert.match(html,/id="google-signin"/);
  assert.match(html,/id="admin-logout"/);
  assert.match(js,/adminLogin/);
  assert.match(js,/adminLogout/);
  assert.match(js,/sessionStorage/);
  assert.match(js,/getAdminAuthToken/);
  assert.doesNotMatch(js,/temporary-example-only/);
  assert.doesNotMatch(source,/5525/);
  assert.doesNotThrow(()=>new vm.Script(js));
  assert.doesNotThrow(()=>new vm.Script(api));
});
