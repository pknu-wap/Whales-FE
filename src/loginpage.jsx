// src/loginpage.jsx
import React, { useMemo, useState } from "react";

const DOMAIN = "pukyong.ac.kr";
const LOCALPART_REGEX = /^[A-Za-z0-9._%+-]+$/;

export default function LoginPage() {
  const [localPart, setLocalPart] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const fullEmail = useMemo(
    () => (localPart ? `${localPart}@${DOMAIN}` : ""),
    [localPart]
  );

  const handleLocalPartChange = (e) => {
    let v = e.target.value.trim();

    if (v.includes("@")) {
      const [beforeAt, afterAt] = v.split("@");
      if ((afterAt || "").toLowerCase() === DOMAIN) {
        v = beforeAt;
        setError("");
      } else {
        setError(`학교 이메일만 사용 가능합니다: *@${DOMAIN}`);
        v = beforeAt || "";
      }
    } else {
      setError("");
    }

    if (v && !LOCALPART_REGEX.test(v)) {
      setError("영문/숫자 및 . _ % + - 만 사용할 수 있어요.");
    }
    setLocalPart(v);
  };

  const isValid = !!localPart && LOCALPART_REGEX.test(localPart) && !!password;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) {
      setError("이메일과 비밀번호를 올바르게 입력해 주세요.");
      return;
    }
    alert(`로그인 시도\n이메일: ${fullEmail}`);
  };

  const handleSignup = () => {
    window.location.href = "/signup";
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>로그인</h2>
          <span style={styles.badge}>신입생 환영 🎉</span>
        </div>

        <div style={styles.signupHint}>
          <strong>아직 계정이 없나요?</strong>
          <ul style={styles.hintList}>
            <li>자신만의 게시판을 펼치세요</li>
            <li>태그로 더 편리하게</li>
            <li>오직 부경대학생만</li>
          </ul>
          <button type="button" onClick={handleSignup} style={styles.secondaryBtn}>
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <label htmlFor="emailLocal" style={styles.label}>학교 이메일</label>
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
            />
            <div style={styles.emailSuffix}>@{DOMAIN}</div>
          </div>

          <label htmlFor="password" style={styles.label}>비밀번호</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {error && <div role="alert" style={styles.error}>{error}</div>}

          <button type="submit" disabled={!isValid} style={{...styles.primaryBtn, opacity: isValid ? 1 : 0.6}}>
            로그인
          </button>

          <div style={styles.underActions}>
            <button type="button" onClick={handleSignup} style={styles.linkBtn}>
              계정이 없으신가요? 지금 가입하기
            </button>
            <button type="button" onClick={() => alert("비밀번호 재설정 링크를 이메일로 보내드릴게요.")} style={styles.linkBtn}>
              비밀번호 찾기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f7fb", padding: 24 },
  card: { width: "100%", maxWidth: 440, background: "#fff", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", padding: 24 },
  header: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  badge: { fontSize: 12, background: "#e8f0fe", color: "#1a73e8", borderRadius: 999, padding: "4px 8px" },
  signupHint: { background: "#f9fafb", border: "1px solid #eef0f3", borderRadius: 12, padding: 12, marginBottom: 16 },
  hintList: { margin: "8px 0 12px", paddingLeft: 18, lineHeight: 1.6 },
  form: { display: "grid", gap: 10 },
  label: { fontSize: 14, color: "#374151" },
  emailRow: { display: "flex", alignItems: "stretch", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" },
  emailInput: { flex: 1, border: "none", outline: "none", padding: 12, fontSize: 16 },
  emailSuffix: { padding: 12, background: "#f3f4f6", color: "#4b5563", fontSize: 14, borderLeft: "1px solid #e5e7eb", whiteSpace: "nowrap" },
  input: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, fontSize: 16 },
  error: { background: "#fff6f6", color: "#c53030", border: "1px solid #fed7d7", borderRadius: 8, padding: "8px 10px", fontSize: 13 },
  primaryBtn: { width: "100%", padding: 12, border: "none", borderRadius: 10, background: "#1a73e8", color: "#fff", fontSize: 16, cursor: "pointer" },
  secondaryBtn: { width: "100%", padding: 10, borderRadius: 10, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" },
  underActions: { display: "flex", justifyContent: "space-between", gap: 8, marginTop: 8 },
  linkBtn: { background: "transparent", border: "none", color: "#2563eb", cursor: "pointer", padding: 0 },
};

