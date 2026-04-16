import { supabase } from '@/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
// User type reserved for future auth features

export interface AuthUser {
  id: string;
  email: string;
  pin?: number;
  isAdmin: boolean;
}

export class AuthService {
  static async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Verifica PIN o ruolo admin
    const pin = this.getPin(data.session);
    const isAdmin = this.isAdmin(data.session);

    if (!pin && !isAdmin) {
      await this.logout();
      throw new Error("PIN non configurato. Contatta l'amministratore.");
    }

    return data;
  }

  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser(): Promise<unknown | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  }

  static onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session);
    });
  }

  static isAdmin(session: Session | null): boolean {
    if (!session?.user) return false;
    return session.user.app_metadata?.badgenode_role === 'admin';
  }

  static getPin(session: Session | null): number | null {
    if (!session?.user) return null;

    const user = session.user;

    // Cerca PIN in ordine: top-level → user_metadata → app_metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- supabase user structure varies
    const pin = (user as any).pin || user.user_metadata?.pin || user.app_metadata?.pin;

    if (typeof pin === 'number' && pin >= 1 && pin <= 99) {
      return pin;
    }

    return null;
  }

  static getUserInfo(session: Session | null): AuthUser | null {
    if (!session?.user) return null;

    return {
      id: session.user.id,
      email: session.user.email || '',
      pin: this.getPin(session) || undefined,
      isAdmin: this.isAdmin(session),
    };
  }
}
