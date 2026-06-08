// supabase-config.js — Vovu Supabase client
// This file must be loaded BEFORE main.js on every page that uses auth.

const SUPABASE_URL  = 'https://tzrtuazvzgfiwsmtajkh.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6cnR1YXp2emdmaXdzbXRhamtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTEyNjYsImV4cCI6MjA5NjUyNzI2Nn0.m29Vp8gz1e_J6Ufor2Z9YHffR5Vo6kjvUcFiWOppcZs';

// createClient is exposed on window.supabase by the CDN build
const { createClient } = window.supabase;
window._supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
