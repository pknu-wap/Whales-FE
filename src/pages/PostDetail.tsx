import { useState, useEffect } from 'react'; // 1. useEffect 추가
import { useParams, useNavigate } from 'react-router-dom';
// 1. AppSidebar import 경로를 상대 경로로 수정합니다.
import { AppSidebar } from '../components/common';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageCircle, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// 2. 게시글과 댓글 데이터 타입을 정의합니다.
interface PostData {
  id: string;
  author: string;
  authorInitial: string; // 아바타용 이니셜
  board: string;
  date: string;
  title: string;
  content: string;
  likes: number;
  commentCount: number; // 댓글 수
  tags: string[];
}

interface CommentData {
  id: number;
  author: string;
  authorInitial: string;
  board: string;
  date: string;
  content: string;
  likes: number;
  replies: number;
}

// 3. 가짜 데이터 (id에 따라 다른 내용을 반환하는 함수)
const fetchMockPostData = (postId: string | undefined): PostData | null => {
  // 실제로는 여기서 axios.get(`/api/post/${postId}`) 등을 호출합니다.
  if (postId === 'hot-1') {
    return {
      id: 'hot-1',
      author: '커리어 전문가',
      authorInitial: '커',
      board: '취업/이직',
      date: '2025.09.18',
      title: '취업 준비생을 위한 면접 팁',
      content:
        '현직 면접관이 알려주는 실전 면접 노하우를 공유합니다. 예상 질문 리스트, 답변 구성 방법, 면접 시 주의해야 할 태도 등에 대해 자세히 다룹니다.\n\n추가적으로 궁금한 점이 있다면 댓글로 남겨주세요.',
      likes: 152,
      commentCount: 18,
      tags: ['면접', '취업', '팁', '커리어'],
    };
  } else if (postId === 'new-2') {
    return {
      id: 'new-2',
      author: '개발 고수',
      authorInitial: '개',
      board: '프로그래밍',
      date: '2025.09.18',
      title: '프로그래밍 언어 선택 가이드',
      content:
        '2025년 기준, 어떤 프로그래밍 언어를 배워야 할까요? 각 언어의 특징과 전망, 그리고 학습 로드맵을 제시합니다. 웹 개발, 데이터 과학, 모바일 앱 등 분야별 추천 언어도 확인해보세요.',
      likes: 88,
      commentCount: 25,
      tags: ['프로그래밍', '가이드', '개발', '언어'],
    };
  }
  // 다른 id 값이나 id가 없을 경우 (혹은 API 실패 시)
  return null;
};

const fetchMockComments = (postId: string | undefined): CommentData[] => {
  // 실제로는 axios.get(`/api/post/${postId}/comments`) 등을 호출합니다.
  if (postId === 'hot-1') {
    return [
      {
        id: 1,
        author: '취준생',
        authorInitial: '취',
        board: '취업/이직',
        date: '2025.09.19',
        content: '좋은 정보 감사합니다! 면접 때 꼭 참고하겠습니다.',
        likes: 15,
        replies: 0,
      },
      {
        id: 2,
        author: '인사담당자',
        authorInitial: '인',
        board: '커리어',
        date: '2025.09.20',
        content: '핵심을 잘 짚어주셨네요. 특히 태도 부분이 중요합니다.',
        likes: 22,
        replies: 1,
      },
    ];
  }
  return []; // 다른 게시글은 댓글 없음 (예시)
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>(); // URL 파라미터에서 id 가져오기
  const navigate = useNavigate();
  const [postData, setPostData] = useState<PostData | null>(null); // 게시글 데이터 상태
  const [comments, setComments] = useState<CommentData[]>([]); // 댓글 목록 상태
  const [commentInput, setCommentInput] = useState(''); // 댓글 입력 상태

  // 4. 컴포넌트 마운트 시 id에 맞는 데이터를 불러옵니다.
  useEffect(() => {
    const fetchedPost = fetchMockPostData(id);
    const fetchedComments = fetchMockComments(id);
    setPostData(fetchedPost);
    setComments(fetchedComments);
  }, [id]); // id가 변경될 때마다 데이터를 다시 불러옵니다.

  const handleCommentSubmit = () => {
    if (commentInput.trim() && postData) {
      const newComment: CommentData = {
        id: comments.length + 1 + Date.now(), // 고유 ID 생성 (임시)
        author: '현재 사용자', // 실제로는 로그인된 사용자 정보 사용
        authorInitial: '현',
        board: postData.board, // 게시글과 같은 게시판으로 설정
        date: new Date()
          .toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          })
          .replace(/\. /g, '.')
          .replace('.', ''),
        content: commentInput,
        likes: 0,
        replies: 0,
      };
      setComments([...comments, newComment]); // 기존 댓글 목록에 새 댓글 추가
      setCommentInput(''); // 입력창 비우기
    }
  };

  // 5. 데이터 로딩 중이거나 없을 경우 처리
  if (!postData) {
    return (
      <div className="min-h-screen bg-background">
        <main className="w-full max-w-[1400px] mx-auto flex p-6 gap-6">
          <AppSidebar />
          <section className="flex-1 flex flex-col items-center justify-center">
            <p className="text-muted-foreground">
              게시글을 불러오는 중이거나 찾을 수 없습니다.
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

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-[1400px] mx-auto flex p-6 gap-6">
        <AppSidebar />

        <section className="flex-1 flex flex-col gap-6">
          {/* 뒤로 가기 버튼 */}
          <Button
            variant="ghost"
            className="w-fit gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Button>

          {/* 게시글 본문 (postData 사용) */}
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    {/* 6. 데이터에서 작성자 이니셜 사용 */}
                    {postData.authorInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {/* 7. 데이터에서 작성자 이름 사용 */}
                    <p className="font-bold text-lg">{postData.author}</p>
                    <Badge variant="secondary" className="text-xs">
                      {/* 8. 데이터에서 게시판 이름 사용 */}
                      {postData.board}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {/* 9. 데이터에서 날짜 사용 */}
                    {postData.date}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                팔로우
              </Button>
            </div>

            <h1 className="text-2xl font-bold mb-6 leading-tight">
              {/* 10. 데이터에서 제목 사용 */}
              {postData.title}
            </h1>

            <div className="text-base leading-relaxed mb-8 text-foreground whitespace-pre-line">
              {/* 11. 데이터에서 본문 내용 사용 (줄바꿈 유지) */}
              {postData.content}
            </div>

            {/* 12. 태그 표시 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {postData.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-6 text-muted-foreground pt-4 border-t">
              <button className="flex items-center gap-2 hover:text-primary transition-colors">
                <ThumbsUp className="w-5 h-5" />
                {/* 13. 데이터에서 좋아요 수 사용 */}
                <span className="font-medium">{postData.likes}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
                {/* 14. 실제 댓글 수(comments.length) 사용 */}
                <span className="font-medium">{comments.length}</span>
              </button>
            </div>
          </div>

          {/* 댓글 작성 */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-bold text-lg mb-4">댓글 작성</h3>
            <div className="flex gap-4">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {/* 현재 사용자 이니셜 (예시) */}현
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex flex-col gap-3">
                <Textarea
                  placeholder="댓글을 입력하세요..."
                  value={commentInput} // comment -> commentInput
                  onChange={(e) => setCommentInput(e.target.value)} // setComment -> setCommentInput
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleCommentSubmit}
                    disabled={!commentInput.trim()} // comment -> commentInput
                  >
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
              {comments.map((comment, index) => (
                <div key={comment.id}>
                  <div className="flex gap-4 py-4">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {comment.authorInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold">{comment.author}</span>
                        <span className="text-sm text-muted-foreground">
                          {comment.board} • {comment.date}
                        </span>
                        {/* 작성자 하트 배지는 필요시 로직 추가 */}
                      </div>
                      <p className="text-sm text-foreground mb-3 leading-relaxed whitespace-pre-line">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="font-medium">{comment.likes}</span>
                        </button>
                        <button className="text-muted-foreground hover:text-primary transition-colors font-medium">
                          답글
                        </button>
                      </div>
                    </div>
                  </div>
                  {index < comments.length - 1 && <Separator />}
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
