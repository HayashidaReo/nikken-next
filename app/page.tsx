import { redirect } from "next/navigation";

export default function Home() {
  // ログイン画面へリダイレクト
  redirect("/login");
}
