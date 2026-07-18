(() => {
  const MAX_BYTES = 10_485_760;
  const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
  const summary = () => ({ imported: 0, skipped: 0, duplicate: 0, failed: 0, errors: [], editions: {} });
  const readJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
  const dataUrlFile = (value, filename) => {
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/=]+)$/i.exec(String(value || ""));
    if (!match || !ALLOWED.has(match[1].toLowerCase())) throw new Error("Imagem local inválida ou não suportada.");
    const bytes = Uint8Array.from(atob(match[2]), (character) => character.charCodeAt(0));
    if (!bytes.length || bytes.length > MAX_BYTES) throw new Error("Imagem local vazia ou grande demais.");
    return new File([bytes], filename, { type: match[1].toLowerCase() });
  };
  const record = (result, response) => { if (response?.duplicate) result.duplicate += 1; else result.imported += 1; };
  const attempt = async (result, label, operation) => { try { record(result, await operation()); return true; } catch (error) { result.failed += 1; result.errors.push(`${label}: ${error.message}`); return false; } };

  const importAsset = async (result, edition, slot, dataUrl, legacyId, order = 0) => {
    if (!dataUrl) { result.skipped += 1; return true; }
    let file;
    try { file = dataUrlFile(dataUrl, `${slot}-${order}.png`); } catch (error) { result.skipped += 1; result.errors.push(`${edition}/${slot}: ${error.message}`); return false; }
    const body = new FormData(); body.set("file", file); body.set("legacy_id", legacyId); body.set("sort_order", String(order));
    return attempt(result, `${edition}/${slot}`, () => window.MemoraAPI.put(`/api/manager/editions/${encodeURIComponent(edition)}/assets/${slot}`, body));
  };

  const run = async () => {
    const result = summary();
    const memberships = await window.MemoraAPI.get("/api/manager/editions");
    const allowed = new Set(memberships.filter((item) => ["owner", "manager", "editor"].includes(item.role)).map((item) => item.slug));
    const feed = readJson("memora:difusora:feed", []);
    for (const edition of allowed) {
      let complete = true;
      const editionResult = { accepted: 0, complete: false };
      result.editions[edition] = editionResult;
      for (const post of feed.filter((item) => item?.editionId === edition && item.text)) {
        editionResult.accepted += 1;
        complete = (await attempt(result, `${edition}/difusora`, () => window.MemoraAPI.post(`/api/manager/editions/${encodeURIComponent(edition)}/difusora`, { text: String(post.text).slice(0, 180), tag: post.tag || "comunicado", legacy_id: String(post.id || `difusora-${post.createdAt || post.text}`) }))) && complete;
      }
      const singles = [["cardFront", "card_front"], ["cardBack", "card_back"], ["editionCover", "edition_cover"]];
      for (const [key, slot] of singles) {
        const value = localStorage.getItem(`memora:${edition}:${key}`);
        if (value) { editionResult.accepted += 1; complete = (await importAsset(result, edition, slot, value, `local-${key}`)) && complete; }
      }
      const wallpapers = readJson(`memora:${edition}:wallpapers`, []);
      for (let index = 0; index < wallpapers.length; index += 1) {
        const value = typeof wallpapers[index] === "string" ? wallpapers[index] : wallpapers[index]?.src;
        if (!value) { result.skipped += 1; continue; }
        editionResult.accepted += 1; complete = (await importAsset(result, edition, "wallpaper", value, `local-wallpaper-${index}`, index)) && complete;
      }
      editionResult.complete = complete;
      if (complete) localStorage.setItem(`memora:migration:${edition}:complete`, new Date().toISOString());
    }
    return result;
  };
  window.MemoraLocalMigration = { run };
})();
