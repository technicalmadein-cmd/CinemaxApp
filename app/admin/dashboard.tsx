import Icon from "@react-native-vector-icons/ionicons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { apiRequest, API_URL, getAccessToken } from "@/src/auth/api";
import { useAuth } from "@/src/auth/context";
import { colors, radius, spacing } from "@/src/theme";
import { uploadForm } from "@/src/utils/upload";

type TabKey = "dashboard" | "movies" | "series" | "banners" | "users";

export default function AdminHome() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const { user, signOut } = useAuth();
  const router = useRouter();

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "speedometer-outline" },
    { key: "movies", label: "Movies", icon: "film-outline" },
    { key: "series", label: "Web Series", icon: "tv-outline" },
    { key: "banners", label: "Banners", icon: "image-outline" },
    { key: "users", label: "Users", icon: "people-outline" },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.sidebar}>
        <Text style={styles.logo}>Cine<Text style={{ color: colors.brandPrimary }}>Max</Text></Text>
        <Text style={styles.logoSub}>Admin Console</Text>
        <View style={{ marginTop: spacing.xl, gap: 4 }}>
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <Pressable key={t.key} testID={`side-${t.key}`} style={[styles.sideBtn, on && styles.sideBtnOn]} onPress={() => setTab(t.key)}>
                <Icon name={t.icon as any} size={18} color={on ? colors.onBrandPrimary : colors.onSurface} />
                <Text style={[styles.sideTxt, on && { color: colors.onBrandPrimary }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flex: 1 }} />
        <Pressable testID="admin-view-app" onPress={() => router.replace("/(tabs)/home")} style={styles.sideBtn}>
          <Icon name="phone-portrait-outline" size={18} color={colors.onSurface} />
          <Text style={styles.sideTxt}>View App</Text>
        </Pressable>
        <Pressable testID="admin-logout" onPress={async () => { await signOut(); router.replace("/admin/login"); }} style={[styles.sideBtn, { borderColor: colors.error, borderWidth: 1 }]}>
          <Icon name="log-out-outline" size={18} color={colors.error} />
          <Text style={[styles.sideTxt, { color: colors.error }]}>Logout</Text>
        </Pressable>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }}>
        <Text style={styles.pageTitle}>{TABS.find((t) => t.key === tab)!.label}</Text>
        <Text style={styles.pageSub}>Signed in as {user?.email}</Text>
        {tab === "dashboard" && <Dashboard />}
        {tab === "movies" && <MoviesPanel />}
        {tab === "series" && <SeriesPanel />}
        {tab === "banners" && <BannersPanel />}
        {tab === "users" && <UsersPanel />}
      </ScrollView>
    </View>
  );
}

function Dashboard() {
  const q = useQuery({ queryKey: ["admin-stats"], queryFn: () => apiRequest<any>("/api/admin/stats") });
  const s = q.data || {};
  const cards = [
    { label: "Total Movies", value: s.movies ?? "—", icon: "film-outline" },
    { label: "Published", value: s.published_movies ?? "—", icon: "checkmark-circle-outline" },
    { label: "Series", value: s.series ?? "—", icon: "tv-outline" },
    { label: "Episodes", value: s.episodes ?? "—", icon: "list-outline" },
    { label: "Users", value: s.users ?? "—", icon: "people-outline" },
    { label: "Total Views", value: s.views ?? "—", icon: "eye-outline" },
  ];
  return (
    <View style={styles.grid}>
      {cards.map((c) => (
        <View key={c.label} style={styles.statCard} testID={`stat-${c.label}`}>
          <Icon name={c.icon as any} size={22} color={colors.brandPrimary} />
          <Text style={styles.statVal}>{String(c.value)}</Text>
          <Text style={styles.statLbl}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

function MoviesPanel() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin-movies"], queryFn: () => apiRequest<any[]>("/api/admin/movies") });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-movies"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); };

  return (
    <View style={{ marginTop: spacing.lg }}>
      <View style={styles.toolbar}>
        <Pressable testID="new-movie" style={styles.primaryBtn} onPress={() => { setEditing(null); setOpen(true); }}>
          <Icon name="add" size={16} color={colors.onBrandPrimary} />
          <Text style={styles.primaryBtnTxt}>Upload New Movie</Text>
        </Pressable>
      </View>

      <View style={styles.table}>
        <View style={[styles.row, styles.rowHead]}>
          <Text style={[styles.cell, { flex: 2 }]}>Title</Text>
          <Text style={styles.cell}>Lang</Text>
          <Text style={styles.cell}>Year</Text>
          <Text style={styles.cell}>Status</Text>
          <Text style={[styles.cell, { textAlign: "right" }]}>Actions</Text>
        </View>
        {list.isLoading && <ActivityIndicator color={colors.brandPrimary} style={{ margin: 20 }} />}
        {(list.data ?? []).map((m) => (
          <View key={m.id} style={styles.row} testID={`admin-movie-${m.id}`}>
            <Text style={[styles.cell, { flex: 2, color: colors.onSurface }]} numberOfLines={1}>{m.title}</Text>
            <Text style={styles.cell}>{m.language}</Text>
            <Text style={styles.cell}>{m.release_year || "—"}</Text>
            <View style={styles.cell}><Badge published={m.published} ready={!!m.video_path} /></View>
            <View style={[styles.cell, { flexDirection: "row", justifyContent: "flex-end", gap: 6 }]}>
              <SmallBtn label="Edit" testID={`edit-${m.id}`} onPress={() => { setEditing(m); setOpen(true); }} />
              {m.published ? (
                <SmallBtn label="Unpublish" testID={`unpub-${m.id}`} onPress={async () => { await apiRequest(`/api/admin/movies/${m.id}/unpublish`, { method: "POST" }); refresh(); }} />
              ) : (
                <SmallBtn label="Publish" testID={`pub-${m.id}`} highlight onPress={async () => {
                  try { await apiRequest(`/api/admin/movies/${m.id}/publish`, { method: "POST" }); refresh(); }
                  catch (e: any) { alert(e.message); }
                }} />
              )}
              <SmallBtn label="Delete" testID={`del-${m.id}`} danger onPress={async () => { if (confirm?.("Delete this movie?")) { await apiRequest(`/api/admin/movies/${m.id}`, { method: "DELETE" }); refresh(); } }} />
            </View>
          </View>
        ))}
        {(list.data ?? []).length === 0 && !list.isLoading && <Text style={styles.empty}>No movies yet. Click "Upload New Movie" to add one.</Text>}
      </View>

      {open && <MovieFormModal movie={editing} onClose={() => { setOpen(false); refresh(); }} />}
    </View>
  );
}

function Badge({ published, ready }: { published: boolean; ready: boolean }) {
  const label = published ? "Published" : ready ? "Ready" : "Draft";
  const bg = published ? colors.success : ready ? colors.info : colors.muted;
  return <View style={{ alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: bg + "33", borderWidth: 1, borderColor: bg }}><Text style={{ color: bg, fontSize: 11, fontWeight: "700" }}>{label}</Text></View>;
}

function SmallBtn({ label, onPress, danger, highlight, testID }: any) {
  return (
    <Pressable testID={testID} onPress={onPress} style={[styles.smallBtn, danger && { borderColor: colors.error }, highlight && { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary }]}>
      <Text style={[styles.smallBtnTxt, danger && { color: colors.error }, highlight && { color: colors.onBrandPrimary }]}>{label}</Text>
    </Pressable>
  );
}

function MovieFormModal({ movie, onClose }: any) {
  const isEdit = !!movie;
  const [form, setForm] = useState({
    title: movie?.title || "",
    description: movie?.description || "",
    language: movie?.language || "English",
    genres: (movie?.genres || []).join(", "),
    release_year: String(movie?.release_year || ""),
    duration_minutes: String(movie?.duration_minutes || ""),
    cast: (movie?.cast || []).join(", "),
    director: movie?.director || "",
    poster_url: movie?.poster_url || "",
    backdrop_url: movie?.backdrop_url || "",
    video_path: movie?.video_path || "",
    rights_confirmed: !!movie?.rights_confirmed,
  });
  const [saving, setSaving] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [uploadMsg, setUploadMsg] = useState("");

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        language: form.language,
        genres: form.genres.split(",").map((s) => s.trim()).filter(Boolean),
        release_year: form.release_year ? Number(form.release_year) : null,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        cast: form.cast.split(",").map((s) => s.trim()).filter(Boolean),
        director: form.director,
        poster_url: form.poster_url,
        backdrop_url: form.backdrop_url,
        video_path: form.video_path,
        rights_confirmed: form.rights_confirmed,
      };
      if (isEdit) await apiRequest(`/api/admin/movies/${movie.id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await apiRequest(`/api/admin/movies`, { method: "POST", body: JSON.stringify(body) });
      onClose();
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };

  const pickImage = async (field: "poster_url" | "backdrop_url") => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.9 });
    if (res.canceled) return;
    const a = res.assets[0];
    setUploadMsg(`Uploading ${field}...`);
    try {
      const resp = await uploadForm(`${API_URL}/api/upload`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        fields: { kind: "image" },
        files: { file: { uri: a.uri, name: a.fileName || "image.jpg", mimeType: a.mimeType } },
      });
      const j = await resp.json();
      if (!resp.ok) throw new Error(j.detail || "Upload failed");
      set(field, `${API_URL}${j.url}`);
      setUploadMsg("");
    } catch (e: any) { setUploadMsg(`Error: ${e.message}`); }
  };

  const pickVideo = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: "video/*", copyToCacheDirectory: true });
    if (res.canceled) return;
    const a = res.assets[0];
    setUploadPct(0); setUploadMsg(`Uploading ${a.name} (${((a.size || 0) / 1024 / 1024).toFixed(1)} MB)...`);
    try {
      // XHR for native-style progress on web
      if (Platform.OS === "web") {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const fd = new FormData();
          fd.append("kind", "video");
          // On web, DocumentPicker gives file.uri as blob URL or data URL
          fetch(a.uri).then((r) => r.blob()).then((b) => {
            fd.append("file", b, a.name || "video.mp4");
            xhr.open("POST", `${API_URL}/api/upload`);
            xhr.setRequestHeader("Authorization", `Bearer ${getAccessToken()}`);
            xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setUploadPct(Math.round((ev.loaded / ev.total) * 100)); };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const j = JSON.parse(xhr.responseText);
                set("video_path", j.path); setUploadMsg(`Uploaded: ${a.name}`); setUploadPct(100); resolve();
              } else reject(new Error(xhr.responseText || "Upload failed"));
            };
            xhr.onerror = () => reject(new Error("Network error"));
            xhr.send(fd);
          }).catch(reject);
        });
      } else {
        const resp = await uploadForm(`${API_URL}/api/upload`, {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
          fields: { kind: "video" },
          files: { file: { uri: a.uri, name: a.name, mimeType: a.mimeType } },
        });
        const j = await resp.json();
        if (!resp.ok) throw new Error(j.detail || "Upload failed");
        set("video_path", j.path); setUploadMsg(`Uploaded: ${a.name}`); setUploadPct(100);
      }
    } catch (e: any) { setUploadMsg(`Error: ${e.message}. Press "Upload Video" to retry.`); setUploadPct(null); }
  };

  return (
    <View style={styles.modalBackdrop}>
      <ScrollView style={styles.modal} contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.modalTitle}>{isEdit ? "Edit Movie" : "Upload New Movie"}</Text>
          <View style={{ flex: 1 }} />
          <Pressable testID="modal-close" onPress={onClose}><Icon name="close" size={22} color={colors.onSurface} /></Pressable>
        </View>
        <Field label="Title *" value={form.title} onChange={(v) => set("title", v)} testID="form-title" />
        <Field label="Description" value={form.description} onChange={(v) => set("description", v)} multi testID="form-desc" />
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <View style={{ flex: 1 }}><Field label="Language" value={form.language} onChange={(v) => set("language", v)} testID="form-lang" /></View>
          <View style={{ flex: 1 }}><Field label="Release Year" value={form.release_year} onChange={(v) => set("release_year", v)} keyboardType="numeric" testID="form-year" /></View>
        </View>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <View style={{ flex: 1 }}><Field label="Duration (min)" value={form.duration_minutes} onChange={(v) => set("duration_minutes", v)} keyboardType="numeric" testID="form-dur" /></View>
          <View style={{ flex: 1 }}><Field label="Director" value={form.director} onChange={(v) => set("director", v)} testID="form-dir" /></View>
        </View>
        <Field label="Genres (comma separated)" value={form.genres} onChange={(v) => set("genres", v)} testID="form-genres" />
        <Field label="Cast (comma separated)" value={form.cast} onChange={(v) => set("cast", v)} testID="form-cast" />

        <Text style={styles.label}>Poster image</Text>
        <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
          <TextInput value={form.poster_url} onChangeText={(v) => set("poster_url", v)} placeholder="Paste URL or upload" placeholderTextColor={colors.muted} style={[styles.input, { flex: 1 }]} testID="form-poster" />
          <Pressable testID="pick-poster" onPress={() => pickImage("poster_url")} style={styles.secondaryBtn}><Text style={styles.secondaryTxt}>Upload</Text></Pressable>
        </View>
        <Text style={styles.label}>Backdrop image</Text>
        <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
          <TextInput value={form.backdrop_url} onChangeText={(v) => set("backdrop_url", v)} placeholder="Paste URL or upload" placeholderTextColor={colors.muted} style={[styles.input, { flex: 1 }]} testID="form-backdrop" />
          <Pressable testID="pick-backdrop" onPress={() => pickImage("backdrop_url")} style={styles.secondaryBtn}><Text style={styles.secondaryTxt}>Upload</Text></Pressable>
        </View>

        <Text style={styles.label}>Video file (MP4) — stored securely in cloud</Text>
        <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
          <View style={[styles.input, { flex: 1, justifyContent: "center" }]}><Text style={{ color: form.video_path ? colors.success : colors.muted }}>{form.video_path || "No file selected"}</Text></View>
          <Pressable testID="pick-video" onPress={pickVideo} style={styles.secondaryBtn}><Text style={styles.secondaryTxt}>Upload Video</Text></Pressable>
        </View>
        {uploadPct !== null && (
          <View style={styles.progressWrap}>
            <View style={[styles.progressFill, { width: `${uploadPct}%` }]} />
            <Text style={styles.progressTxt}>{uploadPct}%</Text>
          </View>
        )}
        {!!uploadMsg && <Text style={{ color: colors.muted, marginTop: 6, fontSize: 12 }} testID="upload-msg">{uploadMsg}</Text>}

        <View style={styles.switchRow}>
          <Switch testID="rights-switch" value={form.rights_confirmed} onValueChange={(v) => set("rights_confirmed", v)} trackColor={{ true: colors.brandPrimary, false: colors.border }} />
          <Text style={{ color: colors.onSurface, flex: 1, marginLeft: 10, fontSize: 13 }}>I confirm I own or have distribution rights for this content.</Text>
        </View>

        <Pressable testID="save-movie" onPress={save} style={styles.primaryBtn} disabled={saving || !form.title}>
          {saving ? <ActivityIndicator color={colors.onBrandPrimary} /> : <Text style={styles.primaryBtnTxt}>{isEdit ? "Save Changes" : "Create Movie"}</Text>}
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChange, multi, keyboardType, testID }: any) {
  return (
    <View style={{ marginTop: spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput testID={testID} value={value} onChangeText={onChange} multiline={multi} keyboardType={keyboardType} style={[styles.input, multi && { minHeight: 70, textAlignVertical: "top" }]} placeholderTextColor={colors.muted} />
    </View>
  );
}

function SeriesPanel() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin-series"], queryFn: () => apiRequest<any[]>("/api/admin/series") });
  const [newTitle, setNewTitle] = useState("");

  const create = async () => {
    if (!newTitle.trim()) return;
    await apiRequest("/api/admin/series", { method: "POST", body: JSON.stringify({ title: newTitle, rights_confirmed: true }) });
    setNewTitle("");
    qc.invalidateQueries({ queryKey: ["admin-series"] });
  };

  return (
    <View style={{ marginTop: spacing.lg }}>
      <View style={[styles.toolbar, { gap: spacing.sm }]}>
        <TextInput testID="series-new-title" value={newTitle} onChangeText={setNewTitle} placeholder="New series title" placeholderTextColor={colors.muted} style={[styles.input, { flex: 1 }]} />
        <Pressable testID="series-create" onPress={create} style={styles.primaryBtn}><Text style={styles.primaryBtnTxt}>Create Series</Text></Pressable>
      </View>
      <View style={styles.table}>
        <View style={[styles.row, styles.rowHead]}>
          <Text style={[styles.cell, { flex: 2 }]}>Title</Text>
          <Text style={styles.cell}>Lang</Text>
          <Text style={styles.cell}>Status</Text>
          <Text style={[styles.cell, { textAlign: "right" }]}>Actions</Text>
        </View>
        {(list.data ?? []).map((s) => (
          <View key={s.id} style={styles.row} testID={`admin-series-${s.id}`}>
            <Text style={[styles.cell, { flex: 2, color: colors.onSurface }]} numberOfLines={1}>{s.title}</Text>
            <Text style={styles.cell}>{s.language}</Text>
            <View style={styles.cell}><Badge published={s.published} ready /></View>
            <View style={[styles.cell, { flexDirection: "row", justifyContent: "flex-end", gap: 6 }]}>
              {s.published ? (
                <SmallBtn testID={`series-unpub-${s.id}`} label="Unpublish" onPress={async () => { await apiRequest(`/api/admin/series/${s.id}/unpublish`, { method: "POST" }); qc.invalidateQueries({ queryKey: ["admin-series"] }); }} />
              ) : (
                <SmallBtn testID={`series-pub-${s.id}`} label="Publish" highlight onPress={async () => { try { await apiRequest(`/api/admin/series/${s.id}/publish`, { method: "POST" }); qc.invalidateQueries({ queryKey: ["admin-series"] }); } catch (e: any) { alert(e.message); } }} />
              )}
              <SmallBtn testID={`series-del-${s.id}`} label="Delete" danger onPress={async () => { if (confirm?.("Delete series?")) { await apiRequest(`/api/admin/series/${s.id}`, { method: "DELETE" }); qc.invalidateQueries({ queryKey: ["admin-series"] }); } }} />
            </View>
          </View>
        ))}
        {(list.data ?? []).length === 0 && <Text style={styles.empty}>No series yet.</Text>}
      </View>
      <Text style={{ color: colors.muted, marginTop: spacing.md, fontSize: 12 }}>Note: Season & episode management uses the backend endpoints `/api/admin/series/.../seasons` and `/api/admin/seasons/.../episodes`. A full nested UI is available via the Movie modal pattern; use REST for bulk ingestion.</Text>
    </View>
  );
}

function BannersPanel() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin-banners"], queryFn: () => apiRequest<any[]>("/api/admin/banners") });
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [target, setTarget] = useState("");

  const create = async () => {
    if (!title || !image) return;
    await apiRequest("/api/admin/banners", { method: "POST", body: JSON.stringify({ title, image_url: image, target_type: target ? "movie" : "none", target_id: target }) });
    setTitle(""); setImage(""); setTarget("");
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };

  return (
    <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>New Banner</Text>
        <TextInput testID="banner-title" value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput testID="banner-image" value={image} onChangeText={setImage} placeholder="Image URL" placeholderTextColor={colors.muted} style={[styles.input, { marginTop: spacing.sm }]} />
        <TextInput testID="banner-target" value={target} onChangeText={setTarget} placeholder="Target movie id (optional)" placeholderTextColor={colors.muted} style={[styles.input, { marginTop: spacing.sm }]} />
        <Pressable testID="banner-create" onPress={create} style={[styles.primaryBtn, { marginTop: spacing.md }]}><Text style={styles.primaryBtnTxt}>Create Banner</Text></Pressable>
      </View>
      <View style={styles.table}>
        <View style={[styles.row, styles.rowHead]}>
          <Text style={[styles.cell, { flex: 2 }]}>Title</Text>
          <Text style={styles.cell}>Target</Text>
          <Text style={[styles.cell, { textAlign: "right" }]}>Actions</Text>
        </View>
        {(list.data ?? []).map((b) => (
          <View key={b.id} style={styles.row}>
            <Text style={[styles.cell, { flex: 2, color: colors.onSurface }]} numberOfLines={1}>{b.title}</Text>
            <Text style={styles.cell}>{b.target_type === "none" ? "—" : b.target_id}</Text>
            <View style={[styles.cell, { flexDirection: "row", justifyContent: "flex-end", gap: 6 }]}>
              <SmallBtn testID={`banner-del-${b.id}`} label="Delete" danger onPress={async () => { await apiRequest(`/api/admin/banners/${b.id}`, { method: "DELETE" }); qc.invalidateQueries({ queryKey: ["admin-banners"] }); }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function UsersPanel() {
  const list = useQuery({ queryKey: ["admin-users"], queryFn: () => apiRequest<any[]>("/api/admin/users") });
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.rowHead]}>
        <Text style={[styles.cell, { flex: 2 }]}>Email</Text>
        <Text style={styles.cell}>Role</Text>
        <Text style={styles.cell}>Name</Text>
      </View>
      {(list.data ?? []).map((u) => (
        <View key={u.id} style={styles.row}>
          <Text style={[styles.cell, { flex: 2, color: colors.onSurface }]} numberOfLines={1}>{u.email}</Text>
          <Text style={[styles.cell, { color: u.role === "admin" ? colors.brandPrimary : colors.onSurface }]}>{u.role}</Text>
          <Text style={styles.cell}>{u.name || "—"}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", backgroundColor: colors.surface, minHeight: "100%" as any },
  sidebar: { width: 240, backgroundColor: colors.surfaceSecondary, borderRightWidth: 1, borderRightColor: colors.border, padding: spacing.lg },
  logo: { color: colors.onSurface, fontSize: 22, fontWeight: "900" },
  logoSub: { color: colors.muted, fontSize: 11, letterSpacing: 2, marginTop: 2 },
  sideBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: spacing.md, borderRadius: radius.md, marginTop: 4 },
  sideBtnOn: { backgroundColor: colors.brandPrimary },
  sideTxt: { color: colors.onSurface, fontWeight: "600", fontSize: 14 },
  pageTitle: { color: colors.onSurface, fontSize: 28, fontWeight: "800" },
  pageSub: { color: colors.muted, marginTop: 2, fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.xl },
  statCard: { width: 180, backgroundColor: colors.surfaceSecondary, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: 6 },
  statVal: { color: colors.onSurface, fontSize: 26, fontWeight: "800" },
  statLbl: { color: colors.muted, fontSize: 12 },
  toolbar: { flexDirection: "row", alignItems: "center", marginVertical: spacing.md },
  primaryBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.brandPrimary, paddingHorizontal: spacing.lg, paddingVertical: 12, borderRadius: radius.md },
  primaryBtnTxt: { color: colors.onBrandPrimary, fontWeight: "800" },
  secondaryBtn: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border },
  secondaryTxt: { color: colors.onSurface, fontWeight: "700", fontSize: 13 },
  table: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  row: { flexDirection: "row", paddingHorizontal: spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider, alignItems: "center" },
  rowHead: { backgroundColor: colors.surfaceTertiary },
  cell: { flex: 1, color: colors.muted, fontSize: 13 },
  smallBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
  smallBtnTxt: { color: colors.onSurface, fontSize: 12, fontWeight: "700" },
  empty: { color: colors.muted, textAlign: "center", padding: spacing.xl },
  label: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: spacing.md, marginBottom: 6 },
  input: { backgroundColor: colors.surfaceTertiary, color: colors.onSurface, paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, fontSize: 14 },
  modalBackdrop: { position: "absolute", inset: 0 as any, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center", padding: spacing.lg, zIndex: 100 },
  modal: { width: "100%" as any, maxWidth: 720, maxHeight: "90%" as any, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  modalTitle: { color: colors.onSurface, fontSize: 20, fontWeight: "800" },
  switchRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.surfaceTertiary, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  progressWrap: { marginTop: spacing.sm, height: 10, backgroundColor: colors.surfaceTertiary, borderRadius: 999, overflow: "hidden", justifyContent: "center" },
  progressFill: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: colors.brandPrimary },
  progressTxt: { color: colors.onSurface, fontSize: 10, fontWeight: "700", textAlign: "center" },
  panel: { backgroundColor: colors.surfaceSecondary, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  panelTitle: { color: colors.onSurface, fontSize: 16, fontWeight: "700", marginBottom: spacing.sm },
});
