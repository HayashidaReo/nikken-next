import { notFound } from "next/navigation";

// このページは直接アクセスされたときに404を表示するためのページです
export default function PublicNotFoundPage() {
    // not-found.tsxが表示されるようにする
    notFound();
}