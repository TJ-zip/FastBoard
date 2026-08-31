/**
 * ═══════════════════════════════════════════════════════════════
 * FastBoard — Application Logic
 * ═══════════════════════════════════════════════════════════════
 * Pure vanilla JS — no frameworks. Every interaction, animation,
 * and feature is implemented here.
 *
 * Depends on: data.js (must be loaded first)
 * ═══════════════════════════════════════════════════════════════
 */

/* ═══════════════════════ UTILITIES ═══════════════════════ */

/**
 * Shorthand DOM helpers.
 * @param {string} sel  CSS selector
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Show a toast notification.
 * @param {string}  message
 * @param {'success'|'error'|'info'} type
 * @param {number}  duration  ms
 */
function showToast(message, type = 'success', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText =
            'position:fixed;top:24px;right:24px;z-index:10000;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
        document.body.appendChild(container);
    }

    const iconMap = { success: '✅', error: '❌', info: 'ℹ️' };
    const bgMap = {
        success: 'var(--bg-tertiary)',
        error:   'var(--bg-tertiary)',
        info:    'var(--bg-tertiary)'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        pointer-events:auto;display:flex;align-items:center;gap:10px;
        padding:14px 22px;border-radius:var(--radius-sm);
        background:${bgMap[type]};
        border: 2px solid var(--border-navy);
        color:var(--text-primary);font-size:14px;font-weight:700;font-family:'Inter',sans-serif;
        box-shadow:var(--shadow-lg);
        transform:translateX(120%);opacity:0;
        transition:transform .4s cubic-bezier(.22,1,.36,1), opacity .4s ease;
        max-width:380px;line-height:1.4;
    `;
    toast.innerHTML = `<span style="font-size:18px;flex-shrink:0">${iconMap[type]}</span><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });
    });

    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

/**
 * Animate a number counting up inside an element.
 * @param {Element} element
 * @param {number}  target
 * @param {number}  duration  ms
 * @param {string}  suffix    appended to displayed value
 * @param {string}  prefix    prepended to displayed value
 */
function animateCountUp(element, target, duration = 1000, suffix = '', prefix = '') {
    if (!element) return;
    let start = 0;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        element.textContent = prefix + current + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else element.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(tick);
}

/**
 * Spawn a floating "+XP" label that drifts upward and fades.
 * @param {number}  amount
 * @param {Element} anchor  element to position near
 */
function floatingXP(amount, anchor) {
    const el = document.createElement('div');
    el.textContent = `+${amount} XP`;
    el.style.cssText = `
        position:absolute;z-index:9999;pointer-events:none;
        font-family:'Inter',sans-serif;font-weight:800;font-size:18px;
        color:var(--accent-red);text-shadow:2px 2px 0px var(--border-navy);
        transition:transform 1s ease, opacity 1s ease;
        transform:translateY(0);opacity:1;
    `;

    if (anchor) {
        const rect = anchor.getBoundingClientRect();
        el.style.left = rect.left + rect.width / 2 - 30 + 'px';
        el.style.top  = rect.top - 10 + 'px';
    } else {
        el.style.right = '80px';
        el.style.top   = '20px';
    }
    el.style.position = 'fixed';
    document.body.appendChild(el);

    requestAnimationFrame(() => {
        el.style.transform = 'translateY(-60px)';
        el.style.opacity   = '0';
    });
    setTimeout(() => el.remove(), 1100);
}

/**
 * Award XP, update state, refresh sidebar display, check level-up.
 * @param {number}  amount
 * @param {Element} [anchor]
 */
function awardXP(amount, anchor) {
    AppState.user.xp += amount;
    AppState.session.xpEarned += amount;
    floatingXP(amount, anchor);
    updateSidebarXP();

    // Level-up check
    const nextLevel = AppState.user.level + 1;
    if (nextLevel <= 10 && AppState.user.xp >= AppState.user.xpToNextLevel) {
        AppState.user.level = nextLevel;
        AppState.user.levelTitle = LevelTitles[nextLevel] || 'Supernova';
        AppState.user.xpToNextLevel = XPThresholds[nextLevel + 1] || 99999;
        showToast(`🎉 Level Up! You're now Level ${nextLevel} — ${AppState.user.levelTitle}!`, 'success', 5000);
        updateSidebarXP();
    }
}

/** Refresh the sidebar XP bar and text. */
function updateSidebarXP() {
    const xpFill  = $('.xp-fill');
    const xpText  = $('.xp-text');
    const lvlBadge = $('.level-badge');
    const xpDisplay = $('.xp-display');
    const profileLevel = $('.profile-level');
    
    if (xpDisplay) {
        xpDisplay.textContent = `${AppState.user.xp.toLocaleString()} XP`;
    }
    
    const pct = Math.min((AppState.user.xp / AppState.user.xpToNextLevel) * 100, 100);
    
    if (xpFill) {
        xpFill.style.width = pct + '%';
    }
    
    if (xpText) {
        xpText.textContent = `${AppState.user.xp.toLocaleString()} / ${AppState.user.xpToNextLevel.toLocaleString()} XP`;
    }
    
    const title = LevelTitles[AppState.user.level] || 'Supernova';
    
    if (lvlBadge) {
        lvlBadge.textContent = `Lv.${AppState.user.level} ${title}`;
    }
    
    if (profileLevel) {
        profileLevel.textContent = `Level ${AppState.user.level} — ${title}`;
    }
}


/* ═══════════════════════ MAIN APP OBJECT ═══════════════════════ */

const App = {

    /* ─── Timers / refs we may need to clear ─── */
    _audioInterval: null,
    _waveInterval: null,
    _pipelineInterval: null,

    /* ─────────────────── Bootstrap ─────────────────── */
    init() {
        AppState.session.startTime = Date.now();
        this.initNavigation();
        this.initQueue();
        this.initCommons();
        this.initLadder();
        this.initProfile();
        this.initCreator();
        this.initNotifications();
        this.initTopbar();
        this.initOnboarding();
        this.initKeyboard();
        this.updateProgressRing();
        this.startWaveAnimation();
        updateSidebarXP();
    },

    /* ═══════════════════════════════════════════════════════════
       1.  NAVIGATION
       ═══════════════════════════════════════════════════════════ */
    initNavigation() {
        const navItems = $$('.nav-item');
        const views    = $$('.view');
        const pageTitle = $('.page-title');

        const titleMap = {
            queue:   'Learn Queue',
            commons: 'Commons',
            ladder:  'Ladder',
            friends: 'Friends',
            profile: 'Profile',
            creator: 'Creator Dashboard'
        };

        const switchView = (viewId) => {
            navItems.forEach(n => n.classList.remove('active'));
            const target = navItems.find(n => n.dataset.view === viewId);
            if (target) target.classList.add('active');

            views.forEach(v => {
                v.classList.remove('active');
                v.classList.remove('animate-fade-in-up');
            });

            const nextView = document.getElementById(`view-${viewId}`);
            if (nextView) {
                nextView.classList.add('active');
                // Trigger entrance animation
                void nextView.offsetWidth; // reflow
                nextView.classList.add('animate-fade-in-up');
                nextView.addEventListener('animationend', () => {
                    nextView.classList.remove('animate-fade-in-up');
                }, { once: true });
            }

            if (pageTitle) pageTitle.textContent = titleMap[viewId] || 'FastBoard';
            AppState.currentView = viewId;

            // Trigger view-specific entrance animations
            if (viewId === 'profile')  this.animateProfile();
            if (viewId === 'ladder')   this.renderLadder('recall');
            if (viewId === 'friends')  this.renderFriendsView();
        };

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = item.dataset.view;
                if (viewId) switchView(viewId);
            });
            // Keyboard a11y
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    },

    /* ═══════════════════════════════════════════════════════════
       2.  QUEUE — The heart of the learning experience
       ═══════════════════════════════════════════════════════════ */
    initQueue() {
        // Generate and render all cards from memory
        this.renderQueue();
        
        // Initialize session complete overlay
        this.initSessionComplete();
    },

    renderQueue(filterTopic = null) {
        const container = $('#queue-container');
        if (!container) return;
        
        let filteredCards = QueueCards;
        if (filterTopic && filterTopic.toLowerCase() !== 'all' && filterTopic.toLowerCase() !== 'all topics') {
            filteredCards = QueueCards.filter(c => c.topic && c.topic.toLowerCase() === filterTopic.toLowerCase());
        }

        if (filteredCards.length === 0) {
            container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-secondary);">No cards found for this topic.</div>';
            return;
        }

        const getDifficultyDots = (diff) => {
            const level = diff || 3;
            let html = '<span class="card-difficulty" aria-label="Difficulty">';
            for(let i=1; i<=5; i++) {
                html += `<span class="diff-dot ${i <= level ? 'filled' : ''}"></span>`;
            }
            html += '</span>';
            return html;
        };

        const generateCardHTML = (card, index) => {
            const isActive = index === 0 ? 'card-active' : '';
            const cType = (card.type || '').toLowerCase().replace(/_/g, '-');
            
            if (cType === 'flashcard' || cType === 'recall') {
                return `
        <div class="queue-card ${isActive}" id="card-${card.id}" data-type="recall-flashcard" role="article">
          <div class="card-badge badge-recall">ACTIVE RECALL</div>
          <div class="card-header">
            <h3>Quick Recall: ${card.title || card.topic}</h3>
          </div>
          <div class="card-meta">
            <span class="card-topic">${card.topic}</span>
            ${getDifficultyDots(card.difficulty)}
            <span class="card-time">~45s</span>
          </div>
          <div class="card-content recall-content">
            <div class="flashcard" id="fc-${card.id}">
              <div class="flashcard-inner">
                <div class="flashcard-front">
                  <p>${card.question}</p>
                </div>
                <div class="flashcard-back">
                  <p>${card.answer}</p>
                </div>
              </div>
            </div>
            <div class="recall-input">
              <textarea class="recall-answer" placeholder="Type your answer..."></textarea>
              <button class="btn-reveal reveal-btn">Reveal Answer</button>
            </div>
            <div class="confidence-rating hidden">
              <p>How confident were you?</p>
              <div class="confidence-buttons">
                <button class="confidence-btn conf-btn" data-value="1">😟 Blackout</button>
                <button class="confidence-btn conf-btn" data-value="2">😕 Hard</button>
                <button class="confidence-btn conf-btn" data-value="3">🙂 Good</button>
                <button class="confidence-btn conf-btn" data-value="4">😎 Easy</button>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-primary recall-next-btn hidden">Next Card →</button>
          </div>
        </div>`;
            }

            if (cType === 'miniboard' || cType === 'visual' || cType === 'visual-miniboard') {
                let columnsHtml = '';
                let dragItemsHtml = '';
                
                if (card.pairs) {
                    columnsHtml = `
              <div class="comparison-column">
                <h4>Terms</h4>
                <div class="drop-zone" data-zone="Terms">
                  <ul>${card.pairs.map(p => `<li>${p.definition}</li>`).join('')}</ul>
                </div>
              </div>
              <div class="comparison-divider"><span class="vs-badge">VS</span></div>
              <div class="comparison-column">
                <h4>Matches</h4>
                <div class="drop-zone" data-zone="Matches">
                  <ul class="empty-list">Drag here</ul>
                </div>
              </div>`;
                    
                    dragItemsHtml = card.pairs.map(p => `<div class="drag-item" draggable="true" id="item-${p.id}" data-item-id="item-${p.id}">${p.term}</div>`).join('');
                } else if (card.columns) {
                    // Fallback for legacy static data format
                    columnsHtml = `
              <div class="comparison-column">
                <h4>${card.columns[0]}</h4>
                <div class="drop-zone" data-zone="${card.columns[0]}">
                  <ul><li>Produces 2 identical cells</li><li>One division</li></ul>
                </div>
              </div>
              <div class="comparison-divider"><span class="vs-badge">VS</span></div>
              <div class="comparison-column">
                <h4>${card.columns[1]}</h4>
                <div class="drop-zone" data-zone="${card.columns[1]}">
                  <ul><li>Produces 4 unique cells</li><li>Two divisions</li></ul>
                </div>
              </div>`;
                    dragItemsHtml = card.items.map((p, idx) => `<div class="drag-item" draggable="true" id="${p.id || 'i'+idx}" data-item-id="${p.id || 'i'+idx}">${p.text}</div>`).join('');
                }

                return `
        <div class="queue-card ${isActive}" id="card-${card.id}" data-type="visual-miniboard" role="article">
          <div class="card-badge badge-visual">VISUAL MINIBOARD</div>
          <div class="card-header">
            <h3>${card.title || 'Visual Matching'}</h3>
          </div>
          <div class="card-meta">
            <span class="card-topic">${card.topic}</span>
            ${getDifficultyDots(card.difficulty)}
            <span class="card-time">~3 min</span>
          </div>
          <div class="card-content visual-content">
            <div class="comparison-board">
              ${columnsHtml}
            </div>
            <div class="drag-drop-zone">
              <p class="instruction">${card.description || 'Drag each label to the correct column:'}</p>
              <div class="drag-items drag-source">
                ${dragItemsHtml}
              </div>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-primary miniboard-check-btn">Check Answers</button>
            <button class="btn-primary miniboard-next-btn hidden">Next Card →</button>
          </div>
        </div>`;
            }

            if (cType === 'concept-link' || cType === 'connect') {
                return `
        <div class="queue-card ${isActive}" id="card-${card.id}" data-type="concept-link" role="article">
          <div class="card-badge badge-link">CONCEPT LINK</div>
          <div class="card-header">
            <h3>Connect: ${card.title || card.topic}</h3>
          </div>
          <div class="card-meta">
            <span class="card-topic">${card.topic}</span>
            ${getDifficultyDots(card.difficulty)}
            <span class="card-time">~2 min</span>
          </div>
          <div class="card-content link-content">
            <div class="concept-pair">
              <div class="concept-node"><span class="concept-label">${card.conceptA || card.concept}</span></div>
              <div class="concept-connector" aria-hidden="true">
                <svg width="80" height="24" viewBox="0 0 80 24" fill="none">
                  <line x1="0" y1="12" x2="65" y2="12" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
                  <polygon points="65,6 77,12 65,18" fill="currentColor"/>
                </svg>
              </div>
              <div class="concept-node"><span class="concept-label">${card.conceptB || '...'}</span></div>
            </div>
            <p class="link-question">${card.prompt || card.question}</p>
            <textarea class="link-answer" placeholder="Explain the connection..."></textarea>
          </div>
          <div class="card-actions">
            <button class="btn-primary concept-submit-btn">Submit Answer</button>
          </div>
        </div>`;
            }

            if (cType === 'audio' || cType === 'audio-digest') {
                return `
        <div class="queue-card ${isActive}" id="card-${card.id}" data-type="audio-digest" role="article">
          <div class="card-badge">AUDIO DIGEST</div>
          <div class="card-header">
            <h3>${card.title}</h3>
          </div>
          <div class="card-meta">
            <span class="card-topic">${card.topic}</span>
            ${getDifficultyDots(card.difficulty)}
            <span class="card-time">${card.duration ? '~' + card.duration.split(':')[0] + ' min' : '~2 min'}</span>
          </div>
          <div class="card-content audio-content">
            <div class="audio-player">
              <button class="play-btn audio-play-btn" aria-label="Play audio">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <circle cx="24" cy="24" r="23" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                  <polygon points="20,16 34,24 20,32" fill="currentColor"/>
                </svg>
              </button>
              <div class="audio-waveform" aria-hidden="true">
                ${'<span class="wave-bar"></span>'.repeat(30)}
              </div>
              <span class="audio-time"><span class="audio-time-current">0:00</span> / ${card.duration || '1:24'}</span>
              <div class="audio-progress-bar">
                <div class="audio-progress-fill"></div>
              </div>
            </div>
            <div class="audio-transcript" aria-label="Audio transcript" style="display:none">
              <p>${card.transcript}</p>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-primary audio-complete-btn">Complete &amp; Continue</button>
            <button class="btn-secondary transcript-toggle">Show Transcript</button>
          </div>
        </div>`;
            }

            if (cType === 'community' || cType === 'community-pulse') {
                return `
        <div class="queue-card ${isActive}" id="card-${card.id}" data-type="community-pulse" role="article">
          <div class="card-badge badge-community">COMMUNITY PULSE</div>
          <div class="card-header">
            <h3>${card.title}</h3>
          </div>
          <div class="card-meta">
            <span class="card-topic">${card.topic}</span>
            <span class="card-time">~1 min</span>
          </div>
          <div class="card-content community-content">
            <div class="pulse-post">
              <div class="pulse-author">
                <div class="avatar">${card.authorInitials || 'AN'}</div>
                <div class="author-info">
                  <span class="author-name">${card.author || 'Anonymous'}</span>
                  <span class="author-level">Lv.1</span>
                </div>
              </div>
              <p class="pulse-question">"${card.question}"</p>
              <div class="pulse-replies">
                <span><span class="pulse-reply-count">${card.replies || 0}</span> replies</span>
              </div>
            </div>
            <div class="pulse-reply-box">
              <textarea placeholder="Share your knowledge (+15 XP)..."></textarea>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-primary pulse-post-btn">Post Reply</button>
            <button class="btn-secondary pulse-skip-btn">Skip</button>
          </div>
        </div>`;
            }

            if (cType === 'read' || cType === 'micro-read') {
                return `
        <div class="queue-card ${isActive}" id="card-${card.id}" data-type="micro-read" role="article">
          <div class="card-badge badge-read">MICRO-READ</div>
          <div class="card-header">
            <h3>${card.title}</h3>
          </div>
          <div class="card-meta">
            <span class="card-topic">${card.topic}</span>
            ${getDifficultyDots(card.difficulty)}
            <span class="card-time">~2 min</span>
          </div>
          <div class="card-content read-content">
            <div class="micro-read-text">
              <p>${card.passage}</p>
            </div>
            <div class="highlight-prompt">
              <p>${card.questionText}</p>
              <div class="term-options">
                ${(card.options || []).map(opt => `<button class="term-btn read-option-btn">${opt}</button>`).join('')}
              </div>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-primary read-submit-btn">Submit &amp; Continue</button>
          </div>
        </div>`;
            }

            // Fallback empty card
            return '';
        };

        const generateSafeCardHTML = (c, i) => {
            try {
                return generateCardHTML(c, i);
            } catch (err) {
                console.error("Error generating HTML for card:", c, err);
                return '';
            }
        };

        container.innerHTML = filteredCards.map((c, i) => generateSafeCardHTML(c, i)).join('');
        
        // Re-initialize event listeners on the newly created DOM elements
        this.initAudioDigest();
        this.initRecallFlashcard();
        this.initVisualMiniBoard();
        this.initCommunityPulse();
        this.initMicroRead();
        this.initConceptLink();
    },

    /* ─── Advance to next card ─── */
    advanceQueue() {
        const cards = $$('.queue-card');
        const currentIndex = AppState.session.currentCardIndex;
        const currentCard = cards[currentIndex];

        if (!currentCard) return;

        // Mark current card as completed (green border + checkmark)
        currentCard.classList.remove('card-active');
        currentCard.classList.add('card-completed');

        AppState.session.completedCards++;
        AppState.session.currentCardIndex++;
        this.updateProgressRing();

        // All done?
        if (AppState.session.currentCardIndex >= AppState.session.totalCards) {
            this.showSessionComplete();
            return;
        }

        // Highlight next card as active and scroll to it
        const nextCard = cards[AppState.session.currentCardIndex];
        if (nextCard) {
            nextCard.classList.add('card-active');
            void nextCard.offsetWidth;
            nextCard.classList.add('animate-fade-in-up');
            nextCard.addEventListener('animationend', () => {
                nextCard.classList.remove('animate-fade-in-up');
            }, { once: true });
            nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    /* ─── 2a. Audio Digest ─── */
    initAudioDigest() {
        const cards = $$('[data-type="audio-digest"]');
        if (!cards.length) return;

        cards.forEach(card => {
            const playBtn    = $('.audio-play-btn', card);
            const player     = $('.audio-player', card);
            const timeEl     = $('.audio-time-current', card);
            const progressEl = $('.audio-progress-fill', card);
            const transcriptBtn = $('.transcript-toggle', card);
            const transcriptEl  = $('.audio-transcript', card);
            const completeBtn   = $('.audio-complete-btn', card);

            let playing = false;
            let elapsed = 0;
            const totalSeconds = 84; // 1:24

            const formatTime = (s) => {
                const m = Math.floor(s / 60);
                const sec = Math.floor(s % 60);
                return `${m}:${sec.toString().padStart(2, '0')}`;
            };

            const playIcon = '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="23" stroke="currentColor" stroke-width="2" opacity="0.3"/><polygon points="20,16 34,24 20,32" fill="currentColor"/></svg>';
            const pauseIcon = '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="23" stroke="currentColor" stroke-width="2" opacity="0.3"/><rect x="17" y="16" width="4" height="16" rx="1" fill="currentColor"/><rect x="27" y="16" width="4" height="16" rx="1" fill="currentColor"/></svg>';

            if (playBtn) {
                playBtn.addEventListener('click', () => {
                    playing = !playing;
                    if (player) player.classList.toggle('playing', playing);
                    playBtn.innerHTML = playing ? pauseIcon : playIcon;

                    if (playing) {
                        card._audioInterval = setInterval(() => {
                            elapsed += 1;
                            if (elapsed >= totalSeconds) {
                                elapsed = totalSeconds;
                                playing = false;
                                if (player) player.classList.remove('playing');
                                clearInterval(card._audioInterval);
                                playBtn.innerHTML = playIcon;
                            }
                            if (timeEl)     timeEl.textContent = formatTime(elapsed);
                            if (progressEl) progressEl.style.width = ((elapsed / totalSeconds) * 100) + '%';
                            
                            // Sync wave visualizer bars with playback progress
                            const waveBars = $$('.wave-bar', card);
                            const activeCount = Math.floor((elapsed / totalSeconds) * waveBars.length);
                            waveBars.forEach((bar, idx) => {
                                if (idx < activeCount) {
                                    bar.classList.add('active');
                                } else {
                                    bar.classList.remove('active');
                                }
                            });
                        }, 1000);
                    } else {
                        clearInterval(card._audioInterval);
                    }
                });
            }

            if (transcriptBtn && transcriptEl) {
                transcriptBtn.addEventListener('click', () => {
                    const visible = transcriptEl.style.display !== 'none' && transcriptEl.style.display !== '';
                    transcriptEl.style.display = visible ? 'none' : 'block';
                    transcriptBtn.textContent  = visible ? 'Show Transcript' : 'Hide Transcript';
                });
            }

            if (completeBtn) {
                completeBtn.addEventListener('click', () => {
                    clearInterval(card._audioInterval);
                    awardXP(20, completeBtn);
                    showToast('Audio digest completed! +20 XP', 'success');
                    AppState.session.correctAnswers++;
                    AppState.session.totalAnswers++;
                    this.advanceQueue();
                });
            }
        });
    },

    /* ─── 2b. Recall Flashcard ─── */
    initRecallFlashcard() {
        const cards = $$('[data-type="recall-flashcard"]');
        if (!cards.length) return;

        cards.forEach(card => {
            const revealBtn  = $('.reveal-btn', card);
            const flashcard  = $('.flashcard', card);
            const ratingEl   = $('.confidence-rating', card);
            const nextBtn    = $('.recall-next-btn', card);
            const confBtns   = $$('.conf-btn', card);

            let answered = false;

            const revealAnswer = () => {
                if (answered) return;
                if (flashcard) flashcard.classList.add('flipped');
                
                if (ratingEl) {
                    ratingEl.classList.remove('hidden');
                    ratingEl.style.display = 'flex';
                    void ratingEl.offsetWidth;
                    ratingEl.classList.add('animate-fade-in-up');
                }
                if (revealBtn) {
                    revealBtn.textContent = 'Answer Revealed ✓';
                    revealBtn.disabled = true;
                    revealBtn.style.opacity = '0.6';
                }
                answered = true;
            };

            if (revealBtn) {
                revealBtn.addEventListener('click', revealAnswer);
            }

            if (flashcard) {
                flashcard.addEventListener('click', revealAnswer);
            }

            confBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent card flip click bubbling
                    confBtns.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');

                    const conf = parseInt(btn.dataset.confidence, 10);
                    const xpMap = { 4: 15, 3: 12, 2: 8, 1: 5 };
                    const xp = xpMap[conf] || 5;

                    awardXP(xp, btn);
                    showToast(`Confidence ${conf} — +${xp} XP earned!`, 'success');
                    AppState.session.totalAnswers++;
                    if (conf >= 3) AppState.session.correctAnswers++;

                    if (nextBtn) {
                        nextBtn.classList.remove('hidden');
                        nextBtn.style.display = 'inline-flex';
                        void nextBtn.offsetWidth;
                        nextBtn.classList.add('animate-fade-in-up');
                    }
                });
            });

            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.advanceQueue());
            }
        });
    },

    /* ─── 2c. Visual MiniBoard (Drag & Drop) ─── */
    initVisualMiniBoard() {
        const cards = $$('[data-type="visual-miniboard"]');
        if (!cards.length) return;

        cards.forEach(card => {
            const dragItems  = $$('.drag-item', card);
            const dropZones  = $$('.drop-zone', card);
            const checkBtn   = $('.miniboard-check-btn', card);
            const nextBtn    = $('.miniboard-next-btn', card);
            
            const rawCardId = card.id.replace('card-', '');

            // Make items draggable
            dragItems.forEach(item => {
                item.setAttribute('draggable', 'true');

                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', item.dataset.itemId || item.id);
                    e.dataTransfer.effectAllowed = 'move';
                    item.classList.add('dragging');
                    setTimeout(() => { item.style.opacity = '0.5'; }, 0);
                });

                item.addEventListener('dragend', () => {
                    item.classList.remove('dragging');
                    item.style.opacity = '1';
                });

                // Touch support
                item.addEventListener('click', () => {
                    // Toggle selection for mobile (tap-to-select, tap-zone-to-place)
                    const wasSelected = item.classList.contains('selected-drag');
                    dragItems.forEach(d => d.classList.remove('selected-drag'));
                    if (!wasSelected) item.classList.add('selected-drag');
                });
            });

            dropZones.forEach(zone => {
                zone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    zone.classList.add('drag-over');
                });

                zone.addEventListener('dragleave', () => {
                    zone.classList.remove('drag-over');
                });

                zone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    zone.classList.remove('drag-over');
                    const itemId = e.dataTransfer.getData('text/plain');
                    const item = document.getElementById(itemId) || $(`[data-item-id="${itemId}"]`, card);
                    if (item) {
                        zone.appendChild(item);
                        item.classList.remove('dragging');
                        item.style.opacity = '1';
                    }
                });

                // Touch support — tap a zone when an item is selected
                zone.addEventListener('click', () => {
                    const sel = $('.selected-drag', card);
                    if (sel) {
                        zone.appendChild(sel);
                        sel.classList.remove('selected-drag');
                    }
                });
            });

            if (checkBtn) {
                checkBtn.addEventListener('click', () => {
                    let correct = 0;
                    let total = 0;

                    dropZones.forEach(zone => {
                        const zoneName = zone.dataset.zone;
                        const items = $$('.drag-item', zone);
                        items.forEach(item => {
                            total++;
                            const cardData = QueueCards.find(c => c.id == rawCardId || c.id === rawCardId);
                            // Support both mock formats: card.pairs and card.items
                            const itemIdToCheck = item.dataset.itemId || item.id;
                            let itemData;
                            if (cardData && cardData.pairs) {
                                // New AI format
                                itemData = cardData.pairs.find(i => 'item-' + i.id == itemIdToCheck);
                                if (itemData && zoneName === 'Matches') {
                                    item.classList.add('correct');
                                    item.classList.remove('incorrect');
                                    correct++;
                                } else {
                                    item.classList.add('incorrect');
                                    item.classList.remove('correct');
                                }
                            } else if (cardData && cardData.items) {
                                // Old format
                                itemData = cardData.items.find(i => i.id === itemIdToCheck);
                                if (itemData && itemData.correct === zoneName) {
                                    item.classList.add('correct');
                                    item.classList.remove('incorrect');
                                    correct++;
                                } else {
                                    item.classList.add('incorrect');
                                    item.classList.remove('correct');
                                }
                            }
                        });
                    });

                    // Also check items still in the source area
                    const sourceItems = $$('.drag-source .drag-item', card);
                    sourceItems.forEach(item => {
                        total++;
                        item.classList.add('incorrect');
                    });

                    const xp = Math.max(5, Math.round((correct / Math.max(total, 1)) * 20));
                    awardXP(xp, checkBtn);
                    AppState.session.totalAnswers++;
                    if (correct === total && total > 0) AppState.session.correctAnswers++;
                    showToast(`${correct}/${total} correct! +${xp} XP`, correct === total ? 'success' : 'info');

                    checkBtn.disabled = true;
                    checkBtn.style.opacity = '0.5';

                    if (nextBtn) {
                        nextBtn.classList.remove('hidden');
                        nextBtn.style.display = 'inline-flex';
                        void nextBtn.offsetWidth;
                        nextBtn.classList.add('animate-fade-in-up');
                    }
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.advanceQueue());
            }
        });
    },

    /* ─── 2d. Community Pulse ─── */
    initCommunityPulse() {
        const cards = $$('[data-type="community-pulse"]');
        if (!cards.length) return;

        cards.forEach(card => {
            const postBtn  = $('.pulse-post-btn', card);
            const skipBtn  = $('.pulse-skip-btn', card);
            const textarea = $('textarea', card);
            const replyCt  = $('.pulse-reply-count', card);

            if (postBtn) {
                postBtn.addEventListener('click', () => {
                    if (textarea && textarea.value.trim().length > 0) {
                        awardXP(15, postBtn);
                        showToast('+15 XP for helping a peer! 🤝', 'success');
                        textarea.value = '';
                        if (replyCt) {
                            const cur = parseInt(replyCt.textContent, 10) || 0;
                            replyCt.textContent = cur + 1;
                        }
                        AppState.session.totalAnswers++;
                        AppState.session.correctAnswers++;
                        setTimeout(() => this.advanceQueue(), 800);
                    } else {
                        showToast('Write a reply first!', 'info');
                    }
                });
            }

            if (skipBtn) {
                skipBtn.addEventListener('click', () => {
                    showToast('Skipped — no XP awarded', 'info');
                    AppState.session.totalAnswers++;
                    this.advanceQueue();
                });
            }
        });
    },

    /* ─── 2e. Micro-Read ─── */
    initMicroRead() {
        const cards = $$('[data-type="micro-read"]');
        if (!cards.length) return;

        cards.forEach(card => {
            const optBtns   = $$('.read-option-btn', card);
            const submitBtn = $('.read-submit-btn', card);

            let selectedOption = null;

            optBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    optBtns.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedOption = btn.dataset.option || btn.textContent.trim();
                });
            });

            if (submitBtn) {
                submitBtn.addEventListener('click', () => {
                    if (!selectedOption) {
                        showToast('Select an answer first!', 'info');
                        return;
                    }

                    AppState.session.totalAnswers++;

                    const rawCardId = card.id.replace('card-', '');
                    const cardData = QueueCards.find(c => c.id == rawCardId || c.id === rawCardId);
                    const correctAnswer = cardData ? cardData.correctAnswer : 'Cleavage Furrow';

                    if (selectedOption === correctAnswer) {
                        awardXP(15, submitBtn);
                        showToast('Correct! +15 XP 🎯', 'success');
                        AppState.session.correctAnswers++;
                        // Highlight correct
                        optBtns.forEach(b => {
                            if ((b.dataset.option || b.textContent.trim()) === correctAnswer) {
                                b.classList.add('correct');
                            }
                        });
                    } else {
                        awardXP(3, submitBtn);
                        showToast(`Not quite — the answer is ${correctAnswer}. +3 XP for trying.`, 'error');
                        optBtns.forEach(b => {
                            if ((b.dataset.option || b.textContent.trim()) === selectedOption) {
                                b.classList.add('incorrect');
                            }
                            if ((b.dataset.option || b.textContent.trim()) === correctAnswer) {
                                b.classList.add('correct');
                            }
                        });
                    }

                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.5';
                    setTimeout(() => this.advanceQueue(), 1500);
                });
            }
        });
    },

    /* ─── 2f. Concept Link ─── */
    initConceptLink() {
        const cards = $$('[data-type="concept_link"]');
        if (!cards.length) return;

        cards.forEach(card => {
            const submitBtn = $('.concept-submit-btn', card);
            const textarea  = $('textarea', card);

            if (submitBtn) {
                submitBtn.addEventListener('click', () => {
                    if (textarea && textarea.value.trim().length > 0) {
                        awardXP(20, submitBtn);
                        showToast('Great explanation! +20 XP 🧠', 'success');
                        AppState.session.totalAnswers++;
                        AppState.session.correctAnswers++;
                        submitBtn.disabled = true;
                        submitBtn.style.opacity = '0.5';
                        setTimeout(() => this.advanceQueue(), 1000);
                    } else {
                        showToast('Write your explanation first!', 'info');
                    }
                });
            }
        });
    },

    /* ─── 2g. Session Complete ─── */
    initSessionComplete() {
        const shareBtn = $('.session-share-btn');
        const continueBtn = $('.session-continue-btn');

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                awardXP(25, shareBtn);
                showToast('Shared to Commons! +25 XP 🚀', 'success');
                shareBtn.disabled = true;
                shareBtn.style.opacity = '0.6';
                shareBtn.textContent = 'Shared ✓';
            });
        }

        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                showToast('Starting a new session…', 'info');
                // Reset session
                AppState.session.currentCardIndex = 0;
                AppState.session.completedCards = 0;
                AppState.session.xpEarned = 0;
                AppState.session.correctAnswers = 0;
                AppState.session.totalAnswers = 0;
                AppState.session.startTime = Date.now();
                // Reload page for fresh state
                location.reload();
            });
        }
    },

    showSessionComplete() {
        const completeEl = document.getElementById('session-complete');
        if (!completeEl) return;

        // Hide all queue cards
        $$('.queue-card').forEach(c => { c.style.display = 'none'; c.classList.remove('card-active'); });

        completeEl.classList.remove('hidden');
        completeEl.style.display = 'block';
        void completeEl.offsetWidth;
        completeEl.classList.add('animate-fade-in-up', 'card-active');

        // Compute session duration
        const durationSec = Math.floor((Date.now() - AppState.session.startTime) / 1000);
        const durationMin = Math.max(1, Math.floor(durationSec / 60));

        // Animate stats
        const accuracyEl = $('.complete-accuracy', completeEl);
        const xpEl       = $('.complete-xp', completeEl);
        const streakEl   = $('.complete-streak', completeEl);
        const cardsEl    = $('.complete-cards', completeEl);

        const accuracyVal = AppState.session.totalAnswers > 0 ? Math.round((AppState.session.correctAnswers / AppState.session.totalAnswers) * 100) : 0;

        if (accuracyEl) animateCountUp(accuracyEl, accuracyVal, 1200, '%');
        if (xpEl)       animateCountUp(xpEl, AppState.session.xpEarned, 1200, '', '+');
        if (streakEl)   animateCountUp(streakEl, AppState.user.streak, 1200, '');
        if (cardsEl)    animateCountUp(cardsEl, AppState.session.completedCards, 1200, '/' + AppState.session.totalCards);

        // Celebration particles
        this.spawnCelebration(completeEl);
    },

    /** Spawn confetti-like celebration particles */
    spawnCelebration(container) {
        const colors = ['#0A192F', '#D90429', '#1D2D44', '#3A4B6B', '#FDFBF7'];
        const rect = container.getBoundingClientRect();
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            const color = colors[i % colors.length];
            const size = 4 + Math.random() * 6;
            const x = Math.random() * rect.width;
            const drift = (Math.random() - 0.5) * 120;
            particle.style.cssText = `
                position:absolute;left:${x}px;top:50%;z-index:10;
                width:${size}px;height:${size}px;border-radius:50%;
                background:${color};pointer-events:none;
                animation:celebrationParticle ${1 + Math.random()}s ease-out forwards;
                animation-delay:${Math.random() * 0.4}s;
                --drift:${drift}px;
            `;
            container.style.position = 'relative';
            container.appendChild(particle);
            setTimeout(() => particle.remove(), 2000);
        }

        // Inject keyframes if not already present
        if (!document.getElementById('celebration-keyframes')) {
            const style = document.createElement('style');
            style.id = 'celebration-keyframes';
            style.textContent = `
                @keyframes celebrationParticle {
                    0%   { transform:translate(0,0) scale(1); opacity:1; }
                    100% { transform:translate(var(--drift),-120px) scale(0); opacity:0; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    /* ═══════════════════════════════════════════════════════════
       3.  PROGRESS RING
       ═══════════════════════════════════════════════════════════ */
    updateProgressRing() {
        const ring = $('.progress-ring-fill');
        const text = $('.progress-text');
        if (!ring) return;

        const radius = parseFloat(ring.getAttribute('r')) || 36;
        const circumference = 2 * Math.PI * radius;
        ring.style.strokeDasharray = circumference;

        const progress = AppState.session.totalCards > 0
            ? AppState.session.completedCards / AppState.session.totalCards
            : 0;
        const offset = circumference * (1 - progress);
        ring.style.strokeDashoffset = offset;
        ring.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(.22,1,.36,1)';

        if (text) {
            text.textContent = `${AppState.session.completedCards} of ${AppState.session.totalCards}`;
        }
    },

    /* ═══════════════════════════════════════════════════════════
       4.  WAVE ANIMATION (Audio visualiser bars)
       ═══════════════════════════════════════════════════════════ */
    startWaveAnimation() {
        const bars = $$('.wave-bar');
        if (bars.length === 0) return;

        // Initial random heights
        bars.forEach(bar => {
            bar.style.height = (8 + Math.random() * 28) + 'px';
        });

        this._waveInterval = setInterval(() => {
            const player = $('.audio-player');
            if (player && player.classList.contains('playing')) {
                bars.forEach(bar => {
                    const h = 8 + Math.random() * 28;
                    bar.style.height = h + 'px';
                    bar.style.transition = 'height 0.15s ease';
                });
            }
        }, 150);
    },

    /* ═══════════════════════════════════════════════════════════
       5.  LADDER / LEADERBOARD
       ═══════════════════════════════════════════════════════════ */
    initLadder() {
        const tabs = $$('.ladder-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const category = tab.dataset.tab || tab.dataset.category || tab.textContent.trim().toLowerCase();
                this.renderLadder(category);
            });
        });

        // Initial render
        this.renderLadder('recall');
    },

    renderLadder(category) {
        const data = LeaderboardData[category];
        if (!data) return;
        this.buildPodium(data);
        this.buildLadderList(data);
        this.updateUserRankDisplay(data);
    },

    buildPodium(data) {
        const podium = document.getElementById('ladder-podium');
        if (!podium) return;

        const top3 = data.slice(0, 3);
        // Display order: 2nd, 1st, 3rd
        const order = [top3[1], top3[0], top3[2]].filter(Boolean);
        const posClasses = ['second', 'first', 'third'];
        const heights    = ['100px', '130px', '80px'];

        podium.innerHTML = order.map((entry, i) => {
            if (!entry) return '';
            const bg = getAvatarColor(entry.name);
            const changeIcon = entry.change > 0 ? '↑' : entry.change < 0 ? '↓' : '—';
            const changeClass = entry.change > 0 ? 'up' : entry.change < 0 ? 'down' : 'neutral';
            return `
                <div class="podium-item ${posClasses[i]} ${entry.isCurrentUser ? 'you' : ''}" style="animation-delay:${i * 0.12}s">
                    <div class="podium-avatar" style="background:${bg}">${entry.initials}</div>
                    <div class="podium-name">${entry.name.split(' ')[0]}</div>
                    <div class="podium-score">${entry.score}</div>
                    <div class="podium-rank">#${entry.rank}</div>
                    <div class="podium-bar" style="height:${heights[i]}"></div>
                    <span class="podium-change ${changeClass}">${changeIcon}${Math.abs(entry.change) || ''}</span>
                </div>
            `;
        }).join('');

        // Animate bars in
        requestAnimationFrame(() => {
            $$('.podium-bar', podium).forEach(bar => {
                bar.style.transition = 'height 0.6s cubic-bezier(.22,1,.36,1)';
            });
        });
    },

    buildLadderList(data) {
        const list = document.getElementById('ladder-list');
        if (!list) return;

        const rows = data.slice(3); // Rows 4–15
        list.innerHTML = rows.map((entry, i) => {
            const bg = getAvatarColor(entry.name);
            const changeIcon = entry.change > 0
                ? `<span class="change-arrow up">↑${entry.change}</span>`
                : entry.change < 0
                    ? `<span class="change-arrow down">↓${Math.abs(entry.change)}</span>`
                    : `<span class="change-arrow neutral">—</span>`;
            return `
                <div class="ladder-row ${entry.isCurrentUser ? 'you' : ''}" style="animation-delay:${i * 0.04}s">
                    <span class="ladder-rank">${entry.rank}</span>
                    <div class="ladder-avatar" style="background:${bg}">${entry.initials}</div>
                    <div class="ladder-info">
                        <span class="ladder-name">${entry.name}${entry.isCurrentUser ? ' <em>(You)</em>' : ''}</span>
                        <span class="ladder-level">Lv ${entry.level} · ${entry.levelTitle}</span>
                    </div>
                    <span class="ladder-score">${entry.score}</span>
                    ${changeIcon}
                </div>
            `;
        }).join('');
    },

    updateUserRankDisplay(data) {
        const userEntry = data.find(d => d.isCurrentUser);
        const el = $('.ladder-your-rank');
        if (el && userEntry) {
            const changeIcon = userEntry.change > 0 ? '↑' : userEntry.change < 0 ? '↓' : '—';
            const changeClass = userEntry.change > 0 ? 'up' : userEntry.change < 0 ? 'down' : 'neutral';
            el.innerHTML = `
                <div class="your-rank">
                    <span>Your Position</span>
                    <span class="rank-number">#${userEntry.rank}</span>
                    <span class="rank-change ${changeClass}">${changeIcon} ${Math.abs(userEntry.change) || ''} from last week</span>
                </div>
            `;
        }
    },

    /* ═══════════════════════════════════════════════════════════
       6.  NOTIFICATIONS
       ═══════════════════════════════════════════════════════════ */
    initNotifications() {
        const bell    = $('.notification-bell');
        const panel   = document.getElementById('notification-panel');
        const closeBtn = $('.notification-close', panel);
        const listEl  = $('.notification-list', panel);
        const badge   = $('.notification-badge');

        if (!panel) return;

        // Render notifications
        const unread = NotificationsData.filter(n => !n.read).length;
        if (badge) {
            badge.textContent = unread;
            badge.style.display = unread > 0 ? 'flex' : 'none';
        }

        if (listEl) {
            listEl.innerHTML = NotificationsData.map(n => {
                let iconClass = 'icon-emerald';
                if (n.icon === '🏆') iconClass = 'icon-violet';
                if (n.icon === '🔥') iconClass = 'icon-amber';
                return `
                    <div class="notification-item ${n.read ? 'read' : 'unread'}" data-notif-id="${n.id}">
                        <span class="notif-icon ${iconClass}">${n.icon}</span>
                        <div class="notif-content">
                            <p class="notif-text">${n.text}</p>
                            <span class="notif-time">${n.time}</span>
                        </div>
                        ${!n.read ? '<span class="notification-dot"></span>' : ''}
                    </div>
                `;
            }).join('');

            // Mark as read on click
            $$('.notification-item.unread', listEl).forEach(item => {
                item.addEventListener('click', () => {
                    const id = parseInt(item.dataset.notifId, 10);
                    const notif = NotificationsData.find(n => n.id === id);
                    if (notif) notif.read = true;
                    item.classList.remove('unread');
                    item.classList.add('read');
                    const dot = $('.notification-dot', item);
                    if (dot) dot.remove();
                    // Update badge
                    const remaining = NotificationsData.filter(n => !n.read).length;
                    if (badge) {
                        badge.textContent = remaining;
                        badge.style.display = remaining > 0 ? 'flex' : 'none';
                    }
                });
            });
        }

        // Toggle panel
        if (bell) {
            bell.addEventListener('click', (e) => {
                e.stopPropagation();
                panel.classList.toggle('open');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => panel.classList.remove('open'));
        }

        // Click outside
        document.addEventListener('click', (e) => {
            if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== bell && !bell?.contains(e.target)) {
                panel.classList.remove('open');
            }
        });
    },

    /* ═══════════════════════════════════════════════════════════
       7.  COMMONS (Social Feed)
       ═══════════════════════════════════════════════════════════ */
    initCommons() {
        this.renderCommonsFeed();
        this.initCommonsFilters();
        this.initCommonsCreatePost();
    },

    renderCommonsFeed() {
        const feed = document.getElementById('commons-feed-list');
        if (!feed) return;

        feed.innerHTML = CommonsFeed.map(post => {
            const bg = getAvatarColor(post.author);
            return `
                <div class="commons-post" data-post-id="${post.id}">
                    <div class="post-header">
                        <div class="post-avatar" style="background:${bg}">${post.initials}</div>
                        <div class="post-meta">
                            <span class="post-author">${post.author}</span>
                            <span class="post-level">Lv ${post.level} · ${post.levelTitle}</span>
                        </div>
                        <span class="post-tag" style="background:${post.tagColor}20;color:${post.tagColor};border:1px solid ${post.tagColor}40">${post.tag}</span>
                        <span class="post-time">${post.time}</span>
                    </div>
                    <p class="post-text">${post.text}</p>
                    <div class="post-engagement">
                        <button class="post-action-btn like-btn" data-post-id="${post.id}">
                            <span class="action-icon">❤️</span>
                            <span class="action-count">${post.likes}</span>
                        </button>
                        <button class="post-action-btn comment-btn" data-post-id="${post.id}">
                            <span class="action-icon">💬</span>
                            <span class="action-count">${post.comments}</span>
                        </button>
                        <button class="post-action-btn share-btn" data-post-id="${post.id}">
                            <span class="action-icon">🔗</span>
                            <span class="action-count">${post.shares}</span>
                        </button>
                    </div>
                    <div class="post-reply-area" style="display:none">
                        <textarea class="post-reply-input" placeholder="Write a reply…" rows="2"></textarea>
                        <button class="post-reply-submit">Reply</button>
                    </div>
                </div>
            `;
        }).join('');

        // Wire up interactions
        this.initCommonsInteractions();
    },

    initCommonsInteractions() {
        const feed = document.getElementById('commons-feed-list');
        if (!feed) return;

        // Like buttons
        $$('.like-btn', feed).forEach(btn => {
            btn.addEventListener('click', () => {
                const postId = btn.dataset.postId;
                const post = CommonsFeed.find(p => p.id === postId);
                if (!post) return;

                post.liked = !post.liked;
                post.likes += post.liked ? 1 : -1;
                btn.classList.toggle('reacted', post.liked);
                const count = $('.action-count', btn);
                if (count) count.textContent = post.likes;

                if (post.liked) {
                    btn.style.transform = 'scale(1.3)';
                    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
                }
            });
        });

        // Comment buttons → toggle reply area
        $$('.comment-btn', feed).forEach(btn => {
            btn.addEventListener('click', () => {
                const post = btn.closest('.commons-post');
                const replyArea = $('.post-reply-area', post);
                if (replyArea) {
                    const visible = replyArea.style.display !== 'none';
                    replyArea.style.display = visible ? 'none' : 'block';
                    if (!visible) {
                        const input = $('textarea', replyArea);
                        if (input) input.focus();
                    }
                }
            });
        });

        // Reply submit
        $$('.post-reply-submit', feed).forEach(btn => {
            btn.addEventListener('click', () => {
                const replyArea = btn.closest('.post-reply-area');
                const textarea = $('textarea', replyArea);
                if (textarea && textarea.value.trim().length > 0) {
                    awardXP(10, btn);
                    showToast('Reply posted! +10 XP', 'success');
                    textarea.value = '';
                    replyArea.style.display = 'none';

                    // Increment comment count
                    const post = btn.closest('.commons-post');
                    const commentBtn = $('.comment-btn', post);
                    if (commentBtn) {
                        const count = $('.action-count', commentBtn);
                        if (count) count.textContent = parseInt(count.textContent, 10) + 1;
                    }
                } else {
                    showToast('Write something first!', 'info');
                }
            });
        });

        // Share buttons
        $$('.share-btn', feed).forEach(btn => {
            btn.addEventListener('click', () => {
                const count = $('.action-count', btn);
                if (count) count.textContent = parseInt(count.textContent, 10) + 1;
                showToast('Link copied to clipboard!', 'info');
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
            });
        });
    },

    initCommonsFilters() {
        const filters = $$('.commons-filter-btn');
        filters.forEach(btn => {
            btn.addEventListener('click', () => {
                filters.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');

                const filter = (btn.dataset.filter || btn.textContent.trim()).toLowerCase();
                const posts = $$('.commons-post');

                posts.forEach(post => {
                    if (filter === 'all' || filter === 'all topics') {
                        post.style.display = '';
                        return;
                    }
                    const tag = $('.post-tag', post);
                    const tagText = tag ? tag.textContent.trim().toLowerCase() : '';
                    post.style.display = tagText === filter ? '' : 'none';
                });
            });
        });
    },

    initCommonsCreatePost() {
        const postBtn = $('.commons-post-btn');
        const input   = $('.commons-post-input');

        if (postBtn && input) {
            postBtn.addEventListener('click', () => {
                const text = input.value ? input.value.trim() : (input.textContent || '').trim();
                if (text.length > 0) {
                    awardXP(10, postBtn);
                    showToast('Post published! +10 XP 🎉', 'success');
                    input.value = '';
                    input.textContent = '';

                    // Prepend to feed
                    const feed = document.getElementById('commons-feed-list');
                    if (feed) {
                        const bg = getAvatarColor(AppState.user.name);
                        const newPost = document.createElement('div');
                        newPost.className = 'commons-post animate-fade-in-up';
                        newPost.innerHTML = `
                            <div class="post-header">
                                <div class="post-avatar" style="background:${bg}">${AppState.user.initials}</div>
                                <div class="post-meta">
                                    <span class="post-author">${AppState.user.name}</span>
                                    <span class="post-level">Lv ${AppState.user.level} · ${AppState.user.levelTitle}</span>
                                </div>
                                <span class="post-tag" style="background:var(--bg-tertiary);color:var(--text-primary);border:2px solid var(--border-navy)">Biology</span>
                                <span class="post-time">Just now</span>
                            </div>
                            <p class="post-text">${text}</p>
                            <div class="post-engagement">
                                <button class="post-action-btn like-btn"><span class="action-icon">❤️</span><span class="action-count">0</span></button>
                                <button class="post-action-btn comment-btn"><span class="action-icon">💬</span><span class="action-count">0</span></button>
                                <button class="post-action-btn share-btn"><span class="action-icon">🔗</span><span class="action-count">0</span></button>
                            </div>
                        `;
                        feed.prepend(newPost);
                        // Re-wire interactions for the new post
                        this.initCommonsInteractions();
                    }
                } else {
                    showToast('Write something first!', 'info');
                }
            });

            // Enter key (with shift for newline)
            if (input.tagName === 'INPUT') {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        postBtn.click();
                    }
                });
            }
        }
    },

    /* ═══════════════════════════════════════════════════════════
       8.  PROFILE
       ═══════════════════════════════════════════════════════════ */
    initProfile() {
        const restartBtn = $('.restart-onboarding-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                localStorage.removeItem('fastboard_onboarded');
                showToast('Resetting onboarding assessment... ⚡', 'info', 1500);
                setTimeout(() => {
                    location.reload();
                }, 1000);
            });
        }
    },

    animateProfile() {
        // XP Bar
        const xpBar = $('.profile-xp-fill');
        if (xpBar) {
            const pct = (AppState.user.xp / AppState.user.xpToNextLevel) * 100;
            xpBar.style.width = '0%';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    xpBar.style.transition = 'width 1s cubic-bezier(.22,1,.36,1)';
                    xpBar.style.width = pct + '%';
                });
            });
        }

        // Archetype bars
        const archBars = $$('.archetype-bar-fill');
        const archValues = [AppState.user.archetype.audio, AppState.user.archetype.visual, AppState.user.archetype.textual];
        archBars.forEach((bar, i) => {
            if (archValues[i] !== undefined) {
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.transition = 'width 0.8s cubic-bezier(.22,1,.36,1)';
                    bar.style.width = (archValues[i] * 100) + '%';
                }, 200 + i * 100);
            }
        });

        // Activity chart bars
        const actBars = $$('.activity-bar');
        const maxMin = Math.max(...AppState.user.weeklyActivity.map(a => a.minutes));
        actBars.forEach((bar, i) => {
            const data = AppState.user.weeklyActivity[i];
            if (data) {
                bar.style.height = '0%';
                setTimeout(() => {
                    bar.style.transition = 'height 0.6s cubic-bezier(.22,1,.36,1)';
                    bar.style.height = ((data.minutes / maxMin) * 100) + '%';
                }, 300 + i * 80);
            }
        });

        // Mastery progress bars
        const masteryBars = $$('.mastery-progress-fill');
        AppState.user.mastery.forEach((m, i) => {
            if (masteryBars[i]) {
                masteryBars[i].style.width = '0%';
                setTimeout(() => {
                    masteryBars[i].style.transition = 'width 0.8s cubic-bezier(.22,1,.36,1)';
                    masteryBars[i].style.width = m.progress + '%';
                }, 400 + i * 60);
            }
        });

        // Stat numbers
        $$('.profile-stat-value').forEach(el => {
            const raw = el.textContent.trim();
            const num = parseInt(raw.replace(/[^\d]/g, ''), 10);
            if (!isNaN(num) && num > 0) {
                const suffix = raw.replace(/[\d,]+/, '');
                animateCountUp(el, num, 1000, suffix);
            }
        });

        // Badge animations
        $$('.badge-item').forEach((badge, i) => {
            badge.style.opacity = '0';
            badge.style.transform = 'translateY(20px)';
            setTimeout(() => {
                badge.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                badge.style.opacity = '1';
                badge.style.transform = 'translateY(0)';
            }, 200 + i * 80);
        });
    },

    /* ═══════════════════════════════════════════════════════════
       9.  CREATOR DASHBOARD
       ═══════════════════════════════════════════════════════════ */
    initCreator() {
        this.initUploadZone();
        this.initPipelineAnimation(75);
        this.initCreatorLinkInput();
        this.initGeneratedUnitsClick();
    },

    initGeneratedUnitsClick() {
        const unitsList = $('.units-list');
        if (!unitsList) return;

        unitsList.addEventListener('click', (e) => {
            const unitItem = e.target.closest('.unit-item');
            if (unitItem) {
                // Check if it has a 'Ready' status.
                const statusBadge = unitItem.querySelector('.unit-status');
                if (statusBadge && statusBadge.classList.contains('status-ready')) {
                    const title = unitItem.querySelector('.unit-title');
                    if (title) {
                        const topicName = title.textContent.trim();
                        // Filter queue for this topic and re-render
                        this.renderQueue(topicName);
                        // Jump to Queue tab to start learning
                        const queueTab = document.querySelector('.nav-item[data-view="queue"]');
                        if (queueTab) queueTab.click();
                        
                        showToast(`Loading unit: ${topicName}...`, 'info');
                    }
                } else {
                    showToast('This unit is still processing.', 'warning');
                }
            }
        });
    },

    initUploadZone() {
        const zone     = $('.upload-zone');
        const browseBtn = $('.upload-browse-btn');
        if (!zone) return;

        // Drag events
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.triggerFileUpload(files[0]);
            } else {
                showToast('Drop a valid file to import!', 'info');
            }
        });

        // Browse button
        if (browseBtn) {
            browseBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx,.pptx,.txt,.md,.mp3,.mp4';
                input.multiple = false;
                input.addEventListener('change', () => {
                    if (input.files.length > 0) {
                        this.triggerFileUpload(input.files[0]);
                    }
                });
                input.click();
            });
        }

        // Click on zone (excluding inputs or specific buttons)
        zone.addEventListener('click', (e) => {
            if (
                e.target.closest('.creator-link-input') ||
                e.target.closest('.or-divider') ||
                e.target.closest('.upload-browse-btn')
            ) {
                return;
            }
            if (browseBtn) browseBtn.click();
        });
    },

    initPipelineAnimation(startProgress = 75) {
        if (this._pipelineInterval) clearInterval(this._pipelineInterval);

        const activeStep = $('.pipeline-step.active');
        if (!activeStep) return;

        let fillEl = $('.pipeline-progress-fill', activeStep);
        if (!fillEl) {
            // Append progress bar if missing
            const progressDiv = document.createElement('div');
            progressDiv.className = 'step-progress';
            progressDiv.innerHTML = '<div class="step-progress-fill pipeline-progress-fill" style="width: 0%"></div>';
            activeStep.appendChild(progressDiv);
            fillEl = $('.pipeline-progress-fill', activeStep);
        }

        // Update status text when a step becomes active
        const statusEl = $('.step-status', activeStep);
        const stepNum = $('.step-num', activeStep)?.textContent.trim();
        if (statusEl && statusEl.textContent === 'Pending') {
            if (stepNum === '4') statusEl.textContent = 'Running quality checks...';
        }

        let progress = startProgress;
        fillEl.style.width = progress + '%';

        this._pipelineInterval = setInterval(() => {
            progress += 1.5; // Responsive, sleek animation speed
            if (progress >= 100) {
                progress = 100;
                clearInterval(this._pipelineInterval);
                fillEl.style.width = '100%';

                // Mark current step as completed
                activeStep.classList.remove('active');
                activeStep.classList.add('completed');
                
                // Hide its progress bar container to keep UI clean
                const progContainer = $('.step-progress', activeStep);
                if (progContainer) progContainer.style.display = 'none';

                if (statusEl) {
                    if (stepNum === '1') statusEl.textContent = '✓ Complete';
                    if (stepNum === '2') statusEl.textContent = '✓ 14 units created';
                    if (stepNum === '3') statusEl.textContent = '✓ 14/14 processed';
                    if (stepNum === '4') statusEl.textContent = '✓ Approved';
                }

                // Check if there is a next step
                const next = activeStep.nextElementSibling;
                if (next && next.classList.contains('pipeline-step')) {
                    next.classList.remove('pending');
                    next.classList.add('active');
                    const nextStatus = $('.step-status', next);
                    if (nextStatus) nextStatus.textContent = 'Processing...';
                    
                    // Trigger animation for the next step starting at 0%
                    setTimeout(() => {
                        this.initPipelineAnimation(0);
                    }, 400);
                } else {
                    // All steps complete!
                    if (AppState.activeUploadName) {
                        showToast(`🎉 "Mastering ${AppState.activeUploadName}" successfully created! +50 XP`, 'success', 5000);
                        awardXP(50, $('.vault-upload'));

                        // Removed mock unit creation - handled by real API response now
                        AppState.activeUploadName = null;
                    } else {
                        showToast('🎉 All content processing completed successfully!', 'success', 4000);
                    }
                }
                return;
            }
            fillEl.style.width = progress + '%';
        }, 120);
    },

    async triggerFileUpload(fileOrName) {
        const isFile = typeof fileOrName === 'object';
        const fileName = isFile ? fileOrName.name : fileOrName;
        // Clean name (e.g. "cell_division.pdf" -> "Cell Division")
        const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        showToast(`"${cleanName}" received! Starting extraction…`, 'success');

        const stepsContainer = $('.pipeline-steps');
        if (!stepsContainer) return;

        // Reset steps
        stepsContainer.innerHTML = `
            <div class="pipeline-step active">
              <span class="step-num">1</span>
              <span class="step-name">Extraction</span>
              <span class="step-status">Extracting content...</span>
              <div class="step-progress"><div class="step-progress-fill pipeline-progress-fill" style="width: 0%"></div></div>
            </div>
            <div class="pipeline-step pending">
              <span class="step-num">2</span>
              <span class="step-name">Chunking</span>
              <span class="step-status">Pending</span>
            </div>
            <div class="pipeline-step pending">
              <span class="step-num">3</span>
              <span class="step-name">Enrichment</span>
              <span class="step-status">Pending</span>
            </div>
            <div class="pipeline-step pending">
              <span class="step-num">4</span>
              <span class="step-name">Quality Gate</span>
              <span class="step-status">Pending</span>
            </div>
        `;

        AppState.activeUploadName = cleanName;
        this.initPipelineAnimation(0);

        // Post to backend
        if (isFile) {
            try {
                const formData = new FormData();
                formData.append('document', fileOrName);
                const response = await fetch('http://localhost:3000/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.cards) {
                        console.log("RECEIVED CARDS FROM SERVER:", data.cards.length, data.cards);
                        // DO NOT wipe out QueueCards! We want to accumulate cards from all uploads.
                        // Force the AI-generated topic to match the cleanName so the filter works perfectly when clicked
                        data.cards.forEach(c => {
                            console.log("Setting topic for card:", c, "to:", cleanName);
                            c.topic = cleanName;
                        });
                        QueueCards.push(...data.cards);
                        console.log("QUEUECARDS POPULATED. Length:", QueueCards.length);
                        
                        // Render queue but filter specifically to the newly uploaded topic
                        this.renderQueue(cleanName);

                        // Dynamically add to the "Generated Learn Units" list
                        const unitsList = document.querySelector('.units-list');
                        if (unitsList) {
                            const newHtml = `
            <div class="unit-item animate-fade-in-up">
              <div class="unit-info">
                <span class="unit-title">${cleanName}</span>
                <div class="unit-meta">
                  <span class="unit-difficulty" aria-label="Medium difficulty">
                    <span class="diff-dot filled"></span>
                    <span class="diff-dot filled"></span>
                    <span class="diff-dot filled"></span>
                    <span class="diff-dot"></span>
                    <span class="diff-dot"></span>
                  </span>
                  <span class="unit-modalities">🎧📊📖</span>
                </div>
              </div>
              <span class="unit-status status-ready">Ready</span>
            </div>`;
                            unitsList.insertAdjacentHTML('afterbegin', newHtml);
                            
                            // Bind click to the newly added item
                            const newUnit = unitsList.firstElementChild;
                            newUnit.addEventListener('click', () => {
                                const title = newUnit.querySelector('.unit-title');
                                if (title) {
                                    this.renderQueue(title.textContent.trim());
                                    setTimeout(() => {
                                        const queueTab = document.querySelector('.nav-item[data-view="queue"]');
                                        if (queueTab) queueTab.click();
                                    }, 50);
                                }
                            });
                        }

                        showToast(`Successfully transformed ${cleanName} into ${data.cards.length} learning units!`, 'success', 4000);
                        
                        // Switch to the Queue tab so the user sees the new cards
                        setTimeout(() => {
                            const queueTab = document.querySelector('.nav-item[data-view="queue"]');
                            if (queueTab) queueTab.click();
                        }, 1500); // slight delay to let them read the toast
                    }
                } else {
                    showToast('Failed to process document on server.', 'error');
                }
            } catch (err) {
                console.error('Upload error:', err);
                showToast('Network error during upload.', 'error');
            }
        }
    },

    initCreatorLinkInput() {
        const input = $('.creator-link-input');
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const url = input.value.trim();
                if (url.length > 0) {
                    let label = url.replace(/https?:\/\/(www\.)?/, "").split("/")[0] || "URL Resource";
                    this.triggerFileUpload(label);
                    input.value = '';
                } else {
                    showToast('Enter a URL first!', 'info');
                }
            }
        });
    },

    /* ═══════════════════════════════════════════════════════════
       10.  ONBOARDING OVERLAY
       ═══════════════════════════════════════════════════════════ */
    initOnboarding() {
        const overlay = document.getElementById('onboarding-overlay');
        if (!overlay) return;

        // Always show onboarding on every visit
        localStorage.removeItem('fastboard_onboarded');

        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';

        const steps  = $$('.onboarding-step-pane', overlay);
        const step1  = document.getElementById('onboarding-step-1');
        const step2  = document.getElementById('onboarding-step-2');
        const step3  = document.getElementById('onboarding-step-3');

        const dots = $$('.onboarding-steps .onboarding-step', overlay);
        const updateDots = (stepNum) => {
            dots.forEach((dot, idx) => {
                dot.classList.remove('active', 'completed');
                if (idx + 1 === stepNum) {
                    dot.classList.add('active');
                } else if (idx + 1 < stepNum) {
                    dot.classList.add('completed');
                }
            });
        };

        let selectedModality = null;
        let selectedPreference = null;

        // Step 1 → Step 2
        const goBtn = $('.onboarding-go-btn', overlay);
        if (goBtn) {
            goBtn.addEventListener('click', () => {
                if (step1) {
                    step1.classList.add('hidden');
                    step1.style.display = 'none';
                }
                if (step2) {
                    step2.classList.remove('hidden');
                    step2.style.display = 'block';
                    void step2.offsetWidth;
                    step2.classList.add('animate-fade-in-up');
                    updateDots(2);
                }
            });
        }

        // Step 2 — Modality selection and previews
        $$('.modality-card', overlay).forEach(card => {
            card.addEventListener('click', () => {
                $$('.modality-card', overlay).forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedModality = card.dataset.modality;
            });

            // Preview buttons inside the card
            const previewBtn = card.querySelector('button');
            if (previewBtn) {
                previewBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent card selection from auto-clicking card
                    card.click(); // but select the card anyway for convenience!
                    const modality = card.dataset.modality;
                    this.showOnboardingPreview(modality);
                });
            }
        });

        // Step 2 → Step 3
        const nextBtn2 = $('.onboarding-next-2', overlay);
        if (nextBtn2) {
            nextBtn2.addEventListener('click', () => {
                if (!selectedModality) {
                    showToast('Pick a learning style first!', 'info');
                    return;
                }
                if (step2) {
                    step2.classList.add('hidden');
                    step2.style.display = 'none';
                }
                if (step3) {
                    step3.classList.remove('hidden');
                    step3.style.display = 'block';
                    void step3.offsetWidth;
                    step3.classList.add('animate-fade-in-up');
                    updateDots(3);
                }
            });
        }

        // Step 3 — Preference selection
        $$('.preference-card', overlay).forEach(card => {
            card.addEventListener('click', () => {
                $$('.preference-card', overlay).forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedPreference = card.dataset.preference || card.textContent.trim();
            });
        });

        // Complete Setup
        const completeBtn = $('.onboarding-complete-btn', overlay);
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                localStorage.setItem('fastboard_onboarded', 'true');
                overlay.style.transition = 'opacity 0.5s ease';
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    overlay.style.opacity = '1';
                }, 500);
                showToast('Welcome to FastBoard! Let\'s start learning 🚀', 'success', 4000);
            });
        }

        // Skip button (if present)
        const skipBtn = $('.onboarding-skip-btn', overlay);
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                localStorage.setItem('fastboard_onboarded', 'true');
                overlay.style.display = 'none';
            });
        }
    },

    showOnboardingPreview(modality) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'preview-modal-overlay';
        
        const closeIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        
        let headerTitle = '';
        let bodyContent = '';
        let stopAudioFn = null;
        
        if (modality === 'audio') {
            headerTitle = '🎧 Audio Lesson: Photosynthesis';
            bodyContent = `
                <p>Listen to a 60-second summary explaining the dual phases of photosynthesis.</p>
                <div class="preview-audio-visualizer">
                    <span class="preview-wave-bar playing"></span>
                    <span class="preview-wave-bar playing" style="animation-delay: 0.15s"></span>
                    <span class="preview-wave-bar playing" style="animation-delay: 0.3s"></span>
                    <span class="preview-wave-bar playing" style="animation-delay: 0.05s"></span>
                    <span class="preview-wave-bar playing" style="animation-delay: 0.25s"></span>
                    <span class="preview-wave-bar playing" style="animation-delay: 0.4s"></span>
                    <span class="preview-wave-bar playing" style="animation-delay: 0.1s"></span>
                    <span class="preview-wave-bar playing" style="animation-delay: 0.35s"></span>
                    <span class="preview-wave-bar playing" style="animation-delay: 0.2s"></span>
                </div>
                <div style="text-align:center; font-weight:600; color:var(--accent-cyan); font-size:15px; margin-bottom:8px;" class="preview-playback-status">Playing Preview...</div>
                <p style="font-size:12px; text-align:center; color:var(--text-muted);">Uses HTML5 Speech Synthesis. Please make sure your speakers are on.</p>
            `;
            
            // Speak text using Web Speech API
            const textToSpeak = "Photosynthesis occurs in two stages. First, light dependent reactions split water molecules using solar energy, releasing oxygen. Second, the light independent Calvin cycle uses carbon dioxide to synthesize glucose molecules.";
            
            if ('speechSynthesis' in window) {
                // Cancel any ongoing speech
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
                
                stopAudioFn = () => {
                    window.speechSynthesis.cancel();
                };
                
                utterance.onend = () => {
                    const status = $('.preview-playback-status', overlay);
                    if (status) status.textContent = 'Playback Finished';
                    $$('.preview-wave-bar', overlay).forEach(b => b.classList.remove('playing'));
                };
            }
        } else if (modality === 'visual') {
            headerTitle = '📊 Visual Diagram: Photosynthesis';
            bodyContent = `
                <p style="margin-bottom:12px;">Visualizing the inputs and outputs of the light reactions and Calvin cycle.</p>
                <svg viewBox="0 0 200 120" width="100%" height="180" style="background:var(--bg-secondary); border-radius:4px; padding:10px; margin-bottom:12px; border: 2px solid var(--border-navy)">
                  <!-- Sun -->
                  <circle cx="30" cy="30" r="10" fill="var(--accent-red)"/>
                  <!-- Rays -->
                  <path d="M30,12 L30,5 M30,48 L30,55 M12,30 L5,30 M48,30 L55,30" stroke="var(--accent-red)" stroke-width="2"/>
                  <path d="M30,30 L85,60" stroke="var(--accent-red)" stroke-dasharray="2 2" stroke-width="1.5"/>
                  <!-- Leaf -->
                  <path d="M90,75 C60,55 100,25 140,45 C170,65 130,95 90,75 Z" fill="var(--border-navy)"/>
                  <path d="M90,75 Q115,60 140,45" stroke="var(--border-navy)" stroke-width="2" fill="none"/>
                  <!-- Inputs -->
                  <text x="10" y="75" fill="var(--text-primary)" font-size="9" font-weight="bold">H2O 💧</text>
                  <path d="M25,80 Q55,90 85,75" stroke="var(--text-primary)" stroke-width="1.5" fill="none" stroke-dasharray="2 2"/>
                  <text x="10" y="100" fill="var(--text-muted)" font-size="9" font-weight="bold">CO2 💨</text>
                  <path d="M25,95 Q55,95 85,77" stroke="var(--text-muted)" stroke-width="1.5" fill="none" stroke-dasharray="2 2"/>
                  <!-- Outputs -->
                  <text x="140" y="25" fill="var(--accent-red)" font-size="9" font-weight="bold">Glucose 🍭</text>
                  <path d="M130,50 Q150,35 150,28" stroke="var(--accent-red)" stroke-width="1.5" fill="none" stroke-dasharray="2 2"/>
                  <text x="150" y="80" fill="var(--border-navy)" font-size="9" font-weight="bold">O2 🍃</text>
                  <path d="M135,65 Q155,70 155,75" stroke="var(--border-navy)" stroke-width="1.5" fill="none" stroke-dasharray="2 2"/>
                </svg>
                <p style="font-size:12px; color:var(--text-muted); text-align:center;">Water and carbon dioxide are converted into glucose and oxygen using light energy.</p>
            `;
        } else if (modality === 'text') {
            headerTitle = '📖 Text Summary: Photosynthesis';
            bodyContent = `
                <p style="margin-bottom:12px;">Read the high-level summary of the light reactions and Calvin cycle.</p>
                <div style="background:var(--bg-secondary); border-radius:4px; padding:16px; border: 2px solid var(--border-navy); max-height:220px; overflow-y:auto; font-family:var(--font-serif);">
                  <h4 style="color:var(--text-primary); margin-bottom:6px; font-size:15px; font-weight:700;">Stages of Photosynthesis</h4>
                  <p style="margin-bottom:12px; font-size:13px; line-height:1.5;">Photosynthesis is the key chemical process enabling plants to construct organic matter from carbon dioxide, water, and sunlight.</p>
                  
                  <h5 style="color:var(--text-primary); margin-bottom:4px; font-size:13px; font-weight:600;">1. Light-Dependent Reactions</h5>
                  <p style="margin-bottom:12px; font-size:12px; color:var(--text-secondary); line-height:1.4;">Chlorophyll complexes absorb light energy, splitting water molecules into oxygen gas, protons, and electrons, while producing ATP and NADPH.</p>
                  
                  <h5 style="color:var(--text-primary); margin-bottom:4px; font-size:13px; font-weight:600;">2. Light-Independent Reactions (Calvin Cycle)</h5>
                  <p style="font-size:12px; color:var(--text-secondary); line-height:1.4;">Occur in the stroma. The enzyme RuBisCO facilitates carbon fixation, using ATP and NADPH to convert carbon dioxide into G3P (precursor to glucose).</p>
                </div>
            `;
        }
        
        overlay.innerHTML = `
            <div class="preview-modal-card">
                <button class="preview-modal-close" aria-label="Close preview">${closeIcon}</button>
                <div class="preview-modal-header">
                    <h3>${headerTitle}</h3>
                </div>
                <div class="preview-modal-body">
                    ${bodyContent}
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Triggers animation transition reflow
        void overlay.offsetWidth;
        overlay.classList.add('open');
        
        const closeBtn = $('.preview-modal-close', overlay);
        const closeModal = () => {
            if (stopAudioFn) stopAudioFn();
            overlay.classList.remove('open');
            setTimeout(() => overlay.remove(), 300);
        };
        
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    },

    /* ═══════════════════════════════════════════════════════════
       11.  TOPBAR
       ═══════════════════════════════════════════════════════════ */
    initTopbar() {
        // Search bar focus effects
        const searchInput = $('.topbar-search input, .search-input');
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                searchInput.parentElement?.classList.add('focused');
            });
            searchInput.addEventListener('blur', () => {
                searchInput.parentElement?.classList.remove('focused');
            });
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const q = searchInput.value.trim();
                    if (q.length > 0) {
                        showToast(`Searching for "${q}"…`, 'info');
                        searchInput.value = '';
                    }
                }
            });
        }

        // Streak tooltip or display
        const streakEl = $('.streak-display, .topbar-streak');
        if (streakEl) {
            streakEl.title = `Current streak: ${AppState.user.streak} days | Longest: ${AppState.user.longestStreak} days`;
        }

        // User menu in topbar
        const userMenu = $('.topbar-user, .user-menu-trigger');
        const dropdown = $('.user-dropdown');
        if (userMenu && dropdown) {
            userMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });
            document.addEventListener('click', () => dropdown.classList.remove('open'));
        }
    },

    /* ═══════════════════════════════════════════════════════════
       12.  KEYBOARD NAVIGATION
       ═══════════════════════════════════════════════════════════ */
    initKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Escape — close panels / overlays
            if (e.key === 'Escape') {
                const panel = document.getElementById('notification-panel');
                if (panel) panel.classList.remove('open');

                const overlay = document.getElementById('onboarding-overlay');
                if (overlay && overlay.style.display !== 'none') {
                    overlay.style.display = 'none';
                }

                const dropdown = $('.user-dropdown');
                if (dropdown) dropdown.classList.remove('open');
            }

            // Ctrl+K or / → focus search
            if ((e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) ||
                (e.ctrlKey && e.key === 'k')) {
                e.preventDefault();
                const search = $('.topbar-search input, .search-input');
                if (search) search.focus();
            }
        });
    }
};

/* ═══════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});



/* ============================================================
   FRIENDS & CHAT LOGIC
   ============================================================ */
class FriendsManager {
    constructor() {
        this.currentChatUser = null;
        this.init();
    }

    init() {
        // Modal elements
        this.modal = document.getElementById('user-profile-modal');
        this.modalClose = document.getElementById('close-profile-modal');
        this.modalAvatar = document.getElementById('modal-user-avatar');
        this.modalName = document.getElementById('modal-user-name');
        this.modalLevel = document.getElementById('modal-user-level');
        this.addBtn = document.getElementById('modal-add-friend-btn');
        this.msgBtn = document.getElementById('modal-message-btn');

        // Chat elements
        this.friendsList = document.getElementById('friends-list');
        this.chatPane = document.getElementById('chat-pane');
        this.chatEmptyState = document.getElementById('chat-empty-state');
        this.chatHistory = document.getElementById('chat-history');
        this.chatInput = document.getElementById('chat-input');
        this.chatSendBtn = document.getElementById('chat-send-btn');
        
        this.chatHeaderAvatar = document.getElementById('chat-header-avatar');
        this.chatHeaderName = document.getElementById('chat-header-name');

        this.bindEvents();
    }

    bindEvents() {
        // Close modal
        this.modalClose.addEventListener('click', () => {
            this.modal.style.display = 'none';
        });

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.modal.style.display = 'none';
        });

        // Add friend
        this.addBtn.addEventListener('click', () => {
            if (!this.selectedUser) return;
            // Add to friends
            AppState.friends.push(this.selectedUser);
            AppState.messages[this.selectedUser.name] = [];
            
            showToast(this.selectedUser.name + ' added to friends!', 'success');
            
            this.addBtn.style.display = 'none';
            this.msgBtn.style.display = 'block';
            
            // If in friends view, re-render list
            if (AppState.currentView === 'friends') {
                App.renderFriendsView();
            }
        });

        // Message from modal
        this.msgBtn.addEventListener('click', () => {
            this.modal.style.display = 'none';
            
            // Switch to friends view
            const friendsNav = Array.from(document.querySelectorAll('.nav-item')).find(n => n.dataset.view === 'friends');
            if (friendsNav) friendsNav.click();
            
            this.openChat(this.selectedUser);
        });

        // Send message
        const handleSend = () => {
            const text = this.chatInput.value.trim();
            if (!text || !this.currentChatUser) return;
            
            // Save msg
            AppState.messages[this.currentChatUser.name].push({
                text: text,
                sender: 'me',
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            });
            
            this.chatInput.value = '';
            this.renderChatHistory();
            
            // Auto-reply
            setTimeout(() => {
                AppState.messages[this.currentChatUser.name].push({
                    text: 'That sounds amazing! Let me think about ' + text.split(' ')[0] + ' and get back to you!',
                    sender: 'them',
                    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                });
                if (this.currentChatUser) {
                    this.renderChatHistory();
                }
            }, 1500);
        };
        
        this.chatSendBtn.addEventListener('click', handleSend);
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });

        // Global click listener for avatars
        document.body.addEventListener('click', (e) => {
            // Check if click was on an avatar or chat-btn
            const avatar = e.target.closest('.avatar') || e.target.closest('.post-avatar') || e.target.closest('.member-avatar') || e.target.closest('.chat-btn');
            if (avatar && !avatar.closest('#chat-pane') && !avatar.closest('#friends-list') && !avatar.closest('#user-profile-modal')) {
                // Ignore if it's the current user's own avatar
                if (avatar.textContent === AppState.user.initials) return;
                
                // Get name from nearest context
                let name = 'Unknown User';
                let level = 'Lv.1 Spark';
                let initials = avatar.textContent || 'UU';
                
                if (avatar.classList.contains('chat-btn')) {
                   const authorInfo = avatar.closest('.post-header').querySelector('.post-author-name');
                   if (authorInfo) name = authorInfo.textContent;
                   const authorLevel = avatar.closest('.post-header').querySelector('.post-author-level');
                   if (authorLevel) level = authorLevel.textContent;
                   const actualAvatar = avatar.closest('.post-header').querySelector('.avatar');
                   if (actualAvatar) initials = actualAvatar.textContent;
                } else {
                    // Try to find name in siblings/parents
                    const container = avatar.closest('.user-info') || avatar.closest('.post-header') || avatar.closest('.active-member') || avatar.closest('.commons-post') || avatar.closest('.ladder-row');
                    if (container) {
                        const nameEl = container.querySelector('.user-name') || container.querySelector('.post-author-name');
                        if (nameEl) name = nameEl.textContent;
                        
                        const levelEl = container.querySelector('.user-level') || container.querySelector('.post-author-level');
                        if (levelEl) level = levelEl.textContent;
                        
                        if (container.classList.contains('active-member')) {
                            name = container.getAttribute('aria-label') || container.getAttribute('title') || name;
                            name = name.split(',')[0]; // Remove ", online"
                        }
                    } else if (avatar.classList.contains('member-avatar')) {
                        name = avatar.getAttribute('aria-label') || avatar.getAttribute('title') || name;
                        name = name.split(',')[0];
                    }
                }
                
                this.openProfileModal({ name, level, initials, bg: getAvatarColor(name) });
            }
        });
    }

    openProfileModal(user) {
        this.selectedUser = user;
        this.modalAvatar.textContent = user.initials;
        this.modalAvatar.style.background = user.bg;
        this.modalName.textContent = user.name;
        this.modalLevel.textContent = user.level;
        
        // Check if already friends
        const isFriend = AppState.friends.find(f => f.name === user.name);
        if (isFriend) {
            this.addBtn.style.display = 'none';
            this.msgBtn.style.display = 'block';
        } else {
            this.addBtn.style.display = 'block';
            this.msgBtn.style.display = 'none';
        }
        
        this.modal.style.display = 'flex';
    }

    openChat(user) {
        this.currentChatUser = user;
        this.chatEmptyState.style.display = 'none';
        this.chatPane.style.display = 'flex';
        
        this.chatHeaderAvatar.textContent = user.initials;
        this.chatHeaderAvatar.style.background = user.bg;
        this.chatHeaderName.textContent = user.name;
        
        // Re-render friends list to show active state
        App.renderFriendsView();
        
        this.renderChatHistory();
        setTimeout(() => this.chatInput.focus(), 100);
    }
    
    renderChatHistory() {
        if (!this.currentChatUser) return;
        const msgs = AppState.messages[this.currentChatUser.name] || [];
        
        this.chatHistory.innerHTML = msgs.map(m => `
            <div class="chat-message ${m.sender === 'me' ? 'sent' : 'received'}">
                ${m.text}
            </div>
        `).join('');
        
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }
}

// Add script to DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.friendsManager = new FriendsManager();
    
    // Extend the main app class to handle friends view rendering
    App.renderFriendsView = function() {
        const list = document.getElementById('friends-list');
        if (!list) return;
        
        if (AppState.friends.length === 0) {
            list.innerHTML = '<div style="padding: 20px; color: var(--text-muted); text-align: center;">No friends added yet. Click on user avatars in the Commons to add them!</div>';
            return;
        }
        
        list.innerHTML = AppState.friends.map(f => `
            <div class="friend-item ${window.friendsManager.currentChatUser && window.friendsManager.currentChatUser.name === f.name ? 'active' : ''}" data-name="${f.name}">
                <div class="avatar" style="background: ${f.bg}">${f.initials}</div>
                <div class="friend-item-info">
                    <span class="friend-item-name">${f.name}</span>
                    <span class="friend-item-level">${f.level}</span>
                </div>
            </div>
        `).join('');
        
        // Bind click events
        list.querySelectorAll('.friend-item').forEach(el => {
            el.addEventListener('click', () => {
                const friend = AppState.friends.find(f => f.name === el.dataset.name);
                if (friend) window.friendsManager.openChat(friend);
            });
        });
    };
});
