import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DownloadStatus } from "@/components/DownloadStatus";

export const metadata: Metadata = { title: "Baixar arquivo", robots: { index: false, follow: false, nocache: true } };
export default async function DownloadPage({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; if (!/^[A-Za-z0-9_-]{32}$/.test(token)) notFound(); return <div className="container download-page"><DownloadStatus token={token}/></div>; }
