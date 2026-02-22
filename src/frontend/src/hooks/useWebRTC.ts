import { useEffect, useRef, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useStartCall, useEndCall } from './useQueries';

export function useWebRTC(remotePrincipal: Principal) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const { mutate: startCallSignal } = useStartCall();
  const { mutate: endCallSignal } = useEndCall();

  useEffect(() => {
    let mounted = true;

    const initializeCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setLocalStream(stream);

        const configuration: RTCConfiguration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        };

        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        peerConnection.ontrack = (event) => {
          if (mounted && event.streams[0]) {
            setRemoteStream(event.streams[0]);
            setIsConnecting(false);
          }
        };

        peerConnection.oniceconnectionstatechange = () => {
          if (peerConnection.iceConnectionState === 'connected') {
            setIsConnecting(false);
          } else if (peerConnection.iceConnectionState === 'failed') {
            setError('Connection failed. Please try again.');
            setIsConnecting(false);
          }
        };

        startCallSignal(remotePrincipal);

        setTimeout(() => {
          if (mounted && !remoteStream) {
            setIsConnecting(false);
          }
        }, 10000);

      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to access camera/microphone');
          setIsConnecting(false);
        }
      }
    };

    initializeCall();

    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [remotePrincipal]);

  const endCall = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    endCallSignal();
  };

  return {
    localStream,
    remoteStream,
    isConnecting,
    error,
    endCall
  };
}
