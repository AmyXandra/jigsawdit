import { useState } from 'react';
import { X } from 'lucide-react';

interface ReferenceImageProps {
  imageUrl: string;
}

export const ReferenceImage = ({
  imageUrl,
}: ReferenceImageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        {/* <button
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md border-2 border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Image className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isVisible ? 'Hide' : 'Show'} Reference
          </span>
        </button> */}

        {/* {isVisible && ( */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer border-4 border-white shadow-lg rounded-lg overflow-hidden hover:scale-105 transition-transform"
          >
            <img
              src={imageUrl}
              alt="Reference"
              className="w-10 h-10 object-cover"
            />
          </div>
        {/* )} */}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={imageUrl}
              alt="Reference full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};
