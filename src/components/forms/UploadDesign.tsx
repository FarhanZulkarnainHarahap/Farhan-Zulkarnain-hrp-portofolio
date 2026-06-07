// components/forms/UploadDesign.tsx
export default function UploadDesign({ type }: { type: string }) {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Upload {type}</h2>
        <p className="text-gray-500 text-sm">Complete the data below to add a new {type}.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name {type}</label>
          <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter name..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition cursor-pointer">
            <div className="text-4xl mb-2">☁️</div>
            <p className="text-gray-600 text-sm">Click to upload or drag and drop</p>
            <p className="text-gray-400 text-xs mt-1">PNG, JPG, or PDF (Max 5MB)</p>
          </div>
        </div>

        {type === "portfolio" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
            <textarea className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3}></textarea>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200">Save Data</button>
        </div>
      </div>
    </div>
  );
}
