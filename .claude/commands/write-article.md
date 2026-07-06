---
description: SEOキーワードから防災コラム記事(articles/)を1本自動生成し、一覧ページとsitemapも更新する
---

# 記事執筆コマンド

このコマンドは、TriTailコーポレートサイトの `/articles/` に新しいSEOコラム記事を1本追加する。

引数（`$ARGUMENTS`）には、次の形式でキーワード・カテゴリを渡す：

```
/write-article <キーワード・テーマ> [カテゴリ] [スラッグ]
```

- **キーワード・テーマ**（必須）：記事の主題。例：「防災訓練の頻度」
- **カテゴリ**（任意）：`BCP対策` / `防災備蓄` / `災害対策` / `企業防災` / `チェックリスト` のいずれか。省略時はテーマから最も適切なものを判断する
- **スラッグ**（任意）：URL用のローマ字ケバブケース。省略時はテーマからローマ字スラッグを自動生成する（例：`bousai-kunren-hindo`）

## 手順

### 1. テンプレートを読み込む
[articles/bcp-taisaku/index.html](../../articles/bcp-taisaku/index.html) を構造テンプレートとして読み込み、以下の構成要素をすべて踏襲する：

- `<head>`：`title` / `meta description` / `canonical`（`https://tritail.co.jp/articles/{slug}/`）/ OGP一式 / JSON-LD 3種（`BreadcrumbList`・`Article`・`FAQPage`）
- `<header>`・グローバルnav・モバイルnav・防災備蓄サブナビ（既存ページと完全に同一のHTMLをコピーする。文言・リンク先を変更しない）
- パンくずリスト（`breadcrumb`）
- `article-header`：カテゴリタグ・タイトル・公開日/更新日（実行日）・執筆者「TriTail 防災コンサルティング部」・`article-summary`
- ファーストCTA（`article-cta-box`）：無料BCP診断 or 備蓄計画書への誘導
- 本文：`h2`/`h3`見出し3〜5個、必要に応じて`article-table`（比較表）や`ul`（リスト）を使用
- 中間CTA（`article-cta-box`）：無料相談への誘導
- 末尾CTA（`article-cta-box article-cta-box--large`）
- FAQ：`dl.faq-list`（`dt`/`dd`）3〜4問。**必ず`<head>`のFAQPage JSON-LDと内容を一致させる**
- `article-footer-nav`：記事一覧へ戻るリンク＋関連記事への次リンク（関連記事が無ければ「記事一覧へ戻る」のみでよい）
- `aside.article-sidebar`：BCP診断・備蓄計画書のCTA＋関連記事3〜4本（既存記事の中からテーマが近いものを選ぶ）
- `cta-banner`セクション、`sticky-cta-bar`、共通`footer`（既存記事からそのままコピー）

### 2. カテゴリとサムネイルの対応
| カテゴリ | サムネイルclass |
|---|---|
| BCP対策 | `column-card__thumb--bcp` |
| 防災備蓄 | `column-card__thumb--stockpile` |
| 災害対策 | `column-card__thumb--disaster` |
| 企業防災 / チェックリスト | `column-card__thumb--company` |

### 3. ファクトチェック注記を挿入
統計・数値・出典（発生確率、市場規模、法令の基準日数など）を本文に含める場合、`article-summary`の直後に次のブロックを追加する：

```html
<div class="article-cta-box" style="background:#FFF3E0;border-color:#E8A33D;">
  <p>⚠️ <strong>公開前のご確認をお願いします：</strong>本記事内の統計データ・出典・法令情報はAIによる下書きです。数値や引用元が最新・正確であることを、公開前に必ず確認してください。</p>
</div>
```

### 4. ファイルを作成する
`articles/{slug}/index.html` を新規作成する（既存ファイルは一切変更しない）。

### 5. 記事一覧ページを更新する
[articles/index.html](../../articles/index.html) の `column-grid`（`<!-- 記事グリッド -->`以下）に、既存カードと同じ構造で新しいカードを1件追加する：

```html
<a href="/articles/{slug}/" class="column-card">
  <div class="column-card__thumb column-card__thumb--{カテゴリ対応class}">{絵文字1つ}</div>
  <div class="column-card__body">
    <div class="column-card__cat">{カテゴリ}</div>
    <h2 class="column-card__title">{記事タイトル}</h2>
    <p class="column-card__excerpt">{80字程度の要約}</p>
    <div class="column-card__meta"><span>{実行日を「2026年6月25日」形式で}</span><span>約{分}分</span></div>
  </div>
</a>
```

`</div>`（column-gridの閉じタグ、`<!-- 無料ツールCTA -->`コメントの直前）の手前に追加すること。

### 6. sitemap.xmlを更新する
[sitemap.xml](../../sitemap.xml) の `<!-- /articles/ SEO articles -->` セクション内、最後の記事エントリの直後に新しい `<url>` を追加する：

```xml
<url>
  <loc>https://tritail.co.jp/articles/{slug}/</loc>
  <lastmod>{実行日 YYYY-MM-DD}</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.85</priority>
</url>
```

### 7. 完了報告（重要）
作業完了後、以下を必ずユーザーに報告する：

- 作成したファイルパス一覧（新規記事・更新した2ファイル）
- ファクトチェックが必要な箇所（挿入した統計・出典の要約）
- 「内容をご確認いただき、問題なければ次に『PRを作って』とお伝えください」という案内

**このコマンドは git add / git commit / git push / PR作成を一切実行しない。** ファイル作成・編集のみで完了とする。ブラウザでの表示確認が必要な場合は preview ツールを使ってよいが、デプロイや公開操作は行わない。
