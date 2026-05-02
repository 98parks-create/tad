export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { quotes, month } = req.body;

  if (!quotes || quotes.length === 0) {
    return res.status(400).json({ error: '분석할 견적 데이터가 없습니다.' });
  }

  const completed = quotes.filter(q => ['completed', 'approved', '승인완료'].includes(q.status));
  const stats = {
    total: quotes.length,
    completed: completed.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    totalRevenue: completed.reduce((sum, q) => sum + (q.grandTotal || 0), 0),
    avgTotal: Math.round(quotes.reduce((sum, q) => sum + (q.grandTotal || 0), 0) / quotes.length),
    topProjects: [...quotes]
      .sort((a, b) => (b.grandTotal || 0) - (a.grandTotal || 0))
      .slice(0, 3)
      .map(q => ({
        project: q.customerInfo?.project || '미기재',
        customer: q.customerInfo?.name || '미기재',
        total: q.grandTotal || 0,
        status: q.status
      }))
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `다음은 ${month || '이번 달'} 견적 데이터입니다. 비즈니스 인사이트를 한국어로 분석해주세요.

[데이터]
- 총 견적: ${stats.total}건
- 완료: ${stats.completed}건 / 미결: ${stats.pending}건
- 완료 매출 합계: ${stats.totalRevenue.toLocaleString()}원
- 견적 평균 금액: ${stats.avgTotal.toLocaleString()}원
- 상위 프로젝트: ${JSON.stringify(stats.topProjects)}

아래 형식으로 작성해주세요:
**이달의 성과 요약**
(2-3문장으로 전체 실적 평가)

**주목할 점**
• (인사이트 1)
• (인사이트 2)

**다음 달 추천 전략**
• (전략 1)
• (전략 2)

실용적이고 구체적으로 작성해주세요.`
        }]
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Anthropic API ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    return res.status(200).json({ report: data.content[0].text, stats });
  } catch (error) {
    console.error('AI report error:', error);
    return res.status(500).json({ error: error.message || '리포트 생성에 실패했습니다.' });
  }
}
