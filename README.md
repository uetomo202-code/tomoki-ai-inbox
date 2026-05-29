# 智貴の思考ログ受信箱 v0（設計書）

## 目的
Grok、Gemini、Claude、Mia、Codexなど複数のAIから得た情報を、**まずは手動で一元保存し、思考断片として再接続・再利用**するための受信箱を作る。

v0では自動化を行わず、Googleスプレッドシートを保存先として運用できるように、
- 何を残すか（保存項目）
- どのように整理するか（運用ルール）
- 誰が何を担うか（役割分担）

を先に定義する。

---

## 想定する課題（思考ログ視点）
- AIごとに回答の特性が違い、あとで比較しづらい
- 思考の断片（気づき・違和感・ひらめき）が流れて再利用できない
- 出典・確度・次アクションが曖昧なまま意思決定に使ってしまう

---

## v0のスコープ（今回作るもの）
- **設計書（本README）**
- **保存項目の定義（Googleスプレッドシート前提）**
- 手動入力による運用ルール

### v0でやらないこと
- API連携による自動収集
- 自動タグ付け・自動要約
- 通知やワークフロー自動化

---

## 運用思想（情報ログではなく思考ログ）
- **まず雑に投げる → 後でMiaが補完する**を前提に、未入力項目は欠損のままでよく、まず断片を残す。
- このv0は「情報の正しさ管理」だけでなく、**思考の流れ・感情・接続**を残すためのログである。
- 1件の回答を知識として保存するだけでなく、「なぜ自分に重要か」「将来どこで使うか」を明文化する。
- 断片のまま残し、週次レビューで接続を見つけて育てる。

## 役割分担（人 × AI）

### 人（オーナー）
- 収集対象（テーマ/プロジェクト）を決める
- AI回答の重要度を判定する
- 保存時に最終要約・次アクションを確定する
- 週次で重複・陳腐化した情報を棚卸しする

### AI（情報提供者）
- 各AIは「一次回答ソース」として扱う
- 回答はそのまま採用せず、必要に応じて比較・統合する

### 受信箱（Googleスプレッドシート）
- 入力窓口を一本化する
- 項目を揃えて比較可能にする
- 後続の検索・再利用・自動化に備えた構造を保持する

---

## Googleスプレッドシート構成案（v0）

### シート1: `inbox`
日々のAI回答を保存するメインシート。

### シート2: `master_tag`
タグの表記ゆれ防止用（任意）。

### シート3: `review_log`
週次レビュー記録（任意）。

### シート4: `job_master`
job_key単位で担当AI・代替AI・入出力形式・確認ルールを管理するマスター。

---

## Googleスプレッドシート実装仕様（v0 / Apps Scriptなし）

この章では、**人間が手入力で運用する前提**で4シートの構造を定義する。

### 1) `inbox`（メイン受信箱）
**運用目的**
- AIごとの回答を同一フォーマットで蓄積し、比較・再利用しやすくする。
- 「次に何をするか」まで残して、情報を行動につなげる。

**列構成（左→右の推奨順）**
| 列 | 項目名 | 必須 | 入力形式 / ルール |
|---|---|---|---|
| A | record_id | 必須 | `AI-YYYYMMDD-連番3桁`（例: `AI-20260527-001`） |
| B | captured_at | 必須 | 日時（`YYYY-MM-DD HH:MM` で統一） |
| C | ai_name | 必須 | プルダウン: `Grok, Gemini, Claude, Mia, Codex` |
| D | source_link | 推奨 | 会話URL（なければ空欄可） |
| E | project_name | 必須 | プロジェクト名（表記ゆれ禁止） |
| F | query_summary | 必須 | 問いの要約（1〜2行） |
| G | response_summary | 必須 | 回答要点（3〜6行） |
| H | key_points | 推奨 | 箇条書き3点以内 |
| I | confidence | 推奨 | プルダウン: `High, Mid, Low` |
| J | evidence_type | 推奨 | `経験則 / 一般知識 / 出典付き / 実測` |
| K | usefulness | 必須 | プルダウン: `A(即利用), B(要検証), C(保留)` |
| L | novelty | 推奨 | プルダウン: `高, 中, 低` |
| M | next_action | 必須 | 1アクションを具体的に記載 |
| N | owner | 必須 | 担当者名 |
| O | due_date | 推奨 | 日付（`YYYY-MM-DD`） |
| P | tags | 必須 | `,` 区切り。`master_tag` 登録語優先 |
| Q | quick_capture | 推奨 | 1セルで雑に残す思考断片（自由記述） |
| R | brain_state | 推奨 | 思考状態（例: 集中 / 拡散 / 迷走 / 収束） |
| S | emotional_state | 推奨 | 感情状態（例: 不安 / 納得 / 高揚 / 違和感） |
| T | connection | 推奨 | 既存メモ・案件・体験との接続 |
| U | why_important | 必須 | 自分にとって重要な理由 |
| V | future_use | 推奨 | 将来の利用シーン・再利用方法 |
| W | chaos_level | 推奨 | 混沌度 `1(整理済)〜5(混沌)` |
| X | mia_review | 推奨 | Miaレビュー結果（未レビュー/整理済 など） |
| Y | mia_priority | 推奨 | Mia補完優先度（高/中/低） |
| Z | mia_connection | 推奨 | Miaが見つけた接続先・関連メモ |
| AA | status | 必須 | プルダウン: `未処理, 検証中, 採用, 却下, 保留` |
| AB | reviewed_at | 推奨 | 最終レビュー日（`YYYY-MM-DD`） |
| AC | notes | 推奨 | 根拠・補足・判断理由 |

**入力ルール（inbox）**
- 1回答につき1行のみ登録（1回答1レコード）。
- `response_summary` は原文コピペ禁止、再利用できる要約文で書く。
- `next_action` は「誰が・何を・いつまでに」が分かる表現にする。
- `tags` は最大5個を目安にし、同義語は `master_tag` に合わせる。
- `brain_state` / `emotional_state` / `chaos_level` は主観でよいので当日の状態を残す。
- `quick_capture` は1セルで雑に残してよい（文法・粒度不問）。
- `connection` / `why_important` / `future_use` は短くても記載し、後日の再接続に使う。
- `mia_review` / `mia_priority` / `mia_connection` は後補完前提で初回は空欄でよい。



### inbox 簡易入力モード（最低3項目）
**目的**
- 思考断片を取り逃さないため、まずは最小入力で保存する。
- 精度より速度を優先し、後でMia補完と週次レビューで育てる。

**最低3項目（これだけで保存可）**
- `captured_at`
- `response_summary`
- `connection`

**さらに雑に残す1セル運用（任意）**
- `quick_capture` のみ先に記入し、他項目は後で追記してもよい。

**保存ルール（簡易入力時）**
- 上記3項目が埋まっていれば `inbox` に登録してよい。
- 未入力項目は空欄のまま保存し、`status=未処理` を付与する。
- `notes` に `mode:simple` を記載して、後続補完対象であることを明示する。
- 後でMiaが補完する優先順は、`why_important` → `future_use` → `tags` → `brain_state/emotional_state/chaos_level` とする。

**簡易入力の記入例**
- `captured_at`: `2026-05-28 09:40`
- `response_summary`: `競合比較の切り口として価格ではなく導入障壁を軸にすると有効という示唆。`
- `connection`: `昨日の営業メモ「導入障壁が不明」と接続。`

---

### 2) `master_tag`（タグ辞書）
**運用目的**
- タグの表記ゆれを防止し、検索性を維持する。
- 新規タグの採用判断を記録し、語彙を統制する。

**列構成（左→右の推奨順）**
| 列 | 項目名 | 必須 | 入力形式 / ルール |
|---|---|---|---|
| A | tag_name | 必須 | 正式タグ名（例: `競合調査`） |
| B | tag_group | 必須 | 分類（例: `業務, 技術, 市場, 顧客`） |
| C | description | 推奨 | タグの利用意図（1行） |
| D | synonyms | 推奨 | 同義語（`,` 区切り） |
| E | usage_rule | 推奨 | 使う条件/使わない条件 |
| F | owner | 必須 | タグ管理担当者 |
| G | active | 必須 | プルダウン: `有効, 廃止` |
| H | updated_at | 推奨 | 最終更新日（`YYYY-MM-DD`） |

**入力ルール（master_tag）**
- `tag_name` は重複禁止（完全一致で1つのみ）。
- 類似タグを追加する前に `synonyms` で吸収できるかを優先検討する。
- 廃止タグは削除せず `active=廃止` にして履歴を残す。

---

### 3) `review_log`（週次レビュー記録）
**運用目的**
- 受信箱の品質を維持するための定期点検ログを残す。
- 「何を見直し、何を決めたか」を追跡可能にする。

**列構成（左→右の推奨順）**
| 列 | 項目名 | 必須 | 入力形式 / ルール |
|---|---|---|---|
| A | review_id | 必須 | `RV-YYYYMMDD-連番2桁` |
| B | review_date | 必須 | レビュー実施日（`YYYY-MM-DD`） |
| C | reviewer | 必須 | 実施者名 |
| D | target_range | 必須 | 対象範囲（例: `2026-05-20〜2026-05-27`） |
| E | open_items | 必須 | 未処理/検証中の件数 |
| F | duplicated_items | 推奨 | 重複検知件数 |
| G | archived_items | 推奨 | アーカイブ候補件数 |
| H | decisions | 必須 | 今回の主要判断（箇条書き可） |
| I | followup_actions | 必須 | 次回までの対応事項 |
| J | due_date | 推奨 | フォロー期限（`YYYY-MM-DD`） |
| K | status | 必須 | プルダウン: `対応中, 完了, 保留` |
| L | memo | 推奨 | 補足メモ |

**入力ルール（review_log）**
- 週1回以上、最低1レコードを登録する。
- `decisions` には「採用/却下/保留」の判断理由を明記する。
- `followup_actions` は `inbox.next_action` と整合させる。

---



### 4) `job_master`（ジョブ定義マスター）
**運用目的**
- AIの固定役割ではなく、`job_key` 単位で担当AIと運用ルールを管理する。
- 課金・外部API・外部契約などの高コスト操作に対する承認ガードレールを明示する。

**列構成（左→右の推奨順）**
| 列 | 項目名 | 必須 | 入力形式 / ルール |
|---|---|---|---|
| A | job_key | 必須 | 一意キー（英小文字+`_`） |
| B | job_name | 必須 | ジョブ名 |
| C | job_stage | 必須 | `収集 / 解釈 / 統合 / 編集 / 報告` |
| D | job_goal | 必須 | 達成目標 |
| E | default_ai | 必須 | 既定担当AI |
| F | fallback_ai | 推奨 | 代替AI |
| G | input_format | 必須 | 入力仕様 |
| H | output_format | 必須 | 出力仕様 |
| I | quality_check | 必須 | 品質基準 |
| J | confidence_rule | 推奨 | 確度判断ルール |
| K | escalation_rule | 必須 | エスカレーション条件 |
| L | approval_required | 必須 | `TRUE/FALSE` |
| M | approval_status | 推奨 | `pending / approved / rejected` |
| N | approved_by | 推奨 | 承認者 |
| O | approved_at | 推奨 | 承認日時 |
| P | cost_risk | 必須 | `low / medium / high` |
| Q | allowed_actions | 必須 | 許可操作 |
| R | forbidden_actions | 必須 | 禁止操作 |
| S | active | 必須 | `有効 / 無効` |
| T | review_cycle | 推奨 | `weekly / monthly` |
| U | reassignment_note | 推奨 | 担当見直しメモ |
| V | notes | 推奨 | 補足 |

**入力ルール（job_master）**
- `cost_risk` が `medium` または `high` のジョブは、必ず `approval_required=TRUE` にする。
- お金がかかる可能性のある処理（課金、有料API、外部契約、有料プラン変更、クレジット消費）は必ず `approval_required=TRUE`。
- `approval_required=TRUE` の場合、`approval_status=approved` になるまで実行禁止。
- 承認前は「提案」または「見積もり」までに限定する。
- 実行時は `approved_by` と `approved_at` を記録する。

---

## 共通の入力ルール（v0）
- Apps Script は使わず、Googleスプレッドシート標準機能（プルダウン、入力規則、フィルタ）だけで運用する。
- 日付・日時フォーマットはシート全体で統一する。
- 原則として必須列は空欄禁止。ただし `inbox` の簡易入力モード（`captured_at` / `response_summary` / `connection`）では一時的な空欄を許容する。
- 削除よりステータス更新を優先し、履歴を残す。

---
## v0の保存項目（必須/推奨）

以下は `inbox` シートのカラム定義。

| 区分 | 項目名 | 必須 | 内容 |
|---|---|---|---|
| 識別 | record_id | 必須 | 一意ID（例: `AI-20260527-001`） |
| 日時 | captured_at | 必須 | 保存日時（UTC or JSTで統一） |
| 出所 | ai_name | 必須 | `Grok / Gemini / Claude / Mia / Codex` |
| 出所 | source_link | 推奨 | 会話URLや参照リンク |
| 文脈 | project_name | 必須 | 紐づく案件/テーマ名 |
| 文脈 | query_summary | 必須 | 何を聞いたかの要約（1〜2行） |
| 内容 | response_summary | 必須 | 回答の要点（3〜6行） |
| 内容 | key_points | 推奨 | 箇条書きの重要点（3点程度） |
| 品質 | confidence | 推奨 | 主観確度 `High / Mid / Low` |
| 品質 | evidence_type | 推奨 | `経験則 / 一般知識 / 出典付き` など |
| 評価 | usefulness | 必須 | 有用性 `A(即利用) / B(要検証) / C(保留)` |
| 評価 | novelty | 推奨 | 新規性 `高 / 中 / 低` |
| 実行 | next_action | 必須 | 次に取る行動（具体的な1アクション） |
| 実行 | owner | 必須 | 次アクション担当者 |
| 実行 | due_date | 推奨 | 期限日 |
| 整理 | tags | 必須 | 検索用タグ（`,`区切り） |
| 断片 | quick_capture | 推奨 | 1セルで雑に残す思考断片 |
| 思考 | brain_state | 推奨 | 思考状態（集中/拡散/迷走/収束 など） |
| 思考 | emotional_state | 推奨 | 感情状態（不安/納得/高揚/違和感 など） |
| 接続 | connection | 推奨 | 既存メモ・案件・体験との接続 |
| 価値 | why_important | 必須 | 自分にとって重要な理由 |
| 活用 | future_use | 推奨 | 将来どこで使うかの想定 |
| 状態 | chaos_level | 推奨 | 混沌度 `1(整理済)〜5(混沌)` |
| Mia | mia_review | 推奨 | Miaレビュー結果 |
| Mia | mia_priority | 推奨 | Mia補完優先度（高/中/低） |
| Mia | mia_connection | 推奨 | Miaが見つけた接続先 |
| 整理 | status | 必須 | `未処理 / 検証中 / 採用 / 却下 / 保留` |
| 履歴 | reviewed_at | 推奨 | 最終レビュー日 |
| 履歴 | notes | 推奨 | 補足メモ |

---

## 入力ルール（v0運用）
- 1回答1レコードで保存する（比較しやすくするため）
- `response_summary` は原文コピペではなく要約で記載する
- `next_action` は「誰が、何を、いつまでに」を意識して具体化する
- `tags` は5個以内を目安にし、`master_tag` の語彙を優先する
- 判断に使った情報は `notes` に出典や前提を残す

---

## レビュー運用（週次）
- `status=未処理/検証中` を優先的に確認
- `usefulness=C` で30日以上放置のものはアーカイブ候補
- 同一テーマの重複レコードは統合し、代表レコードを決める
- 検証済みで再利用価値が高い情報はテンプレ化候補としてマーク

---

## 将来構想（v1以降）

### v1（半自動化）
- フォーム入力（Googleフォーム or Apps Script）
- タグ候補の自動提案
- `status` 更新時の簡易通知

### v2（自動化）
- 各AI/APIからの半自動取り込み
- 重複検知・類似クラスタリング
- プロジェクト単位のダッシュボード化

### v3（活用高度化）
- 「意思決定ログ」との紐付け
- 成果との相関分析（どのAI情報が成果に寄与したか）
- ナレッジベース連携（Notion/Docs/DB等）

---

## 最初の一歩（実装前チェックリスト）
- [ ] `inbox` シートに上記カラムを作成
- [ ] `status` / `usefulness` / `confidence` の入力規則をプルダウン化
- [ ] `record_id` 命名ルールを決定
- [ ] まずは1週間、手動運用して項目の過不足を確認

このREADMEをv0の基準文書として、実運用から改善点を収集する。


## GASでのスプレッドシート生成手順（v0）

Apps Script を使って、`inbox` / `master_tag` / `review_log` / `job_master` の4シートを持つテンプレートを自動生成できる。
（外部AI連携・API連携は行わない）

### 1. スクリプトを用意する
- 本リポジトリの `gas/create_ai_inbox_template.gs` をコピーする。

### 2. Apps Script プロジェクトを作成する
1. Google Drive で「新規」→「その他」→「Google Apps Script」を開く。
2. 既存の `Code.gs` の内容を削除し、`create_ai_inbox_template.gs` の内容を貼り付ける。
3. プロジェクトを保存する（例: `ai-inbox-v0-template`）。

### 3. 実行する
1. 関数選択で `createAIInboxV0Spreadsheet` を選ぶ。
2. 「実行」を押す。
3. 初回のみ権限認可を行う。

### 4. 生成結果
- 新規スプレッドシート `AI情報受信箱 v0 テンプレート` が作成される。
- 次の4シートが作成される。
  - `inbox`
  - `master_tag`
  - `review_log`
  - `job_master`
- 各シートで以下が適用される。
  - 1行目ヘッダー設定
  - ヘッダー行の固定
  - 列幅調整
  - 入力例（2行目）の初期投入

### 5. 運用開始時の推奨
- 入力例行（2行目）は、運用開始時に削除または別シートへ退避する。
- v0は手入力運用のため、入力規則（プルダウン等）は必要に応じてシートUIから追加する。


### 6. 既存スプレッドシートへ作成する（追加関数）
既存のスプレッドシートを開いた状態で、`createAIInboxV0SpreadsheetInActiveSpreadsheet` を実行すると、
アクティブなスプレッドシート上に `inbox` / `master_tag` / `review_log` / `job_master` を再作成できる。

- 内部で `SpreadsheetApp.getActiveSpreadsheet()` を使用する。
- 同名シート（`inbox` / `master_tag` / `review_log` / `job_master`）が既にある場合は削除してから再作成する。
- ヘッダー、列幅、固定行、入力例は新規作成関数と同一仕様。

> 注意: 既存同名シートは削除されるため、必要なデータは事前にバックアップすること。


### 列定義の整合性（README と GAS）
- `gas/create_ai_inbox_template.gs` の `getAIInboxV0SheetDefinitions_()` にある `inbox.headers` は、READMEの `inbox` 列定義（A〜AC）と一致させる。
- 特に思考ログ列 `brain_state / emotional_state / connection / why_important / future_use / chaos_level` が両方に含まれていることを維持する。
- 列を追加・変更した場合は、README と GAS を同時に更新する。




## 課金系ガードレール（承認必須）
- AIや自動化処理は、課金/有料API/外部契約/有料プラン変更を勝手に実行しない。
- `cost_risk` が `medium` または `high` の job は `approval_required=TRUE` を必須とする。
- 承認前は「提案」または「見積もり」までとし、実行は行わない。
- 実行には智貴の明示承認が必要。
- 承認状態は `approval_status / approved_by / approved_at` で記録する。

## 実行プラン：5役割運用をスプレッドシートで回す列設計（手運用v0.1）

以下は「AI名固定ではなくジョブ定義で管理する」ための追加列案。既存3シートのまま運用できる。

### inbox 追加列（推奨）
| 列 | 項目名 | 必須 | 目的 |
|---|---|---|---|
| AD | job_key | 必須 | ジョブ識別子（例: `web_context_collect`） |
| AE | job_stage | 必須 | `収集 / 解釈 / 統合 / 編集 / 報告` |
| AF | assigned_ai | 必須 | 今回担当AI（例: Gemini/Claude/Grok/ChatGPT/Mia） |
| AG | fallback_ai | 推奨 | 代替AI |
| AH | input_contract | 推奨 | 入力仕様（何を渡したか） |
| AI | output_contract | 推奨 | 出力仕様（何を期待したか） |
| AJ | quality_check | 推奨 | 最低品質基準（例: 出典2件以上） |
| AK | mia_queue | 必須 | `未投入 / レビュー待ち / レビュー中 / 完了` |
| AL | mia_action_type | 推奨 | `要約 / 接続 / 検証依頼 / 保留` |
| AM | mia_due_at | 推奨 | Miaレビュー期限 |
| AN | diff_base | 推奨 | 差分統合の比較元（前回結論ID） |
| AO | diff_update | 推奨 | 今回の差分要約 |
| AP | reassignment_note | 推奨 | 月次見直しの担当変更理由 |

### master_tag 追加列（推奨）
| 列 | 項目名 | 必須 | 目的 |
|---|---|---|---|
| I | related_job_stage | 推奨 | タグが主に使われる工程 |
| J | review_owner | 推奨 | タグ品質管理担当 |

### review_log 追加列（推奨）
| 列 | 項目名 | 必須 | 目的 |
|---|---|---|---|
| M | reassignment_done | 必須 | 月次で再割当を実施したか `Yes/No` |
| N | reassignment_changes | 推奨 | 変更内容（誰→誰） |
| O | diff_integration_issues | 推奨 | 差分統合で詰まった点 |
| P | mia_queue_backlog | 推奨 | Miaレビュー待ち件数 |

### 運用ルール（v0.1）
1. 新規レコードは必ず `job_key` と `job_stage` を設定し、AI名ではなくジョブを主語に管理する。  
2. Miaは `mia_queue=レビュー待ち` の行だけを処理対象にする。  
3. ChatGPTでの統合は `diff_base` と `diff_update` を使った差分統合を基本にする。  
4. 毎月末に `review_log.reassignment_done` を更新し、担当AIの再割当を記録する。  
5. ジョブ追加/削除は自由。`job_key` の命名だけ統一（英小文字+アンダースコア）する。  



## Chrome Webアプリ化の実行イメージ（設計のみ / 未実装）

要望どおり、**今は実装せず設計だけ**を絞り込んだ形。

### 1) 全体アーキテクチャ（Chrome依存を薄くする）
- **データ層（中立）**: Googleスプレッドシート（現行v0.1）を正本にする。
- **API層（中継）**: 将来のバックエンド（Cloud Run / Apps Script Web App / Supabase等）を1つ用意し、UIは必ずこの層経由で読む。
- **UI層（差し替え可能）**:
  - 第一候補: Chrome向けWebアプリ（PWA）
  - 将来候補: Yahoo!等の別Web埋め込み・別フロントエンド

> こうすると「保存先は同じ」「見た目だけ差し替え」ができ、Chrome変更に強くなる。

### 2) 画面構成（Mia常駐を前提）
- **メイン画面**: inbox一覧、簡易入力（quick_capture 1セル）、検索/タグ。
- **下部ドック（常駐）**: Miaパネル（会話風の吹き出し・状態表示）。
- **右サイド**: Miaレビューキュー（`mia_review` / `mia_priority` / `mia_connection` 編集）。

### 3) Miaの「会話しているような動き」設計
- **表情/状態ステート**: idle / listening / thinking / speaking。
- **トリガー**:
  - 新規quick_capture保存時 → thinking
  - レビュー提案表示時 → speaking
  - 待機時 → idle
- **表示方式**: 最初は2D Live2D風または動画ループで十分。

### 4) 音声（Mia Voice）統合の進め方
- **v0.2**: テキスト表示のみ（無音）。
- **v0.3**: 事前生成音声ファイル再生（mp3/wav）を追加。
- **v0.4**: 将来リアルタイムTTS接続（ただし課金系は `approval_required=TRUE` で運用）。

### 5) AI役割を固定しない運用（job_master中心）
- 役割はAI名ではなく `job_master.job_key` で定義。
- 実行時に `default_ai` / `fallback_ai` を参照して振り分け。
- 追加・削除は `job_master` 行追加/無効化で対応（コード改修を最小化）。

### 6) 「Chromeから別Webへすぐ変更」するための設計
- UIは**直接AIに接続しない**（必ずAPI層経由）。
- 画面ごとの設定は `app_config`（将来シート or JSON）に分離。
- 接続先や表示モードは設定切替で変更（Chrome固有実装を最小化）。

### 7) 実装順（まだ着手しない前提のロードマップ）
1. **Step 1: 仕様固定**（本README更新、列整合性確認）
2. **Step 2: UIモック**（静的HTMLでMia下部ドック確認）
3. **Step 3: 読み書き接続**（inbox/job_masterのみ）
4. **Step 4: Miaレビュー画面**（キュー処理導線）
5. **Step 5: 音声・アニメ段階導入**（課金承認ルール順守）

### 8) ガードレール（重要）
- 有料API・外部契約・課金発生の可能性がある機能は、`job_master.approval_required=TRUE` を必須。
- 承認状態が `approved` になるまで、実行はせず提案/見積もりのみ。
- 承認ログは `approval_status / approved_by / approved_at` に記録。


## Webアプリ画面v0仕様（実装前 / デザイン定義のみ）

この章は、Chrome Webアプリ化に向けた**最初の画面仕様（v0）**を固定するための設計。
**コード実装は行わない。**

### v0の対象機能（3つに限定）
1. `inbox` を見る（一覧確認）
2. `quick_capture` を入力する（最小1セル入力）
3. Miaレビュー状態を見る（`mia_review` / `mia_priority` の確認）

### v0でやらないこと（明示）
- 音声再生
- アニメーション（Miaドックは静止表示のみ）
- AI自動連携（自動要約・自動投稿・自動振り分け）
- 外部API呼び出し

### 画面レイアウト（共通）
- **Header**: 画面名、日付、表示モード（`PC/iPad/iPhone` 想定）
- **Main**: `inbox` 一覧（最新順）
- **Quick Capture**: 1入力欄 + 保存ボタン
- **Mia Review Status**: レビュー待ち件数 / 高優先件数 / 最終更新時刻
- **Bottom Dock**: Miaドック（静止画像 + 1行ステータス文）

### PC表示（最低限）
- 2カラム構成
  - 左: `inbox` 一覧（広め）
  - 右: `quick_capture` と `Mia Review Status`
- 下部固定: Miaドック（常時表示）
- 一覧の最低表示列: `captured_at / response_summary / connection / mia_review / mia_priority`

### iPad表示（最低限）
- 1カラム + 折りたたみパネル
  - 上: `quick_capture`
  - 中: `inbox` 一覧
  - 下: `Mia Review Status`
- Miaドックは下部固定（高さをPCより小さく）
- 右サイド情報は使わず、縦スクロール優先

### iPhone表示（最低限）
- 完全1カラム
- 表示順:
  1) `quick_capture`
  2) `Mia Review Status`
  3) `inbox` 一覧（要約は2行まで省略表示）
- Miaドックは最下部固定のミニ表示（静止アイコン + 短文）
- 初期は編集より「閲覧と1件投稿」を優先

### Miaドック v0仕様（静止）
- 表示要素:
  - Mia静止画像（1枚）
  - 状態テキスト（例: `レビュー待ち 12件`）
  - 任意ボタン1つ（例: `レビュー一覧へ`）
- 非対応:
  - 口パク/表情変化
  - 音声出力
  - 常時会話UI

### 画面v0の受け入れ基準（実装前定義）
- 3機能（一覧確認・quick_capture入力・Miaレビュー状態確認）だけで運用開始できること。
- PC/iPad/iPhoneの3表示で、主要情報が欠落しないこと。
- Miaドックは静止表示で、情報確認導線として機能すること。
- 自動化なしでも手運用フロー（記録→後レビュー）が成立すること。


## Mia仮レビュー自動補完（v0.1 / スプレッドシート内のみ）

外部AI連携を行わず、`inbox.quick_capture` の内容をもとに、
Miaレビュー列を**ルールベースで仮補完**する運用を追加する。

### 目的
- 雑入力（`quick_capture`）から、後続レビューの初期状態を自動で作る。
- まだ課金・外部APIなしで、スプレッドシート内のみで回せる状態を作る。

### 対象条件
- `inbox` シートで、以下を満たす行のみ処理する。
  - `quick_capture` が入力済み
  - `mia_review` が空欄

### 自動入力される列
- `mia_review`: `仮レビュー: quick_captureベースで一次整理（要追記）`
- `mia_priority`: キーワードと文字量によるルール判定（`高 / 中 / 低`）
- `mia_connection`: `quick_capture` の先頭要約を格納
- `status`: `Mia仮レビュー済み`
- `reviewed_at`: 実行日時
- `notes`: `auto_review:v0.1`

### 実行方法（メニュー）
1. 対象スプレッドシートを開く。
2. メニュー `AI受信箱` を開く。
3. `Mia仮レビュー実行` をクリックする。

### 注意事項
- この機能は**Googleスプレッドシート内のみ**で動作する。
- 外部API、ChatGPT API、有料連携は使用しない。
- ルールベースの仮補完のため、最終判断は人間またはMia手動レビューで確定する。
