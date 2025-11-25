// src/pages/ReportPage.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { reportPost, reportComment, type ReportReason } from '@/services/api';

const REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: 'SPAM',           label: '광고성(SPAM)',              description: '도배, 광고, 홍보성 게시물' },
  { value: 'ABUSE',          label: '욕설 / 비하',               description: '욕설, 인신공격, 모욕적 표현' },
  { value: 'HATE',           label: '혐오 발언(HATE)',           description: '인종, 성별, 지역 등에 대한 혐오 표현' },
  { value: 'ILLEGAL',        label: '불법 정보(ILLEGAL)',        description: '불법 행위 조장, 불법 다운로드 등' },
  { value: 'SEXUAL',         label: '성적 콘텐츠(SEXUAL)',        description: '과도한 노출, 선정적인 내용' },
  { value: 'VIOLENCE',       label: '폭력적 내용(VIOLENCE)',     description: '위협, 자해·타해 조장, 폭력적인 내용' },
  { value: 'MISINFORMATION', label: '허위 정보(MISINFORMATION)', description: '명백한 거짓 정보, 허위 사실 유포' },
  { value: 'OTHER',          label: '기타(OTHER)',               description: '위의 항목에 모두 해당하지 않는 경우' },
];

export default function ReportPage() {
  const navigate = useNavigate();
  const { postId, commentId } = useParams<{
    postId?: string;
    commentId?: string;
  }>();

  const targetType = postId ? 'post' : 'comment';

  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg(null);
  setSuccessMsg(null);

  // 🔹 1) 신고 사유 선택 안 했으면 막기
  if (!reason) {
    setErrorMsg('신고 사유를 선택해주세요.');
    return;
  }

  // 🔹 2) 지금 어떤 값이 나가는지 먼저 로그 찍기
  console.log('📤 신고 요청 준비', {
    targetType,
    postId,
    commentId,
    body: { reason, detail },
  });

  try {
    setIsSubmitting(true);

    if (targetType === 'post' && postId) {
      await reportPost(postId, { reason, detail });
    } else if (targetType === 'comment' && commentId) {
      await reportComment(commentId, { reason, detail });
    } else {
      throw new Error('신고 대상 정보를 찾을 수 없습니다.');
    }

    setSuccessMsg('신고가 접수되었습니다. 감사합니다.');
    setTimeout(() => {
      navigate(-1);
    }, 800);
  } catch (err: any) {
    console.error('❌ 신고 실패', err);
    console.log(
      'status =',
      err?.response?.status,
      'data =',
      err?.response?.data,
    );

    setErrorMsg(
      err?.response?.data?.message ??
        '신고 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* 상단 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-black/70 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>돌아가기</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
        <h1 className="text-xl font-semibold mb-1">
          {targetType === 'post' ? '게시글 신고하기' : '댓글 신고하기'}
        </h1>
        <p className="text-sm text-black/60 mb-4">
          커뮤니티를 안전하게 유지하기 위해 문제가 있는{' '}
          {targetType === 'post' ? '게시글' : '댓글'}을 신고해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 신고 사유 */}
          <div>
            <h2 className="text-sm font-medium mb-2">신고 사유</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {REASONS.map((item) => (
                <label
                  key={item.value}
                  className={`flex items-start gap-2 rounded-md border px-3 py-2 cursor-pointer transition
                    ${
                      reason === item.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={() => setReason(item.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-black/60">
                      {item.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 상세 설명 */}
          <div>
            <h2 className="text-sm font-medium mb-2">상세 설명 (선택사항)</h2>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="상황을 자세히 적어주시면 검토에 큰 도움이 됩니다."
              className="w-full min-h-[100px] text-sm rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-y"
            />
          </div>

          {/* 메시지 */}
          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
          {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

          {/* 버튼들 */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-black/80 hover:bg-gray-100"
            >
              돌아가기
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {isSubmitting ? '신고 접수 중...' : '신고하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
