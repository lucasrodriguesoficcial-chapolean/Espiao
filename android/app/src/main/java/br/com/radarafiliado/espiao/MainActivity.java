package br.com.radarafiliado.espiao;

import android.app.Activity;
import android.os.Bundle;
import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final String SITE="https://lucasrodriguesoficcial-chapolean.github.io/Espiao/";
    private static final String OFFLINE="file:///android_asset/index.html";
    private WebView webView;
    private String pendingCsv;
    private boolean loadedOffline=false;
    private static final int CSV_CREATE=4052;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        webView=new WebView(this);
        webView.setBackgroundColor(0xfff5f7fb);
        setContentView(webView);
        WebSettings settings=webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.addJavascriptInterface(new AndroidBridge(),"AndroidBridge");
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                Uri url=request.getUrl();
                if ("file".equals(url.getScheme())) return false;
                if ("https".equals(url.getScheme()) && "lucasrodriguesoficcial-chapolean.github.io".equalsIgnoreCase(url.getHost()) && url.getPath().startsWith("/Espiao/")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW,url)); } catch(ActivityNotFoundException ignored){}
                return true;
            }
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){
                if(request.isForMainFrame()) offline();
            }
            @Override public void onReceivedHttpError(WebView view,WebResourceRequest request,WebResourceResponse response){
                if(request.isForMainFrame() && response.getStatusCode()>=400) offline();
            }
        });
        webView.loadUrl(SITE);
    }
    private void offline(){
        if(!loadedOffline){ loadedOffline=true;runOnUiThread(()->webView.loadUrl(OFFLINE));}
    }
    public final class AndroidBridge {
        @JavascriptInterface public void shareText(String text, String platform){
            runOnUiThread(()->{
                Intent send=new Intent(Intent.ACTION_SEND);
                send.setType("text/plain");
                send.putExtra(Intent.EXTRA_TEXT,text);
                String pkg="";
                if("whatsapp".equals(platform))pkg="com.whatsapp";
                else if("instagram".equals(platform))pkg="com.instagram.android";
                else if("tiktok".equals(platform))pkg="com.zhiliaoapp.musically";
                else if("facebook".equals(platform))pkg="com.facebook.katana";
                else if("telegram".equals(platform))pkg="org.telegram.messenger";
                if(!pkg.isEmpty()){
                    send.setPackage(pkg);
                    try{startActivity(send);return;}catch(ActivityNotFoundException ignored){
                        send.setPackage(null);
                    }
                }
                try{startActivity(Intent.createChooser(send,"Compartilhar conteúdo"));}catch(ActivityNotFoundException ignored){}
            });
        }
        @JavascriptInterface public void copyText(String text){
            runOnUiThread(()->{
                ClipboardManager cb=(ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE);
                cb.setPrimaryClip(ClipData.newPlainText("Radar Shopee",text));
            });
        }
        @JavascriptInterface public void saveCsv(String filename,String contents){
            runOnUiThread(()->{
                pendingCsv=contents;
                Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("text/csv");
                intent.putExtra(Intent.EXTRA_TITLE,filename);
                try{startActivityForResult(intent,CSV_CREATE);}catch(ActivityNotFoundException ignored){}
            });
        }
    }
    @Override protected void onActivityResult(int req,int res,Intent data){
        super.onActivityResult(req,res,data);
        if(req==CSV_CREATE && res==RESULT_OK && data!=null && data.getData()!=null && pendingCsv!=null){
            try(OutputStream out=getContentResolver().openOutputStream(data.getData())){
                if(out!=null)out.write(pendingCsv.getBytes(StandardCharsets.UTF_8));
            }catch(Exception ignored){}
            pendingCsv=null;
        }
    }
    @Override public void onBackPressed(){
        if(webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
    @Override protected void onDestroy(){
        if(webView!=null)webView.destroy();
        super.onDestroy();
    }
}
