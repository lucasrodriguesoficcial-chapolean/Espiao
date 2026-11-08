# Espião Shopee para Android

O código nativo (Android WebView) acompanha o Radar Shopee. Quando a página do GitHub Pages estiver disponível, o aplicativo a abre para buscar o catálogo mais recente. Se faltar internet ou o site estiver indisponível, abre a cópia do painel com os dados incorporados na compilação.

## Gerar APK sem instalar Android Studio
1. Abra a aba **Actions** do repositório.
2. Selecione **Gerar aplicativo Android APK** e **Run workflow** (se o fluxo não iniciar automaticamente).
3. Quando a execução terminar com sucesso, abra-a e baixe o artefato **espiao-shopee-android-apk**. Descompacte e instale **app-debug.apk** no aparelho Android.
4. Este é um APK de desenvolvimento, não assinado para publicação na Play Store. Nunca coloque segredos Shopee no app ou no código público.

O GitHub Pages deve ser habilitado em **Settings → Pages → Deploy from a branch → main → /(root)**. Sem Pages o APK utiliza a amostra local, e o conteúdo online não atualizará. A API oficial e as credenciais são necessárias para renovar o catálogo semanalmente.

O projeto Android usa Java 17, Gradle 8.9, Android Gradle Plugin 8.7.3, compileSdk 35 e Android 8.0+ (API 26). O APK final só estará disponível quando a ação de compilação tiver concluído com sucesso.