import Icon from "@react-native-vector-icons/ionicons";
import { useEvent } from "expo";
import * as ScreenOrientation from "expo-screen-orientation";
import { VideoView, useVideoPlayer } from "expo-video";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { apiRequest } from "@/src/auth/api";
import { colors, radius, spacing } from "@/src/theme";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function PlayerScreen() {
  const { id, url, title, kind, seriesId } = useLocalSearchParams<{ id: string; url: string; title: string; kind: string; seriesId?: string }>();
  const router = useRouter();
  const [showControls, setShowControls] = useState(true);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const hideTimer = useRef<any>(null);

  const player = useVideoPlayer(url ? decodeURIComponent(url) : "", (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 2;
    p.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player.playing });

  useEffect(() => {
    if (Platform.OS !== "web") {
      ScreenOrientation.unlockAsync().catch(() => {});
    }
    return () => {
      if (Platform.OS !== "web") ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(() => {});
    };
  }, []);

  // Autohide controls
  useEffect(() => {
    if (!showControls) return;
    hideTimer.current && clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 4000);
    return () => hideTimer.current && clearTimeout(hideTimer.current);
  }, [showControls]);

  // Save progress every ~5s
  useEffect(() => {
    const t = setInterval(() => {
      try {
        if (player.duration > 0) {
          apiRequest("/api/progress", {
            method: "POST",
            body: JSON.stringify({
              content_type: kind === "episode" ? "episode" : "movie",
              content_id: id,
              series_id: seriesId || null,
              position_seconds: player.currentTime,
              duration_seconds: player.duration,
            }),
          }).catch(() => {});
        }
      } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, [id, kind, seriesId, player]);

  useEffect(() => {
    try {
      // @ts-ignore
      player.playbackRate = speed;
    } catch {}
  }, [speed, player]);

  const toggle = () => {
    if (isPlaying) player.pause();
    else player.play();
    setShowControls(true);
  };
  const seek = (delta: number) => {
    try {
      player.currentTime = Math.max(0, Math.min(player.currentTime + delta, player.duration || 1e9));
    } catch {}
    setShowControls(true);
  };

  if (!url) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>No video available</Text>
        <Pressable onPress={() => router.back()} style={styles.btn}><Text style={styles.btnTxt}>Back</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowControls((s) => !s)}>
        <VideoView
          testID="video-view"
          style={StyleSheet.absoluteFill}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
          contentFit="contain"
          nativeControls={false}
        />
      </Pressable>

      {showControls && (
        <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.topBar} pointerEvents="box-none">
            <Pressable testID="player-back" onPress={() => router.back()} style={styles.iconBtn}>
              <Icon name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <Text numberOfLines={1} style={styles.title}>{title}</Text>
            <Pressable testID="speed-btn" onPress={() => setSpeedOpen((s) => !s)} style={styles.iconBtn}>
              <Text style={styles.speedTxt}>{speed}x</Text>
            </Pressable>
          </View>

          <View style={styles.midRow} pointerEvents="box-none">
            <Pressable testID="back-10" onPress={() => seek(-10)} style={styles.midBtn}>
              <Icon name="play-back" size={30} color="#fff" />
              <Text style={styles.midTxt}>10s</Text>
            </Pressable>
            <Pressable testID="play-pause" onPress={toggle} style={styles.playBig}>
              {player.status === "loading" ? <ActivityIndicator color="#000" /> : <Icon name={isPlaying ? "pause" : "play"} size={38} color="#000" />}
            </Pressable>
            <Pressable testID="forward-10" onPress={() => seek(10)} style={styles.midBtn}>
              <Icon name="play-forward" size={30} color="#fff" />
              <Text style={styles.midTxt}>10s</Text>
            </Pressable>
          </View>

          {speedOpen && (
            <View style={styles.speedPanel}>
              {SPEEDS.map((s) => (
                <Pressable key={s} testID={`speed-${s}`} onPress={() => { setSpeed(s); setSpeedOpen(false); }} style={[styles.speedPill, s === speed && styles.speedPillOn]}>
                  <Text style={[styles.speedPillTxt, s === speed && { color: "#000" }]}>{s}x</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: spacing.md },
  msg: { color: "#fff" },
  btn: { backgroundColor: colors.brandPrimary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  btnTxt: { color: "#000", fontWeight: "700" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  topBar: { flexDirection: "row", alignItems: "center", padding: spacing.lg, gap: spacing.md },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)" },
  title: { color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 },
  speedTxt: { color: "#fff", fontWeight: "700", fontSize: 12 },
  midRow: { position: "absolute", left: 0, right: 0, top: "40%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32 },
  midBtn: { alignItems: "center", gap: 4 },
  midTxt: { color: "#fff", fontSize: 10 },
  playBig: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  speedPanel: { position: "absolute", right: spacing.lg, top: 70, backgroundColor: "rgba(0,0,0,0.85)", padding: spacing.sm, borderRadius: radius.md, gap: 4 },
  speedPill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: "#fff2" },
  speedPillOn: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  speedPillTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
