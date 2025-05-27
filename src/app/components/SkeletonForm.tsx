export default function SkeletonForm() {
    return (
      <div className="w-full max-w-lg space-y-6 animate-pulse">
        {/* Başlık için skeleton */}
        <div className="flex flex-col items-center">
          <div className="h-8 w-48 bg-gray-300 rounded"></div>
        </div>
  
        {/* Form alanları için skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-full bg-gray-300 rounded"></div>
          <div className="h-10 w-full bg-gray-300 rounded"></div>
          <div className="h-10 w-full bg-gray-300 rounded"></div>
        </div>
  
        {/* Buton için skeleton */}
        <div className="h-12 w-full bg-gray-300 rounded"></div>
  
        {/* "veya" bölümü için skeleton */}
        <div className="flex items-center gap-x-3">
          <span className="h-px flex-1 bg-gray-300"></span>
          <div className="h-4 w-12 bg-gray-300 rounded"></div>
          <span className="h-px flex-1 bg-gray-300"></span>
        </div>
  
        {/* Sosyal medya butonları için skeleton */}
        <div className="flex justify-center gap-3">
          <div className="h-12 w-12 bg-gray-300 rounded"></div>
          <div className="h-12 w-12 bg-gray-300 rounded"></div>
          <div className="h-12 w-12 bg-gray-300 rounded"></div>
        </div>
  
        {/* "Zaten hesabınız var mı?" linki için skeleton */}
        <div className="h-6 w-48 mx-auto bg-gray-300 rounded"></div>
      </div>
    );
  }