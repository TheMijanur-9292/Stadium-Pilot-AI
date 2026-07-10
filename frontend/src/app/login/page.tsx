'use client';
import Input from '@/components/Input';
import Button from '@/components/Button';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useStore, UserRole } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, Chip } from '@heroui/react';
import { Mail, Lock, LogIn, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

type LoginInputs = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const { setAuth, user } = useStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  if (!mounted) {
    return null;
  }

  const onSubmit = async (data: LoginInputs) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', data);
      const { access_token, user: userData } = response.data;
      setAuth(userData, access_token);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Failed to sign in. Please verify your credentials.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role: UserRole) => {
    let email = '';
    let password = 'Password@123'; // Default fallback

    switch (role) {
      case 'ADMIN':
        email = 'admin@stadiumpilot.com';
        password = 'Admin@123';
        break;
      case 'ORGANIZER':
        email = 'organizer@stadiumpilot.com';
        password = 'Organizer@123';
        break;
      case 'VENUE_STAFF':
        email = 'staff@stadiumpilot.com';
        password = 'Staff@123';
        break;
      case 'VOLUNTEER':
        email = 'volunteer@stadiumpilot.com';
        password = 'Volunteer@123';
        break;
      case 'FAN':
      default:
        email = 'fan@stadiumpilot.com';
        password = 'Fan@123';
        break;
    }

    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 pt-24 pb-12 relative overflow-hidden">
      {/* Top Navbar */}
      <header className="glass-nav fixed top-0 left-0 right-0 z-50 w-full">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              StadiumPilot AI
            </span>
            <Chip size="sm" variant="soft" color="accent" className="text-[10px] font-semibold">
              WC 2026
            </Chip>
          </Link>
          <div className="flex gap-3">
            <Button
              href="/"
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Dynamic background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            StadiumPilot AI
          </Link>
          <h2 className="text-xl font-semibold text-foreground">Welcome Back</h2>
          <p className="text-xs text-default-500">
            Sign in to access your contextual smart stadium dashboard.
          </p>
        </div>

        <Card className="glass-card shadow-2xl">
          <CardContent className="p-8 space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-danger-50 text-danger p-4 text-xs">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <label className="block text-xs font-semibold text-default-600 mb-1">Email Address</label>
<Input
                {...register('email')}
                
                placeholder="you@stadiumpilot.com"
                
                startContent={<Mail size={16} className="text-default-400" />}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                variant="primary"
                
              />

              <label className="block text-xs font-semibold text-default-600 mb-1">Password</label>
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                startContent={<Lock size={16} className="text-default-400" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none text-default-400 hover:text-foreground transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                variant="primary"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-default-500">
                  <input type="checkbox" className="rounded border-default-300" />
                  <span>Remember me</span>
                </label>
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full font-semibold mt-2"
                
                isLoading={loading}
                endContent={<LogIn size={16} />}
              >
                Sign In
              </Button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-default-100"></div>
              </div>
              <span className="relative bg-content1 px-3 text-[10px] text-default-400 uppercase tracking-wider">
                Demo Accounts Quick-Fill
              </span>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <Button
                size="sm"
                variant="ghost"
                color="primary"
                onPress={() => handleDemoFill('FAN')}
                className="text-[10px] font-semibold rounded-xl"
              >
                Fan Demo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                color="success"
                onPress={() => handleDemoFill('VOLUNTEER')}
                className="text-[10px] font-semibold rounded-xl"
              >
                Volunteer Demo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                color="warning"
                onPress={() => handleDemoFill('VENUE_STAFF')}
                className="text-[10px] font-semibold rounded-xl"
              >
                Staff Demo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                color="secondary"
                onPress={() => handleDemoFill('ORGANIZER')}
                className="text-[10px] font-semibold rounded-xl"
              >
                Organizer Demo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                color="danger"
                onPress={() => handleDemoFill('ADMIN')}
                className="col-span-2 text-[10px] font-semibold rounded-xl"
              >
                Admin Demo
              </Button>
            </div>

            <p className="text-center text-xs text-default-500">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary-500 font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}







