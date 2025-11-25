import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppSidebar } from '../components/common';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageCircle, ArrowLeft, MoreVertical } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getPost, getPostComments, createComment } from '@/services/api';
import { togglePostLike, togglePostDislike, togglePostScrap, getIsScraped } from '@/services/api';
import scrapIcon from '@/assets/scrap.svg';
import reportIcon from '@/assets/report.svg';
import writeCommentIcon from '@/assets/writecomment.svg';
import RookieBadge from '@/assets/rookie.svg';

type ReactionSummary = {
  likeCount: number;
  dislikeCount: number;
  myReaction?: 'LIKE' | 'DISLIKE' | null;
};

interface PostData {
  id: string;
  authorName: string;
  authorInitial: string;
  date: string;
  title: string;
  content: string;
  likes: number;
  tags: string[];
  reactions?: ReactionSummary;
}

interface CommentData {
  id: string;
  authorName: string;
  authorInitial: string;
  date: string;
  content: string;
  likes: number;
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [postData, setPostData] = useState<PostData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isScraped, setIsScraped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // ⬅ 추가
  const [isProfileOpen, setIsProfileOpen] = useState(false); // ✅ 프로필 팝업

  // const handleTagClick = (tag: string) => {
  //   navigate(`/search?tag=${encodeURIComponent(tag)}`)
  // }

  useEffect(() => {
    if (!id) {
      setPostData(null);
      setComments([]);
      return;
    }

    const fetchData = async () => {
      try {
        const p = await getPost(id);

        // 작성자 이름/이니셜
        const authorName: string =
          p?.author?.displayName ??
          p?.authorName ??
          p?.author?.name ??
          '작성자';
        const authorInitial = authorName.charAt(0);

        // 태그는 문자열 배열로 정규화 (백엔드가 {id,name} 형태일 수 있음)
        const normalizedTags: string[] = Array.isArray(p?.tags)
          ? p.tags.map((t: any) => (typeof t === 'string' ? t : t?.name)).filter(Boolean)
          : [];

        // 리액션 요약에서 좋아요 수 추출
        const reactions: ReactionSummary | undefined = p?.reactions;
        const likeCount = reactions?.likeCount ?? p?.likes ?? 0;

        const post: PostData = {
          id: p.id,
          authorName,
          authorInitial,
          date: p.createdAt
            ? new Date(p.createdAt).toLocaleDateString('ko-KR')
            : '-',
          title: p.title ?? '',
          content: p.content ?? '',
          likes: likeCount,
          tags: normalizedTags,
          reactions,
        };
        // 기존 setPostData(post); 바로 아래에 추가
        setPostData(post);

        // myReaction 초기값 적용
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

        // 댓글 조회 및 매핑
        const c = await getPostComments(id);
        const mapped: CommentData[] = Array.isArray(c)
          ? c.map((it: any) => {
              const cAuthorName: string =
                it?.author?.displayName ??
                it?.authorName ??
                it?.author?.name ??
                '사용자';
              return {
                id: it.id,
                authorName: cAuthorName,
                authorInitial: cAuthorName.charAt(0),
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
        <main className="w-full flex p-6 gap-6 items-start">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-12">
            <p className="text-muted-foreground">불러오는 중…</p>
          </section>
        </main>
      </div>
    );
  }

  if (!postData) {
    return (
      <div>
      <main className="w-full flex p-6 gap-6 items-start">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-12">
            <p className="text-muted-foreground">
              게시글을 찾을 수 없습니다.
            </p>
            <Button
              variant="ghost"
              className="mt-4 gap-2"
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
      // 응답 데이터 구조에 따라 매핑
      const mapped = {
        id: newComment.id,
        authorName: newComment.author?.displayName ?? '나',
        authorInitial:
          newComment.author?.displayName?.charAt(0) ?? '나',
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
        const reactions = { ...prev.reactions };
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
        return { ...prev, likes: likeCount, reactions: { ...reactions, likeCount, dislikeCount } };
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
        const reactions = { ...prev.reactions };
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
      <main className="w-full flex p-6 gap-6 items-start">
      <AppSidebar />
      <section className="flex-1 flex flex-col gap-12">
          <Button variant="ghost" className="w-fit gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Button>

          {/* 본문 */}
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="flex items-start justify-between mb-6">
              {/* 왼쪽: 프로필 + 작은 팝업 */}
              <div className="relative flex items-center gap-3">
                {/* 아바타 - 클릭 시 팝업 열기 */}
                <Avatar
                  className="w-14 h-14 border-2 border-primary/20 cursor-pointer"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                >
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    {postData.authorInitial}
                  </AvatarFallback>
                </Avatar>

                {/* 닉네임/날짜 */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      className="font-bold text-lg text-left hover:underline"
                      onClick={() =>
                        setIsProfileOpen((prev) => !prev)
                      }
                    >
                      {postData.authorName}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {postData.date}
                  </p>
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
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-200 transition"
        >
          <img src={reportIcon} alt="신고하기" className="w-4 h-4" />
          <span>신고하기</span>
        </button>
      </div>
    )}
</div>
                {/* 닉네임 아래에 작게 뜨는 팝업 */}
                {isProfileOpen && (
                  <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-2xl border border-[#c9d8ff] bg-[#eaf2ff] px-4 py-4 shadow-md">
                    {/* 상단 X 버튼 */}
                    <button
                      type="button"
                      className="ml-auto mb-1 flex h-5 w-5 items-center justify-center text-slate-500 hover:text-slate-700"
                      onClick={() => setIsProfileOpen(false)}
                      aria-label="프로필 닫기"
                    >
                      <span className="text-base leading-none">×</span>
                    </button>

                    <div className="flex flex-col items-center gap-3">
                      {/* 작은 아바타 */}
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl font-semibold text-slate-900 ring-[11px] ring-[#D89BFF] mb-4">
                        {postData.authorInitial}
                      </div>

                      <div className="flex flex-col items-center gap-1 text-center">
                        <div className="text-xl font-extrabold text-slate-900">
                          {postData.authorName}
                        </div>
                        <p className="text-xs text-slate-600">
                          자기소개를 준비 중입니다.
                        </p>
                      </div>

                      <img
                        src={RookieBadge}
                        alt="Rookie 등급 배지"
                        className="h-6 w-auto"
                      />

                      <Button
                        size="sm"
                        className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-[12px] text-xs font-semibold bg-[#2f6bff] hover:bg-[#2557d4]"
                        onClick={() => navigate('/chat')}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>채팅하기</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-6 leading-tight">{postData.title}</h1>

            {/* 태그 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {postData.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
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

            {/* 댓글 */}
            <button
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground transition hover:bg-muted/80"
            >
              <MessageCircle className="w-4 h-4 text-black" />
              <span className="font-medium">{comments.length}</span>
            </button>
          </div>
          </div>

         {/* 댓글 작성 */}
<div className="bg-card rounded-lg border border-border p-6">
  <h3 className="font-bold text-lg mb-4">댓글 작성</h3>

  {/* 아바타 + 입력 영역 한 줄 정렬 */}
  <div className="flex items-start gap-4">
    {/* 아바타 */}
    <Avatar className="w-12 h-12 border-2 border-primary/20">
      <AvatarFallback className="bg-primary/10 text-primary font-bold">
        나
      </AvatarFallback>
    </Avatar>

    {/* 입력창 + 버튼 */}
    <div className="flex-1 flex flex-col gap-3">
      <Textarea
        placeholder="댓글을 입력하세요..."
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
            <h3 className="font-bold text-lg mb-6">댓글 {comments.length}개</h3>
            <div className="flex flex-col">
              {comments.map((c, idx) => (
                <div key={c.id}>
                  <div className="flex gap-4 py-4">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {c.authorInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold">{c.authorName}</span>
                        <span className="text-sm text-muted-foreground">{c.date}</span>
                      </div>
                      <p className="text-sm text-foreground mb-3 leading-relaxed whitespace-pre-line">
                        {c.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                          <ThumbsUp className="w-4 h-4 text-black" />
                          <span className="font-medium">{c.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {idx < comments.length - 1 && <Separator />}
                </div>
              ))}
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