import { useEffect, useState } from "react";
import api from "@/services/api";

export default function ModerationPage() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    api.get("/admin/moderation/posts").then((res) => setPosts(res.data));
    api.get("/admin/moderation/comments").then((res) => setComments(res.data));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">차단된 콘텐츠 관리</h1>

      <Section title="차단된 게시글" items={posts} field="title" />
      <Section title="차단된 댓글" items={comments} field="body" />
    </div>
  );
}

function Section({ title, items, field }: any) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      {items.length === 0 && <p className="text-gray-500">없음</p>}

      <ul className="border rounded divide-y bg-white shadow-sm">
        {items.map((item: any) => (
          <li key={item.id} className="p-3">
            <p className="font-semibold">{item[field]}</p>
            {/* status 제거 */}
            <p className="text-sm text-gray-500">{item.authorName}</p>
            <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}