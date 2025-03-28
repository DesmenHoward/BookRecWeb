import React from 'react';
import { LogOut } from 'lucide-react';

const THEME = {
  primary: '#7D6E83',
  accent: '#A75D5D',
  background: '#F9F5EB',
  surface: '#EFE3D0',
  text: '#4F4557',
  textLight: '#7D6E83',
  border: '#D0B8A8'
};

interface LogoutSplashScreenProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutSplashScreen({ visible, onConfirm, onCancel }: LogoutSplashScreenProps) {
  const [animation, setAnimation] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setAnimation(true);
    } else {
      setAnimation(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      <div 
        className={`bg-white rounded-2xl p-6 w-[85%] max-w-md flex flex-col items-center transform transition-all duration-300 ${
          animation ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <div 
          className="bg-[#EFE3D0] rounded-full p-4 mb-4"
          style={{ backgroundColor: THEME.surface }}
        >
          <LogOut size={40} color={THEME.accent} />
        </div>
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: THEME.text }}
        >
          Log Out
        </h2>
        <p 
          className="text-base text-center mb-6"
          style={{ color: THEME.textLight }}
        >
          Are you sure you want to log out?
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-full border text-base font-semibold transition-colors"
            style={{ 
              borderColor: THEME.border,
              color: THEME.text
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-full text-white text-base font-semibold transition-colors"
            style={{ backgroundColor: THEME.accent }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
