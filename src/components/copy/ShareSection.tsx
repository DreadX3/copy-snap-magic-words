import React from 'react';

interface ShareSectionProps {
  text: string;
  imageUrl: string | null;
}

const ShareSection: React.FC<ShareSectionProps> = ({ text, imageUrl }) => {
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };
  
  const handleShare = () => {
    copyToClipboard(text);
  };
  
  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };
  
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(facebookUrl, '_blank');
  };
  
  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(linkedInUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <h4 className="text-md font-semibold">Compartilhe sua copy</h4>
      
      <div className="flex space-x-4">
        <button
          onClick={handleShare}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Copiar
        </button>
        
        <button
          onClick={shareOnTwitter}
          className="bg-brand-500 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Twitter
        </button>
        
        <button
          onClick={shareOnFacebook}
          className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Facebook
        </button>
        
        <button
          onClick={shareOnLinkedIn}
          className="bg-blue-700 hover:bg-blue-900 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          LinkedIn
        </button>
      </div>
      
      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Imagem para compartilhar" className="max-w-full h-auto rounded-md" />
        </div>
      )}
    </div>
  );
};

export default ShareSection;
