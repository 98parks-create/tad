export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: '메시지를 입력해주세요.' });
  }

  const messages = [
    ...history.slice(-10).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: `당신은 TAD B2B 견적관리 서비스의 고객 지원 AI입니다.

서비스 정보:
- 서비스명: TAD B2B 견적관리 (tadsmart.co.kr)
- 대상: 간판/광고물, 인테리어, 설비, 청소/이사 업체
- 요금제: 무료(누적 3건), PRO(월 9,900원 - 무제한 + 직인 삽입 + 맞춤 단가표)
- 로그인: 이메일 / 카카오 / 네이버

자주 묻는 질문:
Q: 무료 몇 건인가요? A: 누적 3건까지 작성 가능합니다.
Q: PRO 결제 방법? A: 앱 내 PRO 업그레이드 → 입금자명 입력 → 계좌이체 → 관리자 승인.
Q: PDF 저장? A: 견적서 목록에서 PDF 다운로드 버튼 클릭.
Q: 직인(도장) 삽입? A: 설정 > 회사 직인 업로드 후 자동 삽입됩니다.
Q: 미수금 관리? A: 대시보드에서 결제기한 초과 건을 추적할 수 있습니다.

친절하고 간결하게 한국어로 답변하세요. 모르는 내용은 tadsmart.co.kr 고객센터를 안내하세요.`,
        messages
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Anthropic API ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    return res.status(200).json({ reply: data.content[0].text });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ error: error.message || '응답 생성에 실패했습니다.' });
  }
}
