# TriTail合同会社 コーポレートサイト

## ディレクトリ構成

```
/
├── index.html                  # TOP
├── disaster/index.html         # 防災備蓄事業
├── ip/index.html               # IP事業
├── company/index.html          # 会社概要
├── contact/index.html          # お問い合わせ
├── assets/
│   ├── css/style.css           # 全ページ共通CSS
│   ├── js/main.js              # 全ページ共通JS
│   └── images/
│       ├── logo.svg            # ロゴ（SVGプレースホルダー → 本番ロゴに差し替え）
│       ├── hero-top.jpg        # TOPヒーロー画像（別途用意）
│       ├── hero-disaster.jpg   # 防災ページヒーロー（別途用意）
│       ├── hero-ip.jpg         # IPページヒーロー（別途用意）
│       ├── about.jpg           # Aboutセクション（別途用意）
│       └── ogp.jpg             # OGP画像 1200×630px（別途用意）
├── functions/
│   └── api/
│       └── contact.js          # Cloudflare Pages Function（フォーム処理）
├── favicon.svg
├── robots.txt
├── sitemap.xml
└── docs/
    ├── cloudflare-setup.md     # Cloudflare設定手順
    └── xserver-setup.md        # Xserver配置手順
```

## 本番公開前に必要な作業

### 1. ロゴ画像の差し替え
`assets/images/logo.svg` を実際のロゴファイルに差し替えてください。
ダークバックグラウンド用のホワイトバージョンも同ディレクトリに置くと便利です。

### 2. ヒーロー画像の設置
各ページのヒーローセクションに画像を設定します。Pexels / Unsplash / Pixabay から
商用利用可能な画像をダウンロードし `assets/images/` に配置したうえで、
`assets/css/style.css` の各クラスに `background-image` を追記してください。

| クラス        | 画像ファイル         | 推奨キーワード                      |
|-------------|---------------------|----------------------------------|
| `.hero`     | `hero-top.jpg`      | business meeting, emergency prep |
| `.hero--disaster` | `hero-disaster.jpg` | emergency supplies, BCP, safety  |
| `.hero--ip` | `hero-ip.jpg`       | intellectual property, creative  |

### 3. OGP画像の作成
`assets/images/ogp.jpg`（1200×630px）を作成して配置してください。
各ページの `og:image` メタタグで参照されます。

### 4. Cloudflare Turnstile サイトキーの設定
`contact/index.html` 内の Turnstile ウィジェットの `data-sitekey` を
Cloudflare ダッシュボードで取得した本番サイトキーに変更してください。

```html
<!-- 変更前（テストキー） -->
<div class="cf-turnstile" data-sitekey="1x00000000000000000000AA" ...>

<!-- 変更後 -->
<div class="cf-turnstile" data-sitekey="あなたのサイトキー" ...>
```

### 5. Cloudflare Pages Function の環境変数設定
Cloudflare Pages ダッシュボード > Settings > Environment variables に下記を追加：

| 変数名                | 値の例                    |
|---------------------|--------------------------|
| `TURNSTILE_SECRET_KEY` | Turnstile シークレットキー  |
| `TO_EMAIL`            | `info@tritail.co.jp`      |
| `FROM_EMAIL`          | `noreply@tritail.co.jp`   |

### 6. sitemap.xml の `<lastmod>` 更新
公開日に合わせて `sitemap.xml` の日付を更新してください。

## 使用技術

- HTML5 / CSS3 / Vanilla JavaScript（ライブラリ不使用）
- Google Fonts: Noto Sans JP
- Cloudflare Turnstile（スパム対策）
- Cloudflare Pages Functions（フォームバックエンド）
- MailChannels API（メール送信、Cloudflare Workers から無料利用）

## パフォーマンス最適化のポイント

- 画像は WebP 形式 + `loading="lazy"` を推奨
- Google Fonts は `display=swap` 設定済み
- CSS/JS はページごとに1ファイルずつ（HTTPリクエスト最小化）
- IntersectionObserver によるアニメーション（レイアウトシフトなし）

## SEO

- 全ページ: `<title>`, `<meta description>`, OGP, `<link rel="canonical">` 設定済み
- 構造化データ（JSON-LD）: Organization, WebSite, ContactPage, BreadcrumbList
- `robots.txt` + `sitemap.xml` 設置済み

## アクセシビリティ

- セマンティックHTML（`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>` 等）
- ランドマークロール設定
- フォームの `<label>` / `aria-describedby` / `aria-live` 設定
- キーボード操作対応（Escape でモバイルメニューを閉じる等）
- `aria-label` / `alt` テキスト設定済み

## 詳細手順書

- [Cloudflare設定手順](docs/cloudflare-setup.md)
- [Xserver配置手順](docs/xserver-setup.md)
