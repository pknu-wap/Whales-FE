import { useEffect, useState } from "react";
import api from "@/services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/admin/dashboard/summary")
      .then((res) => setStats(res.data))
      .catch(console.error);
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="대기 중 신고" value={stats.pending} />
        <StatCard title="승인된 신고" value={stats.accepted} />
        <StatCard title="거절된 신고" value={stats.rejected} />
        <StatCard title="차단된 게시글" value={stats.blockedPosts} />
        <StatCard title="차단된 댓글" value={stats.blockedComments} />
        <StatCard title="주의(ORANGE) 유저" value={stats.orangeUsers} />
        <StatCard title="경고(RED) 유저" value={stats.redUsers} />
        <StatCard title="차단된(Banned) 유저" value={stats.bannedUsers} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: any) {
  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      <p className="text-gray-700">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}