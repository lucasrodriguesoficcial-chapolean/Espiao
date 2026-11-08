#!/usr/bin/env python3
"""Atualização do Radar Shopee pela Affiliate Open API autorizada."""
import datetime as dt
import hashlib
import json
import os
import pathlib
import sys
import time
import urllib.request
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parent
APP_ID = os.environ.get("SHOPEE_APP_ID", "").strip()
APP_SECRET = os.environ.get("SHOPEE_APP_SECRET", "").strip()
URL = "https://open-api.affiliate.shopee.com.br/graphql"
KEYWORDS = [
 ("organizador cozinha","Casa & cozinha","🧺"),
 ("utensílios cozinha","Casa & cozinha","🍳"),
 ("limpeza casa","Casa & cozinha","🧽"),
 ("maquiagem","Beleza & bem-estar","💄"),
 ("bolsa feminina","Moda & acessórios","👜"),
 ("roupa feminina","Moda & acessórios","👗"),
 ("brinquedo educativo","Bebê & família","🧸"),
 ("bebê","Bebê & família","👶"),
 ("gato","Pets","🐈"),
 ("cachorro","Pets","🐕"),
 ("celular acessórios","Tecnologia","📱"),
 ("fones bluetooth","Tecnologia","🎧"),
 ("papelaria","Papelaria","📝"),
 ("academia","Esporte & lazer","🏃")
]
QUERY = """query Radar($keyword:String!,$page:Int!,$limit:Int!){
 productOfferV2(keyword:$keyword,page:$page,limit:$limit){
 nodes{itemId productName priceMin sales ratingStar commissionRate offerLink}
 pageInfo{hasNextPage}
 }}"""

def request(query,variables):
 body=json.dumps({"query":query,"variables":variables},separators=(",",":"),ensure_ascii=False).encode()
 stamp=str(int(time.time()))
 signature=hashlib.sha256(APP_ID.encode()+stamp.encode()+body+APP_SECRET.encode()).hexdigest()
 headers={"Content-Type":"application/json","Authorization":f"SHA256 Credential={APP_ID}, Timestamp={stamp}, Signature={signature}","User-Agent":"RadarShopee/1.0"}
 req=urllib.request.Request(URL,data=body,headers=headers,method="POST")
 with urllib.request.urlopen(req,timeout=35) as resp:
  result=json.load(resp)
 if result.get("errors"):
  raise RuntimeError(str(result["errors"])[:800])
 return result.get("data") or {}

def number(x,default=0):
 try:return float(x)
 except (ValueError,TypeError):return default

def safe_url(x):
 s=str(x or "")
 return s if s.startswith(("https://","http://")) else ""

def main():
 if not APP_ID or not APP_SECRET:
  raise RuntimeError("Cadastre SHOPEE_APP_ID e SHOPEE_APP_SECRET nos Secrets do repositório")
 destination=ROOT/"data"/"products.json"
 prior=json.loads(destination.read_text(encoding="utf-8"))
 old={p["id"]:p for p in prior.get("products",[])}
 found={}
 for keyword,category,emoji in KEYWORDS:
  print("Consultando",keyword,flush=True)
  for page in (1,2):
   data=request(QUERY,{"keyword":keyword,"page":page,"limit":40})
   group=data.get("productOfferV2") or {}
   nodes=group.get("nodes") or []
   for item in nodes:
    item_id=str(item.get("itemId") or "")
    name=str(item.get("productName") or "")
    if not item_id or not name:continue
    key="shopee-"+item_id
    rate=item.get("commissionRate")
    rate=None if rate is None else number(rate)
    if rate is not None and rate>1:rate/=100
    product={
      "id":key,"name":name,"category":category,
      "price":round(max(0,number(item.get("priceMin"))),2),
      "sales":max(0,int(number(item.get("sales")))),
      "rating":max(0,min(5,number(item.get("ratingStar")))),
      "commission_rate":rate,"commission_value":None,
      "image_url":"","emoji":emoji,
      "offer_link":safe_url(item.get("offerLink")),
      "product_link":"","source_url":"https://affiliate.shopee.com.br/",
      "last_sales":old.get(key,{}).get("sales"),
      "source":"Shopee Affiliate Open API"
    }
    if key not in found or product["sales"]>found[key]["sales"]:
     found[key]=product
   time.sleep(1)
   if not nodes or not (group.get("pageInfo") or {}).get("hasNextPage"):break
 products=sorted(found.values(),key=lambda x:x["sales"],reverse=True)[:200]
 if not products:raise RuntimeError("A API não retornou anúncios; os dados antigos foram preservados")
 date=dt.datetime.now(ZoneInfo("America/Sao_Paulo")).isoformat(timespec="seconds")
 history=(prior.get("history") or [])[-25:]
 history.append({"date":date[:10],"products":len(products),"top_product":products[0]["name"],"top_sales":products[0]["sales"]})
 new={"updated_at":date,"mode":"api","source_label":"Shopee Affiliate Open API","source_url":"https://affiliate.shopee.com.br/","scope":"Amostra de até 200 anúncios por palavras-chave. Campo sales não indica necessariamente vendas da última semana ou vendas por afiliados.","history":history,"products":products}
 destination.write_text(json.dumps(new,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 (ROOT/"data.js").write_text("window.RADAR_DATA = "+json.dumps(new,ensure_ascii=False).replace("\u2028","\\u2028").replace("\u2029","\\u2029")+";\n",encoding="utf-8")
 print("Atualizado:",len(products),"produtos")

if __name__=="__main__":
 try:main()
 except Exception as exc:
  print("Erro na atualização:",exc,file=sys.stderr)
  sys.exit(1)
