const fs = require('fs');

// 1. Update CSS
let css = fs.readFileSync('css/components.css', 'utf8');

// Replace standard avatar background
css = css.replace(/\.post-header \.avatar \{[\s\S]*?\}/, .post-header .avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: #EAE6DF;
  border: 1px solid var(--border-navy);
  font-weight: 700;
  font-size: 14px;
  color: var(--text-primary);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
});

css = css.replace(/\.post-header \.avatar\.avatar-warm \{[\s\S]*?\}/, .post-header .avatar.avatar-warm {
  background: #FAD4D8;
  color: var(--accent-red);
  border-color: var(--accent-red);
});

css = css.replace(/\.post-header \.avatar\.avatar-cool \{[\s\S]*?\}/, .post-header .avatar.avatar-cool {
  background: #D4DFFA;
  color: var(--border-navy);
  border-color: var(--border-navy);
});

// Add chat button css
css += \n
.chat-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  margin-left: auto;
}
.chat-btn:hover {
  color: var(--accent-red);
  background: var(--accent-red-glow);
}
;
fs.writeFileSync('css/components.css', css);

// 2. Update HTML
let html = fs.readFileSync('index.html', 'utf8');
const chatSvg = <button class="chat-btn" aria-label="Message user" title="Message User"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></button>;

// Insert after <span class="post-time">...</span>
html = html.replace(/(<span class="post-time">.*?<\/span>)/g, $1\n              );
fs.writeFileSync('index.html', html);

console.log('Update complete.');
