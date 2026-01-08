import { createClient } from "@supabase/supabase-js";

// DEBUG - Vérification des variables d'environnement
console.log("DEBUG Signup - URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("DEBUG Signup - KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function Signup() {
  const handleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      console.error("Erreur Google Auth:", error.message);
    }
  };

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