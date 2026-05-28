/**
 * AI情報受信箱 v0 テンプレートをGoogleスプレッドシート上に作成する。
 * - inbox / master_tag / review_log の3シートを作成
 * - 1行目をヘッダー化
 * - 列幅調整
 * - ヘッダー固定
 * - 入力例を2行目へ追加（必要最小限）
 */
function createAIInboxV0Spreadsheet() {
  const ss = SpreadsheetApp.create('AI情報受信箱 v0 テンプレート');
  const SHEET_DEFS = getAIInboxV0SheetDefinitions_();

  initializeSheets_(ss, SHEET_DEFS);

  Logger.log('Created: ' + ss.getUrl());
  return ss.getUrl();
}

/**
 * アクティブな既存スプレッドシートに AI情報受信箱 v0 テンプレートを再作成する。
 * - inbox / master_tag / review_log が既に存在する場合は削除して再作成
 */
function createAIInboxV0SpreadsheetInActiveSpreadsheet() {
  const functionName = 'createAIInboxV0SpreadsheetInActiveSpreadsheet';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('アクティブなスプレッドシートが見つかりません。対象スプレッドシートを開いてから実行してください。');
  }

  Logger.log('[%s] start', functionName);
  Logger.log('[%s] target spreadsheet: %s', functionName, ss.getName());

  const SHEET_DEFS = getAIInboxV0SheetDefinitions_();
  const inboxDef = SHEET_DEFS.find(def => def.name === 'inbox');
  const inboxHeaders = inboxDef ? inboxDef.headers : [];
  Logger.log('[%s] inbox headers(def): %s', functionName, JSON.stringify(inboxHeaders));
  Logger.log('[%s] has brain_state in def: %s', functionName, String(inboxHeaders.indexOf('brain_state') !== -1));
  recreateTargetSheets_(ss, SHEET_DEFS.map(def => def.name));
  initializeSheets_(ss, SHEET_DEFS);

  const inboxSheet = ss.getSheetByName('inbox');
  if (inboxSheet) {
    const lastColumn = inboxSheet.getLastColumn();
    const actualHeaders = inboxSheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    Logger.log('[%s] inbox last column count: %s', functionName, String(lastColumn));
    Logger.log('[%s] inbox headers(actual): %s', functionName, JSON.stringify(actualHeaders));
    Logger.log('[%s] has brain_state in actual headers: %s', functionName, String(actualHeaders.indexOf('brain_state') !== -1));
  }

  Logger.log('Initialized in active spreadsheet: ' + ss.getUrl());
  return ss.getUrl();
}

function getAIInboxV0SheetDefinitions_() {
  return [
    {
      name: 'inbox',
      headers: [
        'record_id', 'captured_at', 'ai_name', 'source_link', 'project_name',
        'query_summary', 'response_summary', 'key_points', 'confidence', 'evidence_type',
        'usefulness', 'novelty', 'next_action', 'owner', 'due_date',
        'tags', 'quick_capture', 'brain_state', 'emotional_state', 'connection', 'why_important', 'future_use', 'chaos_level', 'mia_review', 'mia_priority', 'mia_connection', 'status', 'reviewed_at', 'notes'
      ],
      widths: [140, 150, 120, 240, 180, 240, 320, 220, 110, 160, 170, 100, 260, 120, 120, 160, 260, 140, 150, 220, 220, 220, 120, 220, 130, 220, 130, 120, 280],
      sampleRow: [
        'AI-20260527-001', '2026-05-27 14:00', 'Claude', 'https://example.com/chat/xxx', 'AI情報受信箱v0',
        'READMEの設計仕様を要約して', '3シート構成と運用ルールを明文化。手入力運用を優先。', '1) 3シート構成\n2) 手入力前提\n3) 将来自動化', 'Mid', '一般知識',
        'B(要検証)', '中', 'READMEの追記項目を確認して確定する', 'tomoki', '2026-05-30',
        '設計,運用,スプレッドシート', '価格軸より導入障壁軸で整理すべきかも', '集中', 'やや不安', '昨日の議事メモとの接続あり', '意思決定の軸を言語化できるため', '次回の企画検討時に参照', 4, 'Mia未レビュー', '高', '営業メモ#2026-05-27と接続候補', '未処理', '', '入力例（必要に応じて削除）'
      ]
    },
    {
      name: 'master_tag',
      headers: ['tag_name', 'tag_group', 'description', 'synonyms', 'usage_rule', 'owner', 'active', 'updated_at'],
      widths: [180, 140, 260, 220, 260, 120, 100, 120],
      sampleRow: ['競合調査', '市場', '競合比較に関する情報', '競合分析,ベンチマーク', '競合比較を含む回答で利用', 'tomoki', '有効', '2026-05-27']
    },
    {
      name: 'review_log',
      headers: [
        'review_id', 'review_date', 'reviewer', 'target_range', 'open_items', 'duplicated_items',
        'archived_items', 'decisions', 'followup_actions', 'due_date', 'status', 'memo'
      ],
      widths: [150, 120, 120, 200, 110, 130, 120, 300, 260, 120, 100, 280],
      sampleRow: [
        'RV-20260527-01', '2026-05-27', 'tomoki', '2026-05-20〜2026-05-27', 3, 1,
        0, '未処理3件を優先して確認', 'inboxのnext_actionを2件更新する', '2026-05-30', '対応中', '週次レビュー入力例'
      ]
    }
  ];
}

function recreateTargetSheets_(ss, targetNames) {
  targetNames.forEach(name => {
    const existing = ss.getSheetByName(name);
    if (existing) {
      ss.deleteSheet(existing);
    }
  });
}

function initializeSheets_(ss, sheetDefs) {
  let firstCreated = null;

  sheetDefs.forEach(def => {
    const sheet = ss.insertSheet(def.name);

    // ヘッダー
    sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
    sheet.getRange(1, 1, 1, def.headers.length).setFontWeight('bold').setBackground('#E8F0FE');

    // 入力例（2行目）
    if (def.sampleRow && def.sampleRow.length === def.headers.length) {
      sheet.getRange(2, 1, 1, def.sampleRow.length).setValues([def.sampleRow]);
      sheet.getRange(2, 1, 1, def.sampleRow.length).setFontColor('#5F6368');
    }

    // 列幅
    def.widths.forEach((w, idx) => sheet.setColumnWidth(idx + 1, w));

    // ヘッダー固定
    sheet.setFrozenRows(1);

    // 見やすさ
    sheet.getRange(1, 1, sheet.getMaxRows(), def.headers.length).setVerticalAlignment('top');
    sheet.autoResizeRows(1, 2);

    if (!firstCreated) firstCreated = sheet;
  });

  if (firstCreated) ss.setActiveSheet(firstCreated);
}
