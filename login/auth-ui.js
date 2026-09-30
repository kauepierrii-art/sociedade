import {getClient,returnUrl,errorMessage} from './auth.js';
const $=id=>document.getElementById(id), form=$('auth-form'), fields=$('fields'), message=$('message');
let mode='login',busy=false,session=null,recovery=new URLSearchParams(location.search).has('recovery')||new URLSearchParams(location.hash.slice(1)).get('type')==='recovery';
const titles={login:'ENTRAR',signup:'CRIAR ACESSO',recover:'RECUPERAR ACESSO',reset:'DEFINIR NOVA SENHA'};
const labels={login:'ENTRAR',signup:'CRIAR ACESSO',recover:'ENVIAR INSTRUÇÕES',reset:'SALVAR NOVA SENHA'};
function notify(text='',error=false){message.textContent=text;message.className=error?'error':'';}
function loading(value){busy=value;fields.disabled=value;document.querySelectorAll('button').forEach(b=>b.disabled=value);form.setAttribute('aria-busy',String(value));}
function show(next,focus=false){
  mode=next;form.reset();notify();$('session-view').hidden=true;form.hidden=false;$('auth-nav').hidden=false;
  $('auth-title').textContent=titles[next];$('submit').textContent=labels[next];
  $('email-field').hidden=next==='reset';$('email').required=next!=='reset';
  $('password-field').hidden=next==='recover';$('password').required=next!=='recover';
  $('confirm-field').hidden=!['signup','reset'].includes(next);$('confirm').required=['signup','reset'].includes(next);
  $('password').autocomplete=next==='login'?'current-password':'new-password';
  $('password-help').hidden=!['signup','reset'].includes(next);
  document.querySelectorAll('[data-mode]').forEach(b=>b.hidden=next==='login'?b.dataset.mode==='login':b.dataset.mode!=='login');
  if(focus) $('auth-title').focus();
}
function active(confirmed=false){
  form.reset();form.hidden=true;$('auth-nav').hidden=true;$('session-view').hidden=false;
  $('auth-title').textContent=confirmed?'ACESSO RECONHECIDO':'SESSÃO ATIVA';
  $('session-email').textContent=session?.user?.email||'';
  $('session-copy').textContent=confirmed?'Sua sessão foi restaurada.':'';
  $('continue').hidden=confirmed;notify();
}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{if(!busy)show(b.dataset.mode,true);}));
$('continue').addEventListener('click',()=>active(true));
$('logout').addEventListener('click',async()=>{if(busy)return;loading(true);try{const {error}=await getClient().auth.signOut({scope:'local'});if(error)throw error;session=null;recovery=false;show('login');}catch(error){notify(errorMessage(error),true);}finally{loading(false);}});
form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;notify();
  const email=$('email').value.trim(),password=$('password').value;
  if((mode!=='reset'&&(!email||!$('email').validity.valid))||(mode!=='recover'&&!password)){notify('Verifique os dados informados.',true);return;}
  if(['signup','reset'].includes(mode)&&(password.length<8||password!==$('confirm').value)){notify(password.length<8?'Use uma senha com pelo menos 8 caracteres.':'As senhas não coincidem.',true);return;}
  loading(true);
  try{
    const auth=getClient().auth;let result;
    if(mode==='login'){result=await auth.signInWithPassword({email,password});if(result.error)throw result.error;session=result.data.session;active(true);}
    else if(mode==='signup'){result=await auth.signUp({email,password,options:{emailRedirectTo:returnUrl()}});if(result.error)throw result.error;session=result.data.session;if(session)active(true);else{form.reset();notify('Verifique seu e-mail para confirmar o acesso. Se já possui cadastro, entre ou recupere sua senha.');}}
    else if(mode==='recover'){result=await auth.resetPasswordForEmail(email,{redirectTo:returnUrl(true)});if(result.error)throw result.error;form.reset();notify('Se houver um acesso associado, você receberá as instruções por e-mail.');}
    else {if(!session){notify('Link inválido ou expirado. Solicite novas instruções.',true);return;}result=await auth.updateUser({password});if(result.error)throw result.error;recovery=false;history.replaceState(null,'',returnUrl());active(true);notify('Senha atualizada.');}
  }catch(error){notify(errorMessage(error),true);}finally{$('password').value='';$('confirm').value='';loading(false);}
});
async function initialize(){
  loading(true);
  try{
    const auth=getClient().auth;
    auth.onAuthStateChange((event,next)=>{session=next;if(event==='PASSWORD_RECOVERY'){recovery=true;show('reset');}else if(!busy){if(next&&!recovery)active();else if(!next&&event==='SIGNED_OUT')show('login');}});
    const {data,error}=await auth.getSession();if(error)throw error;session=data.session;
    const linkError=new URLSearchParams(location.hash.slice(1)).has('error');
    history.replaceState(null,'',returnUrl(recovery));
    if(recovery&&session)show('reset');else if(session)active();else{show('login');if(recovery||linkError)notify('Link inválido ou expirado. Solicite novas instruções.',true);}
  }catch(error){show('login');notify(errorMessage(error),true);}finally{loading(false);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
