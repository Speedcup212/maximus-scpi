import React, { useState } from "react";
import { supabase } from "../lib/supabase";

const PingSupabase: React.FC = () => {
  const [result, setResult] = useState<string>("");

  const handlePing = async () => {
    try {
      const { data, error } = await supabase.from("pg_tables").select("*").limit(1);
      if (error) throw error;
      setResult("✅ Connexion Supabase OK");
    } catch (err) {
      setResult("❌ Erreur connexion : " + (err as Error).message);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handlePing}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Tester connexion Supabase
      </button>
      <p className="mt-2">{result}</p>
    </div>
  );
};

export default PingSupabase;