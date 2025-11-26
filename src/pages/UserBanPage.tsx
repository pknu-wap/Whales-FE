import { useEffect, useState } from "react";
import api from "@/services/api";

export default function UserBanPage() {
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    api.get("/admin/moderation/users/badge/ORANGE")
      .then((r) => setUsers(r.data))
      .catch(console.error);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const banUser = async (id: string) => {
    await api.post(`/admin/users/${id}/ban`);
    loadUsers();
  };

  const unbanUser = async (id: string) => {
    await api.post(`/admin/users/${id}/unban`);
    loadUsers();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">주의/경고 유저 관리</h1>

      {users.length === 0 && (
        <p className="text-gray-500">해당 등급의 유저가 없습니다.</p>
      )}

      {users.map((u: any) => (
        <div
          key={u.id}
          className="p-3 border rounded flex justify-between items-center bg-white shadow"
        >
          <div>
            <p className="font-semibold">{u.displayName}</p>
            <p className="text-sm text-gray-600">{u.email}</p>
            <p className="text-xs text-gray-500">badge: {u.badgeColor}</p>
          </div>

          <div className="space-x-2">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded"
              onClick={() => banUser(u.id)}
            >
              정지
            </button>

            <button
              className="px-3 py-1 bg-green-600 text-white rounded"
              onClick={() => unbanUser(u.id)}
            >
              정지 해제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}