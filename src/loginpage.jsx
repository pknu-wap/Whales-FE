// src/loginpage.jsx
// 간단 설명: 스케치처럼 보이게 스타일을 바꾸고, 이메일 로컬파트만 받도록 유지했습니다.
// - 상단 "Whales 로그인" 제목
// - 바다 느낌 배경(연한 그라데이션 + 대각선 물결무늬)
// - 굵은 테두리의 폼 박스
// - 이메일 입력(로컬파트만) + @pukyong.ac.kr 고정 표시
// - 비밀번호 입력
// - 파란 외곽선 "로그인" 버튼
// - 우하단 "회원가입 / 비밀번호 찾기" 링크

import React, { useEffect, useMemo, useState } from "react";

const DOMAIN = "pukyong.ac.kr";
// 이메일 로컬파트 규칙: 앞/뒤 점 금지, 연속 점 금지, 영문/숫자/._%+-
const LOCALPART_REGEX = /^(?![.])(?!.*[.]{2})[A-Za-z0-9._%+-]+(?<![.])$/;

export default function LoginPage() {
  // 입력값 상태
  const [localPart, setLocalPart] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 전체 이메일(화면에는 @ 오른쪽에 고정 표시)
  const fullEmail = useMemo(
    () => (localPart ? `${localPart}@${DOMAIN}` : ""),
    [localPart]
  );

  // 이메일 왼쪽 부분 입력 처리
  const handleLocalPartChange = (e) => {
    let v = e.target.value.trim();

    // 사용자가 @ 를 포함해 붙여넣는 경우를 대비 (첫 번째 @ 기준)
    const atIndex = v.indexOf("@");
    if (atIndex !== -1) {
      const beforeAt = v.slice(0, atIndex);
      const afterAt = v.slice(atIndex + 1).toLowerCase();
      if (!afterAt || afterAt === DOMAIN) {
        v = beforeAt; // 같은 도메인이면 왼쪽만 남김
        setError("");
      } else {
        setError(`학교 이메일만 사용 가능합니다: *@${DOMAIN}`);
        v = beforeAt || "";
      }
    } else {
      if (error && error.startsWith("학교 이메일만")) setError("");
    }

    // 로컬파트 규칙 검증
    if (v && !LOCALPART_REGEX.test(v)) {
      setError("영문/숫자 및 . _ % + - 사용 가능(앞/뒤 점, 연속 점 불가)");
    }
    setLocalPart(v);
  };

  // 비밀번호 입력 처리
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error && error.includes("비밀번호")) setError("");
  };

  // 제출 가능 여부
  const isValid = !!localPart && LOCALPART_REGEX.test(localPart) && !!password;

  // 값이 올바르면 에러 자동 해제
  useEffect(() => {
    if (isValid && error) setError("");
  }, [isValid, error]);

  // 로그인 시도(데모: alert)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) {
      setError("이메일과 비밀번호를 올바르게 입력해 주세요.");
      return;
    }
    setError("");
    alert(`로그인 시도\n이메일: ${fullEmail}`);
  };

  // 회원가입으로 이동(데모 라우팅)
  const handleSignup = () => {
    window.location.href = "/signup";
  };

  return (
    <div style={styles.page}>
      {/* 상단 타이틀 영역 */}
      <header style={styles.hero}>
        <div style={styles.brand}>Whales</div>
        <div style={styles.subtitle}>로그인</div>
      </header>

      {/* 폼 카드(스케치의 굵은 테두리 박스) */}
      <main style={styles.center}>
        <form onSubmit={handleSubmit} style={styles.card} noValidate>
          {/* 이메일 라벨 */}
          <label htmlFor="emailLocal" style={styles.label}>
            이메일
          </label>

          {/* 이메일 입력 + 고정 도메인 */}
          <div style={styles.emailRow}>
            <input
              id="emailLocal"
              type="text"
              inputMode="email"
              autoComplete="username"
              placeholder="학번 또는 아이디"
              value={localPart}
              onChange={handleLocalPartChange}
              style={styles.emailInput}
              required
              aria-describedby="emailHelp"
            />
            <div style={styles.emailSuffix}>@ {DOMAIN}</div>
          </div>

          {/* 비밀번호 라벨 + 입력 */}
          <label htmlFor="password" style={{ ...styles.label, marginTop: 14 }}>
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요."
            value={password}
            onChange={handlePasswordChange}
            style={styles.input}
            required
          />

          {/* 오류 메시지 */}
          {error && (
            <div role="alert" aria-live="assertive" style={styles.error}>
              {error}
            </div>
          )}

          {/* 로그인 버튼: 파란 외곽선 느낌 */}
          <button
            type="submit"
            disabled={!isValid}
            aria-disabled={!isValid}
            style={{
              ...styles.loginBtn,
              opacity: isValid ? 1 : 0.6,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            로그인
          </button>

          {/* 우하단 링크(회원가입 / 비밀번호 찾기) */}
          <div style={styles.footerLinks}>
            <button type="button" onClick={handleSignup} style={styles.linkBtn}>
              회원가입
            </button>
            <span aria-hidden="true" style={{ opacity: 0.4, margin: "0 6px" }}>
              /
            </span>
            <button
              type="button"
              onClick={() =>
                alert("비밀번호 재설정 링크를 이메일로 보내드릴게요.")
              }
              style={styles.linkBtn}
            >
              비밀번호 찾기
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// 스타일 모음 (인라인 스타일로 간단하게)
// - page: 바다 느낌 배경
// - card: 굵은 테두리 박스
// - emailRow: 왼쪽 입력 + 오른쪽 고정 도메인
const styles = {
  page: {
    minHeight: "100vh",
    // 바다 느낌 배경: 연한 하늘색 그라데이션 + 대각선 물결 스트로크
    backgroundImage: [
      "linear-gradient(180deg, #e9f5ff 0%, #f6fbff 100%)",
      // 왼쪽 위/오른쪽 아래에 은은한 파형 느낌
      "radial-gradient(100% 60% at -10% 20%, rgba(13,148,136,0.10), transparent 60%)",
      "radial-gradient(100% 60% at 110% 80%, rgba(14,165,233,0.10), transparent 60%)",
      // 대각선 반복 줄무늬(물결 스케치 대체)
      "repeating-linear-gradient(60deg, rgba(16,185,129,0.12) 0 4px, transparent 4px 120px)",
    ].join(", "),
    padding: "36px 16px",
    boxSizing: "border-box",
  },
  hero: {
    textAlign: "center",
    marginBottom: 24,
    userSelect: "none",
  },
  brand: {
    fontSize: 40,
    fontWeight: 700,
    letterSpacing: 1,
    color: "#2563eb", // 파란 텍스트(스케치 타이틀 느낌)
  },
  subtitle: {
    marginTop: 6,
    fontSize: 18,
    color: "#1f2937",
  },
  center: {
    display: "grid",
    placeItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 560, // 스케치처럼 넓게
    background: "#fff",
    border: "2px solid #2b2b2b", // 굵은 테두리
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
    display: "grid",
    gap: 10,
  },
  label: { fontSize: 16, color: "#111827", fontWeight: 500 },
  emailRow: {
    display: "flex",
    alignItems: "stretch",
    border: "2px solid #374151", // 입력 박스도 선명한 테두리
    borderRadius: 6,
    overflow: "hidden",
    background: "#fff",
  },
  emailInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "12px 12px",
    fontSize: 16,
  },
  emailSuffix: {
    padding: "12px 12px",
    fontSize: 16,
    background: "#f3f4f6",
    color: "#111827",
    borderLeft: "2px solid #374151",
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
  },
  input: {
    width: "100%",
    border: "2px solid #374151",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    outline: "none",
  },
  error: {
    background: "#fff6f6",
    color: "#c53030",
    border: "1px solid #fed7d7",
    borderRadius: 6,
    padding: "8px 10px",
    fontSize: 14,
  },
  loginBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 6,
    background: "#ffffff",
    color: "#1e3a8a",
    // 파란 외곽선 버튼 느낌
    border: "2px solid #3b82f6",
    fontSize: 16,
    fontWeight: 600,
  },
  footerLinks: {
    marginTop: 6,
    display: "flex",
    justifyContent: "flex-end", // 우하단 정렬
    alignItems: "center",
    gap: 4,
  },
  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    padding: 0,
    fontSize: 14,
  },
};


