export default function InvalidQrPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm">
        <div className="mb-4 text-6xl">X</div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Invalid QR Code</h1>
        <p className="text-gray-500">This QR code is not valid or has already been used.</p>
      </div>
    </div>
  );
}
