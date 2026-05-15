import Link from "next/link";

export default function InvalidQrPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto">
          <span className="text-2xl text-red-500">✕</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Invalid or expired QR code</h1>
        <p className="text-sm text-gray-500">
          This QR code is no longer valid. Please ask an organizer to share a fresh link or QR code.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
