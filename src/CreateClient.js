import { createClient } from "@supabase/supabase-js";

export const supabase = createClient("https://djgtacpgehthspfctcxv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZ3RhY3BnZWh0aHNwZmN0Y3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU2MjE4MzcsImV4cCI6MjA0MTE5NzgzN30.-cbzPiA_PtcwQuZjMAKRTT-Vj9kMQcg0BBMENAjuTjQ")
