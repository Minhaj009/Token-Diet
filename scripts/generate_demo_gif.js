import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRAMES_DIR = resolve(process.cwd(), 'temp_frames');

if (existsSync(FRAMES_DIR)) {
  rmSync(FRAMES_DIR, { recursive: true, force: true });
}
mkdirSync(FRAMES_DIR, { recursive: true });

function getHtml(content) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #1a1b26;
    color: #c0caf5;
    font-family: 'Consolas', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 13px;
    line-height: 1.35;
    width: 880px;
    height: 520px;
    overflow: hidden;
    padding: 14px 18px;
  }
  .window-bar {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #24283b;
  }
  .dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
  .dot-red { background: #ff5f56; }
  .dot-yellow { background: #ffbd2e; }
  .dot-green { background: #27c93f; }
  .title { color: #565f89; font-size: 11px; margin-left: auto; margin-right: auto; letter-spacing: 0.5px; }

  .prompt { color: #7aa2f7; font-weight: bold; }
  .comment { color: #565f89; font-style: italic; }
  .cmd { color: #bb9af7; font-weight: bold; }
  .arg { color: #7dcfff; }
  .pipe { color: #f7768e; font-weight: bold; }
  .cursor { display: inline-block; width: 7px; height: 13px; background: #c0caf5; vertical-align: middle; animation: blink 1s infinite; }

  /* TokyoNight Colored Box */
  .box-border { color: #7dcfff; font-weight: bold; }
  .box-title { color: #e0af68; font-weight: bold; }
  .stat-label { color: #c0caf5; font-weight: bold; }
  .stat-val { color: #7dcfff; font-weight: bold; }
  .stat-highlight { color: #9ece6a; font-weight: bold; }
  .json-key { color: #7aa2f7; }
  .json-str { color: #9ece6a; }
  .json-num { color: #ff9e64; }
  .alias-tag { color: #bb9af7; font-weight: bold; }
  .columnar-tag { color: #f7768e; font-weight: bold; }
</style>
</head>
<body>
  <div class="window-bar">
    <span class="dot dot-red"></span>
    <span class="dot dot-yellow"></span>
    <span class="dot dot-green"></span>
    <span class="title">tokendiet — bash — 880x520</span>
  </div>
  <div class="terminal-content">
${content}
  </div>
</body>
</html>`;
}

const SECTION_1_JSON = `  <span class="json-key">"transaction_identifier"</span>: <span class="json-str">"tx_98412_prod"</span>,
  <span class="json-key">"customer_account_token"</span>: <span class="json-str">"acc_enterprise_alpha_9921"</span>,
  <span class="json-key">"settlement_currency"</span>: <span class="json-str">"USD_DOLLAR"</span>,
  <span class="json-key">"authorization_status"</span>: <span class="json-str">"verified_and_settled"</span>,
  <span class="json-key">"merchant_category_code"</span>: <span class="json-str">"e_commerce_digital_goods"</span>,
  <span class="json-key">"risk_evaluation_score"</span>: <span class="json-num">0.02</span>
  <span style="color:#565f89;">... [5 repetitive enterprise transaction records]</span>`;

const SECTION_2_BANNER = `<span class="box-border">┌──────────────────────────────────────────────────────────┐</span>
<span class="box-border">│</span>  <span class="box-title">🥗 TokenDiet • Lossless Prompt Compressor</span>             <span class="box-border">│</span>
<span class="box-border">├──────────────────────────────────────────────────────────┤</span>
<span class="box-border">│</span>  <span class="stat-label">Original Tokens:</span>   <span class="stat-val">434   </span> tokens                     <span class="box-border">│</span>
<span class="box-border">│</span>  <span class="stat-label">Compressed Tokens:</span> <span class="stat-val">178   </span> tokens                     <span class="box-border">│</span>
<span class="box-border">│</span>  <span class="stat-label">Token Reduction:</span>   <span class="stat-highlight">58.99% (PEAK SAVINGS)</span>           <span class="box-border">│</span>
<span class="box-border">│</span>  <span class="stat-label">Byte Reduction:</span>    <span class="stat-highlight">66.31%</span>                             <span class="box-border">│</span>
<span class="box-border">│</span>  <span class="stat-label">Engine Strategy:</span>   Columnar JSON + Symbol Aliasing    <span class="box-border">│</span>
<span class="box-border">│</span>  <span class="stat-label">Cost & Latency:</span>    <span class="stat-highlight">$0.00 (Offline &lt; 2ms)</span>              <span class="box-border">│</span>
<span class="box-border">└──────────────────────────────────────────────────────────┘</span>

<span style="color:#565f89;">── Compact LLM Payload ────────────────────────────────────</span>
<span class="alias-tag">Aliases:</span> $a=e_commerce_digital_goods,$b=verified_and_settled,$c=acc_enterprise_alpha_9921,$d=USD_DOLLAR,$e=acc_enterprise_beta_4412
<span class="columnar-tag">@td:columnar</span>[keys:transaction_identifier,customer_account_token,settlement_currency...|"tx_98412_prod","$c","$d","$b","$a",0.02|...]`;

const SECTION_3_LLM = `<span style="color:#7dcfff; font-weight:bold;">🤖 LLM Stream Response (GPT-4o via Pipe):</span>
<span style="color:#565f89;">──────────────────────────────────────────────────────────</span>
• 4 settled transactions for merchants in <span style="color:#9ece6a;">USD_DOLLAR</span>
• 1 transaction flagged for manual review (<span style="color:#f7768e;">Risk: 0.48</span>)
• Context ingested losslessly with <span style="color:#9ece6a; font-weight:bold;">58.99% token savings</span>
<span style="color:#565f89;">──────────────────────────────────────────────────────────</span>`;

// Script steps mimicking demo.tape
const steps = [
  // Initial prompt
  { duration: 0.8, html: `<p><span class="prompt">user@dev:~/tokendiet$</span> <span class="cursor"></span></p>` },
  
  // Section 1: Inspecting payload
  { duration: 0.6, html: `<p><span class="comment"># 1. Inspecting uncompressed LLM context payload...</span></p><p><span class="prompt">user@dev:~/tokendiet$</span> <span class="cmd">head</span> <span class="arg">-n 14 demo_payload.json</span><span class="cursor"></span></p>` },
  { duration: 2.6, html: `<p><span class="comment"># 1. Inspecting uncompressed LLM context payload...</span></p><p><span class="prompt">user@dev:~/tokendiet$</span> <span class="cmd">head</span> <span class="arg">-n 14 demo_payload.json</span></p><pre style="margin-top:4px;">${SECTION_1_JSON}</pre><p style="margin-top:6px;"><span class="prompt">user@dev:~/tokendiet$</span> <span class="cursor"></span></p>` },

  // Section 2: Compressing with TokenDiet
  { duration: 0.6, html: `<p><span class="comment"># 2. Losslessly compress payload with TokenDiet...</span></p><p><span class="prompt">user@dev:~/tokendiet$</span> <span class="cmd">tokendiet</span> <span class="arg">compress demo_payload.json</span><span class="cursor"></span></p>` },
  { duration: 4.8, html: `<p><span class="comment"># 2. Losslessly compress payload with TokenDiet...</span></p><p><span class="prompt">user@dev:~/tokendiet$</span> <span class="cmd">tokendiet</span> <span class="arg">compress demo_payload.json</span></p><pre style="margin-top:2px;">${SECTION_2_BANNER}</pre><p style="margin-top:4px;"><span class="prompt">user@dev:~/tokendiet$</span> <span class="cursor"></span></p>` },

  // Section 3: Unix piping into LLM
  { duration: 0.6, html: `<p><span class="comment"># 3. Stream directly into your LLM CLI pipe...</span></p><p><span class="prompt">user@dev:~/tokendiet$</span> <span class="cmd">cat</span> <span class="arg">demo_payload.json</span> <span class="pipe">|</span> <span class="cmd">tokendiet</span> <span class="arg">compress</span> <span class="pipe">|</span> <span class="cmd">llm</span> <span class="arg">'Summarize transactions'</span><span class="cursor"></span></p>` },
  { duration: 3.5, html: `<p><span class="comment"># 3. Stream directly into your LLM CLI pipe...</span></p><p><span class="prompt">user@dev:~/tokendiet$</span> <span class="cmd">cat</span> <span class="arg">demo_payload.json</span> <span class="pipe">|</span> <span class="cmd">tokendiet</span> <span class="arg">compress</span> <span class="pipe">|</span> <span class="cmd">llm</span> <span class="arg">'Summarize transactions'</span></p><pre style="margin-top:6px;">${SECTION_3_LLM}</pre><p style="margin-top:8px;"><span class="prompt">user@dev:~/tokendiet$</span> <span class="cursor"></span></p>` }
];

console.log('1. Rendering terminal frames via Chrome Headless...');
const frameFiles = [];
steps.forEach((step, idx) => {
  const frameHtmlPath = resolve(FRAMES_DIR, `frame_${idx}.html`);
  const framePngPath = resolve(FRAMES_DIR, `frame_${idx}.png`);
  writeFileSync(frameHtmlPath, getHtml(step.html), 'utf-8');

  // Capture screenshot with Chrome headless
  execSync(`"${CHROME_PATH}" --headless=new --disable-gpu --screenshot="${framePngPath}" --window-size=880,520 "file:///${frameHtmlPath.replace(/\\\\/g, '/')}"`);
  frameFiles.push({ path: framePngPath, duration: step.duration });
});

console.log('2. Assembling video and encoding high-fidelity demo.gif via FFmpeg...');
// Write concat demuxer file for FFmpeg with millisecond precision durations
let concatContent = '';
frameFiles.forEach((f) => {
  concatContent += `file '${f.path.replace(/\\\\/g, '/')}'\n`;
  concatContent += `duration ${f.duration}\n`;
});
// Repeat last frame for hold
concatContent += `file '${frameFiles[frameFiles.length - 1].path.replace(/\\\\/g, '/')}'\n`;

const concatFile = resolve(FRAMES_DIR, 'concat.txt');
writeFileSync(concatFile, concatContent, 'utf-8');

const outputGif = resolve(process.cwd(), 'demo.gif');
// Two-pass palettegen + paletteuse for maximum quality & small file size
const ffmpegCmd = `ffmpeg -y -f concat -safe 0 -i "${concatFile.replace(/\\\\/g, '/')}" -vf "fps=10,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3" "${outputGif.replace(/\\\\/g, '/')}"`;

execSync(ffmpegCmd, { stdio: 'inherit' });

console.log('Cleaning up temporary frame assets...');
rmSync(FRAMES_DIR, { recursive: true, force: true });

console.log('Done! demo.gif successfully created.');
