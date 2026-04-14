import fs from "fs";

const supabaseUrl = "https://risvfdlhmnwvkngkllgn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc3ZmZGxobW53dmtuZ2tsbGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDc2OTEsImV4cCI6MjA4OTUyMzY5MX0.0ZAk-tdybtxHqvTkcbfVgoG18hzPupXGGT03GUbnssM";

async function testTmdbSearch(query) {
  const queryParams = new URLSearchParams({ action: "search", query, include_adult: "true" });
  const reqUrl = `${supabaseUrl}/functions/v1/tmdb?${queryParams.toString()}`;
  
  const res = await fetch(reqUrl, {
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
    },
  });
  const data = await res.json();
  return { query, results: data.results?.slice(0, 3) || [] };
}

async function main() {
  const results = [];
  results.push(await testTmdbSearch("Stepdaddy"));
  results.push(await testTmdbSearch("Scorpio Nights 4"));
  results.push(await testTmdbSearch("Tuklas"));
  results.push(await testTmdbSearch("Sundutan"));
  
  fs.writeFileSync("out.json", JSON.stringify(results, null, 2));
}

main();
