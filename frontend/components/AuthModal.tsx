'use client'
import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Button } from './ui/button';

// ĐỊNH NGHĨA HOÀN CHỈNH VỚI TẤT CẢ CÁC PROPS
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Prop này đã có
  mode: 'login' | 'signup'; // Prop này đã có
  onSwitchMode: (newMode: 'login' | 'signup') => void; // Prop này đã có
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, mode, onSwitchMode }) => {
  const supabase = createClient();

  // Lắng nghe sự kiện đăng nhập/đăng ký thành công
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        onSuccess(); // Gọi hàm onSuccess khi đăng nhập thành công
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-card p-8 rounded-lg shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-center mb-6">
          {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          view={mode === 'login' ? 'sign_in' : 'sign_up'}
          providers={['google', 'github']}
          redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`}
          showLinks={false} // Ẩn các link chuyển đổi mặc định
        />
        <div className="text-center mt-4">
          {mode === 'login' ? (
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => onSwitchMode('signup')}>
                Sign up
              </Button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => onSwitchMode('login')}>
                Sign in
              </Button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
