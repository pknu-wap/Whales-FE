import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppSidebar } from '../components/common';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageCircle, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getPost, getPostComments, createComment } from '@/services/api';
import { togglePostLike, togglePostDislike, togglePostScrap, getIsScraped } from '@/services/api';

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
      <div className="min-h-screen bg-background">
        <main className="w-full max-w-[1400px] mx-auto flex p-6 gap-6">
          <AppSidebar />
          <section className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">불러오는 중…</p>
          </section>
        </main>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="min-h-screen bg-background">
        <main className="w-full max-w-[1400px] mx-auto flex p-6 gap-6">
          <AppSidebar />
          <section className="flex-1 flex flex-col items-center justify-center">
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
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-[1400px] mx-auto flex p-6 gap-6">
        <AppSidebar />

        <section className="flex-1 flex flex-col gap-6">
          <Button variant="ghost" className="w-fit gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Button>

          {/* 본문 */}
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    {postData.authorInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-lg">{postData.authorName}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{postData.date}</p>
                </div>
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

            <div className="flex items-center gap-6 text-muted-foreground pt-4 border-t">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${
                  isLiked
                    ? 'text-blue-500 border-blue-500 bg-blue-50'
                    : 'hover:text-blue-500 hover:border-blue-400 border-transparent'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span className="font-medium">{postData.likes}</span>
              </button>
              <button
                onClick={handleDislike}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${
                  isDisliked
                    ? 'text-blue-500 border-blue-500 bg-blue-50'
                    : 'hover:text-blue-500 hover:border-blue-400 border-transparent'
                }`}
              >
                <ThumbsUp className="w-5 h-5 rotate-180" />
                <span className="font-medium">{postData.reactions?.dislikeCount ?? 0}</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-transparent hover:text-blue-500 hover:border-blue-400 transition-all">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{comments.length}</span>
              </button>
              <button
                onClick={handleScrap}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${
                  isScraped
                    ? 'text-yellow-500 border-yellow-500 bg-yellow-50'
                    : 'hover:text-yellow-500 hover:border-yellow-400 border-transparent'
                }`}
              >
                📌 <span className="font-medium">{isScraped ? '스크랩됨' : '스크랩'}</span>
              </button>
            </div>
          </div>

          {/* 댓글 작성 */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-bold text-lg mb-4">댓글 작성</h3>
            <div className="flex gap-4">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">나</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex flex-col gap-3">
                <Textarea
                  placeholder="댓글을 입력하세요..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-end">
                  <Button onClick={handleCommentSubmit} disabled={!commentInput.trim()}>
                    댓글 작성
                  </Button>
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
                          <ThumbsUp className="w-4 h-4" />
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