// Mesma configuração pública já usada por protocol-sync.js. Nenhuma chave administrativa.
export const config = Object.freeze({ url:'https://mbnlnqtuwmukizbezmug.supabase.co', key:'sb_publishable_iCGm-bMY0Z5coie6kHUtLQ_48b7nciY' });
let client;
export function getClient(){
  if(!globalThis.supabase?.createClient) throw new Error('sdk_unavailable');
  client ??= globalThis.supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'delectus:commercial-auth:v1',flowType:'implicit'}});
  return client;
}
export function returnUrl(recovery=false){const url=new URL('./',location.href);url.search=recovery?'?recovery=1':'';url.hash='';return url.href;}
export function errorMessage(error){
  switch(error?.code){
    case 'invalid_credentials':return 'E-mail ou senha não reconhecidos.';
    case 'email_not_confirmed':return 'Confirme seu e-mail para acessar.';
    case 'weak_password':return 'Escolha uma senha mais forte, com pelo menos 8 caracteres.';
    case 'same_password':return 'Escolha uma senha diferente da anterior.';
    case 'over_request_rate_limit':case 'over_email_send_rate_limit':return 'Aguarde alguns instantes e tente novamente.';
    case 'user_already_exists':case 'email_exists':return 'Verifique seu e-mail ou use a recuperação de acesso.';
    default:return 'Não foi possível concluir a solicitação. Tente novamente.';
  }
}
