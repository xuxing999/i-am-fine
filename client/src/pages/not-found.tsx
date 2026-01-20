import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md w-full">
        <div className="mx-auto h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-10 w-10 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-8">找不到此頁面</p>
        
        <Link href="/" className="block w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
          返回首頁
        </Link>
      </div>
    </div>
  );
}
