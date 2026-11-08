'use strict';
/* Central de divulgação: dados oficiais quando a Open API estiver configurada.
   O app não guarda credenciais nem entra em sessões da Shopee. */
(function(){
 const el=id=>document.getElementById(id);
 const safe=u=>{try{const x=new URL(String(u||''));return ['https:','http:'].includes(x.protocol)?x.href:''}catch{return''}};
 const key='radar-real-imports-v1';
 let imports=[];try{imports=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
 if(!Array.isArray(imports))imports=[];
 let selected='';
 const official=products.filter(p=>p.id?.startsWith('shopee-') && (p.product_link||p.offer_link));
 const catalog=()=>{
  const base=official.length?official:products;
  return [...imports,...base.filter(p=>p.source?.startsWith('Shopee vitrine pública')),...base.filter(p=>!p.source?.startsWith('Shopee vitrine pública'))];
 };
 function merged(p){return {rating:0,sales:0,category:'Adicionado por você',emoji:'🛍️',commission_rate:null,...p}}
 function pick(id){
  const p=catalog().find(x=>String(x.id)===String(id));if(!p)return;
  selected=p.id;
  el('central-product').value=String(p.id);
  el('central-title').value=p.name;
  const stored=typeof savedLinks==='object'?savedLinks[p.id]:null;
  const url=safe(stored)||safe(p.offer_link)||safe(p.product_link)||'';
  el('central-link').value=url;
  const a=el('central-link-status');
  a.textContent=stored?'Link pessoal salvo neste aparelho':p.offer_link?'Link fornecido pela API de afiliados':'Ainda sem link de afiliado confirmado';
  a.style.color=url?'#155d45':'#b04b20';
  el('central-caption').value=makeCaption(merged(p));
  el('central-link-preview').textContent=url||'Link de afiliado ainda não disponível';
  el('central-detail').textContent=p.source==='Shopee Affiliate Open API'?'Oferta consultada pela API oficial. Confira preço e comissão no momento de publicar.':p.source==='Cadastro manual'?'Produto cadastrado por você; preço, vendas e link não foram verificados automaticamente.' :p.source?.startsWith('Shopee vitrine pública')?'Produto encontrado em vitrine pública da Shopee. O app ainda não identificou um anúncio específico nem um link pessoal de afiliado; confira loja, preço e comissão.':'Amostra de referência, não necessariamente o anúncio exato na Shopee.';
 }
 function makeCaption(p){
  const intro=/cozinha|organizador|tampa|moedor/i.test(p.name)?'Aquele detalhe que pode facilitar a rotina da cozinha':/moda|bolsa|carteira|presilha/i.test(p.name)?'Um acessório versátil para o dia a dia':/brinquedo|infantil|livro/i.test(p.name)?'Um achadinho para avaliar com atenção à faixa etária e aos materiais':'Um achadinho para descobrir e comparar';
  return '✨ '+intro+'!\n\n🛍️ '+p.name+'\n\n💡 Veja os detalhes, confira avaliações e compare o preço atualizado antes de comprar.\n\n🔗 '+(safe(savedLinks[p.id])||safe(p.offer_link)||'Link do produto no perfil ou mensagem')+'\n\n#AchadinhosShopee #ShopeeBrasil #Achadinhos #DicasDeCompras\n\n*Publicidade • Posso receber comissão se você comprar pelo meu link.*';
 }
 function refresh(){
  const items=catalog();
  el('central-product').innerHTML=items.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join('');
  el('central-mode').textContent=official.length?'Catálogo oficial autorizado: '+official.length+' anúncios':'Sem API conectada — exemplos ou anúncios adicionados manualmente';
  el('central-count').textContent=official.length+' ofertas da API · '+imports.length+' cadastradas manualmente';
  const order=official.length?official.slice().sort((a,b)=>(b.sales||0)-(a.sales||0)).slice(0,6):[...imports,...products.filter(p=>p.source?.startsWith('Shopee vitrine pública'))].slice(0,6);
  el('central-curated').innerHTML=order.length?order.map(p=>'<article><span class="central-badge">'+(p.source==='Cadastro manual'?'Adicionado por você':p.source?.startsWith('Shopee vitrine pública')?'Vitrine pública Shopee':'API oficial')+'</span><h3>'+esc(p.name)+'</h3><p>'+(p.sales?Number(p.sales).toLocaleString('pt-BR')+' vendas informadas · ':'')+'Preço na coleta: '+money(p.price)+'</p><button data-pick="'+esc(p.id)+'">Preparar divulgação</button></article>').join(''):'<div class="central-empty">Ainda não há ofertas verificadas pela API. Ative a integração ou cadastre um anúncio real da Shopee para preparar sua divulgação.</div>';
  pick(items.find(p=>p.id===selected)?.id||items[0]?.id||'');
 }
 function current(){return catalog().find(p=>p.id===selected)}
 function persistLinks(){
  if(typeof savedLinks==='object')localStorage.setItem('radar-my-links',JSON.stringify(savedLinks));
 }
 function currentShare(){
  const caption=el('central-caption').value.trim();
  const raw=safe(el('central-link').value);
  const extra=raw && !caption.includes(raw)?'\n\n'+raw:'';
  return caption+extra;
 }
 async function writeClip(s){
  if(window.AndroidBridge?.copyText){window.AndroidBridge.copyText(s);toast('Copiado!');return}
  await copy(s);
 }
 function openPublic(url){window.open(url,'_blank','noopener,noreferrer')}
 async function share(platform){
  const s=currentShare();
  if(!s.trim()){toast('Escolha um produto primeiro.');return}
  // native Android share sheet. No video selected or posted automatically.
  if(window.AndroidBridge?.shareText){window.AndroidBridge.shareText(s,platform);return}
  if(platform==='whatsapp'){openPublic('https://api.whatsapp.com/send?text='+encodeURIComponent(s));return}
  await writeClip(s);
  if(platform==='instagram')openPublic('https://www.instagram.com/');
  else if(platform==='tiktok')openPublic('https://www.tiktok.com/upload');
  else if(platform==='facebook')openPublic('https://www.facebook.com/');
  else if(platform==='telegram')openPublic('https://t.me/share/url?url='+encodeURIComponent(safe(el('central-link').value)||'https://shopee.com.br/')+'&text='+encodeURIComponent(s));
  else if(navigator.share){try{await navigator.share({title:el('central-title').value,text:s})}catch{}}
  else toast('Texto copiado. Abra a rede e selecione seu vídeo.');
 }
 function addImport(){
  const name=el('central-add-name').value.trim().slice(0,160);
  const url=safe(el('central-add-url').value.trim());
  const val=el('central-add-price').value;
  if(name.length<5){toast('Informe o título do anúncio (mínimo 5 letras).');return}
  if(!url || !['shopee.com.br','www.shopee.com.br','s.shopee.com.br','shopee.com','www.shopee.com'].includes(new URL(url).hostname.toLowerCase())) {toast('Cole um link válido da Shopee.');return}
  const id='manual-'+Date.now();
  const p={id,name,price:Math.max(0,Number(val)||0),sales:0,rating:0,emoji:'🛍️',category:'Adicionado por você',source:'Cadastro manual',product_link:url,offer_link:''};
  imports.unshift(p);imports=imports.slice(0,80);localStorage.setItem(key,JSON.stringify(imports));
  el('central-add-name').value='';el('central-add-url').value='';el('central-add-price').value='';
  selected=id;refresh();toast('Anúncio salvo. Cadastre seu link pessoal para rastrear comissões.');
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const box=el('tab-central');if(!box)return;
  refresh();
  el('central-product').addEventListener('change',e=>pick(e.target.value));
  el('central-curated').addEventListener('click',e=>{const b=e.target.closest('[data-pick]');if(b)pick(b.dataset.pick)});
  el('central-save-link').onclick=()=>{
   const p=current();if(!p)return;
   const url=safe(el('central-link').value.trim());if(!url){toast('Cole primeiro um link válido.');return}
   savedLinks[p.id]=url;persistLinks();pick(p.id);toast('Link salvo neste aparelho. Confira se é seu link de afiliado.');
  };
  el('central-copy').onclick=()=>writeClip(currentShare());
  el('central-copy-script').onclick=()=>{
   const p=current();if(!p)return;const s=strategyFor(merged(p));
   writeClip([p.name,...s.hooks,...s.steps].join('\n\n'));
  };
  el('central-add').onclick=addImport;
  el('central-open-shop').onclick=()=>openPublic('https://affiliate.shopee.com.br/');
  el('central-open-product').onclick=()=>{const p=current();if(p)openPublic(safe(p.product_link)||safe(p.offer_link)||'https://shopee.com.br/search?keyword='+encodeURIComponent(p.name))};
  document.querySelectorAll('[data-share]').forEach(b=>b.onclick=()=>share(b.dataset.share));
  el('central-link').addEventListener('input',e=>{const u=safe(e.target.value);el('central-link-preview').textContent=u||'Link de afiliado ainda não disponível';});
  el('central-upload-video').addEventListener('change',e=>{
   const f=e.target.files?.[0];
   el('central-video-status').textContent=f?'Vídeo selecionado: '+f.name+'. Compartilhamento do vídeo não é automático; selecione-o quando a rede social abrir.':'Nenhum vídeo selecionado.';
  });
 });
})();