# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# 🚀 Tad-one (현장 견적 자동화 솔루션)

#프로젝트 소개
- **배경:** 옥외 광고업 종사자인 아버지의 아날로그 견적 업무를 디지털화하기 위해 기획.
- **목표:** 수기 작성 및 엑셀 입력의 번거로움을 해결하고 데이터 정합성을 확보.

#주요 기술 및 역할 (1인 개발)
- **Language/Framework:** JavaScript (ES6+), Node.js
- **Database:** MySQL (관계형 데이터 모델링 및 인덱싱 적용)
- **Deployment:** Vercel (CI/CD 파이프라인 구축)

#핵심 성과
- **업무 효율화:** 견적서 발행 시간 80% 단축 (50분 → 10분 내외).
- **데이터 무결성:** 자동 매핑 로직을 통해 입력 오류 및 누락률 90% 개선.
- 직접 디버깅 및 배포 완료.

- ## 🚀 TAD v1.0 정식 업데이트 (2026.03.31)

#[신규 기능 및 최적화]
- **Premium UI/UX:** Peq/Plugging 스타일의 고도화된 모바일 전용 UI 적용 (Header/Tab-bar Fixed)
- **Authority Design:** 견적서 출력물의 권위와 신뢰성을 높인 폰트 및 여백 최적화
- **Business Logic:** - 국세청 홈택스 일괄발행 엑셀(.csv) 생성 기능 탑재
  - 업체별 직인(인감) 및 로고 자동 날인 시스템 (mix-blend-mode) 고도화
  - 3회 무료 체험 및 세금계산서 발행 프로세스 연동
- **User Support:** 독립된 [요금제 안내], [이용가이드], [CS 챗봇] 페이지 구축 완료

#[성능 및 버그 수정 (Hotfix)]
- **UI Conflict Resolution:** 모바일 환경에서의 UI 요소 겹침(Overlapping) 현상 완전 해결
- **Data Integrity:** QuoteList 인쇄 필드 누락 방지 및 DB 데이터 매칭 무결성 확보
- **Responsive Patch:** 다양한 기기 해상도에서의 Flex/Grid 레이아웃 안정성 강화

- ## 🚀 TAD v1.1 업데이트 (2026.04.07)

#[주요 업데이트 내용]
- 신규 기능: 입금기한 설정 및 미수금 현황을 한눈에 볼 수 있는 '수금 관리' 대시보드 탭 신설
- 알림 자동화: 기한 초과 건에 대해 클릭 한 번으로 발송하는 카카오톡 재촉 알림 연동 기반 마련
- 글로벌화: 한국어, 영어, 베트남어 다국어(i18n) 통합 팩 적용 및 언어 가변성 확보
- 랜딩 개편: 신규 유저 유입을 높히는 5가지 핵심 기능 소개 및 직관적인 타사 가격 비교 섹션 추가
- 버그 픽스: 견적서 작성 시 첨부하는 현장 증빙 사진이 유실되거나 인쇄 시 잘리는 현상을 오프스크린 자동 압축 방식(Base64)으로 완전히 개선
