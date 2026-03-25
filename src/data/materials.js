export const industries = [
  { id: 'sign', name: '간판/광고물' },
  { id: 'interior', name: '인테리어' },
  { id: 'facility', name: '설비' },
  { id: 'clean_move', name: '청소대행/이사' },
  { id: 'other', name: '기타 (직접입력)' }
];

export const materialCategories = [
  {
    id: "print",
    name: "실사출력",
    items: [
      { id: "p1", name: "유포지", unitPrice: 15000, unit: "sqm", type: "area" },
      { id: "p2", name: "켈지", unitPrice: 18000, unit: "sqm", type: "area" },
      { id: "p3", name: "페트지", unitPrice: 20000, unit: "sqm", type: "area" },
      { id: "p4", name: "백릿", unitPrice: 25000, unit: "sqm", type: "area" },
      { id: "p5", name: "텐트천", unitPrice: 22000, unit: "sqm", type: "area" },
      { id: "p6", name: "메쉬타공망", unitPrice: 20000, unit: "sqm", type: "area" }
    ]
  },
  {
    id: "banner",
    name: "현수막",
    items: [
      { id: "b1", name: "일반 현수막", unitPrice: 8000, unit: "sqm", type: "area" },
      { id: "b2", name: "솔벤트 현수막", unitPrice: 12000, unit: "sqm", type: "area" },
      { id: "b3", name: "양면 현수막", unitPrice: 15000, unit: "sqm", type: "area" },
      { id: "b4", name: "대형 현수막", unitPrice: 10000, unit: "sqm", type: "area" }
    ]
  },
  {
    id: "sign",
    name: "간판/채널",
    items: [
      { id: "s1", name: "알루미늄 캡채널", unitPrice: 80000, unit: "char", type: "quantity" },
      { id: "s2", name: "에폭시 채널", unitPrice: 120000, unit: "char", type: "quantity" },
      { id: "s3", name: "아크릴 면발광", unitPrice: 100000, unit: "char", type: "quantity" },
      { id: "s4", name: "갈바 프레임", unitPrice: 150000, unit: "sqm", type: "area" },
      { id: "s5", name: "플렉스 간판", unitPrice: 100000, unit: "sqm", type: "area" },
      { id: "s6", name: "플렉스 천갈이", unitPrice: 35000, unit: "sqm", type: "area" },
      { id: "s7", name: "포인트 간판", unitPrice: 150000, unit: "ea", type: "quantity" }
    ]
  },
  {
    id: "cutout",
    name: "스카시/커팅",
    items: [
      { id: "c1", name: "고무스카시", unitPrice: 15000, unit: "char", type: "quantity" },
      { id: "c2", name: "아크릴스카시", unitPrice: 20000, unit: "char", type: "quantity" },
      { id: "c3", name: "포맥스 스카시", unitPrice: 10000, unit: "char", type: "quantity" },
      { id: "c4", name: "시트커팅", unitPrice: 20000, unit: "sqm", type: "area" },
      { id: "c5", name: "엠보/안개시트", unitPrice: 15000, unit: "sqm", type: "area" }
    ]
  },
  {
    id: "equipment",
    name: "크레인/장비대",
    items: [
      { id: "e1", name: "크레인 1톤", unitPrice: 300000, unit: "ea", type: "quantity" },
      { id: "e3", name: "크레인 3.5톤", unitPrice: 400000, unit: "ea", type: "quantity" },
      { id: "e5", name: "스카이차 1톤", unitPrice: 250000, unit: "ea", type: "quantity" }
    ]
  },
  {
    id: "labor",
    name: "시공 인건비/기타",
    items: [
      { id: "l1", name: "전문 기공 (1인)", unitPrice: 250000, unit: "ea", type: "quantity" },
      { id: "l2", name: "시공 조공 (1인)", unitPrice: 150000, unit: "ea", type: "quantity" },
      { id: "l3", name: "야간 할증비", unitPrice: 100000, unit: "ea", type: "quantity" },
      { id: "l4", name: "폐기물 처리비", unitPrice: 50000, unit: "ea", type: "quantity" },
      { id: "l5", name: "인허가 대행", unitPrice: 100000, unit: "ea", type: "quantity" }
    ]
  }
];

export const materialCategoriesByIndustry = {
  sign: materialCategories,
  interior: [
    {
      id: "woodwork",
      name: "목공사",
      items: [
        { id: "w1", name: "가벽 설치", unitPrice: 150000, unit: "sqm", type: "area" },
        { id: "w2", name: "천장 덴조", unitPrice: 180000, unit: "sqm", type: "area" },
        { id: "w3", name: "몰딩/걸레받이", unitPrice: 20000, unit: "m", type: "quantity" },
        { id: "w4", name: "문/문틀 교체", unitPrice: 450000, unit: "ea", type: "quantity" },
        { id: "w5", name: "가구 제작(붙박이장)", unitPrice: 250000, unit: "m", type: "quantity" }
      ]
    },
    {
      id: "finish",
      name: "마감사 (도배/장판/도장)",
      items: [
        { id: "f1", name: "실크도배", unitPrice: 35000, unit: "sqm", type: "area" },
        { id: "f2", name: "합지도배", unitPrice: 20000, unit: "sqm", type: "area" },
        { id: "f3", name: "강마루", unitPrice: 120000, unit: "sqm", type: "area" },
        { id: "f4", name: "데코타일", unitPrice: 45000, unit: "sqm", type: "area" },
        { id: "f5", name: "내부 수성페인트", unitPrice: 30000, unit: "sqm", type: "area" },
        { id: "f6", name: "우레탄 방수", unitPrice: 45000, unit: "sqm", type: "area" }
      ]
    },
    {
      id: "elec",
      name: "전기/조명",
      items: [
        { id: "el1", name: "배선/증설", unitPrice: 80000, unit: "ea", type: "quantity" },
        { id: "el2", name: "다운라이트 3인치", unitPrice: 25000, unit: "ea", type: "quantity" },
        { id: "el3", name: "콘센트/스위치 교체", unitPrice: 15000, unit: "ea", type: "quantity" },
        { id: "el4", name: "분전함 교체", unitPrice: 350000, unit: "ea", type: "quantity" },
        { id: "el5", name: "전열선 설치", unitPrice: 65000, unit: "ea", type: "quantity" }
      ]
    },
    {
      id: "int_equipment",
      name: "장비대/가설/철거",
      items: [
        { id: "eq1", name: "실내 철거비", unitPrice: 150000, unit: "sqm", type: "area" },
        { id: "eq2", name: "사다리차 이용료", unitPrice: 150000, unit: "ea", type: "quantity" }
      ]
    },
    {
      id: "int_labor",
      name: "시공 인건비/기타",
      items: [
        { id: "il1", name: "전문 기초/목수 (1인)", unitPrice: 300000, unit: "ea", type: "quantity" },
        { id: "il2", name: "타일 전문기공 (1인)", unitPrice: 350000, unit: "ea", type: "quantity" },
        { id: "il3", name: "일반 조공 (1인)", unitPrice: 180000, unit: "ea", type: "quantity" },
        { id: "il4", name: "폐기물 1톤 처리", unitPrice: 250000, unit: "ea", type: "quantity" },
        { id: "il5", name: "현장 보양작업", unitPrice: 150000, unit: "ea", type: "quantity" }
      ]
    }
  ],
  facility: [
    {
      id: "plumb",
      name: "배관/위생설비",
      items: [
        { id: "pl1", name: "수도배관 신설(PB/엑셀)", unitPrice: 150000, unit: "m", type: "quantity" },
        { id: "pl2", name: "하수배관 신설(PVC)", unitPrice: 120000, unit: "m", type: "quantity" },
        { id: "pl3", name: "양변기 교체세팅", unitPrice: 250000, unit: "ea", type: "quantity" },
        { id: "pl4", name: "세면대 교체세팅", unitPrice: 200000, unit: "ea", type: "quantity" },
        { id: "pl5", name: "싱크/샤워 수전 교체", unitPrice: 80000, unit: "ea", type: "quantity" }
      ]
    },
    {
      id: "hvac",
      name: "공조/소방설비",
      items: [
        { id: "hv1", name: "에어컨 냉매배관 신설", unitPrice: 50000, unit: "m", type: "quantity" },
        { id: "hv2", name: "환기 디퓨저/닥트", unitPrice: 45000, unit: "ea", type: "quantity" },
        { id: "hv3", name: "스프링클러 헤드 증설/이설", unitPrice: 150000, unit: "ea", type: "quantity" },
        { id: "hv4", name: "화재 감지기 설치", unitPrice: 30000, unit: "ea", type: "quantity" },
        { id: "hv5", name: "가스배관 수정작업", unitPrice: 250000, unit: "ea", type: "quantity" }
      ]
    },
    {
      id: "fac_equipment",
      name: "유지보수/점검/장비",
      items: [
        { id: "fe1", name: "코어작업 (건식/습식)", unitPrice: 150000, unit: "hole", type: "quantity" },
        { id: "fe2", name: "누수 탐지/점검", unitPrice: 300000, unit: "ea", type: "quantity" },
        { id: "fe3", name: "배관 내시경/세척", unitPrice: 200000, unit: "ea", type: "quantity" }
      ]
    },
    {
      id: "fac_labor",
      name: "시공 인건비/기타",
      items: [
        { id: "fl1", name: "설비 전문기공", unitPrice: 350000, unit: "ea", type: "quantity" },
        { id: "fl2", name: "용접 전문기공", unitPrice: 400000, unit: "ea", type: "quantity" },
        { id: "fl3", name: "설비 보조조공", unitPrice: 200000, unit: "ea", type: "quantity" },
        { id: "fl4", name: "특수장비대여료", unitPrice: 150000, unit: "ea", type: "quantity" },
        { id: "fl5", name: "설비 폐기물 처리", unitPrice: 150000, unit: "ea", type: "quantity" }
      ]
    }
  ],
  clean_move: [
    {
      id: "moving",
      name: "이사 서비스",
      items: [
        { id: "m1", name: "포장이사 (기본결제)", unitPrice: 1000000, unit: "ea", type: "quantity" },
        { id: "m2", name: "반포장이사", unitPrice: 700000, unit: "ea", type: "quantity" },
        { id: "m3", name: "일반이사", unitPrice: 500000, unit: "ea", type: "quantity" },
        { id: "m4", name: "보관이사 (월)", unitPrice: 300000, unit: "ea", type: "quantity" },
        { id: "m5", name: "원룸/용달이사", unitPrice: 200000, unit: "ea", type: "quantity" }
      ]
    },
    {
      id: "special_ops",
      name: "특수작업/추가옵션",
      items: [
        { id: "sp1", name: "사다리차 1회 이용", unitPrice: 150000, unit: "ea", type: "quantity" },
        { id: "sp2", name: "에어컨 이전/설치비", unitPrice: 150000, unit: "ea", type: "quantity" },
        { id: "sp3", name: "벽걸이 TV 설치", unitPrice: 50000, unit: "ea", type: "quantity" },
        { id: "sp4", name: "피아노/돌침대 등 특수운송", unitPrice: 100000, unit: "ea", type: "quantity" }
      ]
    },
    {
      id: "cleaning",
      name: "청소대행",
      items: [
        { id: "cl1", name: "입주/이사청소 (평당)", unitPrice: 15000, unit: "py", type: "quantity" },
        { id: "cl2", name: "거주청소 (평당)", unitPrice: 18000, unit: "py", type: "quantity" },
        { id: "cl3", name: "상가/사무실 청소 (평당)", unitPrice: 12000, unit: "py", type: "quantity" },
        { id: "cl4", name: "쓰레기집/특수청소", unitPrice: 500000, unit: "ea", type: "quantity" },
        { id: "cl5", name: "새집증후군/피톤치드 시공", unitPrice: 100000, unit: "ea", type: "quantity" }
      ]
    },
    {
      id: "cm_labor",
      name: "인건비/기타",
      items: [
        { id: "cml1", name: "남성 전문인력 추가", unitPrice: 150000, unit: "ea", type: "quantity" },
        { id: "cml2", name: "여성 도우미 추가", unitPrice: 130000, unit: "ea", type: "quantity" },
        { id: "cml3", name: "계단/수작업 할증비", unitPrice: 50000, unit: "ea", type: "quantity" },
        { id: "cml4", name: "대형 폐기물 처리 대행", unitPrice: 30000, unit: "ea", type: "quantity" }
      ]
    }
  ],
  other: []
};
