import { supabase, requireSupabase } from "../lib/supabase";

export default function Signup() {
  const handleSignup = async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      console.error("Erreur Google Auth:", error.message);
    }
  };

  if (!supabase) {
    return (
      <div className="flex items-center justify-center h-screen px-6">
        <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-200">
          Supabase n'est pas configuré. Configurez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={handleSignup}
        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
      >
        Commencer gratuitement
      </button>
    </div>
  );
}