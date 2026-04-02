const url = 'https://risvfdlhmnwvkngkllgn.supabase.co/functions/v1/tmdb?action=popular&type=movie';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc3ZmZGxobW53dmtuZ2tsbGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDc2OTEsImV4cCI6MjA4OTUyMzY5MX0.0ZAk-tdybtxHqvTkcbfVgoG18hzPupXGGT03GUbnssM';

fetch(url, { headers: { Authorization: `Bearer ${key}`, apikey: key }})
  .then(res => res.text().then(text => console.log(res.status, text.substring(0, 500))))
  .catch(err => console.error(err));
