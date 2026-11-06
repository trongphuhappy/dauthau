// Hệ Thống Học Thuộc Nhanh & Luyện Thi 340 Câu Đấu Thầu
(function () {
  "use strict";

  const STORAGE_KEY = "DAUTHAU_340_PROGRESS_V1";

  // State
  let allQuestions = [];
  let topicsMap = {};
  let userProgress = {
    mastered: {},    // { [id]: true }
    learning: {},    // { [id]: true }
    wrong: {},       // { [id]: count }
    bookmarked: {},  // { [id]: true }
    examHistory: [], // [{ date, total, correct, score, durationSec, modeName }]
    theme: "light"
  };

  // Speed Study State
  let speedState = {
    filtered: [],
    page: 1,
    pageSize: 25,
    hlKeywords: true,
    onlyCorrect: false,
    recallMask: false,
    revealedIds: {}
  };

  // Flashcard State
  let fcState = {
    deck: [],
    index: 0,
    flipped: false
  };

  // Practice State
  let pracState = {
    list: [],
    index: 0,
    answers: {},       // { [id]: chosenLetter }
    optionMaps: {},    // { [id]: [{ displayLetter, origLetter, text }] }
    shuffleQ: false,
    shuffleOpt: false,
    correctCount: 0,
    wrongCount: 0
  };

  // Exam State
  let examState = {
    active: false,
    submitted: false,
    modeName: "Đề chuẩn 60 câu",
    questions: [],
    index: 0,
    answers: {},       // { [id]: origLetter }
    flagged: {},       // { [id]: true }
    optionMaps: {},    // { [id]: [{ displayLetter, origLetter, text }] }
    durationSec: 3600,
    remainingSec: 3600,
    timerId: null,
    reviewFilter: "ALL" // ALL | WRONG | CORRECT | UNANSWERED
  };

  // Utility: Escape HTML
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Utility: Highlight a keyword substring inside text safely
  function highlightSubstring(text, keyword, cssClass) {
    if (!text) return "";
    if (!keyword || keyword.trim().length < 2) {
      return escapeHtml(text);
    }
    const cleanText = String(text);
    const cleanKw = String(keyword).trim();
    const idx = cleanText.toLowerCase().indexOf(cleanKw.toLowerCase());
    if (idx === -1) {
      return escapeHtml(cleanText);
    }
    const before = escapeHtml(cleanText.slice(0, idx));
    const match = escapeHtml(cleanText.slice(idx, idx + cleanKw.length));
    const after = escapeHtml(cleanText.slice(idx + cleanKw.length));
    return `${before}<span class="${cssClass}">${match}</span>${after}`;
  }

  // Utility: Fisher-Yates shuffle
  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  // Check if a question's options reference specific letters or position ("Phương án A và B", "Tất cả phương án trên", etc.)
  function canShuffleOptions(q) {
    const combined = Object.values(q.options).join(" ").toLowerCase();
    if (
      combined.includes("phương án trên") ||
      combined.includes("đáp án trên") ||
      combined.includes("cả 3") ||
      combined.includes("cả 2") ||
      combined.includes("cả hai") ||
      combined.includes("tất cả") ||
      /phương án [abcd]/.test(combined) ||
      /đáp án [abcd]/.test(combined)
    ) {
      return false;
    }
    return true;
  }

  function buildOptionMap(q, doShuffle) {
    const letters = ["A", "B", "C", "D"];
    let origOrder = letters.slice();
    if (doShuffle && canShuffleOptions(q)) {
      origOrder = shuffleArray(origOrder);
    }
    return origOrder.map((origKey, idx) => ({
      displayLetter: letters[idx],
      origLetter: origKey,
      text: q.options[origKey] || ""
    }));
  }

  // Load & Save Progress
  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        userProgress = Object.assign(userProgress, parsed);
      }
    } catch (e) {
      console.warn("Could not load progress:", e);
    }
    applyTheme(userProgress.theme || "light");
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (e) {
      console.warn("Could not save progress:", e);
    }
    updateGlobalStatsUI();
  }

  function applyTheme(theme) {
    userProgress.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("btn-theme-toggle");
    if (btn) {
      btn.innerHTML = theme === "dark" ? "☀️ Giao diện sáng" : "🌙 Giao diện tối";
    }
  }

  // Initialize Data
  function initApp() {
    allQuestions = (window.QUESTIONS_DATA || []).slice().sort((a, b) => a.id - b.id);
    (window.BIDDING_TOPICS || []).forEach((t) => {
      topicsMap[t.id] = t;
    });

    loadProgress();
    populateTopicSelects();
    renderMasterTips("");
    updateGlobalStatsUI();
    renderDashboard();

    // Initialize Speed Study
    applySpeedFilters(false);

    // Initialize Flashcards
    applyFlashcardFilters(false);

    // Initialize Practice
    initPracticeSession();

    // Event Listeners
    setupEventListeners();
    updateMobileStickyBar();

    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  function populateTopicSelects() {
    const topicSelectIds = [
      "speed-topic-filter",
      "fc-topic-filter",
      "prac-topic-filter",
      "custom-exam-topic"
    ];
    const topics = window.BIDDING_TOPICS || [];
    topicSelectIds.forEach((selId) => {
      const sel = document.getElementById(selId);
      if (!sel) return;
      topics.forEach((t) => {
        const count = allQuestions.filter((q) => q.topic_id === t.id).length;
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = `${t.icon} ${t.name} (${count} câu)`;
        sel.appendChild(opt);
      });
    });
  }

  function updateGlobalStatsUI() {
    const masteredCount = Object.keys(userProgress.mastered).length;
    const wrongCount = Object.keys(userProgress.wrong).length;
    const bookmarkedCount = Object.keys(userProgress.bookmarked).length;
    const unlearnedCount = Math.max(0, allQuestions.length - masteredCount);
    const pct = allQuestions.length ? Math.round((masteredCount / allQuestions.length) * 100) : 0;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt("hdr-mastered", masteredCount);
    setTxt("hdr-wrong", wrongCount);
    setTxt("hdr-bookmarked", bookmarkedCount);

    setTxt("dash-mastered", `${masteredCount} câu`);
    setTxt("dash-mastered-pct", `Chiếm ${pct}% tổng số 340 câu`);
    setTxt("dash-unlearned", `${unlearnedCount} câu`);
    setTxt("dash-wrong", `${wrongCount} câu`);
    setTxt("dash-bookmarked", `${bookmarkedCount} câu`);
  }

  // Render Dashboard Topics & History
  function renderDashboard() {
    const container = document.getElementById("topics-grid-container");
    if (container) {
      const topics = window.BIDDING_TOPICS || [];
      container.innerHTML = topics
        .map((t) => {
          const qs = allQuestions.filter((q) => q.topic_id === t.id);
          const total = qs.length;
          const mastered = qs.filter((q) => userProgress.mastered[q.id]).length;
          const wrong = qs.filter((q) => userProgress.wrong[q.id]).length;
          const pct = total ? Math.round((mastered / total) * 100) : 0;

          return `
            <div class="topic-card">
              <div>
                <div class="topic-card-top">
                  <div class="topic-icon">${t.icon}</div>
                  <div class="topic-info">
                    <h3>${escapeHtml(t.name)}</h3>
                    <p>${escapeHtml(t.desc)}</p>
                  </div>
                </div>
              </div>
              <div>
                <div class="topic-meta" style="margin-bottom:6px;">
                  <span>Đã thuộc: <strong>${mastered}/${total}</strong> câu (${pct}%)</span>
                  ${wrong > 0 ? `<span style="color:var(--danger)">❌ ${wrong} câu sai</span>` : `<span>✨ Tốt</span>`}
                </div>
                <div class="progress-bar-wrap" style="margin-bottom:12px;">
                  <div class="progress-bar-fill" style="width:${pct}%"></div>
                </div>
                <div class="topic-actions">
                  <button class="btn btn-sm btn-outline-primary" onclick="openTopicInSpeed('${t.id}')">
                    ⚡ Học nhanh
                  </button>
                  <button class="btn btn-sm" onclick="openTopicInPractice('${t.id}')">
                    🎯 Luyện tập
                  </button>
                  <button class="btn btn-sm" onclick="startQuickExam(${total}, ${Math.max(15, Math.ceil(total * 0.9))}, '${t.id}', false)">
                    📝 Kiểm tra
                  </button>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    renderExamHistory();
  }

  function renderExamHistory() {
    const histEl = document.getElementById("exam-history-container");
    if (!histEl) return;
    const hist = userProgress.examHistory || [];
    if (hist.length === 0) {
      histEl.innerHTML = `
        <div class="toolbar-card" style="text-align:center; color:var(--text-muted); padding:24px;">
          Chưa có lịch sử bài thi thử nào. Hãy bấm <strong>"Thi Thử Đề Ngẫu Nhiên 60 Câu"</strong> để kiểm tra trình độ hiện tại của bạn!
        </div>
      `;
      return;
    }

    histEl.innerHTML = `
      <div class="toolbar-card" style="gap:10px;">
        ${hist
          .slice(0, 10)
          .map((h) => {
            const passed = h.score >= 70;
            const mins = Math.floor((h.durationSec || 0) / 60);
            const secs = (h.durationSec || 0) % 60;
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:8px; background:var(--bg-subtle); border:1px solid var(--border-color); flex-wrap:wrap; gap:10px;">
                <div>
                  <strong style="font-size:14.5px;">${escapeHtml(h.modeName || "Bài kiểm tra")}</strong>
                  <span style="font-size:12.5px; color:var(--text-muted); margin-left:8px;">🕒 ${escapeHtml(h.date)} • Thời gian làm: ${mins}p${secs}s</span>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                  <span style="font-size:14px; font-weight:700;">Đúng: ${h.correct}/${h.total} câu</span>
                  <span class="mini-stat ${passed ? "success" : "danger"}">
                    ${h.score} điểm (${passed ? "ĐẠT" : "CHƯA ĐẠT"})
                  </span>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  // TAB 2: Render Master Tips
  function renderMasterTips(searchQuery) {
    const container = document.getElementById("master-tips-container");
    if (!container) return;
    const qLower = (searchQuery || "").trim().toLowerCase();
    const sections = window.MASTER_TIPS || [];

    const html = sections
      .map((sec) => {
        const filteredItems = sec.items.filter((item) => {
          if (!qLower) return true;
          return (
            item.key.toLowerCase().includes(qLower) ||
            item.rule.toLowerCase().includes(qLower) ||
            item.questions.some((qNum) => String(qNum) === qLower || `câu ${qNum}` === qLower)
          );
        });

        if (filteredItems.length === 0) return "";

        return `
          <div class="tips-section-card">
            <div class="tips-section-header">
              <h3>${sec.icon} ${escapeHtml(sec.title)}</h3>
              <span class="mini-stat warning">${escapeHtml(sec.badge)}</span>
            </div>
            <p style="font-size:13.5px; color:var(--text-secondary);">${escapeHtml(sec.summary)}</p>
            <div class="tips-table">
              ${filteredItems
                .map(
                  (item) => `
                <div class="tip-row">
                  <div class="tip-key">${escapeHtml(item.key)}</div>
                  <div class="tip-body">
                    <div class="tip-rule">${escapeHtml(item.rule)}</div>
                    <div class="tip-q-links">
                      <span style="font-size:12px; color:var(--text-muted); font-weight:600;">Xem câu áp dụng:</span>
                      ${item.questions
                        .map(
                          (qId) =>
                            `<button class="q-chip" onclick="openQuestionModal(${qId})">Câu ${qId}</button>`
                        )
                        .join("")}
                    </div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");

    container.innerHTML =
      html ||
      `<div class="toolbar-card" style="text-align:center; padding:32px; color:var(--text-muted);">Không tìm thấy mẹo nào khớp với từ khóa "${escapeHtml(searchQuery)}".</div>`;
  }

  // Question Status Actions
  window.toggleBookmark = function (id, evt) {
    if (evt) evt.stopPropagation();
    if (userProgress.bookmarked[id]) {
      delete userProgress.bookmarked[id];
    } else {
      userProgress.bookmarked[id] = true;
    }
    saveProgress();
    refreshCurrentTabUI();
  };

  window.markQuestionStatus = function (id, status, evt) {
    if (evt) evt.stopPropagation();
    if (status === "MASTERED") {
      userProgress.mastered[id] = true;
      delete userProgress.learning[id];
    } else if (status === "LEARNING") {
      userProgress.learning[id] = true;
      delete userProgress.mastered[id];
    }
    saveProgress();
    refreshCurrentTabUI();
  };

  window.revealRecallCard = function (id) {
    speedState.revealedIds[id] = true;
    renderSpeedList();
  };

  function refreshCurrentTabUI() {
    const activeTab = document.querySelector(".nav-tab.active");
    const tabId = activeTab ? activeTab.getAttribute("data-tab") : "tab-dashboard";
    if (tabId === "tab-dashboard") renderDashboard();
    else if (tabId === "tab-speed") renderSpeedList();
    else if (tabId === "tab-flashcard") renderFlashcard();
    else if (tabId === "tab-practice") renderPracticeCurrent();
  }

  const SET_ALL_CORRECT_18 = new Set([2, 10, 11, 101, 113, 118, 123, 135, 184, 213, 222, 231, 238, 256, 260, 262, 277, 286]);
  const SET_TWO_CORRECT_20 = new Set([6, 9, 44, 45, 71, 90, 93, 107, 138, 176, 209, 211, 221, 224, 233, 241, 252, 261, 272, 275]);
  const SET_TRAP_ALL_16 = new Set([30, 43, 46, 73, 92, 110, 115, 201, 215, 232, 237, 247, 269, 273, 274, 300]);
  const SET_TRAP_TWO_30 = new Set([20, 27, 29, 41, 59, 85, 89, 103, 108, 125, 131, 132, 139, 148, 149, 165, 170, 183, 186, 193, 214, 242, 250, 253, 254, 255, 276, 294, 312, 318]);
  const SET_ALL_WRONG_3 = new Set([296, 301, 314]);

  function normalizeVn(str) {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  }

  // Helper to filter questions by topic, range, status, search
  function filterQuestionList({ topic, range, status, search }) {
    let list = allQuestions.slice();

    if (topic && topic !== "ALL") {
      list = list.filter((q) => q.topic_id === topic);
    }

    if (range && range !== "ALL") {
      const parts = range.split("-").map(Number);
      if (parts.length === 2) {
        list = list.filter((q) => q.id >= parts[0] && q.id <= parts[1]);
      }
    }

    if (status && status !== "ALL") {
      if (status === "TRAP") {
        list = list.filter((q) => !!q.is_trap);
      } else if (status === "ALL_CORRECT_18") {
        list = list.filter((q) => SET_ALL_CORRECT_18.has(q.id));
      } else if (status === "TWO_CORRECT_20") {
        list = list.filter((q) => SET_TWO_CORRECT_20.has(q.id));
      } else if (status === "COMBINED_38") {
        list = list.filter((q) => SET_ALL_CORRECT_18.has(q.id) || SET_TWO_CORRECT_20.has(q.id));
      } else if (status === "TRAP_ALL_16") {
        list = list.filter((q) => SET_TRAP_ALL_16.has(q.id));
      } else if (status === "TRAP_TWO_30") {
        list = list.filter((q) => SET_TRAP_TWO_30.has(q.id));
      } else if (status === "ALL_WRONG_3") {
        list = list.filter((q) => SET_ALL_WRONG_3.has(q.id));
      } else if (status === "MASTERED") {
        list = list.filter((q) => !!userProgress.mastered[q.id]);
      } else if (status === "UNLEARNED") {
        list = list.filter((q) => !userProgress.mastered[q.id]);
      } else if (status === "WRONG") {
        list = list.filter((q) => !!userProgress.wrong[q.id]);
      } else if (status === "BOOKMARKED") {
        list = list.filter((q) => !!userProgress.bookmarked[q.id]);
      }
    }

    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      const sNorm = normalizeVn(s);
      // Check if exact question number
      const numMatch = s.match(/^(?:câu\s*|cau\s*)?(\d+)$/);
      if (numMatch) {
        const targetId = Number(numMatch[1]);
        list = list.filter((q) => q.id === targetId || String(q.id).includes(numMatch[1]));
      } else {
        list = list.filter((q) => {
          const inQ = q.question.toLowerCase().includes(s) || normalizeVn(q.question).includes(sNorm);
          const inOpts = Object.values(q.options).some(
            (v) => v.toLowerCase().includes(s) || normalizeVn(v).includes(sNorm)
          );
          const inTip = (q.tip || "").toLowerCase().includes(s) || normalizeVn(q.tip).includes(sNorm);
          const inExp =
            (q.explanation || "").toLowerCase().includes(s) ||
            normalizeVn(q.explanation).includes(sNorm);
          return inQ || inOpts || inTip || inExp;
        });
      }
    }

    return list;
  }

  window.quickKeywordSearch = function (kw) {
    const speedSearch = document.getElementById("speed-search");
    const globalSearch = document.getElementById("global-keyword-search");
    const statusSel = document.getElementById("speed-status-filter");
    const topicSel = document.getElementById("speed-topic-filter");
    const rangeSel = document.getElementById("speed-range-filter");
    if (speedSearch) speedSearch.value = kw;
    if (globalSearch) globalSearch.value = kw;
    if (statusSel) statusSel.value = "ALL";
    if (topicSel) topicSel.value = "ALL";
    if (rangeSel) rangeSel.value = "ALL";
    applySpeedFilters(false);
    switchTab("tab-speed");
  };

  // TAB 3: Speed Memorization Mode
  function applySpeedFilters(doShuffle) {
    const topic = document.getElementById("speed-topic-filter")?.value || "ALL";
    const range = document.getElementById("speed-range-filter")?.value || "ALL";
    const status = document.getElementById("speed-status-filter")?.value || "ALL";
    const search = document.getElementById("speed-search")?.value || "";

    let list = filterQuestionList({ topic, range, status, search });
    if (doShuffle) {
      list = shuffleArray(list);
    }
    speedState.filtered = list;
    speedState.page = 1;
    speedState.revealedIds = {};
    renderSpeedList();
  }

  function renderQuestionCardHTML(q, options = {}) {
    const {
      hlKeywords = true,
      onlyCorrect = false,
      recallMasked = false
    } = options;

    const topicObj = topicsMap[q.topic_id] || { icon: "📌", shortName: "Chủ đề" };
    const isMastered = !!userProgress.mastered[q.id];
    const isLearning = !!userProgress.learning[q.id];
    const isWrong = !!userProgress.wrong[q.id];
    const isBookmarked = !!userProgress.bookmarked[q.id];

    let statusClass = "";
    if (isMastered) statusClass = "status-mastered";
    else if (isWrong) statusClass = "status-wrong";
    else if (isLearning) statusClass = "status-learning";

    const qTextHtml = hlKeywords
      ? highlightSubstring(q.question, q.question_keyword, "hl-q")
      : escapeHtml(q.question);

    const letters = ["A", "B", "C", "D"];
    const optionsHtml = letters
      .map((letter) => {
        const isCorrect = q.answer === letter;
        if (onlyCorrect && !isCorrect) return "";
        const rawOpt = q.options[letter] || "";
        const optHtml =
          hlKeywords && isCorrect && !recallMasked
            ? highlightSubstring(rawOpt, q.answer_keyword, "hl-a")
            : escapeHtml(rawOpt);

        return `
          <div class="option-item disabled ${isCorrect ? "correct-option" : ""}">
            <div class="option-letter">${letter}</div>
            <div class="option-content">${optHtml}</div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="question-card ${statusClass} ${recallMasked ? "recall-masked" : ""}" id="q-card-${q.id}">
        <div class="q-header">
          <div class="q-badges">
            <span class="q-number-badge">Câu ${q.id}</span>
            <span class="q-topic-badge">${topicObj.icon} ${escapeHtml(topicObj.shortName)}</span>
            ${q.is_trap ? `<span class="mini-stat danger" style="padding:2px 8px; font-size:11.5px;">🔥 Câu bẫy dễ sai</span>` : ""}
            ${q.legal_note ? `<span class="q-legal-badge">📜 ${escapeHtml(q.legal_note)}</span>` : ""}
            ${isWrong ? `<span class="mini-stat danger" style="padding:2px 8px; font-size:11.5px;">❌ Hay sai (${userProgress.wrong[q.id]} lần)</span>` : ""}
          </div>
          <div class="q-actions">
            <button class="btn btn-sm btn-outline-primary" onclick="askQuanSuQuestion(${q.id}, event)" title="Nhờ Quân Sư phân tích chiến thuật lụi & mẹo nhớ câu này">
              🧙‍♂️ Quân Sư soi
            </button>
            <button class="btn btn-sm ${isMastered ? "btn-success" : "btn-outline-success"}" onclick="markQuestionStatus(${q.id}, 'MASTERED', event)">
              ${isMastered ? "✅ Đã thuộc" : "Đánh dấu Đã thuộc"}
            </button>
            <button class="btn btn-sm ${isLearning ? "btn-warning" : "btn-outline-warning"}" onclick="markQuestionStatus(${q.id}, 'LEARNING', event)">
              ⏳ Cần ôn
            </button>
            <button class="star-btn ${isBookmarked ? "bookmarked" : ""}" onclick="toggleBookmark(${q.id}, event)" title="Đánh dấu sao câu hỏi này">
              ${isBookmarked ? "★" : "☆"}
            </button>
          </div>
        </div>

        <div class="q-text">${qTextHtml}</div>

        <div class="options-list">
          ${optionsHtml}
        </div>

        ${
          recallMasked
            ? `<button class="recall-reveal-btn" onclick="revealRecallCard(${q.id})">👁️ Bấm để hiện Đáp Án Đúng, Mẹo Ghi Nhớ & Giải Thích</button>`
            : ""
        }

        <div class="insight-box">
          <div class="tip-block">
            <span class="tip-block-icon">💡</span>
            <div>
              <strong>Mẹo nhớ nhanh 3 giây:</strong> ${escapeHtml(q.tip || "Chú ý cụm từ khóa được tô sáng ở câu hỏi và phương án đúng.")}
            </div>
          </div>
          <div class="exp-block">
            <span class="exp-block-icon">📖</span>
            <div>
              <strong>Giải thích dễ hiểu:</strong> ${escapeHtml(q.explanation || "")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSpeedList() {
    const container = document.getElementById("speed-list-container");
    const countLabel = document.getElementById("speed-count-label");
    const pagBar = document.getElementById("speed-pagination");
    if (!container) return;

    const total = speedState.filtered.length;
    if (countLabel) countLabel.textContent = total;

    if (total === 0) {
      container.innerHTML = `
        <div class="toolbar-card" style="text-align:center; padding:36px; color:var(--text-muted);">
          Không có câu hỏi nào trong bộ lọc hiện tại. Hãy đổi bộ lọc hoặc từ khóa tìm kiếm!
        </div>
      `;
      if (pagBar) pagBar.style.display = "none";
      return;
    }

    const totalPages = Math.ceil(total / speedState.pageSize);
    if (speedState.page > totalPages) speedState.page = totalPages;
    const startIdx = (speedState.page - 1) * speedState.pageSize;
    const slice = speedState.filtered.slice(startIdx, startIdx + speedState.pageSize);

    container.innerHTML = slice
      .map((q) =>
        renderQuestionCardHTML(q, {
          hlKeywords: speedState.hlKeywords,
          onlyCorrect: speedState.onlyCorrect,
          recallMasked: speedState.recallMask && !speedState.revealedIds[q.id]
        })
      )
      .join("");

    if (pagBar) {
      pagBar.style.display = "flex";
      pagBar.innerHTML = `
        <div style="font-size:13.5px; color:var(--text-secondary); font-weight:600;">
          Hiển thị câu <strong>${startIdx + 1} – ${Math.min(total, startIdx + speedState.pageSize)}</strong> trên tổng số <strong>${total}</strong> câu
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-sm" ${speedState.page <= 1 ? "disabled" : ""} onclick="changeSpeedPage(${speedState.page - 1})">⬅️ Trang trước</button>
          <span style="font-size:13.5px; font-weight:700; padding:0 8px;">Trang ${speedState.page} / ${totalPages}</span>
          <button class="btn btn-sm" ${speedState.page >= totalPages ? "disabled" : ""} onclick="changeSpeedPage(${speedState.page + 1})">Trang sau ➡️</button>
        </div>
      `;
    }
  }

  window.changeSpeedPage = function (newPage) {
    speedState.page = newPage;
    renderSpeedList();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // TAB 4: Flashcards
  function applyFlashcardFilters(doShuffle) {
    const topic = document.getElementById("fc-topic-filter")?.value || "ALL";
    const status = document.getElementById("fc-status-filter")?.value || "ALL";
    let deck = filterQuestionList({ topic, range: "ALL", status, search: "" });
    if (doShuffle) {
      deck = shuffleArray(deck);
    }
    fcState.deck = deck;
    fcState.index = 0;
    fcState.flipped = false;
    renderFlashcard();
  }

  function renderFlashcard() {
    const box = document.getElementById("flashcard-box");
    const label = document.getElementById("fc-index-label");
    if (!box) return;

    const total = fcState.deck.length;
    if (total === 0) {
      if (label) label.textContent = "0 / 0";
      box.className = "flashcard-box";
      box.innerHTML = `
        <div style="margin:auto; text-align:center; color:var(--text-muted);">
          <div style="font-size:40px; margin-bottom:10px;">🎉</div>
          <h3>Không có thẻ nào trong bộ lọc này!</h3>
          <p style="font-size:14px; margin-top:6px;">Hãy chọn bộ lọc khác ở thanh công cụ phía trên.</p>
        </div>
      `;
      return;
    }

    if (fcState.index >= total) fcState.index = 0;
    if (fcState.index < 0) fcState.index = total - 1;

    const q = fcState.deck[fcState.index];
    const topicObj = topicsMap[q.topic_id] || { icon: "📌", shortName: "Chủ đề" };
    const isBookmarked = !!userProgress.bookmarked[q.id];
    const isMastered = !!userProgress.mastered[q.id];

    if (label) label.textContent = `${fcState.index + 1} / ${total}`;
    box.className = `flashcard-box ${fcState.flipped ? "flipped" : ""}`;

    if (!fcState.flipped) {
      // Front side
      box.innerHTML = `
        <div>
          <div class="q-header">
            <div class="q-badges">
              <span class="q-number-badge">Câu ${q.id}</span>
              <span class="q-topic-badge">${topicObj.icon} ${escapeHtml(topicObj.shortName)}</span>
              ${isMastered ? `<span class="mini-stat success" style="padding:2px 8px; font-size:11.5px;">✅ Đã thuộc</span>` : ""}
            </div>
            <button class="star-btn ${isBookmarked ? "bookmarked" : ""}" onclick="toggleBookmark(${q.id}, event)">
              ${isBookmarked ? "★ Đã lưu" : "☆ Lưu sao"}
            </button>
          </div>
          <div class="q-text" style="font-size:18px; margin-top:12px;">
            ${highlightSubstring(q.question, q.question_keyword, "hl-q")}
          </div>
          <div class="options-list" style="margin-top:18px;">
            ${["A", "B", "C", "D"]
              .map(
                (l) => `
              <div class="option-item disabled">
                <div class="option-letter">${l}</div>
                <div class="option-content">${escapeHtml(q.options[l])}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        <div style="text-align:center; padding-top:14px; border-top:1px dashed var(--border-color); color:var(--primary); font-weight:700; font-size:14px;">
          👆 Nhấn vào thẻ hoặc bấm phím [Space] để lật xem Đáp Án Đúng & Mẹo Nhớ Nhanh
        </div>
      `;
    } else {
      // Back side
      const ansLetter = q.answer;
      const ansText = q.options[ansLetter] || "";
      box.innerHTML = `
        <div>
          <div class="q-header">
            <div class="q-badges">
              <span class="q-number-badge" style="background:var(--success);">Câu ${q.id} – ĐÁP ÁN: ${ansLetter}</span>
              ${q.legal_note ? `<span class="q-legal-badge">📜 ${escapeHtml(q.legal_note)}</span>` : ""}
            </div>
            <button class="star-btn ${isBookmarked ? "bookmarked" : ""}" onclick="toggleBookmark(${q.id}, event)">
              ${isBookmarked ? "★ Đã lưu" : "☆ Lưu sao"}
            </button>
          </div>

          <div class="q-text" style="font-size:15px; color:var(--text-secondary); margin-bottom:12px;">
            ${escapeHtml(q.question)}
          </div>

          <div class="option-item correct-option disabled" style="margin-bottom:16px; font-size:16px; font-weight:700;">
            <div class="option-letter">${ansLetter}</div>
            <div class="option-content">${highlightSubstring(ansText, q.answer_keyword, "hl-a")}</div>
          </div>

          <div class="insight-box" style="margin-top:0;">
            <div class="tip-block">
              <span class="tip-block-icon">💡</span>
              <div>
                <strong>Mẹo ghi nhớ siêu tốc:</strong> ${escapeHtml(q.tip)}
              </div>
            </div>
            <div class="exp-block">
              <span class="exp-block-icon">📖</span>
              <div>
                <strong>Giải thích dễ hiểu:</strong> ${escapeHtml(q.explanation)}
              </div>
            </div>
          </div>
        </div>
        <div style="text-align:center; padding-top:14px; border-top:1px dashed var(--border-color); color:var(--text-muted); font-size:13px;">
          Nhấn phím <strong>[2]</strong> nếu đã thuộc • Nhấn phím <strong>[1]</strong> nếu cần ôn lại
        </div>
      `;
    }
  }

  // TAB 5: Interactive Practice Mode
  function initPracticeSession() {
    const topic = document.getElementById("prac-topic-filter")?.value || "ALL";
    const range = document.getElementById("prac-range-filter")?.value || "ALL";
    const status = document.getElementById("prac-status-filter")?.value || "ALL";

    let list = filterQuestionList({ topic, range, status, search: "" });
    if (pracState.shuffleQ) {
      list = shuffleArray(list);
    }

    pracState.list = list;
    pracState.index = 0;
    pracState.answers = {};
    pracState.optionMaps = {};
    pracState.correctCount = 0;
    pracState.wrongCount = 0;

    list.forEach((q) => {
      pracState.optionMaps[q.id] = buildOptionMap(q, pracState.shuffleOpt);
    });

    updatePracticeScoreUI();
    renderPracticeCurrent();
  }

  function updatePracticeScoreUI() {
    const cEl = document.getElementById("prac-score-correct");
    const wEl = document.getElementById("prac-score-wrong");
    if (cEl) cEl.textContent = pracState.correctCount;
    if (wEl) wEl.textContent = pracState.wrongCount;
    const mobStat = document.getElementById("mob-prac-stat-inline");
    if (mobStat) {
      mobStat.textContent = `Đúng: ${pracState.correctCount} | Sai: ${pracState.wrongCount}`;
    }
  }

  function renderPracticeCurrent() {
    const area = document.getElementById("prac-question-area");
    const palette = document.getElementById("prac-palette");
    const progTxt = document.getElementById("prac-progress-text");
    if (!area) return;

    const total = pracState.list.length;
    if (total === 0) {
      if (progTxt) progTxt.textContent = "0 / 0";
      if (palette) palette.innerHTML = "";
      area.innerHTML = `
        <div class="toolbar-card" style="text-align:center; padding:40px; color:var(--text-muted);">
          <h3>Không có câu hỏi nào khớp với bộ lọc hiện tại!</h3>
          <p style="margin-top:8px;">Hãy chọn lại chủ đề hoặc trạng thái câu hỏi ở thanh công cụ phía trên.</p>
        </div>
      `;
      return;
    }

    if (pracState.index >= total) pracState.index = total - 1;
    if (pracState.index < 0) pracState.index = 0;

    const q = pracState.list[pracState.index];
    const optMap = pracState.optionMaps[q.id] || buildOptionMap(q, false);
    const chosenOrig = pracState.answers[q.id]; // undefined or origLetter
    const isAnswered = !!chosenOrig;
    const isMastered = !!userProgress.mastered[q.id];
    const isBookmarked = !!userProgress.bookmarked[q.id];
    const topicObj = topicsMap[q.topic_id] || { icon: "📌", shortName: "Chủ đề" };

    if (progTxt) progTxt.textContent = `${pracState.index + 1} / ${total}`;

    area.innerHTML = `
      <div class="question-card">
        <div class="q-header">
          <div class="q-badges">
            <span class="q-number-badge">Câu ${q.id}</span>
            <span class="q-topic-badge">${topicObj.icon} ${escapeHtml(topicObj.shortName)}</span>
            ${q.legal_note ? `<span class="q-legal-badge">📜 ${escapeHtml(q.legal_note)}</span>` : ""}
          </div>
          <div class="q-actions">
            <button class="btn btn-sm btn-outline-primary" onclick="askQuanSuQuestion(${q.id}, event)">
              🧙‍♂️ Quân Sư soi
            </button>
            <button class="btn btn-sm ${isMastered ? "btn-success" : "btn-outline-success"}" onclick="markQuestionStatus(${q.id}, 'MASTERED', event)">
              ${isMastered ? "✅ Đã thuộc" : "Đánh dấu Đã thuộc"}
            </button>
            <button class="star-btn ${isBookmarked ? "bookmarked" : ""}" onclick="toggleBookmark(${q.id}, event)">
              ${isBookmarked ? "★" : "☆"}
            </button>
          </div>
        </div>

        <div class="q-text">${isAnswered ? highlightSubstring(q.question, q.question_keyword, "hl-q") : escapeHtml(q.question)}</div>

        <div class="options-list">
          ${optMap
            .map((item) => {
              let cls = "";
              if (isAnswered) {
                cls += " disabled";
                if (item.origLetter === q.answer) {
                  cls += " correct-option";
                } else if (item.origLetter === chosenOrig) {
                  cls += " wrong-option";
                } else {
                  cls += " dimmed";
                }
              }
              const contentHtml =
                isAnswered && item.origLetter === q.answer
                  ? highlightSubstring(item.text, q.answer_keyword, "hl-a")
                  : escapeHtml(item.text);

              return `
                <div class="option-item ${cls}" onclick="selectPracticeOption(${q.id}, '${item.origLetter}')">
                  <div class="option-letter">${item.displayLetter}</div>
                  <div class="option-content">${contentHtml}</div>
                </div>
              `;
            })
            .join("")}
        </div>

        ${
          isAnswered
            ? `
          <div style="margin-bottom:12px; padding:10px 14px; border-radius:8px; font-weight:700; background:${
            chosenOrig === q.answer ? "var(--success-light)" : "var(--danger-light)"
          }; color:${chosenOrig === q.answer ? "var(--success)" : "var(--danger)"}; border:1px solid ${
                chosenOrig === q.answer ? "var(--success-border)" : "var(--danger-border)"
              };">
            ${
              chosenOrig === q.answer
                ? "🎉 CHÍNH XÁC! Bạn đã chọn đúng đáp án."
                : `❌ CHƯA ĐÚNG! Đáp án chuẩn của câu ${q.id} là phương án gốc [${q.answer}]. Đã thêm vào danh sách Câu hay sai để bạn ôn lại.`
            }
          </div>
          <div class="insight-box">
            <div class="tip-block">
              <span class="tip-block-icon">💡</span>
              <div>
                <strong>Mẹo nhớ nhanh 3 giây:</strong> ${escapeHtml(q.tip)}
              </div>
            </div>
            <div class="exp-block">
              <span class="exp-block-icon">📖</span>
              <div>
                <strong>Giải thích dễ hiểu:</strong> ${escapeHtml(q.explanation)}
              </div>
            </div>
          </div>
        `
            : ""
        }

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:18px; padding-top:14px; border-top:1px solid var(--border-color);">
          <button class="btn" ${pracState.index <= 0 ? "disabled" : ""} onclick="goPracticeStep(-1)">⬅️ Câu trước</button>
          <span style="font-size:13px; color:var(--text-muted);">Câu thứ ${pracState.index + 1} / ${total}</span>
          <button class="btn btn-primary" ${pracState.index >= total - 1 ? "disabled" : ""} onclick="goPracticeStep(1)">Câu tiếp theo ➡️</button>
        </div>
      </div>
    `;

    // Render Practice Palette
    if (palette) {
      palette.innerHTML = pracState.list
        .map((item, idx) => {
          const ans = pracState.answers[item.id];
          let pCls = "";
          if (idx === pracState.index) pCls += " current";
          if (ans) {
            pCls += ans === item.answer ? " review-correct" : " review-wrong";
          }
          return `<button class="palette-btn ${pCls}" onclick="jumpPracticeIndex(${idx})" title="Câu ${item.id}">${item.id}</button>`;
        })
        .join("");
    }
    updateMobileStickyBar();
  }

  window.selectPracticeOption = function (qId, origLetter) {
    if (pracState.answers[qId]) return; // already answered
    const q = allQuestions.find((item) => item.id === qId);
    if (!q) return;

    pracState.answers[qId] = origLetter;
    if (origLetter === q.answer) {
      pracState.correctCount++;
      // If previously wrong and user now answers right, we still let them decide if mastered
    } else {
      pracState.wrongCount++;
      userProgress.wrong[qId] = (userProgress.wrong[qId] || 0) + 1;
      delete userProgress.mastered[qId];
      saveProgress();
    }

    updatePracticeScoreUI();
    renderPracticeCurrent();
  };

  window.goPracticeStep = function (delta) {
    const next = pracState.index + delta;
    if (next >= 0 && next < pracState.list.length) {
      pracState.index = next;
      renderPracticeCurrent();
    }
  };

  window.jumpPracticeIndex = function (idx) {
    pracState.index = idx;
    renderPracticeCurrent();
  };

  // TAB 6: Exam Simulation Mode
  window.startQuickExam = function (count, timeMinutes, topicId = "ALL", balanced = true) {
    switchTab("tab-exam");
    let pool = allQuestions.slice();
    if (topicId && topicId !== "ALL") {
      pool = pool.filter((q) => q.topic_id === topicId);
    }

    let selected = [];
    if (balanced && topicId === "ALL" && count === 60) {
      // Proportional stratified sampling across all 10 topics
      const topics = window.BIDDING_TOPICS || [];
      topics.forEach((t) => {
        const tPool = shuffleArray(pool.filter((q) => q.topic_id === t.id));
        const quota = Math.max(2, Math.round((tPool.length / allQuestions.length) * count));
        selected.push(...tPool.slice(0, quota));
      });
      selected = shuffleArray(selected);
      if (selected.length > count) {
        selected = selected.slice(0, count);
      } else if (selected.length < count) {
        const usedIds = new Set(selected.map((q) => q.id));
        const rest = shuffleArray(pool.filter((q) => !usedIds.has(q.id)));
        selected.push(...rest.slice(0, count - selected.length));
      }
    } else {
      selected = shuffleArray(pool).slice(0, Math.min(count, pool.length));
    }

    const tName =
      topicId !== "ALL" && topicsMap[topicId]
        ? `Kiểm tra ${topicsMap[topicId].shortName} (${selected.length} câu)`
        : `Đề thi xáo trộn ${selected.length} câu`;

    launchExamSession({
      questions: selected,
      timeMinutes,
      shuffleOpt: false,
      modeName: tName
    });
  };

  window.startTrapExam = function () {
    switchTab("tab-exam");
    const trapPool = allQuestions.filter((q) => q.is_trap);
    const selected = shuffleArray(trapPool.length ? trapPool : allQuestions);
    launchExamSession({
      questions: selected,
      timeMinutes: 60,
      shuffleOpt: false,
      modeName: `Đề kiểm tra 72 Câu Bẫy Dễ Sai Nhất (${selected.length} câu)`
    });
  };

  window.startWeaknessExam = function () {
    switchTab("tab-exam");
    const wrongPool = allQuestions.filter((q) => userProgress.wrong[q.id]);
    const unlearnedPool = allQuestions.filter(
      (q) => !userProgress.mastered[q.id] && !userProgress.wrong[q.id]
    );

    let combined = [...shuffleArray(wrongPool), ...shuffleArray(unlearnedPool)];
    if (combined.length === 0) {
      combined = shuffleArray(allQuestions);
    }
    const selected = combined.slice(0, Math.min(50, combined.length));
    launchExamSession({
      questions: selected,
      timeMinutes: Math.max(20, selected.length),
      shuffleOpt: false,
      modeName: `Đề xoáy sâu câu sai & chưa thuộc (${selected.length} câu)`
    });
  };

  function launchExamSession({ questions, timeMinutes, shuffleOpt, modeName }) {
    if (examState.timerId) {
      clearInterval(examState.timerId);
      examState.timerId = null;
    }

    examState.active = true;
    examState.submitted = false;
    examState.modeName = modeName;
    examState.questions = questions;
    examState.index = 0;
    examState.answers = {};
    examState.flagged = {};
    examState.optionMaps = {};
    examState.durationSec = timeMinutes * 60;
    examState.remainingSec = timeMinutes * 60;
    examState.reviewFilter = "ALL";

    questions.forEach((q) => {
      examState.optionMaps[q.id] = buildOptionMap(q, shuffleOpt);
    });

    document.getElementById("exam-setup-view").style.display = "none";
    document.getElementById("exam-active-view").style.display = "block";
    document.getElementById("exam-result-banner").style.display = "none";
    document.getElementById("btn-submit-exam").style.display = "inline-flex";

    updateExamTimerDisplay();
    if (timeMinutes > 0) {
      examState.timerId = setInterval(() => {
        examState.remainingSec--;
        updateExamTimerDisplay();
        if (examState.remainingSec <= 0) {
          clearInterval(examState.timerId);
          examState.timerId = null;
          submitCurrentExam(true);
        }
      }, 1000);
    } else {
      const timerEl = document.getElementById("exam-timer-display");
      if (timerEl) {
        timerEl.textContent = "∞ Tự do";
        timerEl.classList.remove("urgent");
      }
    }

    renderExamActiveUI();
  }

  function updateExamTimerDisplay() {
    const timerEl = document.getElementById("exam-timer-display");
    if (!timerEl) return;
    if (examState.durationSec === 0) {
      timerEl.textContent = "∞ Tự do";
      return;
    }
    const sec = Math.max(0, examState.remainingSec);
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    timerEl.textContent = `⏱️ ${m}:${s}`;
    if (sec <= 300 && !examState.submitted) {
      timerEl.classList.add("urgent");
    } else {
      timerEl.classList.remove("urgent");
    }
  }

  function renderExamActiveUI() {
    const mainCol = document.getElementById("exam-main-column");
    const palette = document.getElementById("exam-palette");
    const ansCountEl = document.getElementById("exam-answered-count");
    const flagCountEl = document.getElementById("exam-flagged-count");
    if (!mainCol) return;

    const total = examState.questions.length;
    const answeredCount = Object.keys(examState.answers).length;
    const flaggedCount = Object.keys(examState.flagged).length;

    if (ansCountEl) ansCountEl.textContent = `${answeredCount}/${total}`;
    if (flagCountEl) flagCountEl.textContent = `${flaggedCount}`;

    if (!examState.submitted) {
      // Active taking mode: show 1 question at a time with quick navigation
      const q = examState.questions[examState.index];
      const optMap = examState.optionMaps[q.id] || buildOptionMap(q, false);
      const chosenOrig = examState.answers[q.id];
      const isFlagged = !!examState.flagged[q.id];
      const topicObj = topicsMap[q.topic_id] || { icon: "📌", shortName: "Chủ đề" };

      mainCol.innerHTML = `
        <div class="question-card">
          <div class="q-header">
            <div class="q-badges">
              <span class="q-number-badge">Câu ${examState.index + 1} / ${total}</span>
              <span class="q-topic-badge">Mã gốc: Câu #${q.id} • ${topicObj.icon} ${escapeHtml(topicObj.shortName)}</span>
            </div>
            <div class="q-actions">
              <button class="btn btn-sm ${isFlagged ? "btn-warning" : ""}" onclick="toggleExamFlag(${q.id})">
                🚩 ${isFlagged ? "Đã đặt cờ xem lại" : "Đặt cờ xem lại"}
              </button>
            </div>
          </div>

          <div class="q-text">${escapeHtml(q.question)}</div>

          <div class="options-list">
            ${optMap
              .map(
                (item) => `
              <div class="option-item ${chosenOrig === item.origLetter ? "selected-exam" : ""}" onclick="selectExamOption(${q.id}, '${item.origLetter}')">
                <div class="option-letter">${item.displayLetter}</div>
                <div class="option-content">${escapeHtml(item.text)}</div>
              </div>
            `
              )
              .join("")}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding-top:16px; border-top:1px solid var(--border-color);">
            <button class="btn" ${examState.index <= 0 ? "disabled" : ""} onclick="goExamStep(-1)">⬅️ Câu trước</button>
            <span style="font-size:13px; color:var(--text-muted);">Sử dụng phím <strong>A, B, C, D</strong> để chọn nhanh</span>
            <button class="btn btn-primary" ${examState.index >= total - 1 ? "disabled" : ""} onclick="goExamStep(1)">Câu tiếp theo ➡️</button>
          </div>
        </div>
      `;

      if (palette) {
        palette.innerHTML = examState.questions
          .map((item, idx) => {
            let cls = "";
            if (idx === examState.index) cls += " current";
            if (examState.flagged[item.id]) cls += " flagged";
            else if (examState.answers[item.id]) cls += " answered";
            return `<button class="palette-btn ${cls}" onclick="jumpExamIndex(${idx})">${idx + 1}</button>`;
          })
          .join("");
      }
    } else {
      // Submitted Review Mode: Show filtered review list with full explanations & tips
      let reviewList = examState.questions.map((q, idx) => ({ q, idx }));
      if (examState.reviewFilter === "WRONG") {
        reviewList = reviewList.filter(({ q }) => examState.answers[q.id] !== q.answer);
      } else if (examState.reviewFilter === "CORRECT") {
        reviewList = reviewList.filter(({ q }) => examState.answers[q.id] === q.answer);
      } else if (examState.reviewFilter === "UNANSWERED") {
        reviewList = reviewList.filter(({ q }) => !examState.answers[q.id]);
      }

      mainCol.innerHTML = `
        <div class="toolbar-card" style="margin-bottom:16px;">
          <div class="toolbar-row" style="justify-content:space-between;">
            <strong style="font-size:15px;">📋 Xem Lại Chi Tiết Đáp Án, Mẹo Ghi Nhớ & Giải Thích:</strong>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-sm ${examState.reviewFilter === "ALL" ? "btn-primary" : ""}" onclick="setExamReviewFilter('ALL')">
                Tất cả (${total})
              </button>
              <button class="btn btn-sm ${examState.reviewFilter === "WRONG" ? "btn-danger" : "btn-outline-danger"}" onclick="setExamReviewFilter('WRONG')">
                ❌ Câu sai / Chưa làm (${examState.questions.filter((q) => examState.answers[q.id] !== q.answer).length})
              </button>
              <button class="btn btn-sm ${examState.reviewFilter === "CORRECT" ? "btn-success" : "btn-outline-success"}" onclick="setExamReviewFilter('CORRECT')">
                ✅ Câu đúng (${examState.questions.filter((q) => examState.answers[q.id] === q.answer).length})
              </button>
            </div>
          </div>
        </div>

        ${reviewList
          .map(({ q, idx }) => {
            const optMap = examState.optionMaps[q.id] || buildOptionMap(q, false);
            const chosenOrig = examState.answers[q.id];
            const isCorrect = chosenOrig === q.answer;
            const topicObj = topicsMap[q.topic_id] || { icon: "📌", shortName: "Chủ đề" };

            return `
              <div class="question-card ${isCorrect ? "status-mastered" : "status-wrong"}" id="exam-review-q-${idx}">
                <div class="q-header">
                  <div class="q-badges">
                    <span class="q-number-badge" style="background:${isCorrect ? "var(--success)" : "var(--danger)"}">
                      Câu ${idx + 1} (Gốc: Câu #${q.id})
                    </span>
                    <span class="q-topic-badge">${topicObj.icon} ${escapeHtml(topicObj.shortName)}</span>
                    ${q.legal_note ? `<span class="q-legal-badge">📜 ${escapeHtml(q.legal_note)}</span>` : ""}
                  </div>
                  <span class="mini-stat ${isCorrect ? "success" : "danger"}">
                    ${isCorrect ? "✅ Trả lời đúng" : chosenOrig ? "❌ Trả lời sai" : "⚠️ Bỏ trống"}
                  </span>
                </div>

                <div class="q-text">${highlightSubstring(q.question, q.question_keyword, "hl-q")}</div>

                <div class="options-list">
                  ${optMap
                    .map((item) => {
                      let cls = "disabled";
                      if (item.origLetter === q.answer) cls += " correct-option";
                      else if (item.origLetter === chosenOrig) cls += " wrong-option";
                      const contentHtml =
                        item.origLetter === q.answer
                          ? highlightSubstring(item.text, q.answer_keyword, "hl-a")
                          : escapeHtml(item.text);

                      return `
                        <div class="option-item ${cls}">
                          <div class="option-letter">${item.displayLetter}</div>
                          <div class="option-content">${contentHtml}</div>
                        </div>
                      `;
                    })
                    .join("")}
                </div>

                <div class="insight-box">
                  <div class="tip-block">
                    <span class="tip-block-icon">💡</span>
                    <div>
                      <strong>Mẹo nhớ nhanh:</strong> ${escapeHtml(q.tip)}
                    </div>
                  </div>
                  <div class="exp-block">
                    <span class="exp-block-icon">📖</span>
                    <div>
                      <strong>Giải thích dễ hiểu:</strong> ${escapeHtml(q.explanation)}
                    </div>
                  </div>
                </div>
              </div>
            `;
          })
          .join("")}
      `;

      if (palette) {
        palette.innerHTML = examState.questions
          .map((item, idx) => {
            const isRight = examState.answers[item.id] === item.answer;
            return `<button class="palette-btn ${isRight ? "review-correct" : "review-wrong"}" onclick="scrollToExamReview(${idx})" title="Câu gốc #${item.id}">${idx + 1}</button>`;
          })
          .join("");
      }
    }
    updateMobileStickyBar();
  }

  window.selectExamOption = function (qId, origLetter) {
    if (examState.submitted) return;
    examState.answers[qId] = origLetter;
    renderExamActiveUI();
  };

  window.toggleExamFlag = function (qId) {
    if (examState.submitted) return;
    if (examState.flagged[qId]) delete examState.flagged[qId];
    else examState.flagged[qId] = true;
    renderExamActiveUI();
  };

  window.goExamStep = function (delta) {
    const next = examState.index + delta;
    if (next >= 0 && next < examState.questions.length) {
      examState.index = next;
      renderExamActiveUI();
    }
  };

  window.jumpExamIndex = function (idx) {
    examState.index = idx;
    renderExamActiveUI();
  };

  window.scrollToExamReview = function (idx) {
    const el = document.getElementById(`exam-review-q-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  window.setExamReviewFilter = function (filter) {
    examState.reviewFilter = filter;
    renderExamActiveUI();
  };

  function submitCurrentExam(autoSubmitted = false) {
    if (examState.submitted) return;
    if (!autoSubmitted) {
      const unanswered = examState.questions.length - Object.keys(examState.answers).length;
      if (unanswered > 0) {
        const ok = window.confirm(
          `Bạn còn ${unanswered} câu chưa chọn đáp án. Bạn có chắc chắn muốn nộp bài ngay không?`
        );
        if (!ok) return;
      }
    }

    if (examState.timerId) {
      clearInterval(examState.timerId);
      examState.timerId = null;
    }

    examState.submitted = true;
    const total = examState.questions.length;
    let correct = 0;
    const wrongQuestions = [];

    examState.questions.forEach((q) => {
      const ans = examState.answers[q.id];
      if (ans === q.answer) {
        correct++;
      } else {
        wrongQuestions.push(q);
        userProgress.wrong[q.id] = (userProgress.wrong[q.id] || 0) + 1;
      }
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const spentSec =
      examState.durationSec > 0
        ? Math.max(1, examState.durationSec - examState.remainingSec)
        : 0;

    userProgress.examHistory = userProgress.examHistory || [];
    userProgress.examHistory.unshift({
      date: new Date().toLocaleString("vi-VN"),
      total,
      correct,
      score,
      durationSec: spentSec,
      modeName: examState.modeName
    });
    saveProgress();

    document.getElementById("btn-submit-exam").style.display = "none";
    const banner = document.getElementById("exam-result-banner");
    if (banner) {
      banner.style.display = "block";
      const passed = score >= 70;
      banner.innerHTML = `
        <div class="toolbar-card" style="border: 2px solid ${passed ? "var(--success)" : "var(--danger)"}; padding: 24px;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
            <div>
              <span class="mini-stat ${passed ? "success" : "danger"}" style="margin-bottom:8px;">
                ${passed ? "🏆 KẾT QUẢ: ĐẠT YÊU CẦU" : "⚠️ KẾT QUẢ: CẦN ÔN THÊM"}
              </span>
              <h2 style="font-size:24px; font-weight:800;">
                Điểm số: ${score}/100 điểm (Đúng ${correct}/${total} câu)
              </h2>
              <p style="font-size:14px; color:var(--text-secondary); margin-top:4px;">
                ${
                  wrongQuestions.length === 0
                    ? "Xuất sắc! Bạn đã trả lời đúng tuyệt đối 100% số câu trong đề này."
                    : `Có ${wrongQuestions.length} câu làm sai hoặc bỏ trống đã được tự động lưu vào danh sách "Câu hay sai" để bạn ôn lại.`
                }
              </p>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              ${
                wrongQuestions.length > 0
                  ? `<button class="btn btn-danger" id="btn-retry-wrong-now">🔥 Thi lại ngay ${wrongQuestions.length} câu vừa sai</button>`
                  : ""
              }
              <button class="btn btn-primary" onclick="startQuickExam(60, 60)">🔄 Làm đề 60 câu mới</button>
            </div>
          </div>
        </div>
      `;

      const retryBtn = document.getElementById("btn-retry-wrong-now");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          launchExamSession({
            questions: shuffleArray(wrongQuestions),
            timeMinutes: Math.max(15, wrongQuestions.length),
            shuffleOpt: false,
            modeName: `Ôn lại ${wrongQuestions.length} câu vừa làm sai`
          });
        });
      }
    }

    renderExamActiveUI();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Modal Popup for Single Question
  window.openQuestionModal = function (qId) {
    const q = allQuestions.find((item) => item.id === Number(qId));
    if (!q) return;
    const modal = document.getElementById("question-modal");
    const title = document.getElementById("modal-title");
    const body = document.getElementById("modal-body");
    if (!modal || !body) return;

    if (title) title.textContent = `Chi tiết Câu hỏi số ${q.id}`;
    body.innerHTML = renderQuestionCardHTML(q, {
      hlKeywords: true,
      onlyCorrect: false,
      recallMasked: false
    });
    modal.classList.add("open");
  };

  function closeQuestionModal() {
    const modal = document.getElementById("question-modal");
    if (modal) modal.classList.remove("open");
  }

  // Mobile Collapsible Filter Toggle
  window.toggleMobileFilter = function (cardId) {
    const card = document.getElementById(cardId);
    if (card) card.classList.toggle("expanded");
  };

  function isMobileLayoutActive() {
    return window.innerWidth <= 820 || document.body.classList.contains("mobile-view");
  }

  function updateMobileStickyBar() {
    const bar = document.getElementById("mobile-action-bar");
    const progEl = document.getElementById("mob-act-progress");
    const prevBtn = document.getElementById("mob-act-prev");
    const nextBtn = document.getElementById("mob-act-next");
    if (!bar) return;

    const activeTab = document.querySelector(".nav-tab.active")?.getAttribute("data-tab");

    if (!isMobileLayoutActive()) {
      bar.style.display = "none";
      return;
    }

    if (activeTab === "tab-practice" && pracState.list.length > 0) {
      bar.style.display = "flex";
      if (progEl) progEl.textContent = `${pracState.index + 1}/${pracState.list.length}`;
      if (prevBtn) prevBtn.disabled = pracState.index <= 0;
      if (nextBtn) nextBtn.disabled = pracState.index >= pracState.list.length - 1;
    } else if (activeTab === "tab-exam" && examState.active && !examState.submitted) {
      bar.style.display = "flex";
      if (progEl) progEl.textContent = `${examState.index + 1}/${examState.questions.length}`;
      if (prevBtn) prevBtn.disabled = examState.index <= 0;
      if (nextBtn) nextBtn.disabled = examState.index >= examState.questions.length - 1;
    } else {
      bar.style.display = "none";
    }
  }

  function openMobilePaletteDrawer() {
    const drawer = document.getElementById("mobile-palette-drawer");
    const grid = document.getElementById("mob-drawer-grid");
    const title = document.getElementById("mob-drawer-title");
    const timerRow = document.getElementById("mob-drawer-timer-row");
    const timerTxt = document.getElementById("mob-drawer-timer");
    const ansTxt = document.getElementById("mob-drawer-answered");
    const examActs = document.getElementById("mob-drawer-exam-actions");
    if (!drawer || !grid) return;

    const activeTab = document.querySelector(".nav-tab.active")?.getAttribute("data-tab");

    if (activeTab === "tab-practice") {
      if (title) title.textContent = `Bảng Câu Hỏi Luyện Tập (${pracState.list.length} câu)`;
      if (timerRow) timerRow.style.display = "none";
      if (examActs) examActs.style.display = "none";
      grid.innerHTML = pracState.list
        .map((item, idx) => {
          const ans = pracState.answers[item.id];
          let pCls = "";
          if (idx === pracState.index) pCls += " current";
          if (ans) pCls += ans === item.answer ? " review-correct" : " review-wrong";
          return `<button class="palette-btn ${pCls}" onclick="jumpPracticeFromMobile(${idx})">${item.id}</button>`;
        })
        .join("");
    } else if (activeTab === "tab-exam" && examState.active) {
      const total = examState.questions.length;
      const answeredCount = Object.keys(examState.answers).length;
      if (title) title.textContent = `Bảng Câu Hỏi Bài Thi (${total} câu)`;
      if (timerRow) {
        timerRow.style.display = "flex";
        const mainTimer = document.getElementById("exam-timer-display")?.textContent || "";
        if (timerTxt) timerTxt.textContent = mainTimer;
        if (ansTxt) ansTxt.textContent = `Đã làm: ${answeredCount}/${total}`;
      }
      if (examActs) {
        examActs.style.display = examState.submitted ? "none" : "flex";
      }
      grid.innerHTML = examState.questions
        .map((item, idx) => {
          let cls = "";
          if (idx === examState.index) cls += " current";
          if (examState.submitted) {
            cls += examState.answers[item.id] === item.answer ? " review-correct" : " review-wrong";
          } else {
            if (examState.flagged[item.id]) cls += " flagged";
            else if (examState.answers[item.id]) cls += " answered";
          }
          return `<button class="palette-btn ${cls}" onclick="jumpExamFromMobile(${idx})">${idx + 1}</button>`;
        })
        .join("");
    }

    drawer.classList.add("open");
  }

  function closeMobilePaletteDrawer() {
    document.getElementById("mobile-palette-drawer")?.classList.remove("open");
  }

  window.jumpPracticeFromMobile = function (idx) {
    closeMobilePaletteDrawer();
    jumpPracticeIndex(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.jumpExamFromMobile = function (idx) {
    closeMobilePaletteDrawer();
    if (examState.submitted) {
      scrollToExamReview(idx);
    } else {
      jumpExamIndex(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Tab Switching & Navigation Shortcuts
  window.switchTab = function (tabId) {
    document.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
    document.querySelectorAll(".mob-nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === tabId);
    });
    refreshCurrentTabUI();
    updateMobileStickyBar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.openSpeedWithFilter = function (status) {
    const sel = document.getElementById("speed-status-filter");
    const topicSel = document.getElementById("speed-topic-filter");
    const rangeSel = document.getElementById("speed-range-filter");
    if (sel) sel.value = status;
    if (topicSel) topicSel.value = "ALL";
    if (rangeSel) rangeSel.value = "ALL";
    applySpeedFilters(false);
    switchTab("tab-speed");
  };

  window.openPracticeWithFilter = function (status) {
    const sel = document.getElementById("prac-status-filter");
    if (sel) sel.value = status;
    initPracticeSession();
    switchTab("tab-practice");
  };

  window.openTopicInSpeed = function (topicId) {
    const sel = document.getElementById("speed-topic-filter");
    const statusSel = document.getElementById("speed-status-filter");
    const rangeSel = document.getElementById("speed-range-filter");
    if (sel) sel.value = topicId;
    if (statusSel) statusSel.value = "ALL";
    if (rangeSel) rangeSel.value = "ALL";
    applySpeedFilters(false);
    switchTab("tab-speed");
  };

  window.openTopicInPractice = function (topicId) {
    const sel = document.getElementById("prac-topic-filter");
    const statusSel = document.getElementById("prac-status-filter");
    const rangeSel = document.getElementById("prac-range-filter");
    if (sel) sel.value = topicId;
    if (statusSel) statusSel.value = "ALL";
    if (rangeSel) rangeSel.value = "ALL";
    initPracticeSession();
    switchTab("tab-practice");
  };

  function setupSwipeGesture(elId, onSwipeLeft, onSwipeRight) {
    const el = document.getElementById(elId);
    if (!el) return;
    let startX = 0;
    let startY = 0;
    el.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      },
      { passive: true }
    );
    el.addEventListener(
      "touchend",
      (e) => {
        if (!e.changedTouches || e.changedTouches.length !== 1) return;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          if (dx < 0) onSwipeLeft();
          else onSwipeRight();
        }
      },
      { passive: true }
    );
  }

  function setupEventListeners() {
    // Desktop & Mobile Tabs
    document.querySelectorAll(".nav-tab, .mob-nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        switchTab(btn.getAttribute("data-tab"));
      });
    });

    // Mobile View Simulator Toggle on Desktop
    const mobViewBtn = document.getElementById("btn-mobile-view-toggle");
    mobViewBtn?.addEventListener("click", () => {
      const isMob = document.body.classList.toggle("mobile-view");
      mobViewBtn.innerHTML = isMob ? "💻 Giao diện Máy tính" : "📱 Giao diện Mobile";
      updateMobileStickyBar();
    });

    // QR Mobile Modal
    const qrModal = document.getElementById("qr-mobile-modal");
    document.getElementById("btn-open-qr-modal")?.addEventListener("click", () => {
      qrModal?.classList.add("open");
    });
    document.getElementById("btn-close-qr-modal")?.addEventListener("click", () => {
      qrModal?.classList.remove("open");
    });
    qrModal?.addEventListener("click", (e) => {
      if (e.target.id === "qr-mobile-modal") qrModal.classList.remove("open");
    });

    // Mobile Sticky Action Bar & Drawer
    document.getElementById("mob-act-prev")?.addEventListener("click", () => {
      const activeTab = document.querySelector(".nav-tab.active")?.getAttribute("data-tab");
      if (activeTab === "tab-practice") goPracticeStep(-1);
      else if (activeTab === "tab-exam") goExamStep(-1);
      updateMobileStickyBar();
    });

    document.getElementById("mob-act-next")?.addEventListener("click", () => {
      const activeTab = document.querySelector(".nav-tab.active")?.getAttribute("data-tab");
      if (activeTab === "tab-practice") goPracticeStep(1);
      else if (activeTab === "tab-exam") goExamStep(1);
      updateMobileStickyBar();
    });

    document.getElementById("mob-act-palette")?.addEventListener("click", openMobilePaletteDrawer);
    document.getElementById("btn-close-mob-drawer")?.addEventListener("click", closeMobilePaletteDrawer);
    document.getElementById("mobile-palette-drawer")?.addEventListener("click", (e) => {
      if (e.target.id === "mobile-palette-drawer") closeMobilePaletteDrawer();
    });

    document.getElementById("mob-drawer-submit-btn")?.addEventListener("click", () => {
      closeMobilePaletteDrawer();
      submitCurrentExam(false);
    });

    document.getElementById("mob-drawer-exit-btn")?.addEventListener("click", () => {
      closeMobilePaletteDrawer();
      document.getElementById("btn-exit-exam")?.click();
    });

    window.addEventListener("resize", updateMobileStickyBar);

    // Touch Swipe Gestures for Mobile
    setupSwipeGesture(
      "flashcard-box",
      () => {
        fcState.index++;
        fcState.flipped = false;
        renderFlashcard();
      },
      () => {
        fcState.index--;
        fcState.flipped = false;
        renderFlashcard();
      }
    );

    setupSwipeGesture(
      "prac-question-area",
      () => {
        goPracticeStep(1);
        updateMobileStickyBar();
      },
      () => {
        goPracticeStep(-1);
        updateMobileStickyBar();
      }
    );

    setupSwipeGesture(
      "exam-main-column",
      () => {
        if (!examState.submitted) {
          goExamStep(1);
          updateMobileStickyBar();
        }
      },
      () => {
        if (!examState.submitted) {
          goExamStep(-1);
          updateMobileStickyBar();
        }
      }
    );

    // Theme toggle
    document.getElementById("btn-theme-toggle")?.addEventListener("click", () => {
      const next = userProgress.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      saveProgress();
    });

    // Reset progress
    document.getElementById("btn-reset-progress")?.addEventListener("click", () => {
      if (
        window.confirm(
          "Bạn có chắc chắn muốn xóa toàn bộ tiến độ Đã thuộc / Câu sai để bắt đầu học lại từ đầu không?"
        )
      ) {
        userProgress.mastered = {};
        userProgress.learning = {};
        userProgress.wrong = {};
        userProgress.bookmarked = {};
        saveProgress();
        refreshCurrentTabUI();
      }
    });

    // Clear exam history
    document.getElementById("btn-clear-history")?.addEventListener("click", () => {
      userProgress.examHistory = [];
      saveProgress();
      renderExamHistory();
    });

    // Master Tips Search
    document.getElementById("tips-search-input")?.addEventListener("input", (e) => {
      renderMasterTips(e.target.value);
    });

    // Speed Study Filters & Toggles
    ["speed-topic-filter", "speed-range-filter", "speed-status-filter"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", () => applySpeedFilters(false));
    });

    document.getElementById("speed-search")?.addEventListener("input", (e) => {
      const gSearch = document.getElementById("global-keyword-search");
      if (gSearch && gSearch.value !== e.target.value) gSearch.value = e.target.value;
      applySpeedFilters(false);
    });

    document.getElementById("global-keyword-search")?.addEventListener("input", (e) => {
      const val = e.target.value;
      const sSearch = document.getElementById("speed-search");
      if (sSearch) sSearch.value = val;
      applySpeedFilters(false);
      const activeTab = document.querySelector(".nav-tab.active")?.getAttribute("data-tab");
      if (activeTab !== "tab-speed") {
        switchTab("tab-speed");
        document.getElementById("global-keyword-search")?.focus();
      }
    });

    const setupPillToggle = (chkId, pillId, onChange) => {
      const chk = document.getElementById(chkId);
      const pill = document.getElementById(pillId);
      if (!chk || !pill) return;
      chk.addEventListener("change", () => {
        pill.classList.toggle("active", chk.checked);
        onChange(chk.checked);
      });
    };

    setupPillToggle("chk-hl-keywords", "pill-hl-keywords", (checked) => {
      speedState.hlKeywords = checked;
      renderSpeedList();
    });

    setupPillToggle("chk-only-correct", "pill-only-correct", (checked) => {
      speedState.onlyCorrect = checked;
      renderSpeedList();
    });

    setupPillToggle("chk-recall-mask", "pill-recall-mask", (checked) => {
      speedState.recallMask = checked;
      speedState.revealedIds = {};
      renderSpeedList();
    });

    document.getElementById("btn-speed-shuffle")?.addEventListener("click", () => {
      applySpeedFilters(true);
    });

    // Flashcard Controls
    ["fc-topic-filter", "fc-status-filter"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", () => applyFlashcardFilters(false));
    });

    document.getElementById("btn-fc-shuffle")?.addEventListener("click", () => {
      applyFlashcardFilters(true);
    });

    document.getElementById("flashcard-box")?.addEventListener("click", () => {
      fcState.flipped = !fcState.flipped;
      renderFlashcard();
    });

    document.getElementById("btn-fc-flip")?.addEventListener("click", () => {
      fcState.flipped = !fcState.flipped;
      renderFlashcard();
    });

    document.getElementById("btn-fc-prev")?.addEventListener("click", () => {
      fcState.index--;
      fcState.flipped = false;
      renderFlashcard();
    });

    document.getElementById("btn-fc-next")?.addEventListener("click", () => {
      fcState.index++;
      fcState.flipped = false;
      renderFlashcard();
    });

    document.getElementById("btn-fc-mastered")?.addEventListener("click", () => {
      if (!fcState.deck.length) return;
      const q = fcState.deck[fcState.index];
      userProgress.mastered[q.id] = true;
      delete userProgress.learning[q.id];
      saveProgress();
      fcState.index++;
      fcState.flipped = false;
      renderFlashcard();
    });

    document.getElementById("btn-fc-learning")?.addEventListener("click", () => {
      if (!fcState.deck.length) return;
      const q = fcState.deck[fcState.index];
      userProgress.learning[q.id] = true;
      delete userProgress.mastered[q.id];
      saveProgress();
      fcState.index++;
      fcState.flipped = false;
      renderFlashcard();
    });

    // Practice Controls
    ["prac-topic-filter", "prac-range-filter", "prac-status-filter"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", () => initPracticeSession());
    });

    setupPillToggle("chk-prac-shuffle-q", "pill-prac-shuffle-q", (checked) => {
      pracState.shuffleQ = checked;
      initPracticeSession();
    });

    setupPillToggle("chk-prac-shuffle-opt", "pill-prac-shuffle-opt", (checked) => {
      pracState.shuffleOpt = checked;
      initPracticeSession();
    });

    document.getElementById("btn-prac-reset-session")?.addEventListener("click", () => {
      initPracticeSession();
    });

    // Custom Exam Controls
    setupPillToggle("chk-exam-shuffle-q", "pill-exam-shuffle-q", () => {});
    setupPillToggle("chk-exam-shuffle-opt", "pill-exam-shuffle-opt", () => {});

    document.getElementById("btn-start-custom-exam")?.addEventListener("click", () => {
      const count = Number(document.getElementById("custom-exam-count")?.value || 60);
      const timeMinutes = Number(document.getElementById("custom-exam-time")?.value || 60);
      const topic = document.getElementById("custom-exam-topic")?.value || "ALL";
      const fromId = Math.max(1, Number(document.getElementById("custom-exam-from")?.value || 1));
      const toId = Math.min(340, Number(document.getElementById("custom-exam-to")?.value || 340));
      const doShuffleQ = document.getElementById("chk-exam-shuffle-q")?.checked ?? true;
      const doShuffleOpt = document.getElementById("chk-exam-shuffle-opt")?.checked ?? false;

      let pool = allQuestions.filter((q) => q.id >= Math.min(fromId, toId) && q.id <= Math.max(fromId, toId));
      if (topic !== "ALL") {
        pool = pool.filter((q) => q.topic_id === topic);
      }

      if (pool.length === 0) {
        alert("Không có câu hỏi nào trong khoảng lọc bạn đã chọn!");
        return;
      }

      if (doShuffleQ) {
        pool = shuffleArray(pool);
      }

      const selected = pool.slice(0, Math.min(count, pool.length));
      launchExamSession({
        questions: selected,
        timeMinutes,
        shuffleOpt: doShuffleOpt,
        modeName: `Đề tùy chỉnh (${selected.length} câu, từ #${Math.min(fromId, toId)}-${Math.max(fromId, toId)})`
      });
    });

    document.getElementById("btn-submit-exam")?.addEventListener("click", () => {
      submitCurrentExam(false);
    });

    document.getElementById("btn-exit-exam")?.addEventListener("click", () => {
      if (examState.timerId) {
        clearInterval(examState.timerId);
        examState.timerId = null;
      }
      examState.active = false;
      document.getElementById("exam-active-view").style.display = "none";
      document.getElementById("exam-setup-view").style.display = "block";
    });

    // Modal close
    document.getElementById("btn-close-modal")?.addEventListener("click", closeQuestionModal);
    document.getElementById("question-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "question-modal") closeQuestionModal();
    });

    // Global Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      // Ignore if typing inside an input/select
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        if (e.key === "Escape") document.activeElement.blur();
        return;
      }

      if (e.key === "Escape") {
        closeQuestionModal();
        return;
      }

      const activeTab = document.querySelector(".nav-tab.active")?.getAttribute("data-tab");

      if (activeTab === "tab-flashcard" && fcState.deck.length > 0) {
        if (e.code === "Space") {
          e.preventDefault();
          fcState.flipped = !fcState.flipped;
          renderFlashcard();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          fcState.index++;
          fcState.flipped = false;
          renderFlashcard();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          fcState.index--;
          fcState.flipped = false;
          renderFlashcard();
        } else if (e.key === "1") {
          document.getElementById("btn-fc-learning")?.click();
        } else if (e.key === "2") {
          document.getElementById("btn-fc-mastered")?.click();
        } else if (e.key.toLowerCase() === "s") {
          const q = fcState.deck[fcState.index];
          if (q) toggleBookmark(q.id);
        }
      } else if (activeTab === "tab-practice" && pracState.list.length > 0) {
        const q = pracState.list[pracState.index];
        if (!q) return;
        const optMap = pracState.optionMaps[q.id] || [];
        const keyMap = { a: 0, "1": 0, b: 1, "2": 1, c: 2, "3": 2, d: 3, "4": 3 };
        const k = e.key.toLowerCase();
        if (k in keyMap && optMap[keyMap[k]]) {
          selectPracticeOption(q.id, optMap[keyMap[k]].origLetter);
        } else if (e.key === "ArrowRight" || e.key === "Enter") {
          goPracticeStep(1);
        } else if (e.key === "ArrowLeft") {
          goPracticeStep(-1);
        }
      } else if (activeTab === "tab-exam" && examState.active && !examState.submitted) {
        const q = examState.questions[examState.index];
        if (!q) return;
        const optMap = examState.optionMaps[q.id] || [];
        const keyMap = { a: 0, "1": 0, b: 1, "2": 1, c: 2, "3": 2, d: 3, "4": 3 };
        const k = e.key.toLowerCase();
        if (k in keyMap && optMap[keyMap[k]]) {
          selectExamOption(q.id, optMap[keyMap[k]].origLetter);
        } else if (e.key === "ArrowRight") {
          goExamStep(1);
        } else if (e.key === "ArrowLeft") {
          goExamStep(-1);
        }
      }
    });

    initQuanSuChatbot();
  }

  // =========================================================================
  // "QUÂN SƯ ĐẤU THẦU" FLOATING CHATBOT ENGINE (STATISTICAL GUESSING ADVISOR)
  // =========================================================================

  function getCurrentContextQuestion() {
    const activeTab = document.querySelector(".nav-tab.active")?.getAttribute("data-tab");
    if (activeTab === "tab-practice" && pracState.list.length > 0) {
      return pracState.list[pracState.index] || allQuestions[0];
    }
    if (activeTab === "tab-flashcard" && fcState.deck.length > 0) {
      return fcState.deck[fcState.index] || allQuestions[0];
    }
    if (activeTab === "tab-exam" && examState.active && examState.questions.length > 0) {
      return examState.questions[examState.index] || allQuestions[0];
    }
    if (activeTab === "tab-speed" && speedState.filtered.length > 0) {
      const startIdx = (speedState.page - 1) * speedState.pageSize;
      return speedState.filtered[startIdx] || allQuestions[0];
    }
    return allQuestions[0];
  }

  function updateQuanSuContextLabel() {
    const label = document.getElementById("quansu-context-label");
    if (!label) return;
    const q = getCurrentContextQuestion();
    if (q) {
      label.innerHTML = `📌 Câu đang mở: <strong>Câu #${q.id}</strong>`;
    }
  }

  function appendQuanSuMessage(role, htmlContent) {
    const box = document.getElementById("quansu-messages");
    if (!box) return;
    const msg = document.createElement("div");
    msg.className = `quansu-msg ${role}`;
    msg.innerHTML = `<div class="quansu-bubble">${htmlContent}</div>`;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
  }

  function renderQuanSuWelcome() {
    const box = document.getElementById("quansu-messages");
    if (!box) return;
    box.innerHTML = "";
    appendQuanSuMessage(
      "bot",
      `
        <div>👋 Chào bạn! Tôi là <strong>Quân Sư Đấu Thầu</strong> – Trợ lý phân tích xác suất & chiến thuật lụi chuẩn toàn bộ <strong>340 câu</strong>.</div>
        <div class="quansu-step-box warning">
          🚨 <strong>Cảnh báo số 1:</strong> Tuyệt đối <strong>KHÔNG</strong> áp dụng mẹo "chọn câu dài nhất" một cách mù quáng (chỉ đúng <strong>23,8% = 81/340 câu</strong>, ở câu hỏi phủ định sai tới <strong>87,5%</strong>)!
        </div>
        <div style="margin-top:8px;">
          👉 Bạn có thể bấm nút <strong>"🎯 Soi câu đang mở"</strong>, bấm các thẻ chiến thuật bên dưới, hoặc gõ bất kỳ <strong>số câu (VD: 115)</strong> / <strong>từ khóa</strong> nào vào ô chat!
        </div>
      `
    );
    updateQuanSuContextLabel();
  }

  function buildQuestionTacticalAnalysisHTML(q) {
    const opts = q.options || {};
    const letters = ["A", "B", "C", "D"];

    // 1. Check 9 Death Words (94.2% wrong)
    const deathRules = [
      { rx: /tổ chuyên gia/i, label: "Tổ chuyên gia (Sai 100% khi đứng riêng)" },
      { rx: /bên mời thầu/i, label: "Bên mời thầu (Sai 100% khi đứng riêng)" },
      { rx: /^người có thẩm quyền\.?$/i, label: "Người có thẩm quyền đứng 1 mình (Sai 90%, chỉ đúng Câu 151)" },
      { rx: /trong mọi trường hợp/i, label: "Trong mọi trường hợp (Sai 100%)" },
      { rx: /\bbắt buộc\b/i, label: "Bắt buộc (Sai 100% khi chỉ 1 đáp án có)" },
      { rx: /\bchỉ được\b/i, label: "Chỉ được (Sai 100% khi chỉ 1 đáp án có)" },
      { rx: /mà không/i, label: "Mà không... (Sai 100% khi chỉ 1 đáp án có)" },
      { rx: /tiếp tục đánh giá/i, label: "Tiếp tục đánh giá (Sai 100% khi chỉ 1 đáp án có)" },
      { rx: /(tất cả.*đều sai|các phương án trên đều sai|phương án a và b đều sai)/i, label: "Đều sai (Sai 89%–100%, chỉ đúng Câu 296, 301, 314)" }
    ];

    const eliminatedNotes = [];
    deathRules.forEach((dr) => {
      const matchedKeys = letters.filter((k) => dr.rx.test((opts[k] || "").trim()));
      if (matchedKeys.length === 1) {
        const mk = matchedKeys[0];
        eliminatedNotes.push(
          `Phương án <strong>${mk}</strong> chứa cụm từ Tử Thần <em>"${dr.label}"</em>`
        );
      }
    });

    // 2. Check 8 Golden Words (75-100% right)
    const goldenRules = [
      { rx: /dự án, gói thầu/i, label: "của dự án, gói thầu (Đúng 100%)" },
      { rx: /(được tự quyết định|tự quyết định|có quyền quyết định)/i, label: "tự quyết định / có quyền quyết định (Đúng 100%)" },
      { rx: /\b50%/i, label: "con số vàng 50% (Đúng 100%)" },
      { rx: /\b70%/i, label: "con số vàng 70% (Đúng 67%)" },
      { rx: /\bcó thể\b/i, label: "ngôn ngữ mở 'có thể' (Đúng 81,8%)" },
      { rx: /một trong các/i, label: "ngôn ngữ mở 'một trong các' (Đúng 80%)" },
      { rx: /trừ trường hợp/i, label: "ngoại lệ 'trừ trường hợp' (Đúng 80%)" },
      { rx: /trên cơ sở bảo đảm/i, label: "'trên cơ sở bảo đảm...' (Đúng 71,4%)" },
      { rx: /^chủ đầu tư\.?$/i, label: "Chủ đầu tư (Chủ thể có thẩm quyền chính theo Luật 2025)" }
    ];

    const goldenNotes = [];
    goldenRules.forEach((gr) => {
      const matchedKeys = letters.filter((k) => gr.rx.test((opts[k] || "").trim()));
      if (matchedKeys.length === 1) {
        const mk = matchedKeys[0];
        goldenNotes.push(
          `Phương án <strong>${mk}</strong> chứa cụm từ Kim Cương <em>"${gr.label}"</em>`
        );
      }
    });

    // 3. Check Special Group ("Tất cả đều đúng", "A và B đều đúng", Trap status)
    let groupNote = "";
    if (SPECIAL_GROUPS.ALL_CORRECT_18.includes(q.id)) {
      groupNote = `✅ Câu này thuộc nhóm <strong>18 câu chọn "Tất cả đều đúng"</strong> (3 ý A, B, C bổ sung cho nhau, không mâu thuẫn) → Khoanh ngay <strong>${q.answer}</strong>!`;
    } else if (SPECIAL_GROUPS.TRAP_ALL_16.includes(q.id)) {
      groupNote = `⚠️ <strong>CẢNH BÁO BẪY CẤP ĐỘ CAO:</strong> Câu này nằm trong <strong>16 câu BẪY có dòng "Tất cả/Cả 3 đều đúng"</strong> nhưng A, B, C mâu thuẫn nhau → Tuyệt đối KHÔNG chọn D, đáp án chuẩn là <strong>${q.answer}</strong>!`;
    } else if (SPECIAL_GROUPS.TWO_CORRECT_20.includes(q.id)) {
      groupNote = `✅ Câu này thuộc nhóm <strong>20 câu chọn "Hai phương án (A&B / B&C / A&C) đều đúng"</strong> → Khoanh <strong>${q.answer}</strong>!`;
    } else if (SPECIAL_GROUPS.TRAP_TWO_30.includes(q.id)) {
      groupNote = `⚠️ <strong>CẢNH BÁO BẪY GỘP 2 Ý:</strong> Câu này có phương án gộp 2 ý nhưng là <strong>BẪY</strong> (chỉ có 1 ý đúng duy nhất là <strong>${q.answer}</strong>)!`;
    } else if (SPECIAL_GROUPS.ALL_WRONG_3.includes(q.id)) {
      groupNote = `❌ Câu này là <strong>1 trong 3 câu hiếm hoi chọn "Các phương án trên đều sai"</strong> (Câu 296, 301, 314) → Khoanh <strong>D</strong>!`;
    }

    // 4. Check Option Lengths
    const lengths = letters.map((k) => ({ k, len: (opts[k] || "").trim().length }));
    lengths.sort((a, b) => b.len - a.len);
    const longestKey = lengths[0].k;
    const isNegativeQ = /(không phải|không đúng|không phù hợp|không thuộc|nào sau đây là sai)/i.test(q.question);
    let lengthNote = "";
    if (longestKey === q.answer) {
      lengthNote = `📏 <strong>Độ dài đáp án:</strong> Ở câu này phương án dài nhất (<strong>${longestKey}</strong>) trùng với đáp án đúng.`;
    } else {
      lengthNote = `🚨 <strong>Cảnh báo bẫy chọn câu dài:</strong> Phương án dài nhất là <strong>${longestKey}</strong> (${lengths[0].len} ký tự) nhưng là <strong>ĐÁP ÁN SAI</strong>${
        isNegativeQ ? " (vì đây là câu hỏi PHỦ ĐỊNH tìm câu sai)" : ""
      }! Đừng bị độ dài đánh lừa.`;
    }

    return `
      <div>
        <div style="font-weight:800; color:var(--primary); font-size:14px; margin-bottom:4px;">
          🎯 Quân Sư Mổ Xẻ Câu #${q.id} ${q.is_trap ? '<span style="color:var(--danger)">(🔥 Câu Bẫy)</span>' : ""}
        </div>
        <div style="font-size:12.8px; color:var(--text-secondary); margin-bottom:8px;">
          "${escapeHtml(q.question.length > 130 ? q.question.slice(0, 130) + "..." : q.question)}"
        </div>

        ${
          eliminatedNotes.length > 0
            ? `<div class="quansu-step-box danger">🔥 <strong>Bước 1 (Loại trừ 94,2%):</strong><br/>• ${eliminatedNotes.join("<br/>• ")} → <strong>Gạch bỏ!</strong></div>`
            : ""
        }

        ${
          goldenNotes.length > 0
            ? `<div class="quansu-step-box success">💎 <strong>Bước 2 (Từ khóa Kim Cương):</strong><br/>• ${goldenNotes.join("<br/>• ")}</div>`
            : ""
        }

        ${groupNote ? `<div class="quansu-step-box warning">${groupNote}</div>` : ""}

        <div class="quansu-step-box">
          ${lengthNote}
        </div>

        <div class="quansu-step-box primary">
          🏆 <strong>Chốt đáp án đúng: [${q.answer}]</strong> — ${escapeHtml(opts[q.answer] || "")}<br/>
          🔑 <strong>Từ khóa 3 giây:</strong> Hỏi <em>"${escapeHtml(q.question_keyword || "...")}"</em> → Chọn <strong>"${escapeHtml(q.answer_keyword || opts[q.answer] || "")}"</strong><br/>
          💡 <strong>Mẹo nhớ:</strong> ${escapeHtml(q.tip || "")}
        </div>

        <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
          <button class="q-chip" onclick="openQuestionModal(${q.id})">👁️ Mở toàn văn Câu #${q.id}</button>
        </div>
      </div>
    `;
  }

  window.askQuanSuQuestion = function (qId, evt) {
    if (evt) evt.stopPropagation();
    const q = allQuestions.find((item) => item.id === Number(qId));
    if (!q) return;
    const win = document.getElementById("quansu-window");
    if (win) {
      win.classList.add("open");
      win.setAttribute("aria-hidden", "false");
    }
    appendQuanSuMessage("user", `🎯 Soi chiến thuật & mẹo nhớ Câu #${q.id}`);
    appendQuanSuMessage("bot", buildQuestionTacticalAnalysisHTML(q));
  };

  function handleQuanSuQuickStrategy(code) {
    if (code === "ANALYZE_CURRENT") {
      const q = getCurrentContextQuestion();
      if (q) {
        appendQuanSuMessage("user", `🎯 Soi câu đang mở (Câu #${q.id})`);
        appendQuanSuMessage("bot", buildQuestionTacticalAnalysisHTML(q));
      }
      return;
    }

    if (code === "LONGEST_MYTH") {
      appendQuanSuMessage("user", "🚨 Có nên chọn câu dài nhất khi đi thi không?");
      appendQuanSuMessage(
        "bot",
        `
          <div><strong>🚨 KẾT LUẬN THỐNG KÊ 340 CÂU: TUYỆT ĐỐI KHÔNG CHỌN MÙ QUÁNG CÂU DÀI NHẤT!</strong></div>
          <div class="quansu-step-box danger">
            • Chọn đáp án dài nhất toàn cục chỉ đúng <strong>81/340 câu (23,8%)</strong> — thấp hơn cả đánh bừa 25%!<br/>
            • Ở <strong>24 câu hỏi phủ định</strong> (<em>"Phương án nào KHÔNG phải / KHÔNG đúng / SAI"</em>), đáp án dài vượt trội lại là câu trích nguyên văn Luật nên <strong>SAI TỚI 87,5% (7/8 câu)</strong>!
          </div>
          <div class="quansu-step-box primary">
            📊 <strong>Tỷ lệ đáp án đúng theo chữ cái:</strong><br/>
            • <strong>A: 93 câu (27,4%) – Nhiều nhất</strong><br/>
            • <strong>B: 86 câu (25,3%)</strong><br/>
            • <strong>C: 82 câu (24,1%)</strong><br/>
            • <strong>D: 79 câu (23,2%)</strong><br/>
            👉 Nếu bí hoàn toàn, hãy loại các đáp án có <em>"từ Tử Thần"</em> rồi ưu tiên khoanh <strong>A (hoặc C)</strong>!
          </div>
        `
      );
      return;
    }

    if (code === "DEATH_WORDS") {
      appendQuanSuMessage("user", "🔥 9 cụm từ Tử Thần cần gạch bỏ ngay là gì?");
      appendQuanSuMessage(
        "bot",
        `
          <div><strong>🔥 9 CỤM TỪ "TỬ THẦN" (TỶ LỆ SAI TỚI 94,2% – 113/120 PHƯƠNG ÁN!)</strong></div>
          <div style="margin-top:4px;">Hễ thấy 1 phương án đơn lẻ chứa các từ này → <strong>GẠCH BỎ NGAY</strong>:</div>
          <div class="quansu-step-box danger">
            1. <strong>"Tổ chuyên gia"</strong> (đứng riêng): <strong>SAI 100% (16/16 câu)</strong><br/>
            2. <strong>"Bên mời thầu"</strong> (đứng riêng): <strong>SAI 100% (8/8 câu)</strong><br/>
            3. <strong>"Người có thẩm quyền"</strong> (đứng 1 mình): <strong>SAI 90% (9/10 câu)</strong> – <em>Chỉ đúng duy nhất <span class="q-chip" onclick="openQuestionModal(151)">Câu 151</span> (Kế hoạch TỔNG THỂ LCNT)</em><br/>
            4. <strong>"Trong mọi trường hợp"</strong>: <strong>SAI 100% (6/6 câu)</strong><br/>
            5. <strong>"Bắt buộc"</strong> (chỉ 1 đáp án có): <strong>SAI 100% (7/7 câu)</strong><br/>
            6. <strong>"Chỉ được"</strong> (chỉ 1 đáp án có): <strong>SAI 100% (7/7 câu)</strong><br/>
            7. <strong>"Mà không"</strong> (VD: mà không cần...): <strong>SAI 100% (6/6 câu)</strong><br/>
            8. <strong>"Tiếp tục đánh giá"</strong> (chỉ 1 đáp án có): <strong>SAI 100% (8/8 câu)</strong><br/>
            9. <strong>"Tất cả đều sai" / "A và B đều sai"</strong>: <strong>SAI 89%–100%</strong> <em>(Chỉ đúng 3 câu: <span class="q-chip" onclick="openQuestionModal(296)">Câu 296</span> <span class="q-chip" onclick="openQuestionModal(301)">Câu 301</span> <span class="q-chip" onclick="openQuestionModal(314)">Câu 314</span>)</em>
          </div>
        `
      );
      return;
    }

    if (code === "GOLDEN_WORDS") {
      appendQuanSuMessage("user", "💎 8 cụm từ Kim Cương khoanh ngay là gì?");
      appendQuanSuMessage(
        "bot",
        `
          <div><strong>💎 8 CỤM TỪ "KIM CƯƠNG" (ĐỘ CHÍNH XÁC 75% – 100%)</strong></div>
          <div style="margin-top:4px;">Khi chỉ có 1 phương án duy nhất chứa các cụm từ chuẩn Luật 90/2025 & NĐ 214/2025 này → <strong>KHOANH NGAY</strong>:</div>
          <div class="quansu-step-box success">
            1. <strong>"...của dự án, gói thầu"</strong> / <strong>"tiến độ của dự án, gói thầu"</strong>: <strong>ĐÚNG 100% (4/4 câu)</strong><br/>
            2. <strong>"Được tự quyết định" / "Có quyền quyết định"</strong>: <strong>ĐÚNG 100% (2/2 câu)</strong><br/>
            3. Con số <strong>"50%"</strong>: <strong>ĐÚNG 100% (4/4 câu)</strong>; <strong>"70%"</strong>: <strong>ĐÚNG 67%</strong><br/>
            4. Từ mở <strong>"Có thể"</strong> (chỉ 1 đáp án có): <strong>ĐÚNG 81,8% (9/11 câu)</strong><br/>
            5. <strong>"Một trong các"</strong>: <strong>ĐÚNG 80% (4/5 câu)</strong><br/>
            6. <strong>"Trừ trường hợp..."</strong>: <strong>ĐÚNG 80% (4/5 câu)</strong><br/>
            7. <strong>"Trên cơ sở bảo đảm..."</strong>: <strong>ĐÚNG 71,4% (5/7 câu)</strong><br/>
            8. Hỏi chủ thể phê duyệt/quyết định/đăng tải → Khoanh <strong>"Chủ đầu tư"</strong>!
          </div>
        `
      );
      return;
    }

    if (code === "ALL_ABOVE_RULE") {
      appendQuanSuMessage("user", "⚡ Quy tắc 3 giây xử lý câu có Tất cả đều đúng & A,B đúng?");
      appendQuanSuMessage(
        "bot",
        `
          <div><strong>⚡ QUY TẮC 3 GIÂY XỬ LÝ ĐÁP ÁN GỘP:</strong></div>
          <div class="quansu-step-box primary">
            <strong>1. Khi D là "Tất cả / Cả 3 phương án đều đúng" (34 câu):</strong><br/>
            • Nếu A, B, C là 3 ý <strong>liệt kê bổ sung nhau</strong> (không đá nhau) → <strong>Khoanh D (Trúng 85%)</strong>.<br/>
            • Nếu A, B, C <strong>mâu thuẫn trực tiếp nhau</strong> (VD: A nói <em>Được</em>, B nói <em>Không được</em>; hoặc 3 thời điểm khác nhau) → <strong>Loại ngay D và B</strong>, chỉ chọn <strong>A hoặc C</strong> (A và C chiếm tới <strong>15/16 câu = 93,8%</strong>)!
          </div>
          <div class="quansu-step-box warning">
            <strong>2. Khi có "Phương án A và B (hoặc B và C) đều đúng" (50 câu):</strong><br/>
            • Nếu C là <em>"A và B đều đúng"</em> còn D là <em>"A và B đều sai"</em> (<span class="q-chip" onclick="openQuestionModal(20)">Câu 20</span> <span class="q-chip" onclick="openQuestionModal(107)">Câu 107</span> <span class="q-chip" onclick="openQuestionModal(252)">Câu 252</span>) → Gạch D ngay, chọn <strong>C</strong> (riêng Câu 20 chọn A miễn phí).<br/>
            • Kiểm tra 2 ý được nhắc tên: nếu 1 ý dính "từ Tử Thần" ở Bước 1 thì loại câu gộp, khoanh ý còn lại!
          </div>
        `
      );
      return;
    }

    if (code === "TRAP_16_LIST") {
      appendQuanSuMessage("user", "⚠️ Cho xem 16 câu BẪY có Tất cả đều đúng nhưng KHÔNG chọn D!");
      const chips = SPECIAL_GROUPS.TRAP_ALL_16.map(
        (id) => `<span class="q-chip" onclick="askQuanSuQuestion(${id})">Câu ${id}</span>`
      ).join(" ");
      appendQuanSuMessage(
        "bot",
        `
          <div><strong>⚠️ 16 CÂU BẪY CÓ "TẤT CẢ ĐỀU ĐÚNG" NHƯNG KHÔNG CHỌN D:</strong></div>
          <div class="quansu-step-box danger">
            Chỉ cần nhớ mặt 16 câu này (trong đó <strong>15/16 câu chọn A hoặc C</strong>, duy nhất Câu 46 chọn B), còn lại gặp "Tất cả đều đúng" bạn tự tin khoanh D 100%!<br/><br/>
            ${chips}
          </div>
          <div style="margin-top:8px;">
            <button class="btn btn-sm btn-danger" onclick="openSpeedWithFilter('TRAP_ALL_16')">🔥 Mở lọc 16 câu này để học ngay</button>
          </div>
        `
      );
      return;
    }

    if (code === "NUMBER_RULE") {
      appendQuanSuMessage("user", "🔢 Mẹo lụi nhanh các câu hỏi Con Số (Ngày, Tiền, Năm, %)?");
      appendQuanSuMessage(
        "bot",
        `
          <div><strong>🔢 BẢNG LỤI NHANH CON SỐ KHI QUÊN BÀI:</strong></div>
          <div class="quansu-step-box success">
            • <strong>Số ngày làm việc:</strong> Khoanh <strong>03 ngày làm việc</strong> (làm rõ HSMT, sửa sai lệch chào giá) hoặc <strong>05 ngày làm việc</strong> (công khai KHLCNT, đăng KQLCNT, trả lời kiến nghị).<br/>
            • <strong>Số ngày tự nhiên:</strong> Gạch bỏ <em>"20 ngày"</em> (Sai 100%). Khoanh <strong>10 ngày</strong> (chuẩn bị HSDT, kiến nghị KQLCNT) hoặc <strong>14 ngày</strong> (hoàn trả BĐDT).<br/>
            • <strong>Số năm:</strong> Khoanh <strong>03 năm</strong> hoặc <strong>03 – 05 năm</strong> (Đúng 65% các câu có năm: doanh thu 3 năm, cấm thầu gian lận/thông thầu 3–5 năm, lưu hồ sơ 5 năm).<br/>
            • <strong>Tỷ lệ %:</strong> Khoanh <strong>50%</strong> (Đúng 100%: HĐ tương tự gói hỗn hợp, tạm ứng công việc tự thực hiện) hoặc <strong>70%</strong> (Đúng 67%).<br/>
            • <strong>Số tiền:</strong> Gạch bỏ <em>"50 triệu"</em> (khi đứng riêng) và <em>"05 tỷ"</em> (Sai 100%). Dự toán mua sắm khoanh <strong>500 triệu</strong>; Dự án khoanh <strong>01 tỷ / 02 tỷ</strong>.
          </div>
        `
      );
      return;
    }

    if (code === "CRAM_30_MIN") {
      appendQuanSuMessage("user", "⏱️ Chỉ còn 30 phút trước giờ thi thì học thế nào hiệu quả nhất?");
      appendQuanSuMessage(
        "bot",
        `
          <div><strong>⏱️ LỘ TRÌNH 30 PHÚT CẤP CỨU TRƯỚC GIỜ THI:</strong></div>
          <div class="quansu-step-box primary">
            <strong>• Phút 01 – 10:</strong> Bấm xem <strong>16 câu bẫy không chọn "Tất cả đều đúng"</strong> + <strong>3 câu chọn "Tất cả đều sai"</strong> (Câu 296, 301, 314) → Ăn chắc ngay 10% đề thi.<br/>
            <strong>• Phút 11 – 25:</strong> Bấm nút <button class="q-chip" onclick="openSpeedWithFilter('TRAP')">🔥 72 Câu Bẫy Dễ Sai</button> và bật nút <strong>"🎯 Ẩn đáp án sai"</strong> để chụp ảnh từ khóa đúng vào não.<br/>
            <strong>• Phút 26 – 30:</strong> Thuộc lòng <strong>9 từ Tử Thần (Loại 94,2%)</strong> + <strong>8 từ Kim Cương (Khoanh 80–100%)</strong> của Quân Sư để xử đẹp mọi câu lạ trong phòng thi!
          </div>
        `
      );
      return;
    }
  }

  function handleQuanSuFreeText(rawText) {
    const text = (rawText || "").trim();
    if (!text) return;

    appendQuanSuMessage("user", escapeHtml(text));
    const norm = normalizeVN(text);

    // 1. Check if user typed a question number (e.g., "115", "cau 115", "#115")
    const qMatch = norm.match(/^(?:cau\s*|#)?(\d{1,3})$/);
    if (qMatch) {
      const qId = Number(qMatch[1]);
      const q = allQuestions.find((item) => item.id === qId);
      if (q) {
        appendQuanSuMessage("bot", buildQuestionTacticalAnalysisHTML(q));
      } else {
        appendQuanSuMessage("bot", `⚠️ Bộ đề chỉ có từ <strong>Câu 1 đến Câu 340</strong>. Bạn hãy nhập số câu trong khoảng 1–340 nhé!`);
      }
      return;
    }

    // 2. Check tactical intent keywords
    if (norm.includes("dai nhat") || norm.includes("cau dai")) {
      handleQuanSuQuickStrategy("LONGEST_MYTH");
      return;
    }
    if (norm.includes("tu than") || norm.includes("loai tru") || norm.includes("gach bo")) {
      handleQuanSuQuickStrategy("DEATH_WORDS");
      return;
    }
    if (norm.includes("kim cuong") || norm.includes("khoanh ngay")) {
      handleQuanSuQuickStrategy("GOLDEN_WORDS");
      return;
    }
    if (norm.includes("tat ca") || norm.includes("ca 3") || norm.includes("hai y") || norm.includes("a va b")) {
      handleQuanSuQuickStrategy("ALL_ABOVE_RULE");
      return;
    }
    if (norm.includes("con so") || norm.includes("bao nhieu ngay") || norm.includes("han muc")) {
      handleQuanSuQuickStrategy("NUMBER_RULE");
      return;
    }
    if (norm.includes("30 phut") || norm.includes("cap toc") || norm.includes("chien thuat") || norm.includes("lui")) {
      handleQuanSuQuickStrategy("CRAM_30_MIN");
      return;
    }

    // 3. Otherwise search across all 340 questions for matching keywords
    const matches = allQuestions.filter((q) => {
      const hay = normalizeVN(
        `${q.id} ${q.question} ${q.question_keyword || ""} ${q.answer_keyword || ""} ${q.tip || ""} ${q.options?.A || ""} ${q.options?.B || ""} ${q.options?.C || ""} ${q.options?.D || ""}`
      );
      return hay.includes(norm);
    });

    if (matches.length === 0) {
      appendQuanSuMessage(
        "bot",
        `🔍 Không tìm thấy câu hỏi nào chứa từ khóa <strong>"${escapeHtml(text)}"</strong>. Bạn hãy thử gõ từ khóa ngắn gọn hơn (VD: <em>"bảo lãnh", "liên danh", "500 triệu", "chào giá", "câu 115"</em>)!`
      );
      return;
    }

    const topMatches = matches.slice(0, 6);
    const itemsHtml = topMatches
      .map(
        (q) => `
        <div class="quansu-step-box" style="margin-top:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
            <strong>Câu #${q.id} ${q.is_trap ? "🔥" : ""} (Đáp án: ${q.answer})</strong>
            <div style="display:flex; gap:4px;">
              <button class="q-chip" onclick="askQuanSuQuestion(${q.id})">🎯 Soi</button>
              <button class="q-chip" onclick="openQuestionModal(${q.id})">👁️ Xem</button>
            </div>
          </div>
          <div style="font-size:12.2px; color:var(--text-secondary); margin-top:3px;">
            ${escapeHtml(q.question.length > 95 ? q.question.slice(0, 95) + "..." : q.question)}
          </div>
          <div style="font-size:12.5px; color:var(--success); font-weight:700; margin-top:3px;">
            ✅ [${q.answer}] ${escapeHtml(q.answer_keyword || q.options[q.answer] || "")}
          </div>
        </div>
      `
      )
      .join("");

    appendQuanSuMessage(
      "bot",
      `
        <div>🎯 Tìm thấy <strong>${matches.length} câu hỏi</strong> khớp với từ khóa <strong>"${escapeHtml(text)}"</strong>:</div>
        ${itemsHtml}
        ${
          matches.length > 6
            ? `<div style="margin-top:8px;"><button class="btn btn-sm btn-outline-primary" style="width:100%;" onclick="quickSearchKeyword('${escapeHtml(text.replace(/'/g, "\\'"))}')">🔎 Xem toàn bộ ${matches.length} câu trong tab Học Nhanh</button></div>`
            : ""
        }
      `
    );
  }

  function initQuanSuChatbot() {
    const fab = document.getElementById("quansu-fab");
    const win = document.getElementById("quansu-window");
    const closeBtn = document.getElementById("btn-quansu-close");
    const resetBtn = document.getElementById("btn-quansu-reset");
    const analyzeCurBtn = document.getElementById("btn-quansu-analyze-current");
    const form = document.getElementById("quansu-form");
    const input = document.getElementById("quansu-input");

    if (!fab || !win) return;

    renderQuanSuWelcome();

    fab.addEventListener("click", () => {
      const isOpen = win.classList.toggle("open");
      win.setAttribute("aria-hidden", String(!isOpen));
      if (isOpen) {
        updateQuanSuContextLabel();
        input?.focus();
      }
    });

    closeBtn?.addEventListener("click", () => {
      win.classList.remove("open");
      win.setAttribute("aria-hidden", "true");
    });

    resetBtn?.addEventListener("click", () => {
      renderQuanSuWelcome();
    });

    analyzeCurBtn?.addEventListener("click", () => {
      handleQuanSuQuickStrategy("ANALYZE_CURRENT");
    });

    document.querySelectorAll("#quansu-chips-bar .quansu-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const code = chip.getAttribute("data-ask");
        if (code) handleQuanSuQuickStrategy(code);
      });
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!input) return;
      const val = input.value;
      input.value = "";
      handleQuanSuFreeText(val);
    });

    // Update context label whenever user clicks or changes questions
    document.addEventListener("click", () => {
      setTimeout(updateQuanSuContextLabel, 50);
    });
  }

  document.addEventListener("DOMContentLoaded", initApp);
})();


