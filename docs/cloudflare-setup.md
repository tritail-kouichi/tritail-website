# Cloudflare 設定手順書

## 1. Cloudflare Pages プロジェクト作成

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Workers & Pages** > **Create** > **Pages** を選択
3. **Connect to Git** でリポジトリ（GitHub / GitLab）を接続
4. ビルド設定:
   - **Framework preset**: `None`
   - **Build command**: （空欄）
   - **Build output directory**: `/`（ルートをそのまま公開）
5. **Save and Deploy**

> Git不使用の場合は **Direct Upload** でフォルダをアップロード可能

---

## 2. カスタムドメイン設定（tritail.co.jp）

1. Pages プロジェクト > **Custom domains** > **Set up a custom domain**
2. `tritail.co.jp` を入力して追加
3. DNS レコードが自動提案されるので **Activate domain** をクリック
4. サブドメイン `www.tritail.co.jp` も同様に追加し、**301リダイレクト**を設定

---

## 3. Cloudflare Turnstile 設定

1. Cloudflare Dashboard > **Turnstile** > **Add widget**
2. **Widget name**: `TriTail お問い合わせフォーム`
3. **Hostname**: `tritail.co.jp`
4. **Widget mode**: `Managed`（推奨）
5. 生成された **Site Key** と **Secret Key** をメモ

### HTMLへの反映
`contact/index.html` の Turnstile ウィジェットを更新:
```html
<div class="cf-turnstile"
     data-sitekey="【取得したサイトキー】"
     data-theme="light">
</div>
```

---

## 4. Pages Function 環境変数の設定

1. Pages プロジェクト > **Settings** > **Environment variables**
2. 以下を **Production** 環境に追加:

| 変数名                  | 値                          |
|------------------------|----------------------------|
| `TURNSTILE_SECRET_KEY` | Turnstile のシークレットキー  |
| `TO_EMAIL`             | `info@tritail.co.jp`        |
| `FROM_EMAIL`           | `noreply@tritail.co.jp`     |

3. 変更後は **Redeploy** が必要

---

## 5. MailChannels DNS ロック（スパム対策）

MailChannels 経由でメール送信するため、送信ドメインの SPF レコードを追加してください。

DNS > Add record:
```
Type:    TXT
Name:    @
Value:   v=spf1 include:relay.mailchannels.net -all
```

> 既存の SPF レコードがある場合は `include:relay.mailchannels.net` を追記

---

## 6. HTTPS / セキュリティ設定

1. **SSL/TLS** > **Overview** > **Full (strict)** を選択
2. **Edge Certificates** > **Always Use HTTPS**: ON
3. **HTTP Strict Transport Security (HSTS)**: 有効化（max-age=31536000 推奨）
4. **Minimum TLS Version**: TLS 1.2

---

## 7. キャッシュ設定（パフォーマンス向上）

Pages はデフォルトで CDN キャッシュが有効です。
静的アセットのキャッシュを強化する場合は `_headers` ファイルをルートに追加:

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

---

## 8. デプロイ確認

- `https://tritail.co.jp/` が表示されること
- `https://tritail.co.jp/contact/` のフォームから送信テスト
- `info@tritail.co.jp` に管理者通知メールが届くこと
- 送信者のメールアドレスに自動返信メールが届くこと
