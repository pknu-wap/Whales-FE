import { useEffect, useRef, useState } from "react";
import "./MyPage.css";

type Tab = "posts" | "comments" | "scrap" | "drafts";

interface Counts {
  posts?: number;
  comments?: number;
  scrap?: number;
  drafts?: number;
}

interface Item {
  id: number;
  title: string;
  createdAt: string;
  author?: string;
  avatarUrl?: string;
  tags?: string[];
  excerpt?: string;
}

interface ListResponse<T> {
  items: T[];
  total?: number;
}

export default function MyPage() {
  const [nickname] = useState("자전 최고");
  const [bio, setBio] = useState("컴퓨터공학에 관심 있습니다.");
  const [editing, setEditing] = useState(false);

  const [tab, setTab] = useState<Tab>("posts");

  const [counts, setCounts] = useState<Counts>({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  const [posts, setPosts] = useState<Item[]>([]);
  const [postsTotal, setPostsTotal] = useState<number | undefined>(undefined);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [comments, setComments] = useState<Item[]>([]);
  const [commentsTotal, setCommentsTotal] = useState<number | undefined>(undefined);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const [scrap, setScrap] = useState<Item[]>([]);
  const [scrapTotal, setScrapTotal] = useState<number | undefined>(undefined);
  const [loadingScrap, setLoadingScrap] = useState(false);
  const [scrapLoaded, setScrapLoaded] = useState(false);

  const [drafts, setDrafts] = useState<Item[]>([]);
  const [draftsTotal, setDraftsTotal] = useState<number | undefined>(undefined);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [draftsLoaded, setDraftsLoaded] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const prevBlobUrlRef = useRef<string | null>(null);

  async function fetchCounts() {
    setLoadingCounts(true);
    try {
      const res = await fetch("/api/mypage/counts");
      if (!res.ok) throw new Error("counts fetch failed");
      const data: Counts = await res.json();
      setCounts(data ?? {});
    } catch {
      setCounts({});
    } finally {
      setLoadingCounts(false);
    }
  }

  async function loadList(
    url: string,
    setItems: (v: Item[]) => void,
    setTotal: (n: number | undefined) => void,
    setLoading: (b: boolean) => void,
    mergeCountsKey: keyof Counts | null
  ) {
    setLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("list fetch failed");
      const data: ListResponse<Item> = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total);
      if (mergeCountsKey && typeof data.total === "number") {
        setCounts((prev) => ({ ...prev, [mergeCountsKey]: data.total }));
      }
    } catch {
      const fallback: Item[] = [
        {
          id: Date.now(),
          title: "알고리즘 스터디 모집",
          createdAt: "2025-10-18",
          author: "닉네임",
          tags: ["스터디", "컴퓨터공학과", "알고리즘"],
          excerpt:
            "함께 알고리즘 공부할 스터디원을 모집합니다. 관심 있으신 분들은 연락 주세요. 주 2회 진행할 예정..",
        },
      ];
      setItems(fallback);
      setTotal(fallback.length);
      if (mergeCountsKey) setCounts((prev) => ({ ...prev, [mergeCountsKey]: fallback.length }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCounts();
    loadList("/api/mypage/posts", setPosts, setPostsTotal, setLoadingPosts, "posts");
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (tab === "comments" && !commentsLoaded) {
      loadList("/api/mypage/comments", setComments, setCommentsTotal, setLoadingComments, "comments")
        .then(() => setCommentsLoaded(true));
    }
    if (tab === "scrap" && !scrapLoaded) {
      loadList("/api/mypage/scrap", setScrap, setScrapTotal, setLoadingScrap, "scrap")
        .then(() => setScrapLoaded(true));
    }
    if (tab === "drafts" && !draftsLoaded) {
      loadList("/api/mypage/drafts", setDrafts, setDraftsTotal, setLoadingDrafts, "drafts")
        .then(() => setDraftsLoaded(true));
    }
  }, [tab, commentsLoaded, scrapLoaded, draftsLoaded]);

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일을 선택해 주세요.");
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    prevBlobUrlRef.current = blobUrl;
    setAvatarUrl(blobUrl);
    /*
    const form = new FormData();
    form.append("avatar", file);
    const res = await fetch("/api/mypage/avatar", { method: "POST", body: form });
    const { imageUrl } = await res.json();
    setAvatarUrl(imageUrl);
    */
  };

  const openFilePicker = () => fileInputRef.current?.click();

  function badgeCount(t: Tab) {
    if (t === "posts") return (counts.posts ?? postsTotal ?? posts.length) || 0;
    if (t === "comments") return (counts.comments ?? commentsTotal ?? comments.length) || 0;
    if (t === "scrap") return (counts.scrap ?? scrapTotal ?? scrap.length) || 0;
    if (t === "drafts") return (counts.drafts ?? draftsTotal ?? drafts.length) || 0;
    return 0;
  }

  const tabs = [
    { key: "posts" as Tab, label: "내가 쓴 글" },
    { key: "comments" as Tab, label: "내가 쓴 댓글" },
    { key: "scrap" as Tab, label: "스크랩" },
    { key: "drafts" as Tab, label: "임시저장" },
  ];

  function renderList(items: Item[], loading: boolean) {
    if (loading) return <p>로딩 중...</p>;
    if (items.length === 0) return <p>항목이 없습니다.</p>;
    return (
      <ul className="post-list">
        {items.map((it) => (
          <li key={it.id} className="post-card">
            <div className="post-header">
              <div className="avatar-sm" aria-hidden="true">
                {it.avatarUrl ? <img src={it.avatarUrl} alt="" /> : <span>{(it.author ?? "닉")[0]}</span>}
              </div>
              <div className="meta">
                <span className="author">{it.author ?? "닉네임"}</span>
                <time className="date" dateTime={it.createdAt}>
                  {new Date(it.createdAt).toLocaleDateString("ko-KR")}
                </time>
              </div>
            </div>

            <h3 className="post-h3">
              <a href={`/posts/${it.id}`} className="post-link" aria-label={`${it.title} 상세로 이동`}>
                {it.title}
              </a>
            </h3>

            {it.tags && it.tags.length > 0 && (
              <div className="tag-row">
                {it.tags.map((t, idx) => (
                  <span key={idx} className="tag-chip">{t}</span>
                ))}
              </div>
            )}

            {it.excerpt && <p className="excerpt">{it.excerpt}</p>}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mypage-root">
      <div className="backbar">
        <button
          type="button"
          className="back-btn"
          onClick={() => {
            if (window.history.length > 1) window.history.back();
            else window.location.href = "/";
          }}
          aria-label="메인으로 돌아가기"
          title="뒤로가기"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M15.5 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="back-text">메인</span>
        </button>
      </div>

      <section className="profile-card">
        <button
          type="button"
          className="avatar editable"
          aria-label="프로필 사진 변경"
          onClick={openFilePicker}
        >
          {avatarUrl ? <img src={avatarUrl} alt="프로필 사진 미리보기" /> : <span aria-hidden="true">자</span>}
          <span className="avatar-overlay" aria-hidden="true">
            <svg className="avatar-pencil" viewBox="0 0 24 24" width="20" height="20">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42L18.37 3.29a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/>
            </svg>
            <span className="avatar-text">사진 변경</span>
          </span>
        </button>

        <label htmlFor="avatar-input" className="visually-hidden">프로필 사진 업로드</label>
        <input
          id="avatar-input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={handleAvatarChange}
          aria-label="프로필 사진 업로드"
        />

        <div className="profile-main">
          <div className="profile-head">
            <h2 className="nickname">{nickname}</h2>
            {!editing && (
              <button className="btn btn-outline" type="button" onClick={() => setEditing(true)}>
                프로필 수정
              </button>
            )}
          </div>

          <div className="bio-box">
            {!editing ? (
              <p className="bio-text">{bio?.trim() ? bio : "자기소개를 입력해 주세요."}</p>
            ) : (
              <>
                <textarea
                  className="bio-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="자기소개를 입력해 주세요."
                  aria-label="자기소개 편집"
                />
                <div className="bio-actions">
                  <button className="btn" type="button" onClick={() => setEditing(false)}>취소</button>
                  <button className="btn btn-primary" type="button" onClick={() => setEditing(false)}>저장</button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="tabs" role="tablist" aria-label="마이페이지 탭">
        {tabs.map(({ key, label }) => {
          const active = tab === key;
          const tabId = `tab-${key}`;
          const panelId = `panel-${key}`;
          const count = badgeCount(key);

          const content = (
            <>
              <span className="tab-label">{label}</span>
              <span className={`tab-badge ${active ? "on" : ""}`} aria-hidden="true">
                {(loadingCounts && count === 0) ? "…" : count}
              </span>
            </>
          );

          return active ? (
            <button
              key={key}
              id={tabId}
              role="tab"
              aria-selected="true"
              aria-controls={panelId}
              tabIndex={0}
              className="tab active"
              type="button"
              onClick={() => setTab(key)}
              aria-label={`${label} 탭, 총 ${count}개`}
            >
              {content}
            </button>
          ) : (
            <button
              key={key}
              id={tabId}
              role="tab"
              aria-selected="false"
              aria-controls={panelId}
              tabIndex={-1}
              className="tab"
              type="button"
              onClick={() => setTab(key)}
              aria-label={`${label} 탭, 총 ${count}개`}
            >
              {content}
            </button>
          );
        })}
      </div>

      <div className="panels" role="presentation">
        <section id="panel-posts" role="tabpanel" aria-labelledby="tab-posts" hidden={tab !== "posts"}>
          <div className="card">{renderList(posts, loadingPosts)}</div>
        </section>

        <section id="panel-comments" role="tabpanel" aria-labelledby="tab-comments" hidden={tab !== "comments"}>
          <div className="card">{renderList(comments, loadingComments)}</div>
        </section>

        <section id="panel-scrap" role="tabpanel" aria-labelledby="tab-scrap" hidden={tab !== "scrap"}>
          <div className="card">{renderList(scrap, loadingScrap)}</div>
        </section>

        <section id="panel-drafts" role="tabpanel" aria-labelledby="tab-drafts" hidden={tab !== "drafts"}>
          <div className="card">{renderList(drafts, loadingDrafts)}</div>
        </section>
      </div>
    </div>
  );
}
