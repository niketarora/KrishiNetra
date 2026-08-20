import React, { useEffect, useRef, useState } from "react";
import { createAvatarSession, closeAvatarSession } from "../../../lib/avatarApi";

const HERO_IMG = process.env.PUBLIC_URL + "/assets/images/hero_image.png";
const FARMER_VIDEO = process.env.PUBLIC_URL + "/assets/video/farmer_video.mp4";

export default function LiveAvatar({ isOpen, isSpeaking, onStatusChange }) {
  const [streamActive, setStreamActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const webrtcVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // HeyGen WebRTC Session Management (if enabled)
  useEffect(() => {
    let isMounted = true;

    async function initStreaming() {
      if (!isOpen) return;

      try {
        const sessionData = await createAvatarSession();
        if (sessionData && sessionData.enabled && sessionData.token && isMounted) {
          setSessionId(sessionData.session_id);

          if (window.RTCPeerConnection) {
            const pc = new RTCPeerConnection({
              iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
              ],
            });
            peerConnectionRef.current = pc;

            pc.ontrack = (event) => {
              if (webrtcVideoRef.current && event.streams && event.streams[0]) {
                webrtcVideoRef.current.srcObject = event.streams[0];
                if (isMounted) setStreamActive(true);
              }
            };

            pc.oniceconnectionstatechange = () => {
              if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
                if (isMounted) setStreamActive(false);
              }
            };
          }
        } else {
          if (isMounted) setStreamActive(false);
        }
      } catch (err) {
        if (isMounted) setStreamActive(false);
      }
    }

    if (isOpen) {
      initStreaming();
    } else {
      if (sessionId) {
        closeAvatarSession(sessionId);
        setSessionId(null);
      }
      setStreamActive(false);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    }

    return () => {
      isMounted = false;
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [isOpen, sessionId]);

  // Manage Video Playback when Avatar starts or stops speaking
  useEffect(() => {
    const video = localVideoRef.current;
    if (!video) return;

    if (isSpeaking) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Avatar video playback notice:", err);
        });
      }
    } else {
      video.pause();
    }
  }, [isSpeaking]);

  // Handle modal closing - pause & reset video
  useEffect(() => {
    if (!isOpen && localVideoRef.current) {
      localVideoRef.current.pause();
      localVideoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  return (
    <div className="relative w-full h-full overflow-hidden flex items-start justify-center">
      {/* 1. WebRTC Remote Video Stream (if live HeyGen connection is active) */}
      {streamActive ? (
        <video
          ref={webrtcVideoRef}
          autoPlay
          playsInline
          muted={false}
          className="w-full h-full object-cover object-[center_8%]"
        />
      ) : (
        /* 2. AI Generated Farmer Realistic Video + Fallback Image */
        <div className="relative w-full h-full">
          {/* Animated speaking video */}
          <video
            ref={localVideoRef}
            src={FARMER_VIDEO}
            loop
            muted
            playsInline
            preload="auto"
            onError={(e) => {
              // Fallback to legacy root asset if needed
              if (e.target.src !== process.env.PUBLIC_URL + "/farmer_video.mp4") {
                e.target.src = process.env.PUBLIC_URL + "/farmer_video.mp4";
              }
            }}
            onLoadedData={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover object-[center_8%] transition-opacity duration-300 ${
              isSpeaking ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Idle resting Hero Image */}
          <img
            src={HERO_IMG}
            alt="KrishiNetra Farmer Voice Assistant"
            onError={(e) => {
              if (e.target.src !== process.env.PUBLIC_URL + "/hero_image.png") {
                e.target.src = process.env.PUBLIC_URL + "/hero_image.png";
              }
            }}
            className={`w-full h-full object-cover object-[center_8%] absolute inset-0 transition-opacity duration-300 pointer-events-none ${
              isSpeaking && videoLoaded ? "opacity-0" : "opacity-100"
            }`}
          />
        </div>
      )}

      {/* Progressive Dark Bottom Gradient for Text Contrast */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(6, 11, 17, 0) 0%, rgba(6, 11, 17, 0.05) 45%, rgba(6, 11, 17, 0.5) 65%, rgba(6, 11, 17, 0.88) 85%, #060B11 100%)",
        }}
      />
    </div>
  );
}
