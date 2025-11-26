import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageCircle, ArrowLeft, MoreVertical } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getPost, getPostComments, createComment } from '@/services/api';
import {
  togglePostLike,
  togglePostDislike,
  togglePostScrap,
  getIsScraped,
  getCommentReactions,
  likeComment,
  dislikeComment,
} from '@/services/api';
import scrapIcon from '@/assets/scrap.svg';
import reportIcon from '@/assets/report.svg';
import writeCommentIcon from '@/assets/writecomment.svg';
import useAuthStore from '@/stores/authStore';
import { UserProfilePopup } from '@/components/common';

type ReactionSummary = {
  likeCount: number;
  dislikeCount: number;
  myReaction?: 'LIKE' | 'DISLIKE' | null;
};

interface PostData {
  id: string;
  authorName: string;
  authorInitial: string;
  authorNicknameColor?: string;
  date: string;
  title: string;
  content: string;
  likes: number;
  tags: string[];
  reactions?: ReactionSummary;
}

// ⭐ 댓글에도 닉네임 색 정보 추가
interface CommentData {
  id: string;
  authorName: string;
  authorInitial: string;
  authorNicknameColor?: string;
  date: string;
  content: string;
  likes: number;
}

// 프로필 테두리 색 결정 함수 (공통)
const getProfileBorderClass = (color?: string) => {
  if (!color) return 'border-gray-300';

  switch (color.toLowerCase()) {
    case 'white':
    case 'gray':
      return 'border-gray-300';
    case 'black':
      return 'border-neutral-800';
    case 'green':
    case 'emerald':
      return 'border-emerald-400';
    case 'blue':
      return 'border-blue-400';
    case 'purple':
      return 'border-purple-400';
    case 'gold':
    case 'yellow':
      return 'border-yellow-400';
    case 'orange':
      return 'border-orange-400';
    case 'red':
      return 'border-red-400';
    default:
      return 'border-gray-300';
  }
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [postData, setPostData] = useState<PostData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentReactions, setCommentReactions] = useState<
    Record<
      string,
      { likeCount: number; dislikeCount: number; myReaction: 'LIKE' | 'DISLIKE' | null }
    >
  >({});
  const { accessToken, user } = useAuthStore();
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isScraped, setIsScraped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const myName =
    user?.displayName ??
    user?.nickname ??
    '나';

  const myInitial = myName.charAt(0);
  const myColor = user?.nicknameColor;

  // ⭐ 댓글용 프로필 팝업: 현재 열려 있는 댓글 id
  const [activeCommentProfileId, setActiveCommentProfileId] = useState<string | null>(null);

  const refreshCommentReaction = async (commentId: string) => {
    const r = await getCommentReactions(commentId);

    setCommentReactions((prev) => ({
      ...prev,
      [commentId]: {
        likeCount: r.likeCount ?? 0,
        dislikeCount: r.dislikeCount ?? 0,
        myReaction: r.myReaction ?? null,
      },
    }));
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      if (!accessToken) return alert('로그인이 필요합니다.');
      await likeComment(commentId);
      await refreshCommentReaction(commentId);
    } catch (e) {
      console.error('댓글 좋아요 실패:', e);
    }
  };

  const handleCommentDislike = async (commentId: string) => {
    try {
      if (!accessToken) return alert('로그인이 필요합니다.');
      await dislikeComment(commentId);
      await refreshCommentReaction(commentId);
    } catch (e) {
      console.error('댓글 싫어요 실패:', e);
    }
  };

  useEffect(() => {
    if (!comments || comments.length === 0) return;

    const fetchReactions = async () => {
      try {
        const entries = await Promise.all(
          comments.map(async (c) => {
            const r = await getCommentReactions(c.id);
            return [
              c.id,
              {
                likeCount: r.likeCount ?? 0,
                dislikeCount: r.dislikeCount ?? 0,
                myReaction: r.myReaction ?? null,
              },
            ] as const;
          }),
        );

        const map: typeof commentReactions = {};
        for (const [id, data] of entries) map[id] = data;

        setCommentReactions(map);
      } catch (e) {
        console.error('댓글 리액션 로드 실패:', e);
      }
    };

    fetchReactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  useEffect(() => {
    if (!id) {
      setPostData(null);
      setComments([]);
      return;
    }

    const fetchData = async () => {
      try {
        const p = await getPost(id);

        const authorName: string =
          p?.author?.displayName ?? p?.authorName ?? p?.author?.name ?? '작성자';
        const authorInitial = authorName.charAt(0);

        const authorNicknameColor: string | undefined = p?.author?.nicknameColor ?? undefined;

        const normalizedTags: string[] = Array.isArray(p?.tags)
          ? p.tags
              .map((t: any) => (typeof t === 'string' ? t : t?.name))
              .filter(Boolean)
          : [];

        const reactions: ReactionSummary | undefined = p?.reactions;
        const likeCount = reactions?.likeCount ?? p?.likes ?? 0;

        const post: PostData = {
          id: p.id,
          authorName,
          authorInitial,
          authorNicknameColor,
          date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('ko-KR') : '-',
          title: p.title ?? '',
          content: p.content ?? '',
          likes: likeCount,
          tags: normalizedTags,
          reactions,
        };
        setPostData(post);

        if (p?.reactions?.myReaction === 'LIKE') {
          setIsLiked(true);
          setIsDisliked(false);
        } else if (p?.reactions?.myReaction === 'DISLIKE') {
          setIsLiked(false);
          setIsDisliked(true);
        } else {
          setIsLiked(false);
          setIsDisliked(false);
        }

        try {
          const scrapedStatus = await getIsScraped(id);
          setIsScraped(!!scrapedStatus);
        } catch {
          setIsScraped(false);
        }

        const c = await getPostComments(id);
        const mapped: CommentData[] = Array.isArray(c)
          ? c.map((it: any) => {
              const cAuthorName: string =
                it?.author?.displayName ?? it?.authorName ?? it?.author?.name ?? '사용자';
              return {
                id: it.id,
                authorName: cAuthorName,
                authorInitial: cAuthorName.charAt(0),
                authorNicknameColor: it?.author?.nicknameColor ?? undefined,
                date: it.createdAt
                  ? new Date(it.createdAt).toLocaleDateString('ko-KR')
                  : '-',
                content: it.body ?? it.content ?? '',
                likes: it?.reactions?.likeCount ?? it?.likes ?? 0,
              };
            })
          : [];
        setComments(mapped);
      } catch (e) {
        setPostData(null);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div>
        {/* ✅ 수정: p-6 px-6 pb-6 pt-24 형태로 분리하여 충돌 방지 */}
        <main className="w-full flex px-6 pb-6 pt-24 gap-6 items-start">
          <AppSidebar />
          <section className="flex-1 flex flex-col gap-6">
            <div className="text-center text-muted-foreground py-8">
              불러오는 중...
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!postData) {
    return (
      <div>
         {/* ✅ 수정: p-6 px-6 pb-6 pt-24 형태로 분리 */}
        <main className="w-full flex px-6 pb-6 pt-24 gap-6 items-start">
          <AppSidebar />
          <section className="flex-1 flex flex-col gap-12">
            <p className="text-muted-foreground">게시글을 찾을 수 없습니다.</p>
            <Button
              variant="ghost"
              className="mt-4 gap-2 mr-auto"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
              목록으로 돌아가기
            </Button>
          </section>
        </main>
      </div>
    );
  }

  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !id) return;
    try {
      const newComment = await createComment(id, commentInput);
      const authorName =
        newComment.author?.displayName ?? newComment.authorName ?? '나';

      const mapped: CommentData = {
        id: newComment.id,
        authorName,
        authorInitial: authorName.charAt(0),
        authorNicknameColor: newComment?.author?.nicknameColor ?? undefined,
        date: new Date(newComment.createdAt).toLocaleDateString('ko-KR'),
        content: newComment.body ?? '',
        likes: newComment.reactions?.likeCount ?? 0,
      };
      setComments((prev) => [...prev, mapped]);
      setCommentInput('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    }
  };

  const handleLike = async () => {
    if (!id) return;
    try {
      await togglePostLike(id);
      setPostData((prev) => {
        if (!prev) return prev;
        const reactions = { ...(prev.reactions ?? { likeCount: 0, dislikeCount: 0 }) };
        let likeCount = reactions.likeCount ?? 0;
        let dislikeCount = reactions.dislikeCount ?? 0;

        if (isLiked) {
          likeCount = Math.max(0, likeCount - 1);
          setIsLiked(false);
        } else {
          likeCount += 1;
          setIsLiked(true);
          if (isDisliked) {
            dislikeCount = Math.max(0, dislikeCount - 1);
            setIsDisliked(false);
          }
        }
        return {
          ...prev,
          likes: likeCount,
          reactions: { ...reactions, likeCount, dislikeCount },
        };
      });
    } catch (e) {
      console.error('좋아요 실패:', e);
    }
  };

  const handleDislike = async () => {
    if (!id) return;
    try {
      await togglePostDislike(id);
      setPostData((prev) => {
        if (!prev) return prev;
        const reactions = { ...(prev.reactions ?? { likeCount: 0, dislikeCount: 0 }) };
        let likeCount = reactions.likeCount ?? 0;
        let dislikeCount = reactions.dislikeCount ?? 0;

        if (isDisliked) {
          dislikeCount = Math.max(0, dislikeCount - 1);
          setIsDisliked(false);
        } else {
          dislikeCount += 1;
          setIsDisliked(true);
          if (isLiked) {
            likeCount = Math.max(0, likeCount - 1);
            setIsLiked(false);
          }
        }
        return { ...prev, reactions: { ...reactions, likeCount, dislikeCount } };
      });
    } catch (e) {
      console.error('싫어요 실패:', e);
    }
  };

  const handleScrap = async () => {
    if (!id) return;
    try {
      await togglePostScrap(id);
      setIsScraped(!isScraped);
    } catch (e) {
      console.error('스크랩 실패:', e);
    }
  };

  return (
    <div>
       {/* ✅ 수정: px-6 pb-6 pt-24 (충돌 방지 명시적 작성) */}
      <main className="w-full flex px-6 pb-6 pt-24 gap-6 items-start">
        <AppSidebar />
        <section className="flex-1 flex flex-col gap-6">
          

          {/* 본문 */}
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="flex items-start justify-between mb-6">
              {/* 왼쪽: 프로필 + 팝업 */}
              <div className="relative flex items-center gap-3">
                {/* 게시글 작성자 아바타 */}
                <Avatar
                  onClick={() => setShowProfilePopup((v) => !v)}
                  className={`
                    w-14 h-14 rounded-full cursor-pointer
                    border-[5px] ${getProfileBorderClass(postData.authorNicknameColor)}
                    bg-white text-gray-900 font-bold
                    shadow-sm hover:bg-gray-50 transition
                  `}
                >
                  <AvatarFallback className="text-lg font-semibold">
                    {postData.authorInitial}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-lg">{postData.authorName}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{postData.date}</p>
                </div>

                {/* 게시글 작성자 프로필 팝업 */}
                {showProfilePopup && (
                  <UserProfilePopup
                    className="absolute left-0 top-16"
                    name={postData.authorName}
                    initial={postData.authorInitial}
                    nicknameColor={postData.authorNicknameColor}
                    onClose={() => setShowProfilePopup(false)}
                  />
                )}
              </div>

              {/* 오른쪽: 스크랩/신고 메뉴 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="p-2 rounded-full hover:bg-muted transition"
                >
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-gray-100 border border-border rounded-lg shadow-lg py-1 text-sm z-10">
                    <button
                      type="button"
                      onClick={() => {
                        handleScrap();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-200 transition"
                    >
                      <img src={scrapIcon} alt="스크랩" className="w-4 h-4" />
                      <span>{isScraped ? '스크랩 취소' : '스크랩'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/report/post/${id}`);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-200 transition"
                    >
                      <img src={reportIcon} alt="신고하기" className="w-4 h-4" />
                      <span>신고하기</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-6 leading-tight">
              {postData.title}
            </h1>

            {/* 태그 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {postData.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="text-base leading-relaxed mb-8 text-foreground whitespace-pre-line">
              {postData.content}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              {/* 좋아요 */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-muted transition ${
                  isLiked ? 'text-blue-500' : 'text-muted-foreground'
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-black" />
                <span className="font-medium">{postData.likes}</span>
              </button>

              {/* 싫어요 */}
              <button
                onClick={handleDislike}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-muted transition ${
                  isDisliked ? 'text-blue-500' : 'text-muted-foreground'
                }`}
              >
                <ThumbsUp className="w-4 h-4 rotate-180 text-black" />
                <span className="font-medium">
                  {postData.reactions?.dislikeCount ?? 0}
                </span>
              </button>

              {/* 댓글 개수 */}
              <button className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground transition hover:bg-muted/80">
                <MessageCircle className="w-4 h-4 text-black" />
                <span className="font-medium">{comments.length}</span>
              </button>
            </div>
          </div>

          {/* 댓글 작성 */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-bold text-lg mb-4">댓글 작성</h3>

            <div className="flex items-start gap-4">
              {/* ⭐ 내 프로필 아바타 + 팝업 */}
              <div className="relative">
                <Avatar
                  onClick={() => setActiveCommentProfileId('me')}
                  className={`
                    w-12 h-12 rounded-full cursor-pointer
                    border-[5px] ${getProfileBorderClass(myColor)}
                    bg-white text-gray-900 font-bold
                    shadow-sm hover:bg-gray-50 transition
                  `}
                >
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {myInitial}
                  </AvatarFallback>
                </Avatar>

                {/* 내 프로필 팝업 */}
                {activeCommentProfileId === 'me' && (
                  <UserProfilePopup
                    className="absolute left-0 top-14 z-20"
                    name={myName}
                    initial={myInitial}
                    nicknameColor={myColor}
                    onClose={() => setActiveCommentProfileId(null)}
                  />
                )}
              </div>

              {/* 입력창 */}
              <div className="flex-1 flex flex-col gap-3">
                <Textarea
                  placeholder={`댓글을 입력하세요...`}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="min-h-[100px] resize-none bg-gray-100 border-0 rounded-md focus:ring-0 focus:outline-none"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCommentSubmit}
                    disabled={!commentInput.trim()}
                    className="inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <img
                      src={writeCommentIcon}
                      alt="댓글 작성"
                      className="w-30 h-30"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* 댓글 목록 */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-bold text-lg mb-6">
              댓글 {comments.length}개
            </h3>
            <div className="flex flex-col">
              {comments.map((c, idx) => {
                const r = commentReactions[c.id];

                return (
                  <div key={c.id}>
                    {/* ⭐ relative로 감싸서 팝업 위치 잡기 */}
                    <div className="relative flex gap-4 py-4">
                      {/* 댓글 작성자 아바타 + 팝업 */}
                      <Avatar
                        className={`
                          w-12 h-12 rounded-full cursor-pointer
                          border-[5px] ${getProfileBorderClass(c.authorNicknameColor)}
                          bg-white text-gray-900 font-bold
                          shadow-sm hover:bg-gray-50 transition
                        `}
                        onClick={() =>
                          setActiveCommentProfileId((prev) =>
                            prev === c.id ? null : c.id,
                          )
                        }
                      >
                        <AvatarFallback className="text-sm font-semibold">
                          {c.authorInitial}
                        </AvatarFallback>
                      </Avatar>

                      {/* 댓글 작성자 프로필 팝업 */}
                      {activeCommentProfileId === c.id && (
                        <UserProfilePopup
                          className="absolute left-0 top-14 z-20"
                          name={c.authorName}
                          initial={c.authorInitial}
                          nicknameColor={c.authorNicknameColor}
                          onClose={() => setActiveCommentProfileId(null)}
                        />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold">{c.authorName}</span>
                          <span className="text-sm text-muted-foreground">
                            {c.date}
                          </span>
                        </div>

                        <p className="text-sm text-foreground mb-3 leading-relaxed whitespace-pre-line">
                          {c.content}
                        </p>

                        {/* 댓글 좋아요/싫어요 */}
                        <div className="flex items-center gap-2 justify-end mt-2">
                          {/* 👍 좋아요 */}
                          <button
                            type="button"
                            onClick={() => handleCommentLike(c.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-full border bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span
                              className={`text-xs font-medium ${
                                r?.myReaction === 'LIKE'
                                  ? 'text-blue-500'
                                  : ''
                              }`}
                            >
                              {r?.likeCount ?? 0}
                            </span>
                          </button>

                          {/* 👎 싫어요 */}
                          <button
                            type="button"
                            onClick={() => handleCommentDislike(c.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-full border bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                          >
                            <ThumbsUp className="w-3 h-3 rotate-180" />
                            <span
                              className={`text-xs font-medium ${
                                r?.myReaction === 'DISLIKE'
                                  ? 'text-blue-500'
                                  : ''
                              }`}
                            >
                              {r?.dislikeCount ?? 0}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {idx < comments.length - 1 && <Separator />}
                  </div>
                );
              })}

              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  아직 댓글이 없습니다.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}