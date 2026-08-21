let idx = 0;
let qidx = 0;
let timer = null;
let timeLeft = 45;
let mediaRecorder = null;
let chunks = [];

function esc(s) { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function escapeRegExp(string) { return String(string).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'); }
function highlight(text, collos) {
  let out = esc(text);
  const terms = collos.map(c => c[0]).sort((a,b)=>b.length-a.length);
  for (const term of terms) {
    const re = new RegExp(escapeRegExp(term), 'gi');
    out = out.replace(re, m => `<span class="hl" title="${esc(collos.find(c=>c[0].toLowerCase()===term.toLowerCase())?.[1]||'collocation')}">${m}</span>`);
  }
  return out;
}
function render() {
  const s = DATA[idx];
  const q = s.questions[qidx];
  document.getElementById('title').textContent = s.title;
  document.getElementById('themeVi').textContent = s.theme_vi;
  document.getElementById('themeBadge').textContent = `Topic ${idx+1} / ${DATA.length}`;
  document.getElementById('jump').value = idx+1;
  document.getElementById('total').textContent = DATA.length;
  document.getElementById('progress').style.width = `${((idx+1)/DATA.length)*100}%`;
  document.getElementById('pics').innerHTML = s.pics.map(p => { const media = p.img ? `<img src="${p.img}" alt="${esc(p.en)}" loading="lazy" decoding="async">` : `<div class="icon">${p.icon||''}</div>`; return `<div class="pic"><div class="pic-top"><span class="pic-label">${esc(p.label)}</span>${media}</div><div class="pic-body"><div class="en">${esc(p.en)}</div><div class="vi">${esc(p.vi)}</div></div></div>`; }).join('');
  for (let i=0;i<3;i++) document.getElementById('tab'+i).classList.toggle('active', i===qidx);
  document.getElementById('questionEn').textContent = q.en;
  document.getElementById('questionVi').textContent = q.vi;
  document.getElementById('answerEn').innerHTML = highlight(q.answer, s.collocations);
  document.getElementById('answerVi').textContent = q.translation;
  document.getElementById('collocations').innerHTML = s.collocations.map(c => `<div class="item"><div class="term">${esc(c[0])}</div><div class="meaning">${esc(c[1])}</div><div class="ex">${esc(c[2])}</div></div>`).join('');
  document.getElementById('vocab').innerHTML = s.vocab.map(v => `<div class="item"><div class="term">${esc(v[0])} <span class="ipa">${esc(v[1])}</span></div><div class="meaning">${esc(v[2])}</div><div class="ex">${esc(v[3])}</div></div>`).join('');
  document.getElementById('answerCard').classList.add('hidden');
  document.getElementById('toggleAnswerBtn').textContent = '👁️ Hiện đáp án';
  resetTimer(false);
}
function setQ(n) { qidx = n; render(); }
function nextSet() { idx = (idx + 1) % DATA.length; qidx = 0; render(); window.scrollTo({top:0, behavior:'smooth'}); }
function prevSet() { idx = (idx - 1 + DATA.length) % DATA.length; qidx = 0; render(); window.scrollTo({top:0, behavior:'smooth'}); }
function jumpTo(v) { const n = Math.max(1, Math.min(DATA.length, Number(v)||1)); idx = n-1; qidx = 0; render(); }
function toggleAnswer() { const card = document.getElementById('answerCard'); card.classList.toggle('hidden'); document.getElementById('toggleAnswerBtn').textContent = card.classList.contains('hidden') ? '👁️ Hiện đáp án' : '🙈 Ẩn đáp án'; }
function fmt(t) { return '00:' + String(t).padStart(2,'0'); }
function startTimer() { clearInterval(timer); timeLeft = 45; document.getElementById('clock').textContent = fmt(timeLeft); timer = setInterval(()=>{ timeLeft--; document.getElementById('clock').textContent = fmt(Math.max(timeLeft,0)); if(timeLeft<=0) { clearInterval(timer); showToast('Time is up / Hết giờ'); } },1000); }
function resetTimer(clear=true) { if(clear) clearInterval(timer); timeLeft = 45; document.getElementById('clock').textContent = '00:45'; }
function speak(text, lang='en-US') { if(!('speechSynthesis' in window)) return showToast('Browser does not support speech.'); window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = .9; window.speechSynthesis.speak(u); }
function speakAnswer() { speak(DATA[idx].questions[qidx].answer); }
function speakCurrentQuestion() { speak(DATA[idx].questions[qidx].en); }
function speakNotes(type) { const s=DATA[idx]; const text = type==='collocations' ? s.collocations.map(c=>c[0]).join('. ') : s.vocab.map(v=>v[0]).join('. '); speak(text); }
function copyCurrentAnswer() { navigator.clipboard?.writeText(DATA[idx].questions[qidx].answer + "\n\n" + DATA[idx].questions[qidx].translation); showToast('Copied sample answer'); }
async function toggleRecord() {
  const btn = document.getElementById('recBtn');
  if(mediaRecorder && mediaRecorder.state === 'recording') { mediaRecorder.stop(); btn.textContent='🎙️ Record'; btn.classList.add('danger'); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    chunks=[]; mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => { const blob = new Blob(chunks, {type:'audio/webm'}); const url = URL.createObjectURL(blob); document.getElementById('audioBox').innerHTML = '<b>Playback / Nghe lại:</b><audio controls src="'+url+'"></audio>'; stream.getTracks().forEach(t=>t.stop()); };
    mediaRecorder.start(); btn.textContent='⏹️ Stop'; btn.classList.remove('danger'); showToast('Recording...');
  } catch(e) { showToast('Cannot access microphone.'); }
}
function showToast(msg) { const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1800); }
render();
