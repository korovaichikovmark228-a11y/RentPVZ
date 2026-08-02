import { notFound } from "next/navigation";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Админ · Рядом.Аренда",
};

// Секретный путь: домен/<ADMIN_CODE>. Код хранится в переменной окружения,
// в публичный репозиторий не попадает. Любой другой путь — обычный 404.
export default function AdminGate({ params }) {
  const admin = process.env.ADMIN_CODE;
  if (!admin || params.code !== admin) {
    notFound();
  }
  return <Dashboard code={params.code} />;
}
