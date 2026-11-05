// ============ 状态 ============
let theme = 'dark';
let messages = []; // { kind: 'msg'|'time'|'system', side, text }
const avatars = { self: null, other: null }; // dataURL
const fallbackChars = { self: '我', other: '杨' };

const EMOJI_RE = /^(\p{Extended_Pictographic}|\p{Emoji_Component}|\uFE0F|\u200D)+$/u;

// ============ 默认数据（对照真实截图）============
function initDefaults() {
  messages = [
    { kind: 'time', text: '2024年6月18日 17:34' },
    { kind: 'msg', side: 'self', text: '阿普利亚 250 有的话帮我留意下，拿 gsx250 置换' },
    { kind: 'msg', side: 'other', text: '我 gsx 够多了🤝' },
    { kind: 'time', text: '2024年6月18日 19:41' },
    { kind: 'msg', side: 'other', text: '我新到个 sr450 年要吗' },
    { kind: 'msg', side: 'self', text: '要不起啊' },
    { kind: 'msg', side: 'other', text: '🤦' },
    { kind: 'msg', side: 'other', text: '预算多少' },
    { kind: 'msg', side: 'self', text: '想置换' },
    { kind: 'system', text: '"天津 A+机车销售服务中心 杨阳" 撤回了一条消息' },
    { kind: 'msg', side: 'other', text: '平换啊' },
  ];
}

// ============ 左侧编辑器 ============
function kindLabel(m) {
  if (m.kind === 'time') return '时间';
  if (m.kind === 'system') return '系统';
  return m.side === 'self' ? '自己' : '对方';
}

function renderEditorList() {
  const list = document.getElementById('message-list');
  list.innerHTML = '';
  messages.forEach((m, idx) => {
    const item = document.createElement('div');
    item.className = 'msg-item';

    const badge = document.createElement('span');
    badge.className = 'kind-badge ' + (m.kind === 'msg' ? (m.side === 'self' ? 'self' : 'other') : 'meta');
    badge.textContent = kindLabel(m);
    badge.title = m.kind === 'msg' ? '点击切换 发送方' : '时间/系统条目';
    badge.addEventListener('click', () => {
      if (messages[idx].kind === 'msg') {
        messages[idx].side = messages[idx].side === 'self' ? 'other' : 'self';
        renderAll();
      }
    });
    item.appendChild(badge);

    if (m.kind === 'msg') {
      const ta = document.createElement('textarea');
      ta.value = m.text;
      ta.placeholder = '消息内容（纯 emoji 自动无气泡）';
      ta.addEventListener('input', () => { messages[idx].text = ta.value; renderPreview(); });
      item.appendChild(ta);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = m.text;
      input.placeholder = m.kind === 'time' ? '如：2024年6月18日 17:34' : '如："某某" 撤回了一条消息';
      input.addEventListener('input', () => { messages[idx].text = input.value; renderPreview(); });
      item.appendChild(input);
    }

    const footer = document.createElement('div');
    footer.className = 'msg-footer';
    const up = document.createElement('button');
    up.className = 'mv-btn'; up.textContent = '↑';
    up.addEventListener('click', () => {
      if (idx === 0) return;
      [messages[idx - 1], messages[idx]] = [messages[idx], messages[idx - 1]];
      renderAll();
    });
    const down = document.createElement('button');
    down.className = 'mv-btn'; down.textContent = '↓';
    down.addEventListener('click', () => {
      if (idx === messages.length - 1) return;
      [messages[idx + 1], messages[idx]] = [messages[idx], messages[idx + 1]];
      renderAll();
    });
    const spacer = document.createElement('div'); spacer.className = 'grow';
    const del = document.createElement('button');
    del.className = 'del-btn'; del.textContent = '删除';
    del.addEventListener('click', () => { messages.splice(idx, 1); renderAll(); });
    footer.append(up, down, spacer, del);
    item.appendChild(footer);

    list.appendChild(item);
  });
}

// ============ 预览 ============
function renderPreview() {
  const phone = document.getElementById('phone');
  phone.classList.toggle('light', theme === 'light');
  phone.classList.toggle('dark', theme === 'dark');

  document.getElementById('tb-title').textContent = document.getElementById('chat-title').value.trim() || '';

  const badge = document.getElementById('back-badge').value.trim();
  const badgeEl = document.getElementById('tb-badge');
  badgeEl.textContent = badge;
  badgeEl.classList.toggle('empty', !badge);

  document.getElementById('sb-time').textContent = document.getElementById('time').value.trim() || '';
  document.getElementById('sb-signal').textContent = document.getElementById('signal-text').value.trim() || '';
  const b = Math.max(0, Math.min(100, parseInt(document.getElementById('battery').value, 10) || 0));
  document.getElementById('sb-battery').textContent = b;
  document.getElementById('battery-fill').style.width = (b * 0.9) + '%';

  document.getElementById('self-fallback').value && (fallbackChars.self = document.getElementById('self-fallback').value.trim());
  document.getElementById('other-fallback').value && (fallbackChars.other = document.getElementById('other-fallback').value.trim());

  renderAvatars();

  const chatArea = document.getElementById('chat-area');
  chatArea.innerHTML = '';

  messages.forEach((m) => {
    if (m.kind === 'time' || m.kind === 'system') {
      const meta = document.createElement('div');
      meta.className = 'center-meta';
      meta.textContent = m.text;
      chatArea.appendChild(meta);
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'msg ' + (m.side === 'self' ? 'self' : 'other');

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    const img = avatars[m.side];
    if (img) {
      const im = document.createElement('img');
      im.src = img;
      avatar.appendChild(im);
    } else {
      avatar.style.background = m.side === 'self' ? '#3a4a5c' : '#5a4a3a';
      avatar.textContent = fallbackChars[m.side] || '?';
    }
    wrap.appendChild(avatar);

    const body = document.createElement('div');
    body.className = 'msg-body';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = m.text || '';
    if (m.text && EMOJI_RE.test(m.text.trim())) bubble.classList.add('emoji-only');
    body.appendChild(bubble);
    wrap.appendChild(body);

    chatArea.appendChild(wrap);
  });
}

function renderAvatars() {
  const s = document.getElementById('avatar-self-img');
  const o = document.getElementById('avatar-other-img');
  if (avatars.self) s.src = avatars.self; else s.removeAttribute('src');
  if (avatars.other) o.src = avatars.other; else o.removeAttribute('src');
}

function renderAll() { renderEditorList(); renderPreview(); }

// ============ 头像上传 ============
function readAvatarFile(file, side) {
  const reader = new FileReader();
  reader.onload = () => {
    avatars[side] = reader.result;
    renderPreview();
  };
  reader.readAsDataURL(file);
}

// ============ 导出 ============
async function ensureLib() {
  if (typeof htmlToImage === 'undefined') {
    alert('截图组件未加载，请重启应用');
    return false;
  }
  return true;
}

async function exportPNG() {
  if (!(await ensureLib())) return;
  const phone = document.getElementById('phone');
  const dataUrl = await htmlToImage.toPng(phone, {
    pixelRatio: 3, // 375*3 = 1125px 宽，接近 S23U 分辨率
    cacheBust: true,
  });
  if (window.api) {
    const res = await window.api.saveImage({ dataUrl, defaultName: '微信聊天截图.png' });
    if (res && res.ok) alert('已保存到：' + res.filePath);
  } else {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = '微信聊天截图.png';
    a.click();
  }
}

async function copyToClipboard() {
  if (!(await ensureLib())) return;
  const phone = document.getElementById('phone');
  const dataUrl = await htmlToImage.toPng(phone, { pixelRatio: 3, cacheBust: true });
  if (window.api) {
    const res = await window.api.copyImage(dataUrl);
    if (res && res.ok) alert('已复制到剪贴板');
    else if (res) alert('复制失败：' + res.error);
  }
}

// ============ 事件绑定 ============
function bindEvents() {
  document.querySelectorAll('.seg-btn[data-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn[data-theme]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      theme = btn.dataset.theme;
      renderPreview();
    });
  });

  ['chat-title', 'back-badge', 'time', 'signal-text', 'battery', 'self-fallback', 'other-fallback'].forEach((id) => {
    document.getElementById(id).addEventListener('input', renderPreview);
  });

  const fileInput = document.getElementById('avatar-file');
  let pendingSide = null;
  document.querySelectorAll('[data-avatar]').forEach((btn) => {
    btn.addEventListener('click', () => {
      pendingSide = btn.dataset.avatar;
      fileInput.click();
    });
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0] && pendingSide) {
      readAvatarFile(fileInput.files[0], pendingSide);
    }
    fileInput.value = '';
  });

  document.getElementById('add-text').addEventListener('click', () => {
    messages.push({ kind: 'msg', side: 'other', text: '' });
    renderAll();
    const tas = document.querySelectorAll('.msg-item textarea');
    if (tas.length) tas[tas.length - 1].focus();
  });
  document.getElementById('add-time').addEventListener('click', () => {
    messages.push({ kind: 'time', text: '2024年6月18日 20:54' });
    renderAll();
  });
  document.getElementById('add-system').addEventListener('click', () => {
    messages.push({ kind: 'system', text: '"某某" 撤回了一条消息' });
    renderAll();
  });

  document.getElementById('export').addEventListener('click', exportPNG);
  document.getElementById('copy').addEventListener('click', copyToClipboard);
}

initDefaults();
renderAll();
bindEvents();
