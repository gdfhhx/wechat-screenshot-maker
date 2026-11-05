// 头像配色池
const AVATAR_COLORS = [
  '#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac',
  '#4299e1', '#667eea', '#9f7aea', '#ed64a6', '#a0aec0',
];

let chatType = 'private'; // private | group
let messages = []; // { side: 'other'|'self', nick, text, avatarColor }

function defaultNick(side) {
  return side === 'self' ? '我' : '对方';
}

function randColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// 取昵称首字作头像文字
function avatarChar(nick) {
  return (nick || '?').trim().charAt(0) || '?';
}

function initDefaults() {
  messages = [
    { side: 'other', nick: '小明', text: '在吗？', avatarColor: '#4299e1' },
    { side: 'self', nick: '我', text: '在的，怎么了？', avatarColor: '#667eea' },
    { side: 'other', nick: '小明', text: '周末有空一起吃饭吗？', avatarColor: '#4299e1' },
    { side: 'self', nick: '我', text: '好呀，没问题！', avatarColor: '#667eea' },
  ];
}

// ============ 渲染消息编辑器列表 ============
function renderEditorList() {
  const list = document.getElementById('message-list');
  list.innerHTML = '';
  messages.forEach((m, idx) => {
    const item = document.createElement('div');
    item.className = 'msg-item';

    // 第一行：方向切换 + 昵称 + 头像色
    const row1 = document.createElement('div');
    row1.className = 'msg-row';
    const sideBadge = document.createElement('span');
    sideBadge.className = 'side-badge ' + (m.side === 'self' ? 'self' : 'other');
    sideBadge.textContent = m.side === 'self' ? '自己' : '对方';
    sideBadge.title = '点击切换发送方';
    sideBadge.addEventListener('click', () => {
      messages[idx].side = messages[idx].side === 'self' ? 'other' : 'self';
      renderAll();
    });
    row1.appendChild(sideBadge);

    const nickInput = document.createElement('input');
    nickInput.type = 'text';
    nickInput.value = m.nick;
    nickInput.placeholder = '昵称';
    nickInput.addEventListener('input', () => {
      messages[idx].nick = nickInput.value;
      renderPreview();
    });
    row1.appendChild(nickInput);

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'avatar-color';
    colorInput.value = m.avatarColor;
    colorInput.title = '头像颜色';
    colorInput.addEventListener('input', () => {
      messages[idx].avatarColor = colorInput.value;
      renderPreview();
    });
    row1.appendChild(colorInput);

    item.appendChild(row1);

    // 第二行：文本
    const textarea = document.createElement('textarea');
    textarea.value = m.text;
    textarea.placeholder = '消息内容';
    textarea.addEventListener('input', () => {
      messages[idx].text = textarea.value;
      renderPreview();
    });
    item.appendChild(textarea);

    // 第三行：操作
    const footer = document.createElement('div');
    footer.className = 'msg-footer';
    const spacer = document.createElement('div');
    spacer.className = 'grow';
    footer.appendChild(spacer);
    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.textContent = '删除';
    delBtn.addEventListener('click', () => {
      messages.splice(idx, 1);
      renderAll();
    });
    footer.appendChild(delBtn);
    item.appendChild(footer);

    list.appendChild(item);
  });
}

// ============ 渲染手机预览 ============
function renderPreview() {
  // 标题
  const title = document.getElementById('chat-title').value.trim() || '微信昵称';
  document.getElementById('tb-title').textContent = title;

  // 状态栏
  const signal = document.getElementById('signal').value.trim() || '4G';
  const time = document.getElementById('time').value.trim() || '18:30';
  const battery = parseInt(document.getElementById('battery').value, 10);
  const batteryVal = isNaN(battery) ? 86 : Math.max(0, Math.min(100, battery));
  document.getElementById('sb-signal').textContent = signal;
  document.getElementById('sb-time').textContent = time;
  document.getElementById('sb-battery').textContent = batteryVal + '%';
  const fill = document.querySelector('.battery-icon .fill');
  if (!fill) {
    const f = document.createElement('span');
    f.className = 'fill';
    document.getElementById('battery-icon').appendChild(f);
  }
  document.querySelector('.battery-icon .fill').style.width = Math.max(0, batteryVal - 2) + '%';

  // 群聊成员数
  const memberRow = document.getElementById('tb-member-row');
  const memberHint = document.getElementById('group-member-hint');
  const chatArea = document.getElementById('chat-area');
  if (chatType === 'group') {
    memberRow.style.display = 'block';
    memberHint.style.display = 'flex';
    const cnt = document.getElementById('member-count').value || '3';
    document.getElementById('tb-member-count').textContent = cnt;
    chatArea.classList.add('chat-group');
  } else {
    memberRow.style.display = 'none';
    memberHint.style.display = 'none';
    chatArea.classList.remove('chat-group');
  }

  // 气泡
  chatArea.innerHTML = '';
  messages.forEach((m) => {
    const msg = document.createElement('div');
    msg.className = 'msg ' + (m.side === 'self' ? 'self' : 'other');

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.style.background = m.avatarColor || randColor();
    avatar.textContent = avatarChar(m.nick);
    msg.appendChild(avatar);

    const body = document.createElement('div');
    body.className = 'msg-body';
    const nick = document.createElement('div');
    nick.className = 'msg-nick';
    nick.textContent = m.nick || defaultNick(m.side);
    body.appendChild(nick);
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = m.text || '';
    body.appendChild(bubble);
    msg.appendChild(body);

    chatArea.appendChild(msg);
  });
}

function renderAll() {
  renderEditorList();
  renderPreview();
}

// ============ 截图导出 ============
// 导出：用 html-to-image 把手机预览节点渲染成图片（全局 htmlToImage 由 script 标签注入）
async function exportPNG() {
  const phone = document.getElementById('phone');
  const dataUrl = await htmlToImage.toPng(phone, {
    pixelRatio: 2,
    backgroundColor: '#ededed',
    cacheBust: true,
  });

  if (window.api) {
    const res = await window.api.saveImage({
      dataUrl,
      defaultName: '微信聊天截图.png',
    });
    if (res && res.ok) {
      alert('已保存到：' + res.filePath);
    }
  } else {
    // 浏览器环境回退：直接下载
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = '微信聊天截图.png';
    a.click();
  }
}

async function copyToClipboard() {
  const phone = document.getElementById('phone');
  const dataUrl = await htmlToImage.toPng(phone, { pixelRatio: 2, backgroundColor: '#ededed' });
  if (window.api) {
    const res = await window.api.copyImage(dataUrl);
    if (res && res.ok) {
      alert('已复制到剪贴板');
    } else if (res) {
      alert('复制失败：' + res.error);
    }
  }
}

// ============ 事件绑定 ============
function bindEvents() {
  // 会话类型切换
  document.querySelectorAll('.seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      chatType = btn.dataset.chatType;
      renderPreview();
    });
  });

  // 标题/状态栏输入
  ['chat-title', 'signal', 'time', 'battery', 'member-count'].forEach((id) => {
    document.getElementById(id).addEventListener('input', renderPreview);
  });

  // 添加消息
  document.getElementById('add-message').addEventListener('click', () => {
    messages.push({ side: 'other', nick: defaultNick('other'), text: '', avatarColor: randColor() });
    renderAll();
    // 聚焦到最后一条的文本框
    const items = document.querySelectorAll('.msg-item textarea');
    if (items.length) items[items.length - 1].focus();
  });

  // 导出
  document.getElementById('export').addEventListener('click', exportPNG);
  document.getElementById('copy').addEventListener('click', copyToClipboard);
}

// ============ 启动 ============
initDefaults();
renderAll();
bindEvents();
