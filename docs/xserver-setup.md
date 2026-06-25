# Xserver 配置手順書

> Cloudflare Pages を利用する場合、Xserverへのファイル配置は不要です。
> Xserver に直接ホスティングする場合（Cloudflare はDNS/CDNのみ使用）はこの手順を参照してください。

---

## 1. FTP接続情報の確認

Xserver サーバーパネル > **FTP** > **FTPアカウント設定** で接続情報を確認:

| 項目         | 値                                   |
|------------|--------------------------------------|
| ホスト       | `sv〇〇〇.xserver.jp`                  |
| ユーザー名   | （サーバーIDまたは追加FTPアカウント）    |
| ポート       | `21`（FTP）または `22`（SFTP推奨）      |

FTPクライアント（FileZilla、Cyberduck 等）で接続してください。

---

## 2. ファイルの配置場所

```
/home/【サーバーID】/【ドメイン名】/public_html/
```

例: `/home/abc12345/tritail.co.jp/public_html/`

---

## 3. アップロードするファイル

以下をすべて `public_html/` 配下にアップロードしてください:

```
public_html/
├── index.html
├── disaster/
│   └── index.html
├── ip/
│   └── index.html
├── company/
│   └── index.html
├── contact/
│   └── index.html
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   └── images/（各画像ファイル）
├── favicon.svg
├── robots.txt
└── sitemap.xml
```

> `functions/` ディレクトリ（Cloudflare Pages Function）は Xserver では動作しません。
> Xserver 環境でのフォーム処理は別途 PHP スクリプト等を用意するか、
> Cloudflare Pages に切り替えることを推奨します。

---

## 4. Xserver でのフォーム処理（代替案）

Xserver に直接ホスティングする場合、`contact/send.php` を作成してフォーム送信を処理できます。
`contact/index.html` のフォームの `action` 属性を `/contact/send.php` に変更し、
PHP の `mail()` または外部SMTPライブラリを使用してください。

---

## 5. .htaccess の設定

`public_html/.htaccess` を作成してリダイレクトと設定を行います:

```apache
# HTTPS リダイレクト（Cloudflare使用時は不要）
# RewriteEngine On
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# www なし → ありへのリダイレクト（必要に応じて）
# RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
# RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L]

# DirectoryIndex
DirectoryIndex index.html

# 文字コード
AddDefaultCharset UTF-8

# キャッシュ設定
<FilesMatch "\.(css|js|svg|woff2)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

<FilesMatch "\.html$">
  Header set Cache-Control "public, max-age=0, must-revalidate"
</FilesMatch>
```

---

## 6. Cloudflare DNS の設定

ドメイン `tritail.co.jp` を Xserver の IP アドレスに向けます:

1. Cloudflare DNS > **Add record**
2. `A` レコード:
   - **Name**: `@`
   - **IPv4**: Xserver のサーバーIPアドレス（サーバーパネルで確認）
   - **Proxy status**: **Proxied**（オレンジ雲マーク）
3. `A` レコード:
   - **Name**: `www`
   - **IPv4**: 同じIPアドレス
   - **Proxy status**: **Proxied**

---

## 7. SSL証明書（Xserver 無料SSL）

1. Xserverサーバーパネル > **SSL設定** > 対象ドメインを選択
2. **無料独自SSL追加** をクリック
3. 証明書が発行されるまで数分〜数時間待つ
4. Cloudflare の **SSL/TLS** を **Full** に設定

---

## 8. 公開確認チェックリスト

- [ ] `https://tritail.co.jp/` が正常表示される
- [ ] `https://tritail.co.jp/disaster/` が正常表示される
- [ ] `https://tritail.co.jp/ip/` が正常表示される
- [ ] `https://tritail.co.jp/company/` が正常表示される
- [ ] `https://tritail.co.jp/contact/` が正常表示される
- [ ] スマートフォンでの表示確認（iOS Safari / Android Chrome）
- [ ] `https://tritail.co.jp/robots.txt` が参照できる
- [ ] `https://tritail.co.jp/sitemap.xml` が参照できる
- [ ] Google Search Console にサイトを登録・サイトマップを送信
