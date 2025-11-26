import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    api.get(`/admin/reports/${id}/detail`)
      .then((res) => setReport(res.data))
      .catch(console.error);
  }, [id]);

  if (!report) return <p>Loading...</p>;

  const process = (status: "ACCEPTED" | "REJECTED") => {
    api.patch(`/admin/reports/${id}/process`, { status, note })
      .then(() => {
        alert("처리 완료!");
        navigate("/admin/reports");
      });
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">신고 상세</h1>

      <div className="space-y-2">
        <p><b>유형:</b> {report.targetType}</p>
        <p><b>사유:</b> {report.reason}</p>
        <p><b>상세:</b> {report.detail || "(내용 없음)"}</p>
      </div>

      <textarea
        placeholder="관리자 메모"
        className="w-full border p-2 rounded"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex gap-2">
        <button className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={() => process("ACCEPTED")}
        >
          신고 승인(차단)
        </button>
        <button className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={() => process("REJECTED")}
        >
          신고 거절
        </button>
      </div>
    </div>
  );
}