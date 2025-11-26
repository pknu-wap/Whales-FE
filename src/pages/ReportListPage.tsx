import { useEffect, useState } from "react";
import api from "@/services/api";
import { Link } from "react-router-dom";

export default function ReportListPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    api.get("/admin/reports")
      .then((res) => setReports(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">신고 목록</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">ID</th>
            <th>유형</th>
            <th>사유</th>
            <th>상태</th>
            <th>상세보기</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id} className="border-b text-center">
              <td className="p-2">{r.id.slice(0, 6)}...</td>
              <td>{r.targetType}</td>
              <td>{r.reason}</td>
              <td>{r.status}</td>
              <td>
                <Link className="text-blue-500" to={`/admin/reports/${r.id}`}>
                  상세
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}