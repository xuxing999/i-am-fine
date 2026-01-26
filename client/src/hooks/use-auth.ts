import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

// Frontend User type (camelCase)
export type User = {
  id: string;
  username: string;
  displayName: string;
  contact1Name?: string | null;
  contact1Phone?: string | null;
  contact2Name?: string | null;
  contact2Phone?: string | null;
  lastCheckInAt?: Date | null;
  createdAt?: Date | null;
  timeoutThreshold?: number; // 報平安超時閾值（秒）
};

// Insert User type for registration
export type InsertUser = {
  username: string;
  password: string;
  displayName: string;
  contact1Name?: string;
  contact1Phone?: string;
  contact2Name?: string;
  contact2Phone?: string;
};

// Database User type (snake_case) - matches Supabase schema
type DbUser = {
  id: string;
  username: string;
  display_name: string;
  contact1_name: string | null;
  contact1_phone: string | null;
  contact2_name: string | null;
  contact2_phone: string | null;
  last_check_in_at: string | null;
  created_at: string | null;
  timeout_threshold: number;
};

// Convert database user (snake_case) to frontend user (camelCase)
function dbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    displayName: dbUser.display_name,
    contact1Name: dbUser.contact1_name,
    contact1Phone: dbUser.contact1_phone,
    contact2Name: dbUser.contact2_name,
    contact2Phone: dbUser.contact2_phone,
    lastCheckInAt: dbUser.last_check_in_at ? new Date(dbUser.last_check_in_at) : null,
    createdAt: dbUser.created_at ? new Date(dbUser.created_at) : null,
    timeoutThreshold: dbUser.timeout_threshold,
  };
}

// GET current user
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[useUser] Session error:', sessionError);
        throw sessionError;
      }
      if (!session) return null;

      // Get user profile from database
      // Try with timeout_threshold and created_at first, fallback if columns don't exist
      let { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, contact1_name, contact1_phone, contact2_name, contact2_phone, last_check_in_at, created_at, timeout_threshold')
        .eq('id', session.user.id)
        .single();

      // If timeout_threshold or created_at column doesn't exist, retry without them
      if (error && error.message?.includes('column')) {
        console.warn('[useUser] Some columns not found, falling back to basic query');
        const fallback = await supabase
          .from('users')
          .select('id, username, display_name, contact1_name, contact1_phone, contact2_name, contact2_phone, last_check_in_at')
          .eq('id', session.user.id)
          .single();

        data = fallback.data ? { ...fallback.data, timeout_threshold: 86400 } : fallback.data; // 預設 24 小時
        error = fallback.error;
      }

      if (error) {
        console.error('[useUser] Database error:', error);
        // If user doesn't exist in database, clear session
        if (error.code === 'PGRST116') {
          console.warn('[useUser] User profile not found, signing out');
          await supabase.auth.signOut();
          return null;
        }
        throw error;
      }

      return dbUserToUser(data as DbUser);
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// POST login
export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (credentials: Pick<InsertUser, "username" | "password">) => {
      console.log('[useLogin] Attempting login for:', credentials.username);

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.username + '@gmail.com',
        password: credentials.password,
      });

      if (authError) {
        console.error('[useLogin] Auth error:', authError);
        throw new Error("帳號或密碼錯誤");
      }
      if (!authData.user) {
        console.error('[useLogin] No user data returned');
        throw new Error("登入失敗");
      }

      console.log('[useLogin] Auth successful, user ID:', authData.user.id);

      // Get user profile from database
      // Try with created_at first, fallback if column doesn't exist
      let { data, error: dbError } = await supabase
        .from('users')
        .select('id, username, display_name, contact1_name, contact1_phone, contact2_name, contact2_phone, last_check_in_at, created_at')
        .eq('id', authData.user.id)
        .single();

      // Fallback if created_at column doesn't exist
      if (dbError && dbError.message?.includes('column') && dbError.message?.includes('created_at')) {
        console.warn('[useLogin] created_at column not found, retrying without it');
        const fallback = await supabase
          .from('users')
          .select('id, username, display_name, contact1_name, contact1_phone, contact2_name, contact2_phone, last_check_in_at')
          .eq('id', authData.user.id)
          .single();

        data = fallback.data;
        dbError = fallback.error;
      }

      if (dbError) {
        console.error('[useLogin] Database query error:', dbError);

        // If user profile doesn't exist, try to create it automatically
        if (dbError.code === 'PGRST116') {
          console.warn('[useLogin] User profile not found, creating default profile...');
          console.log('[useLogin] Creating profile with username:', credentials.username);

          const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              username: credentials.username,
              display_name: credentials.username,
              contact1_name: null,
              contact1_phone: null,
              contact2_name: null,
              contact2_phone: null,
            })
            .select()
            .single();

          if (insertError) {
            console.error('[useLogin] Failed to create profile:', insertError);
            console.error('[useLogin] Insert error details:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
            });
            throw new Error(`無法創建使用者資料：${insertError.message}`);
          }

          console.log('[useLogin] Profile created:', insertData);

          // Retry fetching the profile
          // Try with created_at first, fallback if column doesn't exist
          let { data: retryData, error: retryError } = await supabase
            .from('users')
            .select('id, username, display_name, contact1_name, contact1_phone, contact2_name, contact2_phone, last_check_in_at, created_at')
            .eq('id', authData.user.id)
            .single();

          // Fallback if created_at column doesn't exist
          if (retryError && retryError.message?.includes('column') && retryError.message?.includes('created_at')) {
            console.warn('[useLogin] created_at column not found in retry, retrying without it');
            const fallback = await supabase
              .from('users')
              .select('id, username, display_name, contact1_name, contact1_phone, contact2_name, contact2_phone, last_check_in_at')
              .eq('id', authData.user.id)
              .single();

            retryData = fallback.data;
            retryError = fallback.error;
          }

          if (retryError) {
            console.error('[useLogin] Retry fetch error:', retryError);
            throw new Error("無法載入使用者資料");
          }

          console.log('[useLogin] Profile created successfully');
          return dbUserToUser(retryData as DbUser);
        }

        throw new Error(`無法載入使用者資料：${dbError.message}`);
      }

      console.log('[useLogin] Login successful');
      return dbUserToUser(data as DbUser);
    },
    onSuccess: (user) => {
      console.log('[useLogin] Setting user data in cache');
      queryClient.setQueryData(['user'], user);
      toast({ title: "登入成功", description: `歡迎回來，${user.displayName}` });
      setLocation("/");
    },
    onError: (error: Error) => {
      console.error('[useLogin] Login failed:', error);
      toast({
        variant: "destructive",
        title: "登入失敗",
        description: error.message,
      });
    },
  });
}

// POST register
export function useRegister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (userData: InsertUser) => {
      console.log('[useRegister] Starting registration for:', userData.username);

      // Validate password length
      if (userData.password.length < 6) {
        throw new Error("密碼長度至少需要 6 個字元");
      }

      // Create auth user with Supabase Auth, including user metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.username + '@gmail.com',
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            display_name: userData.displayName,
          }
        }
      });

      if (authError) {
        console.error('[useRegister] Auth signup error:', authError);

        // Check if user already exists
        if (authError.message?.includes('already registered') || authError.message?.includes('User already registered')) {
          throw new Error(`此帳號已被註冊，請直接登入`);
        }

        throw new Error(`註冊失敗：${authError.message}`);
      }
      if (!authData.user) {
        console.error('[useRegister] No user data returned from signup');
        throw new Error("註冊失敗：未返回使用者資料");
      }

      console.log('[useRegister] Auth user created, ID:', authData.user.id);

      // Check if user profile already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (existingUser) {
        console.log('[useRegister] User profile already exists, this is OK');
        // User profile already exists (from a previous failed registration)
        // This is fine, just return success
        return authData.user;
      }

      // Insert user profile into database using UPSERT
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          username: userData.username,
          display_name: userData.displayName,
          contact1_name: userData.contact1Name || null,
          contact1_phone: userData.contact1Phone || null,
          contact2_name: userData.contact2Name || null,
          contact2_phone: userData.contact2Phone || null,
          timeout_threshold: 86400, // 預設 24 小時
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (insertError) {
        console.error('[useRegister] Database upsert error:', insertError);
        console.error('[useRegister] Upsert error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });

        // Don't clean up auth user - it might be legitimate
        // Just inform the user to try logging in
        throw new Error(`無法創建使用者資料。如果您已註冊過，請直接登入。`);
      }

      console.log('[useRegister] User profile created successfully:', insertData);

      // Verify the profile was created with correct data
      const { data: verifyData, error: verifyError } = await supabase
        .from('users')
        .select('id, username, display_name')
        .eq('id', authData.user.id)
        .single();

      if (verifyError) {
        console.error('[useRegister] Verification failed:', verifyError);
        await supabase.auth.signOut();
        throw new Error("註冊失敗：無法驗證使用者資料");
      }

      // Verify username and display_name are not null
      if (!verifyData.username || !verifyData.display_name) {
        console.error('[useRegister] Username or display_name is null:', verifyData);
        throw new Error("註冊失敗：用戶資料不完整");
      }

      console.log('[useRegister] Registration completed successfully');
      console.log('[useRegister] Verified user data:', verifyData);
      return authData.user;
    },
    onSuccess: () => {
      console.log('[useRegister] Registration successful, redirecting to login');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: "註冊成功",
        description: "請登入您的新帳號"
      });
      setLocation("/login");
    },
    onError: (error: Error) => {
      console.error('[useRegister] Registration failed:', error);
      toast({
        variant: "destructive",
        title: "註冊失敗",
        description: error.message,
      });
    },
  });
}

// POST logout
export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      console.log('[useLogout] Signing out');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[useLogout] Logout error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[useLogout] Logout successful');
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
      toast({
        title: "已登出",
        description: "期待您下次使用"
      });
      setLocation("/login");
    },
    onError: (error: Error) => {
      console.error('[useLogout] Logout failed:', error);
      toast({
        variant: "destructive",
        title: "登出失敗",
        description: error.message,
      });
    },
  });
}
