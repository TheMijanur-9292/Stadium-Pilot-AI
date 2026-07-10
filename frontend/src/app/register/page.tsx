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
import { Mail, Lock, User as UserIcon, Shield, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

const registerSchema = zod.object({
  fullName: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
  role: zod.enum(['FAN', 'VOLUNTEER', 'VENUE_STAFF', 'ORGANIZER'] as const, {
    message: 'Please select a valid tournament role',
  }),
});

type RegisterInputs = zod.infer<typeof registerSchema>;

export default function RegisterPage() {
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
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'FAN',
    },
  });

  if (!mounted) {
    return null;
  }

  const onSubmit = async (data: RegisterInputs) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', data);
      const { access_token, user: userData } = response.data;
      setAuth(userData, access_token);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Signup failed. Please try a different email address.',
      );
    } finally {
      setLoading(false);
    }
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

      {/* Background glow effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            StadiumPilot AI
          </Link>
          <h2 className="text-xl font-semibold text-foreground">Create Account</h2>
          <p className="text-xs text-default-500">
            Sign up to coordinate your FIFA World Cup 2026 operations.
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
              <label className="block text-xs font-semibold text-default-600 mb-1">Full Name</label>
<Input
                {...register('fullName')}
                
                placeholder="Frankie Fan"
                
                startContent={<UserIcon size={16} className="text-default-400" />}
                isInvalid={!!errors.fullName}
                errorMessage={errors.fullName?.message}
                variant="primary"
                
              />

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

              {/* Role Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground block pl-1">
                  Select Your Platform Role
                </label>
                <div className="relative">
                  <select
                    {...register('role')}
                    className="w-full bg-transparent border-2 border-default-200 hover:border-default-400 focus:border-primary-500 rounded-xl px-3 py-2 text-sm text-default-700 outline-none transition-all cursor-pointer dark:text-default-300"
                  >
                    <option value="FAN" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Fan (Spectator)</option>
                    <option value="VOLUNTEER" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Volunteer (Event Crew)</option>
                    <option value="VENUE_STAFF" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Venue Staff (Operations)</option>
                    <option value="ORGANIZER" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Tournament Organizer (Executive)</option>
                  </select>
                </div>
                {errors.role && (
                  <p className="text-[10px] text-danger pl-1 mt-0.5">{errors.role.message}</p>
                )}
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full font-semibold mt-4"
                
                isLoading={loading}
                endContent={<ArrowRight size={16} />}
              >
                Sign Up
              </Button>
            </form>

            <p className="text-center text-xs text-default-500">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-500 font-semibold hover:underline">
                Log In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}







