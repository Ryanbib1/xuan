// 玄 · 正缘深度解读 —— 服务端无密钥泄露版（Vercel Serverless / Node）
// 前端把「命盘文本 + 选定视角」发来，密钥只存在服务端环境变量里。
// 付费版上线时：在本函数开头校验订单/会话，未付费直接 401。

const DEEP_SYS = '你是一位精通八字与紫微斗数的姻缘命理研究者，以温柔、负责任、建设性的方式，为以爱好者身份咨询的人解读正缘。务必遵守：①这是文化体验与自我觉察的参考，不是预言、更不是决定依据，语气要让人安心、有力量，绝不制造焦虑或恐惧；②绝不下伤人的绝对断言（如「你某年才会有正缘」「你命里没有姻缘」），把命理化为温柔的提醒与可执行的小建议；③用大白话，少术语，像很懂行又很暖的朋友；④紧扣对方提供的命盘数据来分析，同时坦诚命理有其局限。分点清晰、篇幅适中，结尾给一句温暖的话。';

// 5 种视角的提问模板，须与前端 PERSP 保持一致（前端只传 key，避免被改写）。
const PERSP = {
  '大白话': '请用大白话分析我的正缘：正缘的特质、我们相遇的条件、年龄/地域/性格的匹配、相处模式、契合点与需要磨合的点。',
  '交叉验证': '先根据我的命盘，描述我在感情里的性格、相处模式、择偶偏好；再推测2-3件我过往情感里大概率发生过的事（供我核对）；最后再分析我的正缘。',
  '深度拆解': '深度拆解：1)我的正缘大概会在哪个大运/流年出现？2026离火年有契机吗？2)命盘里影响我正缘的关键问题，给3个具体可执行的调整建议。3)正缘的五行与我是否相合，相处要避哪些命理上的坑？4)我的正缘格局更偏向细水长流/势均力敌/彼此滋养哪一种？',
  '2026离火年': '结合2026丙午离火年：1)离火年对我正缘的核心影响？怎么借火运催旺正缘、筛掉烂桃花？2)哪些场景/方位容易遇正缘，要避雷哪些烂桃花场景？3)穿搭/家居/社交上，3个贴合火运、催旺正缘的小细节。4)怎么借文化/创意/科技类社交，提高遇见正缘的概率？',
  '趣味版': '用好玩好执行的方式：1)我的正缘外形/性格/职业像哪个影视角色？用3句话描述。2)大概率在什么场景相遇？我怎么主动创造机会？3)遇到正缘后，哪种相处方式能快速推进关系？4)给我5个易执行的日常小习惯，长期滋养正缘运势。'
};

module.exports = async function handler(req, res) {
  // CORS：上线时把 * 改成你的正式域名
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: '服务端未配置 ANTHROPIC_API_KEY' });

  // 解析 body（兼容已解析对象与原始字符串）
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; }
  } else if (!body) {
    body = await new Promise(r => { let s = ''; req.on('data', c => s += c); req.on('end', () => { try { r(JSON.parse(s)); } catch { r({}); } }); });
  }

  const chart = (body.chart || '').toString().slice(0, 4000);
  const perspP = PERSP[body.persp];
  if (!chart) return res.status(400).json({ error: '缺少命盘数据' });
  if (!perspP) return res.status(400).json({ error: '未知的解读视角' });

  // TODO 付费版：在此校验 body.token / 订单已支付，否则 return res.status(402)

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-opus-4-8',
        max_tokens: 1600,
        system: DEEP_SYS,
        messages: [{ role: 'user', content: chart + '\n\n以下是我想问的：\n' + perspP }]
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: (data.error && data.error.message) || '上游错误' });
    const text = (data.content || []).map(b => b.text || '').join('').trim();
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message || '深算失败' });
  }
};
