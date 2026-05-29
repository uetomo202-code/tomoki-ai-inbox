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

/**
 * スプレッドシートを開いたときのメニューを追加する。
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('AI受信箱')
    .addItem('Mia仮レビュー実行', 'runMiaTentativeReview_')
    .addToUi();
}

/**
 * quick_capture を元に、Miaレビュー用の列をルールベースで仮補完する（外部API不使用）。
 * 対象: quick_capture が入力済み かつ mia_review が空欄 の行
 */
function runMiaTentativeReview_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('アクティブなスプレッドシートが見つかりません。');
  }

  const sheet = ss.getSheetByName('inbox');
  if (!sheet) {
    throw new Error('inbox シートが見つかりません。');
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) {
    Logger.log('[runMiaTentativeReview_] 対象データなし');
    return;
  }

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const col = getColumnIndexMap_(headers);
  const requiredColumns = ['quick_capture', 'mia_review', 'mia_priority', 'mia_connection', 'status', 'reviewed_at', 'notes'];
  requiredColumns.forEach(name => {
    if (!col[name]) {
      throw new Error('必須列が見つかりません: ' + name);
    }
  });

  const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const now = new Date();
  let updatedCount = 0;

  values.forEach((row, i) => {
    const quickCapture = String(row[col.quick_capture - 1] || '').trim();
    const miaReview = String(row[col.mia_review - 1] || '').trim();
    if (!quickCapture || miaReview) {
      return;
    }

    const rule = buildMiaRuleBasedReview_(quickCapture);
    row[col.mia_review - 1] = rule.miaReview;
    row[col.mia_priority - 1] = rule.miaPriority;
    row[col.mia_connection - 1] = rule.miaConnection;
    row[col.status - 1] = 'Mia仮レビュー済み';
    row[col.reviewed_at - 1] = now;
    row[col.notes - 1] = 'auto_review:v0.1';
    updatedCount += 1;
  });

  if (updatedCount > 0) {
    sheet.getRange(2, 1, values.length, lastCol).setValues(values);
    if (col.reviewed_at) {
      sheet.getRange(2, col.reviewed_at, values.length, 1).setNumberFormat('yyyy-mm-dd hh:mm');
    }
  }

  Logger.log('[runMiaTentativeReview_] updated rows: %s', String(updatedCount));
}

function getColumnIndexMap_(headers) {
  const map = {};
  headers.forEach((name, i) => {
    map[String(name)] = i + 1;
  });
  return map;
}

function buildMiaRuleBasedReview_(quickCapture) {
  const text = quickCapture.toLowerCase();
  const highKeywords = ['至急', 'urgent', '緊急', '障害', 'error', '失敗', 'blocked', 'deadline', '期限'];
  const mediumKeywords = ['検討', '比較', '調査', 'review', '確認', 'todo', '要件'];

  let miaPriority = '低';
  if (highKeywords.some(k => text.indexOf(k) !== -1)) {
    miaPriority = '高';
  } else if (mediumKeywords.some(k => text.indexOf(k) !== -1) || quickCapture.length >= 60) {
    miaPriority = '中';
  }

  return {
    miaReview: '仮レビュー: quick_captureベースで一次整理（要追記）',
    miaPriority: miaPriority,
    miaConnection: 'quick_capture由来: ' + quickCapture.slice(0, 80)
  };
}

function getAIInboxV0SheetDefinitions_() {
  return [
    {
      name: 'inbox',
      headers: [
        'record_id', 'captured_at', 'ai_name', 'source_link', 'project_name',
        'query_summary', 'response_summary', 'key_points', 'confidence', 'evidence_type',
        'usefulness', 'novelty', 'next_action', 'owner', 'due_date',
        'tags', 'quick_capture', 'brain_state', 'emotional_state', 'connection', 'why_important', 'future_use', 'chaos_level', 'mia_review', 'mia_priority', 'mia_connection', 'status', 'reviewed_at', 'notes', 'job_key', 'job_stage', 'assigned_ai', 'fallback_ai', 'input_contract', 'output_contract', 'quality_check', 'mia_queue', 'mia_action_type', 'mia_due_at', 'diff_base', 'diff_update', 'reassignment_note'
      ],
      widths: [140,150,120,240,180,240,320,220,110,160,170,100,260,120,120,160,260,140,150,220,220,220,120,220,130,220,130,120,280,180,140,130,130,220,220,180,140,160,130,180,220],
      sampleRow: [
        'AI-20260527-001', '2026-05-27 14:00', 'Claude', 'https://example.com/chat/xxx', 'AI情報受信箱v0',
        'READMEの設計仕様を要約して', '3シート構成と運用ルールを明文化。手入力運用を優先。', '1) 3シート構成\n2) 手入力前提\n3) 将来自動化', 'Mid', '一般知識',
        'B(要検証)', '中', 'READMEの追記項目を確認して確定する', 'tomoki', '2026-05-30',
        '設計,運用,スプレッドシート', '価格軸より導入障壁軸で整理すべきかも', '集中', 'やや不安', '昨日の議事メモとの接続あり', '意思決定の軸を言語化できるため', '次回の企画検討時に参照', 4, 'Mia未レビュー', '高', '営業メモ#2026-05-27と接続候補', '未処理', '', '入力例（必要に応じて削除）', 'web_context_collect', '収集', 'Gemini', 'ChatGPT', '検索クエリ+目的', '出典付き要約3点', '出典2件以上', 'レビュー待ち', '接続', '2026-05-30', 'AI-20260520-004', '導入障壁軸を追加', '月次でGemini→ChatGPTへ再割当検討'
      ]
    },
    {
      name: 'master_tag',
      headers: ['tag_name', 'tag_group', 'description', 'synonyms', 'usage_rule', 'owner', 'active', 'updated_at'],
      widths: [180, 140, 260, 220, 260, 120, 100, 120],
      sampleRow: ['競合調査', '市場', '競合比較に関する情報', '競合分析,ベンチマーク', '競合比較を含む回答で利用', 'tomoki', '有効', '2026-05-27']
    },

    {
      name: 'job_master',
      headers: [
        'job_key', 'job_name', 'job_stage', 'job_goal', 'default_ai', 'fallback_ai',
        'input_format', 'output_format', 'quality_check', 'confidence_rule', 'escalation_rule',
        'approval_required', 'approval_status', 'approved_by', 'approved_at', 'cost_risk',
        'allowed_actions', 'forbidden_actions', 'active', 'review_cycle', 'reassignment_note', 'notes'
      ],
      widths: [180, 180, 130, 260, 120, 120, 220, 220, 180, 180, 220, 150, 150, 130, 150, 110, 220, 220, 100, 120, 220, 260],
      sampleRow: [
        'web_context_collect', 'Web文脈収集', '収集', 'テーマに関連する一次情報を収集する', 'Gemini', 'ChatGPT',
        '検索クエリ+目的+期間', '出典URL付き要点3件', '一次情報2件以上', '根拠が弱い場合はLow', '判断不能時はMiaへエスカレーション',
        true, 'pending', '', '', 'medium',
        '公開Web検索,要約提案', '有料API実行,課金操作,外部契約', '有効', 'monthly', '月次で担当AI見直し', 'cost_risk=mediumのため承認必須'
      ]
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
