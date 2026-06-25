/* ============================================================
   TriTail — Disaster Lead Generation JS
   disaster.js  (included on disaster section pages)
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initStickyCtaBar();
  initBcpDiagnosis();
  initStockplanForm();
  initDownloadForm();
});

/* ================================================================
   Sticky CTA Bar
   ================================================================ */
function initStickyCtaBar() {
  const bar = document.querySelector('.sticky-cta-bar');
  if (!bar) return;

  const dismiss = bar.querySelector('.sticky-cta-bar__dismiss');
  let dismissed = false;
  let shown = false;

  function onScroll() {
    if (dismissed) return;
    const scrolled = window.scrollY > window.innerHeight * 0.5;
    if (scrolled && !shown) {
      bar.classList.add('is-visible');
      shown = true;
    } else if (!scrolled && shown) {
      bar.classList.remove('is-visible');
      shown = false;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (dismiss) {
    dismiss.addEventListener('click', () => {
      dismissed = true;
      bar.classList.remove('is-visible');
      setTimeout(() => { bar.style.display = 'none'; }, 400);
    });
  }
}

/* ================================================================
   BCP Diagnosis
   ================================================================ */
function initBcpDiagnosis() {
  const wrap = document.getElementById('bcpDiagnosis');
  if (!wrap) return;

  const steps    = Array.from(wrap.querySelectorAll('.diagnosis-step'));
  const progress = Array.from(wrap.querySelectorAll('.diagnosis-progress__step'));
  const label    = wrap.querySelector('.diagnosis-progress__label');
  const result   = document.getElementById('diagnosisResult');
  const restart  = document.getElementById('diagnosisRestart');

  let current = 0;
  const answers = {};

  /* Score lookup per question-option */
  const SCORES = {
    q3: { a: 3, b: 1, c: 0 },
    q4: { a: 3, b: 2, c: 0 },
    q5: { a: 2, b: 1, c: 0 },
    q6: { a: 2, b: 1, c: 0 },
    q7: { a: 2, b: 0 },
    q8: { a: 2, b: 0 },
    q9: { a: 3, b: 1, c: 0 },
    q10:{ a: 3, b: 1, c: 0 },
  };

  function updateProgress() {
    progress.forEach((el, i) => {
      el.classList.remove('is-done', 'is-active');
      if (i < current) el.classList.add('is-done');
      else if (i === current) el.classList.add('is-active');
    });
    if (label) label.textContent = (current + 1) + ' / ' + steps.length;
  }

  function showStep(n) {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === n));
    current = n;
    updateProgress();
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Option click */
  wrap.addEventListener('click', e => {
    const opt = e.target.closest('.diagnosis-option');
    if (!opt) return;
    const step = opt.closest('.diagnosis-step');
    if (!step) return;

    /* Deselect siblings */
    step.querySelectorAll('.diagnosis-option').forEach(o => o.classList.remove('is-selected'));
    opt.classList.add('is-selected');

    const qName = opt.dataset.q;
    const qVal  = opt.dataset.val;
    answers[qName] = qVal;
  });

  /* Next / Prev */
  wrap.addEventListener('click', e => {
    if (e.target.matches('[data-next]')) {
      const qKey = steps[current].dataset.q;
      if (!answers[qKey]) {
        const step = steps[current];
        step.style.outline = '2px solid var(--orange)';
        step.style.borderRadius = '8px';
        setTimeout(() => { step.style.outline = ''; step.style.borderRadius = ''; }, 800);
        return;
      }
      if (current < steps.length - 1) {
        showStep(current + 1);
      } else {
        showResults();
      }
    }
    if (e.target.matches('[data-prev]')) {
      if (current > 0) showStep(current - 1);
    }
  });

  function calcScore() {
    let score = 0;
    Object.entries(SCORES).forEach(([q, map]) => {
      const val = answers[q];
      if (val && map[val] !== undefined) score += map[val];
    });
    return score;
  }

  function getGrade(score) {
    if (score >= 18) return { grade: 'S', title: '防災対策 優良', color: '#38a169' };
    if (score >= 14) return { grade: 'A', title: '防災対策 良好', color: var_gold() };
    if (score >= 9)  return { grade: 'B', title: '改善が必要', color: var_orange() };
    if (score >= 5)  return { grade: 'C', title: '緊急対応が必要', color: '#e53e3e' };
    return              { grade: 'D', title: '非常に危険な状態', color: '#c53030' };
  }

  function var_gold()   { return '#D6A33A'; }
  function var_orange() { return '#D96E28'; }

  const RISK_TEXTS = {
    S: {
      risk:      '現状のリスクレベルは低く、高い防災対応力があります。',
      improve:   '定期的な見直しと訓練の継続を推奨します。',
      priority:  '年次見直し・最新情報の収集',
    },
    A: {
      risk:      'おおむね良好ですが、一部に改善余地があります。',
      improve:   '不足している備蓄品の補充と手順の文書化を進めましょう。',
      priority:  '不足品目の補充・マニュアル整備',
    },
    B: {
      risk:      '複数の備蓄・BCP対策が不十分で、災害時に被害が拡大するリスクがあります。',
      improve:   '備蓄品の整備とBCP策定を優先的に進めてください。',
      priority:  'BCP策定・備蓄品の早急な整備',
    },
    C: {
      risk:      '備蓄・BCP対策が大幅に不足しており、従業員の安全確保が困難な状態です。',
      improve:   '今すぐ専門家に相談し、優先順位をつけて対策を開始してください。',
      priority:  '緊急の備蓄整備・専門家への相談',
    },
    D: {
      risk:      '防災対策がほとんど未実施で、大規模災害時に甚大な被害を受けるリスクが非常に高い状態です。',
      improve:   '直ちに専門家に相談し、最低限の備蓄確保から始めてください。',
      priority:  '今すぐ専門家への相談が必要',
    },
  };

  const RECS_BY_ANSWER = {
    q3_c: '【最優先】BCP（事業継続計画）の策定を開始してください。ゼロから始める場合でも専門家がサポートします。',
    q4_c: '3日分以上の備蓄が推奨されています。まず72時間分の飲料水と食料を確保することから始めましょう。',
    q5_c: '1人1日3Lの飲料水が必要です。従業員数×3日×3L分の保存水を用意してください。',
    q6_c: '3日分の食料備蓄が必要です。アレルギー対応食や調理不要な非常食の選定をお手伝いします。',
    q7_b: '簡易トイレは災害時に最も不足するアイテムの一つです。1人あたり1日5回を目安に備蓄を。',
    q8_b: '防災マニュアル（行動指針・連絡体制・避難ルート）の整備が急務です。',
    q9_c: '年1回以上の防災訓練を実施してください。訓練なきマニュアルは機能しません。',
    q10_c: '帰宅困難者対策（3日分の食料・宿泊場所の確保）が企業に求められています。',
  };

  function showResults() {
    const score = calcScore();
    const { grade, title } = getGrade(score);
    const texts = RISK_TEXTS[grade];

    /* Grade display */
    const gradeEl = document.getElementById('scoreGrade');
    const titleEl = document.getElementById('scoreTitle');
    if (gradeEl) gradeEl.textContent = grade;
    if (titleEl) titleEl.textContent = title;

    /* Risk items */
    const riskEl    = document.getElementById('resultRisk');
    const improveEl = document.getElementById('resultImprove');
    const priorEl   = document.getElementById('resultPriority');
    if (riskEl)    riskEl.textContent    = texts.risk;
    if (improveEl) improveEl.textContent = texts.improve;
    if (priorEl)   priorEl.textContent   = texts.priority;

    /* Recommendations */
    const recList = document.getElementById('recList');
    if (recList) {
      recList.innerHTML = '';
      const recs = buildRecs(answers, grade);
      recs.forEach(r => {
        const li = document.createElement('div');
        li.className = 'result-rec-item';
        li.innerHTML = '<span class="result-rec-item__icon" aria-hidden="true">✓</span><span>' + r + '</span>';
        recList.appendChild(li);
      });
    }

    /* Hide form, show result */
    wrap.style.display = 'none';
    if (result) result.classList.add('is-visible');
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildRecs(ans, grade) {
    const recs = [];
    if (ans.q3 === 'c') recs.push(RECS_BY_ANSWER.q3_c);
    if (ans.q4 === 'c') recs.push(RECS_BY_ANSWER.q4_c);
    if (ans.q5 === 'c') recs.push(RECS_BY_ANSWER.q5_c);
    if (ans.q6 === 'c') recs.push(RECS_BY_ANSWER.q6_c);
    if (ans.q7 === 'b') recs.push(RECS_BY_ANSWER.q7_b);
    if (ans.q8 === 'b') recs.push(RECS_BY_ANSWER.q8_b);
    if (ans.q9 === 'c') recs.push(RECS_BY_ANSWER.q9_c);
    if (ans.q10 === 'c') recs.push(RECS_BY_ANSWER.q10_c);
    if (recs.length === 0) {
      recs.push('現在の対策を維持しつつ、年次見直しを定期的に実施してください。');
      recs.push('最新の防災情報・法令改正に対応するため、専門家との定期相談をお勧めします。');
      recs.push('従業員への防災教育・啓発活動を継続することで対策レベルをさらに向上できます。');
    }
    return recs;
  }

  if (restart) {
    restart.addEventListener('click', () => {
      Object.keys(answers).forEach(k => delete answers[k]);
      wrap.querySelectorAll('.diagnosis-option').forEach(o => o.classList.remove('is-selected'));
      wrap.style.display = '';
      if (result) result.classList.remove('is-visible');
      showStep(0);
    });
  }

  showStep(0);
}

/* ================================================================
   Stockpile Plan Calculator
   ================================================================ */
function initStockplanForm() {
  const form   = document.getElementById('stockplanForm');
  const result = document.getElementById('stockplanResult');
  const restart = document.getElementById('stockplanRestart');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const emp  = parseInt(form.querySelector('[name="employees"]').value) || 0;
    const base = parseInt(form.querySelector('[name="bases"]').value)     || 1;
    const days = parseInt(form.querySelector('input[name="days"]:checked')?.value) || 3;

    if (emp < 1) {
      alert('従業員数を入力してください。');
      return;
    }

    const total = emp * base;

    const calc = {
      water:   { qty: Math.ceil(total * days * 3),  unit: 'L',  icon: '💧', name: '保存水', note: '1人1日3L基準' },
      food:    { qty: Math.ceil(total * days * 3),  unit: '食', icon: '🍱', name: '保存食', note: '1人1日3食基準' },
      toilet:  { qty: Math.ceil(total * days * 5),  unit: '回分',icon:'🚽', name: '簡易トイレ', note: '1人1日5回基準' },
      blanket: { qty: Math.ceil(emp * base),         unit: '枚', icon: '🛏️', name: '毛布', note: '1拠点×人数分' },
      hygiene: { qty: Math.ceil(total / 10),        unit: 'セット',icon:'🧴', name: '衛生用品', note: '10名に1セット' },
      light:   { qty: Math.ceil(total / 5) * base,  unit: '個', icon: '🔦', name: 'ライト', note: '5名に1個×拠点数' },
      power:   { qty: Math.ceil(total / 20) * base, unit: '台', icon: '🔋', name: 'モバイル電源', note: '20名に1台×拠点数' },
      helmet:  { qty: Math.ceil(total),             unit: '個', icon: '⛑️', name: '防災ヘルメット', note: '1人1個' },
    };

    /* Fill result header */
    const hdr = document.getElementById('planHeader');
    if (hdr) {
      hdr.querySelector('[data-emp]').textContent  = emp + '名';
      hdr.querySelector('[data-base]').textContent = base + '拠点';
      hdr.querySelector('[data-days]').textContent = days + '日分';
    }

    /* Fill grid */
    const grid = document.getElementById('planGrid');
    if (grid) {
      grid.innerHTML = Object.values(calc).map(c =>
        `<div class="plan-item">
          <span class="plan-item__icon">${c.icon}</span>
          <div class="plan-item__name">${c.name}</div>
          <div class="plan-item__qty">${c.qty.toLocaleString()}</div>
          <div class="plan-item__unit">${c.unit}</div>
          <div class="plan-item__note">${c.note}</div>
        </div>`
      ).join('');
    }

    form.style.display = 'none';
    if (result) result.classList.add('is-visible');
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  if (restart) {
    restart.addEventListener('click', () => {
      form.reset();
      form.style.display = '';
      if (result) result.classList.remove('is-visible');
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

/* ================================================================
   Download Form
   ================================================================ */
function initDownloadForm() {
  const form    = document.getElementById('downloadForm');
  const success = document.getElementById('downloadSuccess');
  const btn     = document.getElementById('downloadSubmit');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (btn) { btn.disabled = true; btn.textContent = '送信中...'; }

    const data = Object.fromEntries(new FormData(form).entries());
    data.message = '【資料ダウンロード申込】業種:' + data.industry + ' 従業員数:' + data.employee_count + '名';

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      if (res.ok) {
        form.style.display = 'none';
        if (success) success.classList.add('is-visible');
        success.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        throw new Error('server error');
      }
    } catch {
      if (btn) { btn.disabled = false; btn.textContent = '資料をダウンロードする'; }
      alert('送信に失敗しました。しばらく経ってから再度お試しいただくか、info@tritail.co.jp までご連絡ください。');
    }
  });
}
